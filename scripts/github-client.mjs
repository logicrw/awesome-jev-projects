/** Serialized GitHub requests; remote repository content is never executed. */
import { createHash } from "node:crypto";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Scan bounded raw bytes without retaining the whole document. Returned windows
 * keep absolute byte spans; a complete scan may also attest the full content hash. */
async function materialWindows(response, maximum) {
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 10_485_760 || !response.body?.getReader)
    throw Object.assign(new Error("Invalid material scan budget"), { code: "RESPONSE_BUDGET" });
  const reader = response.body.getReader(), digest = createHash("sha256");
  const width = 16384, overlap = 512, retained = [], qualifications = [];
  const declaredLength = Number(response.headers?.get("content-length"));
  const midpoint = Number.isSafeInteger(declaredLength) && declaredLength > 0 ? Math.min(maximum, declaredLength) / 2 : maximum / 2;
  let pending = Buffer.alloc(0), offset = 0, scannedBytes = 0, complete = false, first = null, last = null, middle = null;
  const capture = (buffer, start) => {
    let trim = 0;
    while (trim < buffer.length && (buffer[trim] & 0xc0) === 0x80) trim++;
    let text;
    try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buffer.subarray(trim), { stream: true }); }
    catch { return; }
    if (!text || text.includes("\0")) return;
    const entry = { text, startByte: start + trim, endByte: start + trim + Buffer.byteLength(text) };
    first ??= entry; last = entry;
    if (!middle && entry.startByte <= midpoint && entry.endByte >= midpoint) middle = entry;
    if (/mock|stub|placeholder|not implemented|limitation|not production|仅供示例|尚未实现|限制|非生产/i.test(text)) {
      if (qualifications.length < 2) qualifications.push(entry);
      else qualifications[1] = entry;
    }
    if (/jev|typesafe|system.?one|\bnoul\b|\bchoice\b|CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION/i.test(text)) {
      if (retained.length < 2) retained.push(entry);
      else retained[1] = entry;
    }
  };
  try {
    while (scannedBytes < maximum) {
      const part = await reader.read();
      if (part.done) { complete = true; break; }
      const value = Buffer.from(part.value).subarray(0, maximum - scannedBytes);
      digest.update(value); scannedBytes += value.length;
      pending = Buffer.concat([pending, value]);
      while (pending.length >= width) {
        capture(pending.subarray(0, width), offset);
        pending = pending.subarray(width - overlap); offset += width - overlap;
      }
    }
    if (pending.length) capture(pending, offset);
  } finally { reader.cancel().catch(() => {}); reader.releaseLock(); }
  const windows = [...new Map([first, ...retained, ...qualifications, middle, last].filter(Boolean)
    .map((window) => [`${window.startByte}:${window.endByte}`, window])).values()].sort((a,b)=>a.startByte-b.startByte);
  return { windows, scannedBytes, complete, contentSha256: complete ? digest.digest("hex") : null };
}

async function boundedResponse(response, maximum, raw, truncate) {
  const fail = () => Object.assign(new Error("GitHub response exceeds bounded material budget"), { code: "RESPONSE_BUDGET" });
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 10_000_000) throw fail();
  if (!truncate && Number(response.headers?.get("content-length")) > maximum) {
    response.body?.cancel().catch(() => {}); throw fail();
  }
  if (!response.body?.getReader) throw fail();
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.byteLength > maximum) {
        if (!truncate) throw fail();
        chunks.push(Buffer.from(value).subarray(0, maximum - size)); size = maximum; break;
      }
      chunks.push(Buffer.from(value)); size += value.byteLength;
      if (truncate && size === maximum) break;
    }
  } finally { reader.cancel().catch(() => {}); reader.releaseLock(); }
  const bytes = Buffer.concat(chunks);
  // Streaming TextDecoder drops only an incomplete trailing UTF-8 codepoint on a bounded prefix.
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: raw }).decode(bytes, { stream: truncate });
  return raw ? text : JSON.parse(text);
}

function retryAfterMs(value, now) {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}

export function createGitHubClient({
  token,
  writeRepository,
  writeScope = "repository",
  fetchImpl = fetch,
  now = Date.now,
  sleep = pause,
  maxAttempts = 3,
  maxRateLimitWaitMs = 15 * 60 * 1000,
  onRetry = () => {},
} = {}) {
  if (writeRepository && !/^[a-z\d][a-z\d-]{0,38}\/[a-z\d_.-]{1,100}$/i.test(writeRepository))
    throw new Error("Invalid GitHub write repository");
  if (!["repository", "budget"].includes(writeScope)) throw new Error("Invalid GitHub write scope");
  let queue = Promise.resolve();
  let nextRequest = 0;
  let nextSearch = 0;
  let rateLimitWaited = 0;
  let rateLimitBlocked = null;

  async function request(
    path,
    { search = false, code = false, raw = false, method = "GET", body, responseBytes, truncate = false, sampleMaterials = false } = {},
  ) {
    // A run-wide circuit avoids hammering every remaining repository after the
    // bounded retry allowance has been exhausted. The next run starts fresh.
    if (rateLimitBlocked) throw rateLimitBlocked;
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u0020\u007f#]/u.test(path)) {
      throw new Error("GitHub API path must be an absolute API pathname");
    }
    const parsed = new URL("https://api.github.com" + path);
    if (parsed.origin !== "https://api.github.com" || parsed.pathname !== path.split("?")[0])
      throw new Error("Non-canonical GitHub API path rejected");
    // Read clients cannot be turned into account/API writers by remote data.
    // The write client has only the fixed data-publication and Issue mutation shapes this app uses.
    const mutationPath = writeRepository && `/repos/${writeRepository}/`;
    const relative = mutationPath && parsed.pathname.startsWith(mutationPath)
      ? parsed.pathname.slice(mutationPath.length) : null;
    const sha = (value) => /^[a-f\d]{40}$/.test(value ?? "");
    const isAllowedTreePath = (p) => {
      if (typeof p !== "string") return false;
      if (p === "src/data/projects.json") return true;
      if ([
        "README.md", "README.zh-CN.md", "README.ja.md", "README.ko.md",
        "public/banner.svg", "public/banner-zh.svg", "public/banner-ja.svg", "public/banner-ko.svg",
        "public/llms.txt", "public/llms-full.txt", "public/sitemap.xml",
      ].includes(p)) return true;
      if (/^public\/avatars\/[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\.png$/i.test(p)) return true;
      return false;
    };
    const isSafeEntry = (entry) => {
      if (!entry || typeof entry !== "object") return false;
      if (entry.mode !== "100644" || entry.type !== "blob") return false;
      if (!isAllowedTreePath(entry.path)) return false;
      if (entry.sha) {
        return sha(entry.sha) && entry.content === undefined;
      }
      return typeof entry.content === "string" && Buffer.byteLength(entry.content) <= 10_000_000;
    };
    const safeTree = Array.isArray(body?.tree) &&
      body.tree.length >= 1 && body.tree.length <= 100 &&
      sha(body?.base_tree) &&
      body.tree.some((e) => e?.path === "src/data/projects.json") &&
      new Set(body.tree.map((e) => e?.path)).size === body.tree.length &&
      body.tree.every(isSafeEntry);
    const safeBudgetTree = sha(body?.base_tree) && Array.isArray(body?.tree) && body.tree.length >= 1 && body.tree.length <= 100 &&
      new Set(body.tree.map((entry) => entry?.path)).size === body.tree.length &&
      body.tree.every((entry) => {
        const match = /^radar\/review-budget-cases\/([a-f\d]{2})\/([a-f\d]{64})\.json$/.exec(entry?.path ?? "");
        return (entry?.path === "radar/review-budget.json" || (match && match[1] === match[2].slice(0, 2))) &&
          entry.mode === "100644" && entry.type === "blob" && entry.sha === undefined && typeof entry.content === "string" &&
          Buffer.byteLength(entry.content) <= (match ? 8192 : 2_000_000);
      }) && body.tree.reduce((sum, entry) => sum + Buffer.byteLength(entry.content), 0) <= 2_000_000;
    const safeBlob = method === "POST" && relative === "git/blobs" &&
      (body?.encoding === "base64" || body?.encoding === "utf-8") &&
      typeof body?.content === "string" &&
      Buffer.byteLength(body.content) <= 30_000_000;
    const budgetWrite = relative && !parsed.search && (
      (method === "POST" && relative === "git/trees" && safeBudgetTree) ||
      (method === "POST" && relative === "git/commits" && sha(body?.tree) && body?.parents?.length === 1 && sha(body.parents[0])) ||
      (method === "POST" && relative === "git/refs" && body?.ref === "refs/heads/ingestion-budget" && sha(body.sha)) ||
      (method === "PATCH" && relative === "git/refs/heads/ingestion-budget" && body?.force === false && sha(body.sha))
    );
    const allowedWrite = writeScope === "budget" ? budgetWrite : relative && !parsed.search && (
      safeBlob ||
      (method === "POST" && relative === "git/trees" && safeTree) ||
      (method === "POST" && relative === "git/commits" && sha(body?.tree) &&
        body?.parents?.length === 1 && sha(body.parents[0])) ||
      (method === "PATCH" && relative === "git/refs/heads/main" && body?.force === false && sha(body.sha)) ||
      (method === "POST" && /^issues\/[1-9]\d*\/(?:comments|labels)$/.test(relative)) ||
      (method === "DELETE" && /^issues\/[1-9]\d*\/labels\/needs-evidence$/.test(relative) && body === undefined) ||
      (method === "PATCH" && /^issues\/[1-9]\d*$/.test(relative))
    );
    if (method !== "GET" && !allowedWrite)
      throw new Error("GitHub mutation outside the explicit repository write scope");
    if (method === "GET" && body !== undefined)
      throw new Error("GET request bodies are forbidden");
    let requestUrl = parsed.href;
    let redirects = 0;
    const attempts = method === "POST" ? 1 : maxAttempts;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const wait = Math.max(
        0,
        nextRequest - now(),
        search ? nextSearch - now() : 0,
      );
      if (wait) await sleep(wait);
      const sentAt = now();
      nextRequest = sentAt + 1500;
      if (search) nextSearch = sentAt + (code ? 6500 : token ? 2200 : 6200);
      let response;
      try {
        response = await fetchImpl(requestUrl, {
          method,
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          headers: {
            Accept: raw
              ? "application/vnd.github.raw+json"
              : "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "awesome-jev-radar",
            ...(body === undefined
              ? {}
              : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: AbortSignal.timeout(20000),
          redirect: "manual",
        });
      } catch (error) {
        if (attempt === attempts - 1)
          throw new Error(token ? String(error.message).replaceAll(token, "[redacted]") : String(error.message));
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if ([301, 302, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const error = new Error(
          "GitHub API redirect rejected: invalid destination or redirect limit exceeded",
        );
        error.status = response.status;
        const location = response.headers.get("location");
        let destination;
        try {
          destination = location ? new URL(location, requestUrl) : null;
        } catch {
          throw error;
        }
        if (
          method !== "GET" ||
          redirects >= 3 ||
          !destination ||
          destination.origin !== "https://api.github.com" ||
          destination.username ||
          destination.password
        )
          throw error;
        requestUrl = destination.href;
        redirects++;
        // Redirects consume their own bounded allowance, while every follow-up
        // still passes through the same request and search pacing above.
        attempt--;
        continue;
      }
      if (response.ok && raw && sampleMaterials)
        return materialWindows(response, responseBytes);
      if (response.ok && responseBytes !== undefined)
        return boundedResponse(response, responseBytes, raw, truncate === true && raw === true);
      if (response.ok)
        return response.status === 204
          ? null
          : raw
            ? response.text()
            : response.json();
      let detail;
      try {
        detail = (await response.json()).message;
      } catch {
        detail = response.statusText;
      }
      const message = token
        ? String(detail).replaceAll(token, "[redacted]")
        : String(detail);
      const error = new Error(
        `GitHub ${response.status}: ${message.slice(0, 220)}`,
      );
      error.status = response.status;
      const remaining = response.headers.get("x-ratelimit-remaining");
      const retryAfter = response.headers.get("retry-after");
      const rateLimited =
        response.status === 429 ||
        (response.status === 403 &&
          (remaining === "0" ||
            retryAfter !== null ||
            /rate limit|secondary limit|abuse detection/i.test(message)));
      if (rateLimited) {
        error.rateLimited = true;
        const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
        const retry = retryAfterMs(retryAfter, now());
        const primaryWait =
          remaining === "0" && Number.isFinite(reset)
            ? Math.max(0, reset - now())
            : 0;
        // GitHub requires at least one minute for secondary limits without a
        // Retry-After header, followed by an exponentially increasing delay.
        const backoff =
          Math.max(retry || 60000 * 2 ** attempt, primaryWait) + 500;
        error.retryAfterMs = backoff;
        if (
          attempt === attempts - 1 ||
          rateLimitWaited + backoff > maxRateLimitWaitMs
        ) {
          rateLimitBlocked = error;
          throw error;
        }
        rateLimitWaited += backoff;
        onRetry({
          status: response.status,
          waitMs: backoff,
          attempt: attempt + 1,
        });
        await sleep(backoff);
        continue;
      }
      if (response.status >= 500 && attempt < attempts - 1) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  return function api(path, options) {
    const result = queue.then(() => request(path, options));
    queue = result.catch(() => {});
    return result;
  };
}
