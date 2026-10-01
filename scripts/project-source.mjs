/** Inspect immutable public GitHub sources. Issue text is input, never integration evidence. */
import { createHash } from "node:crypto";
import { posix } from "node:path";
import { normalizeRepository } from "../src/lib/submission.mjs";
import { resolveTagId } from "../src/lib/tags.mjs";

const MAX_README_BYTES = 90_000;
const MAX_FILE_BYTES = 120_000;
const MAX_NOTEBOOK_BYTES = 500_000;
const MAX_READMES = 3;
const MAX_CODE_FILES = 8;
const SHA = /^[a-f\d]{40,64}$/i;
const REPOSITORY_FIELD =
  /^(?:(?:github|project|code|open\s*source)?\s*(?:repository|repo|url|link)|项目仓库|仓库地址|github\s*仓库|开源(?:仓库|地址)|项目地址|代码仓库|仓库链接|仓库)$/i;
const TAGS_FIELD =
  /^(?:(?:project|scenario|suggested)?\s*tags?|项目标签|标签|场景标签|建议标签)$/i;
const CATEGORY_FIELD =
  /^(?:(?:primary|suggested)?\s*category|项目分类|分类|所属分类|建议分类|主分类)$/i;
const REPO = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[a-z\d_.-]{1,100}$/i;
const pathPart = (path) => path.split("/").map(encodeURIComponent).join("/");
const hash = (text) => createHash("sha256").update(text).digest("hex");

function canonicalRepository(value) {
  if (typeof value !== "string") return null;
  const normalized = normalizeRepository(value);
  return normalized?.replace("https://github.com/", "") ?? null;
}

function repositoriesInText(text) {
  const shorthands = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^`|`$/g, ""))
    .filter((line) => REPO.test(line.replace(/\/$/, "")))
    .map(canonicalRepository)
    .filter(Boolean);
  const candidates =
    text.match(
      /git@github\.com:[^\s<>"'`()\]]+|[a-z][a-z\d+.-]*:[^\s<>"'`()\]]+|(?<![\w@./:+-])(?:www\.)?github\.com\/[^\s<>"'`()\]]+/gi,
    ) ?? [];
  return [
    ...shorthands,
    ...candidates
      .map((candidate) =>
        canonicalRepository(candidate.replace(/[.,;!，。；！？]+$/u, "")),
      )
      .filter(Boolean),
  ];
}

function uniqueRepository(texts) {
  const repositories = texts.flatMap(repositoriesInText);
  const unique = new Map(
    repositories.map((repository) => [repository.toLowerCase(), repository]),
  );
  return unique.size === 1 ? unique.values().next().value : null;
}

/** Explicit submission fields take priority over README/evidence/example links elsewhere. */
export function extractSubmittedRepository(issueBody) {
  if (typeof issueBody !== "string" || issueBody.length > 100_000) return null;
  const body = issueBody.replace(/<!--[\s\S]*?-->/g, "");
  const sections = [];
  let current = null;
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const title = heading[1]
        .replace(/[*_]/g, "")
        .replace(/[:：]\s*$/, "")
        .trim();
      current = REPOSITORY_FIELD.test(title) ? [] : null;
      if (current) sections.push(current);
    } else if (current) {
      current.push(line);
    }
  }
  if (sections.length)
    return uniqueRepository(sections.map((section) => section.join("\n")));
  return uniqueRepository([
    body.replace(/^\s*(?:```|~~~)[\s\S]*?^\s*(?:```|~~~).*$/gm, ""),
  ]);
}

function splitTagsLine(line) {
  const segments = [];
  let current = "";
  let parenDepth = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "(" || char === "（" || char === "[" || char === "【") {
      parenDepth++;
      current += char;
    } else if (char === ")" || char === "）" || char === "]" || char === "】") {
      if (parenDepth > 0) parenDepth--;
      current += char;
    } else if (
      parenDepth === 0 &&
      (char === "," || char === "，" || char === ";" || char === "；" || char === "、")
    ) {
      if (current.trim()) segments.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

/** Extract explicit tags selected by the submitter in the issue body. */
export function extractSubmittedTags(issueBody) {
  if (typeof issueBody !== "string" || issueBody.length > 100_000) return [];
  const body = issueBody.replace(/<!--[\s\S]*?-->/g, "");
  const lines = [];
  let capturing = false;
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const title = heading[1]
        .replace(/[*_]/g, "")
        .replace(/[:：]\s*$/, "")
        .replace(/\s*[\(（][\s\S]*?[\)）]\s*$/, "")
        .trim();
      capturing = TAGS_FIELD.test(title);
    } else if (capturing) {
      lines.push(line);
    }
  }
  const candidates = [];
  for (const line of lines) {
    const segments = splitTagsLine(line);
    for (const segment of segments) {
      const trimmed = segment.replace(/^[-*•\d.)\s]+/, "").trim();
      if (!trimmed) continue;
      const direct = resolveTagId(trimmed);
      if (direct) {
        candidates.push(direct);
        continue;
      }
      const head = trimmed.split(/[\s(（]/)[0].trim();
      const headResolved = resolveTagId(head);
      if (headResolved) {
        candidates.push(headResolved);
        continue;
      }
      const parts = trimmed.split(/[/()（）]/).map((s) => s.trim()).filter(Boolean);
      for (const part of parts) {
        const partResolved = resolveTagId(part);
        if (partResolved) {
          candidates.push(partResolved);
          break;
        }
      }
    }
  }
  return [...new Set(candidates)];
}

/** Extract explicit primary category selected by the submitter in the issue body. */
export function extractSubmittedCategory(issueBody, taxonomy = []) {
  if (typeof issueBody !== "string" || issueBody.length > 100_000) return null;
  const body = issueBody.replace(/<!--[\s\S]*?-->/g, "");
  const lines = [];
  let capturing = false;
  let fenced = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const heading = /^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      const title = heading[1]
        .replace(/[*_]/g, "")
        .replace(/[:：]\s*$/, "")
        .replace(/\s*[\(（][\s\S]*?[\)）]\s*$/, "")
        .trim();
      capturing = CATEGORY_FIELD.test(title);
    } else if (capturing) {
      lines.push(line);
    }
  }
  for (const line of lines) {
    const trimmed = line.replace(/^[-*•\d.)\s]+/, "").trim();
    if (!trimmed) continue;
    const head = trimmed.split(/[\s(（]/)[0].trim();
    const full = trimmed.toLowerCase();
    const headLower = head.toLowerCase();
    const candidate = taxonomy.find((t) => {
      const cat = t.category.toLowerCase();
      return (
        full === cat ||
        headLower === cat ||
        full.startsWith(`${cat} `) ||
        full.startsWith(`${cat}(`) ||
        full.startsWith(`${cat}（`)
      );
    });
    if (candidate) return candidate.category;
  }
  return null;
}

/** Extract explicit repository code paths linked in the issue text or comments. */
export function extractSubmittedCodePaths(text, repository) {
  if (typeof text !== "string" || !repository) return [];
  const paths = new Set();
  const escaped = repository.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blobRegex = new RegExp(
    `(?:https:\\/\\/raw\\.githubusercontent\\.com\\/${escaped}\\/[^/\\s"')\\]>]+\\/|https:\\/\\/github\\.com\\/${escaped}\\/(?:blob|tree|raw)\\/[^/\\s"')\\]>]+\\/)([^\\s"')\\]#?]+)`,
    "gi",
  );
  let match;
  while ((match = blobRegex.exec(text)) !== null) {
    let candidate = match[1];
    try {
      candidate = decodeURIComponent(candidate);
    } catch {}
    candidate = candidate.replace(/(?::\d+(?:-\d+)?|[.,;:!?)>\]])+$|#L\d+(?:-L?\d+)?$/i, "").trim();
    if (safePath(candidate)) {
      paths.add(candidate);
    }
  }

  const inlineRegex =
    /`([^`\n\r]+?\.(?:py|[cm]?js|jsx|ts|tsx|go|rs|java|kt|rb|php|cs|cpp|cc|c|h|hpp|swift|sh|lua|dart|ipynb))(?::\d+(?:-\d+)?|#L\d+(?:-L?\d+)?)?`|(?:\b(?:path|file|in|at|under|source|evidence)\s*[:=]?\s*["']?)([a-z\d_.-]+(?:\/[a-z\d_.-]+)*\.(?:py|[cm]?js|jsx|ts|tsx|go|rs|java|kt|rb|php|cs|cpp|cc|c|h|hpp|swift|sh|lua|dart|ipynb))(?::\d+(?:-\d+)?|#L\d+(?:-L?\d+)?)?\b/gi;
  while ((match = inlineRegex.exec(text)) !== null) {
    let candidate = (match[1] || match[2] || "").trim();
    candidate = candidate.replace(/(?::\d+(?:-\d+)?|[.,;:!?)>\]])+$|#L\d+(?:-L?\d+)?$/i, "").trim();
    if (safePath(candidate)) {
      paths.add(candidate);
    }
  }

  return [...paths];
}

function safePath(value) {
  return (
    typeof value === "string" &&
    value.length <= 600 &&
    !/^[/.]|[\\\u0000-\u001f\u007f?#]/u.test(value) &&
    value.split("/").every((part) => part && part !== "." && part !== "..")
  );
}

function sourceFile(repository, sha, path, text) {
  return {
    path,
    text,
    url: `https://github.com/${repository}/blob/${sha}/${pathPart(path)}`,
    hash: hash(text),
  };
}

function decodeFile(file, maxBytes = MAX_FILE_BYTES) {
  if (
    !file ||
    file.type === "symlink" ||
    file.type === "submodule" ||
    file.encoding !== "base64" ||
    typeof file.content !== "string" ||
    (typeof file.size === "number" && file.size > maxBytes) ||
    file.content.length > Math.ceil((maxBytes * 4) / 3) + 4_000
  )
    return null;
  const buffer = Buffer.from(file.content, "base64");
  if (buffer.byteLength > maxBytes || buffer.includes(0)) return null;
  return buffer.toString("utf8");
}

export function decodeNotebookCode(text) {
  try {
    const nb = JSON.parse(text);
    if (!Array.isArray(nb?.cells)) return null;
    return nb.cells
      .filter((cell) => cell?.cell_type === "code")
      .map((cell) =>
        Array.isArray(cell.source) ? cell.source.join("") : (cell?.source ?? ""),
      )
      .join("\n\n");
  } catch {
    return null;
  }
}

function chineseReadme(path) {
  return (
    /(?:^|\/)readme(?:[._-](?:zh(?:[._-](?:cn|hans|tw|hant))?|cn|chinese|中文|简体中文))\.(?:md|mdx|rst|txt)$/i.test(
      path,
    ) ||
    /(?:^|\/)(?:zh(?:[._-](?:cn|hans|tw|hant))?|cn|chinese)\/readme\.(?:md|mdx|rst|txt)$/i.test(
      path,
    )
  );
}

function linkedReadmePath(link, repository, readmePath) {
  let target = link.replace(/^<|>$/g, "").split(/[?#]/)[0];
  try {
    target = decodeURIComponent(target);
  } catch {
    return null;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith("//")) {
    const match =
      /^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/[^/]+\/(.+)$/i.exec(
        target,
      );
    if (!match || match[1].toLowerCase() !== repository.toLowerCase())
      return null;
    target = match[2];
  } else {
    // Resolve Markdown links locally; never request an author-supplied remote URL.
    target = target.startsWith("/")
      ? target.slice(1)
      : posix.join(posix.dirname(readmePath), target);
  }
  return safePath(target) && chineseReadme(target) ? target : null;
}

/** Return the primary README plus up to two linked/root Chinese READMEs at one commit. */
export async function readLocalizedReadmes({
  api,
  repository,
  sha,
  readme = "",
  readmePath = "README.md",
}) {
  if (!REPO.test(repository) || !SHA.test(sha))
    throw new Error("Invalid immutable GitHub source identity");
  const files = [];
  if (
    safePath(readmePath) &&
    typeof readme === "string" &&
    readme &&
    Buffer.byteLength(readme) <= MAX_README_BYTES
  ) {
    files.push(sourceFile(repository, sha, readmePath, readme));
  }
  const candidates = new Set();
  const links = [
    ...readme.matchAll(
      /\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)|^\s*\[[^\]]+\]:\s*(\S+)/gm,
    ),
  ];
  for (const match of links) {
    const path = linkedReadmePath(match[1] ?? match[2], repository, readmePath);
    if (path && path !== readmePath) candidates.add(path);
  }
  let root = [];
  try {
    root = await api(`/repos/${repository}/contents?ref=${sha}`);
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  if (Array.isArray(root))
    for (const entry of root.slice(0, 1000)) {
      if (
        entry.type === "file" &&
        safePath(entry.path) &&
        chineseReadme(entry.path)
      )
        candidates.add(entry.path);
    }
  // Failed or oversized references cannot turn this into an unbounded series of requests.
  for (const path of [...candidates].slice(0, MAX_READMES - 1)) {
    if (files.length >= MAX_READMES || files.some((file) => file.path === path))
      continue;
    let file;
    try {
      file = await api(
        `/repos/${repository}/contents/${pathPart(path)}?ref=${sha}`,
      );
    } catch (error) {
      if (error.status === 404) continue;
      throw error;
    }
    const text = decodeFile(file, MAX_README_BYTES);
    if (text !== null) files.push(sourceFile(repository, sha, path, text));
  }
  return files;
}

function identityMatches(project, names, repositoryId) {
  if (typeof project === "string")
    return names.has(canonicalRepository(project)?.toLowerCase());
  if (!project || typeof project !== "object") return false;
  if (
    [
      project.repositoryId,
      project.repoId,
      project.githubRepositoryId,
      project.githubId,
    ].some((id) => Number.isSafeInteger(id) && id === repositoryId)
  )
    return true;
  return [
    project.repo,
    project.url,
    project.full_name,
    project.repository,
  ].some((value) => names.has(canonicalRepository(value)?.toLowerCase()));
}

function codeCandidate(entry) {
  const path = entry.path;
  const isNotebook = /\.ipynb$/i.test(path);
  const maxBytes = isNotebook ? MAX_NOTEBOOK_BYTES : MAX_FILE_BYTES;
  return (
    entry.type === "blob" &&
    entry.mode !== "120000" &&
    safePath(path) &&
    (entry.size ?? 0) <= maxBytes &&
    !/(?:^|\/)(?:docs?|documentation|node_modules|vendor|dist|build|coverage|\.git|\.github|\.env[^/]*|fixtures?|tests?|__tests__|generated|__pycache__)(?:\/|$)/i.test(
      path,
    ) &&
    !/(?:^|\/)(?:package(?:-lock)?\.json|models\.json|catalog\.json)|(?:\.min\.[cm]?js|\.lock|\.generated\.[^/]+|\.g\.[^/]+)$/i.test(
      path,
    ) &&
    /\.(?:py|[cm]?js|jsx|ts|tsx|go|rs|java|kt|rb|php|cs|cpp|cc|c|h|hpp|swift|sh|lua|dart|ipynb)$/i.test(
      path,
    )
  );
}

function stripSourceComments(text, path) {
  // Preserve quoted endpoints while removing comments and Python/Dart/JVM documentation strings.
  let code = /\.(?:py|dart|java|kt|ipynb)$/i.test(path)
    ? text.replace(/("""|\x27\x27\x27)[\s\S]*?\1/g, " ")
    : text;
  const commentsAndStrings = /\.(?:py|rb|sh|ipynb)$/i.test(path)
    ? /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|#[^\n]*/g
    : /\.(?:lua)$/i.test(path)
    ? /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|--[^\n]*/g
    : /"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  return code.replace(commentsAndStrings, (token) => /^["'`]/.test(token) ? token : " ");
}

export function hasOpenRouterJevSource({ path, text }) {
  if (typeof text !== "string" || !codeCandidate({ path, type: "blob", mode: "100644", size: Buffer.byteLength(text) })) return false;
  return hasOpenRouterJevIntegration(stripSourceComments(text, path));
}

function hasOpenRouterJevIntegration(code) {
  const jevModel = /["'`]~?(?:typesafe-ai|typesafe)\/jev(?:-(?:latest|\d+(?:\.\d+)*(?:-\d{8})?))?["'`]/i.test(code);
  const hasEndpoint = /https:\/\/(?:www\.)?openrouter\.ai(?::\d+)?\/(?:api\/)?(?:alpha\/decisions|v1\/chat\/completions|v1|api|decisions)(?=[/'"`\s)]|$)/i.test(code);
  const hasOpenRouterHost = /https:\/\/(?:www\.)?openrouter\.ai(?::\d+)?(?:\/api)?(?:\/(?:v1|alpha))?(?=[/'"`\s)]|$)/i.test(code);
  const anyHttpClient = /\b(?:fetch(?:er)?|axios|requests|httpx|aiohttp|got|ky|superagent|reqwest|ureq|client\.(?:post|request)|session\.(?:post|request)|api\.(?:post|request)|postJson|httpPost|http\.Post|post|send)\b/i.test(code);
  const openRouterRequest = (hasEndpoint || hasOpenRouterHost) && (
    anyHttpClient ||
    /\b(?:json\s*=|body\s*:|headers\s*:|Authorization.*Bearer)/i.test(code)
  );
  const openRouterSdk = /\b(?:from|require\s*\(|import\s*\()\s*["']@openrouter\/sdk["']/i.test(code) &&
    /\.\s*alpha\s*\.\s*decisions\s*\.\s*create\s*\(/i.test(code);
  const openAiCompatible = /\b(?:OpenAI|AsyncOpenAI|ChatOpenAI|LiteLLM|createOpenAI|generateText|streamText)\b/i.test(code) &&
    hasOpenRouterHost;
  // A model ID alone may be a catalog or an unused mention; require request code too.
  return jevModel && (openRouterRequest || openRouterSdk || openAiCompatible);
}

/** Static implementation evidence must come from executable sources, not README installs. */
function hasImplementationEvidence(text, path) {
  const code = stripSourceComments(text, path);
  if (hasOpenRouterJevIntegration(code)) return true;

  const providerImport =
    /\bfrom\s+(?:typesafe(?:_ai|_sdk)?|jev)(?:\.[\w.]+)?\s+import\b/i.test(code) ||
    /\bimport\s+(?:static\s+)?(?:(?!com\.typesafe\.(?:config|play|scalalogging|sslconfig|sbt|akka))(?:[\w.]+\.)?(?:typesafe(?:_ai|_sdk)?|jev)(?:\.[\w.]+)*)\b/i.test(code) ||
    /\b(?:from|require\s*\(|import\s*\(?)\s*["'](?:package:(?:jev|typesafe)[\w./-]*|@typesafe(?:-ai)?\/[\w.-]+|typesafe(?:-ai|-sdk)?|jev|github\.com\/(?:typesafe-ai|typesafe|[\w.-]+\/jev[\w.-]*)|(?:go\.)?typesafe\.ai\/[\w.-]*)["']/i.test(code) ||
    /\b(?:use\s+(?:typesafe(?:_ai|_sdk|_jev)?|jev)(?:::[\w{}*,\s:]+)?|extern\s+crate\s+(?:typesafe(?:_ai|_sdk|_jev)?|jev))\s*;/i.test(code) ||
    /\bimport\s*\([\s\S]*?["'](?:github\.com\/(?:typesafe-ai|typesafe|[\w.-]+\/jev[\w.-]*)|(?:go\.)?typesafe\.ai\/[\w.-]*)["']/i.test(code);

  const sdkCall =
    /\b(?:TypeSafe|AsyncTypeSafe|TypeSafeClient|JevClient|typesafe\.(?:Client|AsyncClient|NewClient|New)|jev\.(?:Client|NewClient|New))\s*(?:\(|::new\s*\()|(?<!\b(?:random|math)\s*)\.\s*(?:choice|score|noul|decision|decide|query|ask|systemOne|system_one|evaluate|judge|route)\s*\(|\b(?:Choice|Score|Noul)\s*(?:::new|\.builder|\.of|\()\s*\(|(?<![\w.]\s*)\b(?:choice|score|noul|decide)\s*\(/i.test(code);

  if (providerImport && sdkCall) return true;

  const aiSdkImport = /\b(?:from|require\s*\(|import\s*\(?)\s*["'](?:ai|@ai-sdk\/[\w.-]+)["']/i.test(code);
  const jevModelRef = /["'`]~?(?:typesafe-ai|typesafe)\/jev(?:-(?:latest|\d+))?["'`]/i.test(code);
  if (aiSdkImport && jevModelRef) return true;

  const hasTypesafeHost = /(?:https?:\/\/)?(?:api\.)?typesafe\.ai/i.test(code);
  const hasSystemOnePath = /\/v1\/(?:systemone|decide)\b/i.test(code);
  const hasJevIdentity = /["'`]~?(?:typesafe-ai|typesafe)\/jev-(?:latest|\d)|(?:TypeSafeClient|JevClient|AsyncTypeSafe)\s*\(|\.\s*(?:systemOne|system_one|choice|score|noul|decision|decide)\s*\(/i.test(code);

  const anyHttpClient = /\b(?:fetch(?:er)?|axios|requests|httpx|aiohttp|got|ky|superagent|reqwest|ureq|http\.Post|postJson|httpPost|client\.(?:post|request)|api\.(?:post|request)|post|send)\b/i.test(code);
  const inlineHttp = anyHttpClient && /["'`]https:\/\/(?:api\.)?typesafe\.ai\//i.test(code);
  if (inlineHttp && (hasJevIdentity || hasSystemOnePath)) return true;

  const pyHttp = /\burllib\.request\.(?:Request|urlopen)\s*\(\s*["'`]https:\/\/(?:api\.)?typesafe\.ai/i.test(code);
  if (pyHttp && (hasSystemOnePath || hasJevIdentity)) return true;

  const hasHttpDispatch = /\b(?:postJson|httpPost|request|client\.post|api\.post|post|send)\s*\(/i.test(code);
  if (hasTypesafeHost && (hasSystemOnePath || hasJevIdentity) && (hasHttpDispatch || /\bAuthorization\b.*?\bBearer\b/i.test(code))) {
    return true;
  }

  const typesafeKey = /\b(?:TYPESAFE_API_KEY|TYPESAFE_KEY|JEV_API_KEY|JEV_KEY)\b/i.test(code);
  const jevPrimitive = /["'](?:type|kind)["']\s*:\s*["'](?:noul|choice|score)["']|\b(?:noul|choice|score)\b.{0,50}\b(?:answer|probabilities|confidence)/i.test(code);
  const anyHttpRequest = /\b(?:urllib\.request|requests|httpx|aiohttp|fetch|axios|got|ky|superagent|postJson|http\.(?:Post|Get|Client|NewRequest)|reqwest|ureq)\b/i.test(code);
  if (typesafeKey && jevPrimitive && anyHttpRequest) return true;

  const jevWireClient =
    /\b(?:typesafe|jev)\b/i.test(code) &&
    anyHttpRequest &&
    /\b(?:noul|choice|score)\b/i.test(code) &&
    /\bquestions\b/i.test(code) &&
    /\b(?:state|probabilities|confidence|answers)\b/i.test(code);
  if (jevWireClient) return true;

  const serverSystemOne =
    /(?:@[\w.]*\.post|router\.(?:post|handle|POST)|app\.(?:post|all)|Route\s*\(\s*["']POST["']|Endpoint|def\s+post|fn\s+handle|route)\s*\(\s*["']\/v1\/(?:systemone|decide)["']/i.test(code) ||
    /(?:path\s*=\s*["']\/v1\/systemone["']|["']\/v1\/systemone["']\s*,\s*(?:tags|summary|description|handler|func))/i.test(code) ||
    /\b(?:client|session)\.post\s*\(\s*["']\/v1\/systemone["']/i.test(code);
  const serverPrimitives = /\bchoice\b/i.test(code) && (/\bscore\b/i.test(code) || /\bnoul\b/i.test(code) || /\blogits?\b/i.test(code) || /\bquestions?\b/i.test(code));
  if (serverSystemOne && serverPrimitives) return true;

  return false;
}

/** Check metadata, immutable README/source evidence and duplicate/exclusion identities. */
export async function inspectRepository({
  api,
  repository,
  existingProjects = [],
  exclusions = [],
  verifyIntegration,
  requireCodeEvidence = false,
  preferredPaths = [],
}) {
  if (
    typeof repository !== "string" ||
    !REPO.test(repository) ||
    canonicalRepository(repository) !== repository
  )
    return { status: "rejected", reason: "invalid repository" };
  if (typeof verifyIntegration !== "function")
    throw new TypeError("verifyIntegration is required");
  let repo;
  try {
    repo = await api(`/repos/${repository}`);
  } catch (error) {
    if (error.status === 404)
      return {
        status: "rejected",
        reason: "repository not found or inaccessible",
      };
    throw error;
  }
  const canonical = canonicalRepository(repo.full_name);
  if (
    !Number.isSafeInteger(repo.id) ||
    repo.id <= 0 ||
    !canonical ||
    canonical !== repo.full_name
  )
    return { status: "rejected", reason: "invalid repository metadata" };
  if (
    repo.private !== false ||
    (repo.visibility && repo.visibility !== "public")
  )
    return { status: "rejected", reason: "repository is not public" };
  if (repo.fork === true)
    return { status: "rejected", reason: "forks are not ingested", repo };
  const names = new Set([repository.toLowerCase(), canonical.toLowerCase()]);
  if (
    existingProjects.some((project) => identityMatches(project, names, repo.id))
  )
    return { status: "duplicate", reason: "repository already listed", repo };
  if (exclusions.some((project) => identityMatches(project, names, repo.id)))
    return {
      status: "rejected",
      reason: "repository is excluded by editorial review",
      repo,
    };
  let commits;
  try {
    commits = await api(`/repos/${canonical}/commits?per_page=1`);
  } catch (error) {
    if ([404, 409].includes(error.status))
      return {
        status: "rejected",
        reason: "repository has no accessible commit",
        repo,
      };
    throw error;
  }
  const sha = commits[0]?.sha;
  if (!SHA.test(sha ?? ""))
    return {
      status: "rejected",
      reason: "repository has no immutable commit",
      repo,
    };
  let readme = "";
  let readmePath = "README.md";
  try {
    const file = await api(`/repos/${canonical}/readme?ref=${sha}`);
    if (safePath(file.path)) {
      readmePath = file.path;
      readme = decodeFile(file) ?? "";
    }
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const readmeFiles = await readLocalizedReadmes({
    api,
    repository: canonical,
    sha,
    readme,
    readmePath,
  });
  readme = readmeFiles.map((file) => file.text).join("\n\n");
  let evidence = verifyIntegration(repo, readme);
  const files = [...readmeFiles];
  const implementationFiles = [];
  if ((!evidence.verified || requireCodeEvidence) && evidence.reason !== "mention-only directory") {
    let tree;
    try {
      tree = await api(`/repos/${canonical}/git/trees/${sha}?recursive=1`);
    } catch (error) {
      if (error.status !== 404) throw error;
      tree = { tree: [] };
    }
    const preferredSet = new Set(preferredPaths.map((p) => p.toLowerCase()));
    const allTree = tree.tree ?? [];
    const isPreferred = (entryPath) => {
      const lower = entryPath.toLowerCase();
      if (preferredSet.has(lower)) return true;
      const base = posix.basename(lower);
      for (const p of preferredPaths) {
        const plower = p.toLowerCase();
        const pbase = posix.basename(plower);
        if (lower.endsWith("/" + plower) || plower.endsWith("/" + lower)) return true;
        if (pbase && (pbase === base || base.toLowerCase().includes(pbase)) && /(?:src|lib|app|server|internal|core|pkg|providers?|routers?)/i.test(lower)) return true;
      }
      return false;
    };
    const preferredCandidates = allTree.filter(
      (entry) => entry.type === "blob" && safePath(entry.path) && isPreferred(entry.path),
    );
    const seenPreferred = new Set(preferredCandidates.map((c) => c.path.toLowerCase()));
    const directProbes = preferredPaths
      .filter((p) => safePath(p) && !seenPreferred.has(p.toLowerCase()))
      .map((p) => ({ path: p, type: "blob" }));
    const generalCandidates = allTree
      .slice(0, 5000)
      .filter((entry) => codeCandidate(entry) && !seenPreferred.has(entry.path.toLowerCase()));
    const candidates = [...preferredCandidates, ...directProbes, ...generalCandidates].sort(
      (a, b) =>
        Number(isPreferred(b.path)) - Number(isPreferred(a.path)) ||
        Number(/typesafe|jev/i.test(posix.basename(b.path))) -
          Number(/typesafe|jev/i.test(posix.basename(a.path))) ||
        Number(/(?:^|\/)(?:bench|benchmark|benchmarks|examples?|demos?|fixtures?|scripts?)(?:\/|$)/i.test(a.path)) -
          Number(/(?:^|\/)(?:bench|benchmark|benchmarks|examples?|demos?|fixtures?|scripts?)(?:\/|$)/i.test(b.path)) ||
        Number(/(?:^|\/)(?:judge|gate|decision|backend|client|agent|model|service|policy|api|route|provider|evaluator|engine|handler|selection|select|prompt|filter|classifier|routing|rule)/i.test(b.path)) -
          Number(/(?:^|\/)(?:judge|gate|decision|backend|client|agent|model|service|policy|api|route|provider|evaluator|engine|handler|selection|select|prompt|filter|classifier|routing|rule)/i.test(a.path)) ||
        Number(/(?:^|\/)(?:ci|docker|github|gitlab|azure|gitea|bitbucket)(?:\/|$)/i.test(a.path)) -
          Number(/(?:^|\/)(?:ci|docker|github|gitlab|azure|gitea|bitbucket)(?:\/|$)/i.test(b.path)) ||
        (a.path.split("/").length - b.path.split("/").length) ||
        Number(/(?:^|\/)(?:__init__|\.d)\.[a-z]+$/i.test(a.path)) -
          Number(/(?:^|\/)(?:__init__|\.d)\.[a-z]+$/i.test(b.path)) ||
        Number(/jev|typesafe/i.test(b.path)) -
          Number(/jev|typesafe/i.test(a.path)) ||
        Number(/(?:^|\/)(?:src|lib|app|main|client|agent|cmd|pkg|internal)/i.test(b.path)) -
          Number(/(?:^|\/)(?:src|lib|app|main|client|agent|cmd|pkg|internal)/i.test(a.path)) ||
        a.path.localeCompare(b.path),
    );
    for (const entry of candidates.slice(0, MAX_CODE_FILES)) {
      let file;
      try {
        file = await api(
          `/repos/${canonical}/contents/${pathPart(entry.path)}?ref=${sha}`,
        );
      } catch (error) {
        if (error.status === 404) continue;
        throw error;
      }
      const isNotebook = /\.ipynb$/i.test(entry.path);
      let text = decodeFile(file, isNotebook ? MAX_NOTEBOOK_BYTES : MAX_FILE_BYTES);
      if (text === null) continue;
      if (isNotebook) {
        const nbCode = decodeNotebookCode(text);
        if (nbCode !== null) text = nbCode;
      }
      const source = sourceFile(canonical, sha, entry.path, text);
      files.push(source);
      if (hasImplementationEvidence(text, entry.path)) implementationFiles.push(source);
      evidence = verifyIntegration(
        repo,
        files.map((source) => source.text).join("\n\n"),
        { codeSources: files.filter((source) => !readmeFiles.includes(source)) },
      );
      if (evidence.verified && (!requireCodeEvidence || implementationFiles.length)) break;
    }
    if (requireCodeEvidence && !implementationFiles.length) {
      const codeOnlySources = files.filter((source) => !readmeFiles.includes(source));
      if (codeOnlySources.length > 1) {
        const jointText = codeOnlySources.map((s) => s.text).join("\n\n");
        if (hasImplementationEvidence(jointText, "joint.ts")) {
          const keySource =
            codeOnlySources.find((s) => /typesafe|jev|router|decision|provider|judge|client/i.test(s.path)) ||
            codeOnlySources[0];
          if (keySource) implementationFiles.push(keySource);
          evidence = verifyIntegration(
            repo,
            files.map((source) => source.text).join("\n\n"),
            { codeSources: codeOnlySources },
          );
        }
      }
    }
  }
  if (requireCodeEvidence && !implementationFiles.length && evidence.reason !== "mention-only directory") {
    evidence = { ...evidence, verified: false, reason: "no implementation source evidence" };
  }
  evidence = { ...evidence, files, implementationFiles };
  return {
    status: evidence.verified ? "accepted" : "rejected",
    ...(evidence.verified ? {} : { reason: evidence.reason }),
    repo,
    sha,
    commits,
    readme,
    readmeFiles,
    evidence,
  };
}
