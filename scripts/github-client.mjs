/** Serialized GitHub requests; remote repository content is never executed. */
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  fetchImpl = fetch,
  now = Date.now,
  sleep = pause,
  maxAttempts = 3,
  maxRateLimitWaitMs = 15 * 60 * 1000,
  onRetry = () => {},
} = {}) {
  if (writeRepository && !/^[a-z\d][a-z\d-]{0,38}\/[a-z\d_.-]{1,100}$/i.test(writeRepository))
    throw new Error("Invalid GitHub write repository");
  let queue = Promise.resolve();
  let nextRequest = 0;
  let nextSearch = 0;
  let rateLimitWaited = 0;
  let rateLimitBlocked = null;

  async function request(
    path,
    { search = false, code = false, raw = false, method = "GET", body } = {},
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
    const safeBlob = method === "POST" && relative === "git/blobs" &&
      (body?.encoding === "base64" || body?.encoding === "utf-8") &&
      typeof body?.content === "string" &&
      Buffer.byteLength(body.content) <= 30_000_000;
    const allowedWrite = relative && !parsed.search && (
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
