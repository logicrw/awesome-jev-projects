/**
 * Bounded MOS-assisted recovery for known derived-asset failures.
 * This is a fixed-action runner, NOT an OS sandbox or an arbitrary code repairer.
 * No issue text, dataset prose, raw diagnostics or model-authored code is sent/executed.
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const ACTIONS = new Set(["realign-derived-assets", "resync-avatars", "retry-build"]);
const COMMANDS = new Set(["npm test", "npm run build"]);
const SAFE_ENV = ["PATH", "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "SystemRoot", "COMSPEC", "PATHEXT", "CI", "DEVELOPER_DIR"];

export function buildChildEnv(env = process.env) {
  // In particular, do not inherit credentials, NODE_OPTIONS, npm config, event
  // paths or GitHub command-file paths from the credential-bearing parent.
  return Object.fromEntries(SAFE_ENV.filter((key) => typeof env[key] === "string").map((key) => [key, env[key]]));
}

export function redactDiagnostics(text, secrets = []) {
  if (typeof text !== "string") return "";
  let result = text;
  const values = [...secrets, ...Object.entries(process.env)
    .filter(([key]) => /TOKEN|SECRET|PASSWORD|API_?KEY|CREDENTIAL|AUTHORIZATION/i.test(key))
    .map(([, value]) => value)].filter((value) => typeof value === "string" && value.length >= 4);
  for (const value of values.sort((a, b) => b.length - a.length)) result = result.split(value).join("[REDACTED]");
  return result
    .replace(/-----BEGIN [\w ]*PRIVATE KEY-----[\s\S]*?(?:-----END [\w ]*PRIVATE KEY-----|$)/g, "[REDACTED_PRIVATE_KEY]")
    .replace(/\b(?:github_pat_[\w]+|gh[pousr]_[\w]+|sk-[\w-]+|AIza[\w-]+|muse-[\w-]+|AKIA[A-Z\d]{16})\b/g, "[REDACTED]")
    .replace(/\b(?:Bearer|Basic)\s+[^\s,;"']+/gi, "[REDACTED_AUTH]")
    .replace(/(["']?[\w-]*(?:token|secret|password|api[_-]?key|authorization|cookie)[\w-]*["']?\s*[:=]\s*)(?:"[^"\n]*"|'[^'\n]*'|[^\s,;&]+)/gi, "$1[REDACTED]")
    .replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/gi, "https://[REDACTED]@")
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}

export async function executeCommand(cmd, args = [], { timeoutMs = 180_000, maxOutputBytes = 1_000_000 } = {}) {
  return new Promise((done) => {
    const child = spawn(cmd, args, {
      cwd: root, shell: false, detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"], env: buildChildEnv(),
    });
    const chunks = { stdout: [], stderr: [] };
    let bytes = 0, reason = null, killTimer;
    function signal(value) {
      try {
        if (process.platform !== "win32" && child.pid) process.kill(-child.pid, value);
        else child.kill(value);
      } catch { /* Already reaped. */ }
    }
    function stop(why) {
      if (reason) return;
      reason = why;
      signal("SIGTERM");
      killTimer = setTimeout(() => signal("SIGKILL"), 500);
    }
    const timer = setTimeout(() => stop("timeout"), timeoutMs);
    for (const stream of ["stdout", "stderr"]) child[stream].on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > maxOutputBytes) { stop("output-limit"); return; }
      chunks[stream].push(chunk);
    });
    child.on("error", () => { reason = "spawn-error"; });
    child.on("close", (code) => {
      clearTimeout(timer); clearTimeout(killTimer);
      // Reap lingering descendants, including ones holding the output pipes.
      if (reason) signal("SIGKILL");
      const output = (stream) => reason === "output-limit" ? "" : redactDiagnostics(Buffer.concat(chunks[stream]).toString("utf8"));
      done({ code: reason ? 1 : code ?? 1, reason, stdout: output("stdout"), stderr: output("stderr") });
    });
  });
}

async function alignDocuments(execute) {
  for (const script of ["prepare-public-data", "generate-readme"]) {
    const result = await execute(process.execPath, [`scripts/${script}.mjs`]);
    if (result.code !== 0) throw new Error(`Alignment failed: ${script} (${result.reason || "nonzero-exit"})`);
  }
}

export async function deterministicAlignment({ execute = executeCommand } = {}) {
  // A failed avatar fetch may use the remote fallback; the integrity test still
  // enforces the minimum cache. Document generation is mandatory and fail-closed.
  const avatars = await execute(process.execPath, ["scripts/sync-avatars.mjs"], { timeoutMs: 60_000 });
  await alignDocuments(execute);
  return [
    { action: "sync-avatars", status: avatars.code === 0 ? "ok" : "warn" },
    { action: "generate-readme", status: "ok" },
  ];
}

// Only these enum facts may cross the model boundary. Matching a marker is a
// recovery hint, not proof of causation; success always requires a fresh full run.
export function diagnosticFacts({ failedCommand, stdout = "", stderr = "", reason = null }) {
  const combined = `${stdout}\n${stderr}`;
  const symptoms = [];
  // Both TAP and the spec reporter include names of successful tests. A name
  // is evidence only on a failed-test line, never a passing line or TAP header.
  const failedTests = combined.split(/\r?\n/).filter((line) => /^\s*(?:not ok \d+ - |[✖✗]\s)/u.test(line)).join("\n");
  if (/VERIFIED REPOS|Curated%20Projects/.test(combined) || /banners and README/.test(failedTests)) symptoms.push("derived-assets");
  if (/avatar static integrity/.test(failedTests) || /ENOENT[^\n]*avatars\//.test(combined)) symptoms.push("avatar-cache");
  if (reason === "timeout" || /ETIMEDOUT|ECONNRESET|EAI_AGAIN/.test(combined)) symptoms.push("transient-failure");
  return { command: COMMANDS.has(failedCommand) ? failedCommand : "unknown", symptoms };
}

export function heuristicDiagnosis(failure) {
  const facts = diagnosticFacts(failure);
  const actions = [];
  if (facts.symptoms.includes("derived-assets")) actions.push("realign-derived-assets");
  if (facts.symptoms.includes("avatar-cache")) actions.push("resync-avatars");
  if (facts.symptoms.includes("transient-failure")) actions.push("retry-build");
  return { source: "heuristic", diagnosis: facts.symptoms.join(", ") || "unrecognized-failure", actions };
}

async function readBoundedResponse(response, signal, limit = 16_384) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing response body");
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  const chunks = []; let size = 0;
  try {
    signal.throwIfAborted();
    while (true) {
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      if ((size += value.byteLength) > limit) throw new Error("Response too large");
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    signal.removeEventListener("abort", abort);
    void reader.cancel().catch(() => {});
  }
}

export async function consultMosForRepair({
  token = process.env.DEEPSEEK_API_KEY || process.env.MUSE_API_KEY,
  endpoint = process.env.DEEPSEEK_ENDPOINT || process.env.MUSE_ENDPOINT,
  model = process.env.DEEPSEEK_MODEL || process.env.MUSE_MODEL,
  fetchImpl = fetch,
  timeoutMs = 25_000,
  ...failure
}) {
  const fallback = heuristicDiagnosis(failure);
  if (!token || fallback.actions.length === 0) return fallback;
  const isDeepSeek = Boolean(
    endpoint?.includes("deepseek.com") ||
    model?.includes("deepseek") ||
    process.env.DEEPSEEK_API_KEY ||
    (token && token.startsWith("sk-") && !token.startsWith("sk-or-"))
  );
  const openrouter = endpoint ? endpoint === "https://openrouter.ai/api/v1/chat/completions" : token.startsWith("sk-or-");
  const url = endpoint || (isDeepSeek ? "https://api.deepseek.com/chat/completions" : openrouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.meta.ai/v1/chat/completions");
  const expectedModel = isDeepSeek ? (model || "deepseek-chat") : (openrouter ? "meta/muse-spark-1.3-contributor" : "muse-spark-1.3-contributor");
  // Do not send a credential to an arbitrary configured URL or silently switch
  // to another model/provider while reporting that MOS performed the repair.
  const allowedEndpoints = [
    "https://api.meta.ai/v1/chat/completions",
    "https://openrouter.ai/api/v1/chat/completions",
    "https://api.deepseek.com/chat/completions",
    "https://api.deepseek.com/v1/chat/completions",
  ];
  if (!allowedEndpoints.includes(url) || (model && model !== expectedModel))
    return { ...fallback, fallbackReason: "unsupported-model-config" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "POST", redirect: "error", signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        model: expectedModel, temperature: 0.1, max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Select only from the supplied allowedActions for the structured validation symptoms. Return only JSON: {"actions":[...]}. No commands, prose or code.' },
          { role: "user", content: JSON.stringify({ ...diagnosticFacts(failure), allowedActions: fallback.actions }) },
        ],
      }),
    });
    if (!response.ok) { await response.body?.cancel(); throw new Error("Provider error"); }
    const data = await readBoundedResponse(response, controller.signal);
    const plan = JSON.parse(data.choices?.[0]?.message?.content ?? "");
    if (!Array.isArray(plan.actions) || !plan.actions.length || plan.actions.length > 3 ||
        plan.actions.some((action) => !ACTIONS.has(action) || !fallback.actions.includes(action))) throw new Error("Invalid plan");
    // Never log model-authored prose (including workflow-command injection).
    return { source: isDeepSeek ? "deepseek" : "mos-spark", model: expectedModel, diagnosis: fallback.diagnosis, actions: [...new Set(plan.actions)] };
  } catch {
    return { ...fallback, fallbackReason: "provider-or-plan-failure" };
  } finally { clearTimeout(timer); }
}

export async function applyHealingAction(action, { execute = executeCommand } = {}) {
  if (!ACTIONS.has(action)) return { action: "unknown", status: "rejected" };
  if (action === "realign-derived-assets") await alignDocuments(execute);
  if (action === "resync-avatars") {
    const result = await execute(process.execPath, ["scripts/sync-avatars.mjs"], { timeoutMs: 60_000 });
    if (result.code !== 0) throw new Error("Avatar repair failed");
  }
  return { action, status: "completed" };
}

export async function runWithHealing({
  maxAttempts = 3, execute = executeCommand, align = deterministicAlignment,
  consult = consultMosForRepair, apply = applyHealingAction, log = console.log,
} = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 3) throw new Error("maxAttempts must be 1..3");
  const steps = await align({ execute });
  if (steps.some((step) => step.status === "warn")) log("[MOS] Avatar sync incomplete; validating cache and remote fallback.");
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let failure;
    for (const args of [["test"], ["run", "build"]]) {
      const failedCommand = `npm ${args.join(" ")}`;
      log(`[MOS] Attempt ${attempt}/${maxAttempts}: ${failedCommand}`);
      const result = await execute("npm", args);
      if (result.code !== 0) { failure = { failedCommand, ...result }; break; }
    }
    if (!failure) return { success: true, attempts: attempt };
    // Prefix each line so untrusted diagnostics cannot become Actions commands.
    log(redactDiagnostics(`${failure.stdout}\n${failure.stderr}`).slice(-20_000).split(/\r?\n/).map((line) => `  | ${line}`).join("\n"));
    if (attempt === maxAttempts) throw new Error(`Validation failed after ${attempt} attempts: ${failure.failedCommand}`);
    const plan = await consult(failure);
    log(`[MOS] ${plan.source}: ${plan.diagnosis}${plan.fallbackReason ? ` (${plan.fallbackReason})` : ""}`);
    if (!plan.actions.length) throw new Error(`No safe repair for ${failure.failedCommand}`);
    for (const action of plan.actions) await apply(action, { execute });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const mode = process.argv[2] || "validate";
    if (mode === "align") console.log(JSON.stringify(await deterministicAlignment()));
    else if (mode === "validate" || mode === "run-with-healing") console.log(JSON.stringify(await runWithHealing()));
    else throw new Error("Unknown MOS mode");
  } catch (error) { console.error(redactDiagnostics(error.message)); process.exitCode = 1; }
}
