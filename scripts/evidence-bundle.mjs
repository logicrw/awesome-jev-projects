/** Immutable, bounded reading materials. Format and executable syntax never decide admission. */
import { createHash } from "node:crypto";

const TARGET_IDS = new Set(["R1", "R2", "R3"]);
const FORMS = new Set(["source", "documentation", "code-block", "sql", "configuration", "dsl", "text"]);
const CATALOG_KINDS = new Set(["learning-resource", "benchmark", "integration", "developer-tool", "research", "other"]);
const RELATIONS = new Set(["implemented", "described", "discussed", "unrelated", "uncertain"]);
const BASES = new Set(["implementation-material", "descriptive-material", "mixed"]);
const NEEDS = new Set(["definition", "backend", "configuration", "usage-example"]);
const VERDICT_KEYS = ["target", "decision", "catalogKind", "jevRelation", "reviewBasis", "claims", "conflicts", "need", "category", "plainSummary", "plainSummaryEn"];
const QUALIFICATION = /\b(?:mock|stub|placeholder|limitation|not implemented|not production|simulation|synthetic|demo only)\b|仅(?:作|供|为)?(?:示例|演示|模拟)|尚未实现|占位|限制|非生产/i;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const size = (value) => Buffer.byteLength(value, "utf8");
const isSha = (value) => typeof value === "string" && /^[a-f\d]{40,64}$/i.test(value);
const safeText = (value) => typeof value === "string" && !/[\u0000-\u0008\u000b\u000e-\u001f\u007f\ud800-\udfff]/u.test(value);
const sourceKey = (source) => JSON.stringify([source.targetId, source.commit, source.path, source.readSpan]);
const materialId = (material) => `M${hash(JSON.stringify([material.targetId, material.commit, material.path, material.span, material.spanSha256])).slice(0, 16)}`;

function sourceIdentity(source, maxSourceBytes) {
  if (!source || !safeText(source.path) || !source.path || source.path.length > 1600 || /^[\\/]/.test(source.path) ||
      source.path.includes("\\") || source.path.split("/").some((part) => !part || part === "." || part === "..") ||
      !safeText(source.text) || size(source.text) > maxSourceBytes || typeof source.hash !== "string" || !/^[a-f\d]{64}$/i.test(source.hash) || hash(source.text) !== source.hash.toLowerCase()) return null;
  if (source.repoId != null && (!Number.isSafeInteger(source.repoId) || source.repoId <= 0)) return null;
  if (source.contentSha256 != null && (typeof source.contentSha256 !== "string" || !/^[a-f\d]{64}$/i.test(source.contentSha256))) return null;
  if (source.blobOid != null && !isSha(source.blobOid)) return null;
  try {
    const url = new URL(source.url), parts = url.pathname.split("/").slice(1).map(decodeURIComponent);
    if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password || url.search || url.hash ||
        parts.length < 5 || !parts[0] || !parts[1] || parts[2] !== "blob" || !isSha(parts[3]) || parts.slice(4).join("/") !== source.path) return null;
    const repository = `${parts[0]}/${parts[1]}`, commit = parts[3].toLowerCase();
    if (source.commit && source.commit.toLowerCase() !== commit) return null;
    if (source.repository && source.repository.toLowerCase() !== repository.toLowerCase()) return null;
    if (source.readSpan && (!Number.isSafeInteger(source.readSpan.startByte) || source.readSpan.startByte < 0 ||
        source.readSpan.endByte !== source.readSpan.startByte + size(source.text))) return null;
    if (source.originalBytes != null && (!Number.isSafeInteger(source.originalBytes) || source.originalBytes < (source.readSpan?.endByte ?? size(source.text)))) return null;
    return { repository, commit };
  } catch { return null; }
}

function normalizeTargets(targets, inspected) {
  const result = [], seen = new Set();
  const values = targets ?? [...new Map(inspected.map(({ source, identity }) => [
    `${identity.repository.toLowerCase()}@${identity.commit}`,
    { repository: identity.repository, commit: identity.commit, repoId: source.repoId ?? null },
  ])).values()].slice(0, 3).map((target, index) => ({ ...target, id: `R${index + 1}`, available: true, listed: false }));
  if (!Array.isArray(values) || values.length > 3) return null;
  for (const value of values) {
    if (!value || !TARGET_IDS.has(value.id) || seen.has(value.id) || typeof value.repository !== "string" ||
        !/^[a-z\d][a-z\d-]*\/[a-z\d_.-]+$/i.test(value.repository) ||
        !(value.repoId == null || (Number.isSafeInteger(value.repoId) && value.repoId > 0))) return null;
    const available = value.available ?? isSha(value.commit);
    if (typeof available !== "boolean" || (available && !isSha(value.commit)) || (value.commit != null && !isSha(value.commit))) return null;
    seen.add(value.id);
    result.push(Object.freeze({ id: value.id, repository: value.repository, repoId: value.repoId ?? null,
      commit: value.commit?.toLowerCase() ?? null, available, listed: value.listed === true, fork: value.fork === true,
      parent: typeof value.parent === "string" && /^[a-z\d][a-z\d-]*\/[a-z\d_.-]+$/i.test(value.parent) ? value.parent : null }));
  }
  return result;
}

function inferForm(path, requested) {
  if (requested === "prose") return "documentation";
  if (requested === "config") return "configuration";
  if (FORMS.has(requested)) return requested;
  if (/\.(?:md|mdx|rst|adoc|txt)$/i.test(path) || /(?:^|\/)readme(?:\.|$)/i.test(path)) return "documentation";
  if (/\.sql$/i.test(path)) return "sql";
  if (/\.(?:json|ya?ml|toml|ini|conf|config|xml|env)$/i.test(path)) return "configuration";
  if (/\.(?:hcl|tf|rego|cue|graphql|gql|proto|dsl|rules)$/i.test(path)) return "dsl";
  if (/\.(?:py|[cm]?js|jsx|ts|tsx|go|rs|java|kt|rb|php|cs|cpp|cc|c|h|hpp|swift|sh|lua|dart|ipynb)$/i.test(path)) return "source";
  return "text";
}

function roundRobin(groups) {
  const result = [], queues = groups.map((group) => [...group]);
  while (queues.some((queue) => queue.length)) for (const queue of queues) if (queue.length) result.push(queue.shift());
  return result;
}

/** Windows are measured in raw bytes. Character offsets are used only to avoid broken UTF-8. */
function readingWindows(text, byteBudget) {
  const length = size(text);
  if (length <= byteBudget) return [{ startByte: 0, endByte: length, text, partial: false }];
  if (byteBudget < 32) return [];
  const centers = [0, text.length, Math.floor(text.length / 2)];
  const hint = /jev|typesafe|systemone|purpose|mechanism|limitations?/gi;
  let match;
  for (let count = 0; count < 6 && (match = hint.exec(text)); count++) centers.push(match.index);
  const limit = Math.max(32, Math.floor(byteBudget / centers.length)), result = [], seen = new Set();
  for (const center of centers) {
    let start = Math.max(0, center - Math.floor(limit / 2));
    while (size(text.slice(start, center)) > limit / 2) start = Math.ceil((start + center) / 2);
    if (start > 0 && /[\udc00-\udfff]/u.test(text[start])) start++;
    let low = start, high = Math.min(text.length, start + limit);
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (size(text.slice(start, middle)) <= limit) low = middle; else high = middle - 1;
    }
    let end = low;
    if (end > start && /[\ud800-\udbff]/u.test(text[end - 1])) end--;
    const body = text.slice(start, end), startByte = size(text.slice(0, start));
    if (!body || seen.has(startByte)) continue;
    seen.add(startByte); result.push({ startByte, endByte: startByte + size(body), text: body, partial: true });
  }
  return result;
}

function splitBlock(block, text, limit, overlap) {
  const raw = Buffer.from(text), result = [];
  for (let start = 0; start < raw.length;) {
    let end = Math.min(raw.length, start + limit);
    while (end < raw.length && end > start && (raw[end] & 0xc0) === 0x80) end--;
    if (end <= start) break;
    result.push({ ...block, span: { startByte: block.span.startByte + start, endByte: block.span.startByte + end }, partial: true });
    if (end === raw.length) break;
    let next = Math.max(start + 1, end - overlap);
    while (next < end && (raw[next] & 0xc0) === 0x80) next++;
    start = next;
  }
  return result;
}

function sourceLines(text) {
  let offset = 0;
  return [...text.matchAll(/[^\n]*(?:\n|$)/g)].filter((match) => match[0]).map(([text]) => {
    const line = { text, start: offset, end: offset + size(text) }; offset = line.end; return line;
  });
}

/** Group syntax only to avoid cutting balanced containers. Nothing here determines Jev semantics. */
function scanBalance(text, state) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i], pair = text.slice(i, i + 2);
    if (state.comment) { if (pair === "*/") { state.comment = false; i++; } continue; }
    if (state.quote) {
      if (char === "\\") { i++; continue; }
      if (char === state.quote) state.quote = null;
      continue;
    }
    if (pair === "/*") { state.comment = true; i++; continue; }
    if (pair === "//" || pair === "--" || char === "#") break;
    if (["'", '"', "`"].includes(char)) { state.quote = char; continue; }
    if ("([{ ".includes(char) && char !== " ") state.depth++;
    if (")] }".includes(char) && char !== " ") state.depth = Math.max(0, state.depth - 1);
  }
}

/** Complete paragraphs, fenced examples, or bounded balanced blocks; raw bytes are never rewritten. */
function blocksFor(source) {
  const lines = sourceLines(source.text), blocks = [], raw = Buffer.from(source.text);
  const form = inferForm(source.path, source.form);
  let index = 0;
  while (index < lines.length) {
    if (!lines[index].text.trim()) { index++; continue; }
    const start = index, fence = /^\s{0,3}(`{3,}|~{3,})/.exec(lines[index].text);
    let blockForm = form;
    if (fence) {
      blockForm = "code-block"; index++;
      const close = new RegExp(`^\\s{0,3}${fence[1][0]}{${fence[1].length},}\\s*$`);
      while (index < lines.length && !close.test(lines[index].text.trimEnd())) index++;
      if (index < lines.length) index++;
    } else {
      const state = { depth: 0, quote: null, comment: false };
      const indentedBlock = /:\s*$/.test(lines[start].text.trimEnd());
      const startIndent = lines[start].text.match(/^\s*/)[0].length;
      const heading = /^\s{0,3}#{1,6}\s/.test(lines[start].text);
      while (index < lines.length) {
        if (index > start && /^\s{0,3}(`{3,}|~{3,})/.test(lines[index].text)) break;
        if (form === "documentation" && index > start && /^\s{0,3}#{1,6}\s/.test(lines[index].text)) break;
        if (form !== "documentation" && form !== "text") scanBalance(lines[index].text, state);
        index++;
        const balanced = !state.depth && !state.quote && !state.comment;
        const next = lines[index]?.text;
        if (!next) break;
        if (indentedBlock && next.trim() && next.match(/^\s*/)[0].length > startIndent) continue;
        if (balanced && !next.trim() && !(heading && index === start + 1)) break;
        if (balanced && form !== "documentation" && index - start >= 20) break;
      }
    }
    const span = { startByte: lines[start].start, endByte: lines[index - 1].end };
    blocks.push({ span, form: blockForm, index: blocks.length });
  }
  // A fenced example retains adjacent explanation/limitations at its true README span.
  return blocks.map((block, index) => {
    let left = block, right = block;
    const before = blocks[index - 1], after = blocks[index + 1];
    const read = (part) => part ? raw.subarray(part.span.startByte, part.span.endByte).toString("utf8") : "";
    if (block.form === "code-block") {
      if (before && before.form !== "code-block") left = before;
      if (after && after.form !== "code-block" && !/^\s*#/.test(read(after))) right = after;
    } else {
      if (before && QUALIFICATION.test(read(before))) left = before;
      if (after && QUALIFICATION.test(read(after))) right = after;
    }
    return { ...block, span: { startByte: left.span.startByte, endByte: right.span.endByte } };
  });
}

function readingPriority(material, index) {
  // Reading order only: a low score, an unfamiliar language, or a mention can never reject a project.
  const text = material.text;
  const declaration = /(?:^|\n)\s*(?:(?:export\s+)?(?:async\s+)?(?:def|class|function|fn|func)\s|CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\b)/i.test(text);
  const invocation = /\b[\w.]+\s*\(/.test(text);
  const decoration = /data:image|shields\.io|<img\b|!\[[^\]]*\]\([^\n)]*\.(?:svg|png|jpe?g)/i.test(text);
  return (QUALIFICATION.test(text) ? 12 : 0) + (index === 0 ? 5 : 0) +
    (/purpose|overview|how it works|mechanism|usage|tutorial|example|研究|用途|机制|原理|教程|示例/i.test(text) ? 5 : 0) +
    (/jev|typesafe|\/v1\/systemone|decision|choice|noul|score/i.test(text) ? 4 : 0) +
    (declaration ? 20 : 0) + (invocation ? 8 : 0) - (decoration ? 50 : 0);
}

/** maxMaterialBytes/maxBytes bound serialized UTF-8 bytes, not provider token counts. */
export function buildEvidenceBundle({ sources, codeSources, targets, maxMaterialBytes, maxBytes = 4800,
  maxSourceBytes = 10 * 1024 * 1024, maxInputBytes = 16 * 1024 * 1024,
  maxReadBytes = 256 * 1024, maxSourceReadBytes = 64 * 1024, maxSources = 64, maxMaterials = 12,
  excludeMaterialIds = [], deprioritizeMaterialIds = [], redactText = (text) => text } = {}) {
  const inputs = sources ?? codeSources ?? [], budget = maxMaterialBytes ?? maxBytes;
  const bundle = { status: "insufficient-evidence", targets: [], modelData: null, materialMap: new Map(), sourceMap: new Map(), manifest: new Map(), sources: [], errors: [], byteLength: 0,
    coverage: { inputBytesProcessed: 0, snapshotBytesVerified: 0, bytesRead: 0, partialSources: 0, omittedSources: 0 }, redactText };
  if (!Array.isArray(inputs) || !Number.isSafeInteger(budget) || budget < 0 ||
      ![maxSourceBytes, maxInputBytes, maxReadBytes, maxSourceReadBytes, maxSources, maxMaterials].every((value) => Number.isSafeInteger(value) && value > 0) ||
      !Array.isArray(excludeMaterialIds) || !Array.isArray(deprioritizeMaterialIds) || typeof redactText !== "function") return bundle;
  const inputGroups = new Map();
  for (const source of inputs) {
    const group = source?.targetId ?? source?.repository ?? String(source?.url ?? "").split("/blob/")[0];
    if (!inputGroups.has(group)) inputGroups.set(group, []);
    if (inputGroups.get(group).length < maxSources) inputGroups.get(group).push(source);
  }
  const inspected = [];
  for (const source of roundRobin([...inputGroups.values()]).slice(0, maxSources)) {
    const length = typeof source?.text === "string" ? size(source.text) : 0;
    if (bundle.coverage.inputBytesProcessed + length > maxInputBytes) { bundle.coverage.omittedSources++; continue; }
    bundle.coverage.inputBytesProcessed += length;
    const identity = sourceIdentity(source, maxSourceBytes);
    if (!identity) { bundle.errors.push("invalid-source"); continue; }
    bundle.coverage.snapshotBytesVerified += length;
    inspected.push({ source, identity });
  }
  const normalizedTargets = normalizeTargets(targets, inspected);
  if (!normalizedTargets) { bundle.errors.push("invalid-targets"); return bundle; }
  bundle.targets = normalizedTargets;
  const groups = [], allCandidates = [], excluded = new Set(excludeMaterialIds), deprioritized = new Set(deprioritizeMaterialIds), tainted = new Set();
  for (const { source, identity } of inspected) {
    const target = normalizedTargets.find((value) => (!source.targetId || value.id === source.targetId) && value.available &&
      value.repository.toLowerCase() === identity.repository.toLowerCase() && value.commit === identity.commit &&
      (source.repoId == null || value.repoId == null || source.repoId === value.repoId));
    if (!target) { bundle.errors.push("source-target-mismatch"); continue; }
    const remaining = Math.min(maxSourceReadBytes, maxReadBytes - bundle.coverage.bytesRead);
    if (remaining < 32) { bundle.coverage.omittedSources++; continue; }
    const readSpan = Object.freeze(source.readSpan ? { ...source.readSpan } : { startByte: 0, endByte: size(source.text) });
    const partial = source.partial === true || readSpan.startByte > 0 || (source.originalBytes != null && source.originalBytes > readSpan.endByte);
    const record = Object.freeze({ targetId: target.id, repoId: target.repoId ?? source.repoId ?? null, repository: identity.repository,
      commit: identity.commit, path: source.path, url: source.url, hash: source.hash.toLowerCase(), text: source.text, form: inferForm(source.path, source.form),
      partial, readSpan, originalBytes: source.originalBytes ?? (partial ? null : readSpan.endByte),
      ...(source.blobOid ? { blobOid: source.blobOid.toLowerCase() } : {}),
      ...(source.contentSha256 ? { contentSha256: source.contentSha256.toLowerCase() } : {}) });
    const key = sourceKey(record), existing = bundle.manifest.get(key);
    if (existing) {
      if (existing.hash !== record.hash) { bundle.errors.push("conflicting-source"); tainted.add(key); }
      continue;
    }
    let conflict = false;
    for (const [otherKey, other] of bundle.manifest) {
      if (other.targetId !== record.targetId || other.commit !== record.commit || other.path !== record.path) continue;
      const start = Math.max(other.readSpan.startByte, record.readSpan.startByte), end = Math.min(other.readSpan.endByte, record.readSpan.endByte);
      const sizeConflict = other.originalBytes != null && record.originalBytes != null && other.originalBytes !== record.originalBytes;
      const digestConflict = other.contentSha256 && record.contentSha256 && other.contentSha256 !== record.contentSha256;
      const bytesConflict = start < end && !Buffer.from(other.text).subarray(start - other.readSpan.startByte, end - other.readSpan.startByte)
        .equals(Buffer.from(record.text).subarray(start - record.readSpan.startByte, end - record.readSpan.startByte));
      if (sizeConflict || digestConflict || bytesConflict) { tainted.add(otherKey); tainted.add(key); conflict = true; }
    }
    if (conflict) { bundle.errors.push("conflicting-source"); continue; }
    bundle.manifest.set(key, record); bundle.sources.push(record);
    const windows = readingWindows(record.text, remaining), group = [], ids = new Set();
    bundle.coverage.bytesRead += windows.reduce((sum, window) => sum + size(window.text), 0);
    if (record.partial || windows.some(({ partial }) => partial)) bundle.coverage.partialSources++;
    for (const window of windows) {
      const raw = Buffer.from(window.text), pieces = [];
      for (const block of blocksFor({ ...record, text: window.text })) {
        const text = raw.subarray(block.span.startByte, block.span.endByte).toString("utf8");
        pieces.push(block);
        if (size(text) > 1024) pieces.push(...splitBlock(block, text, 1024, 128));
        if (size(text) > 256) pieces.push(...splitBlock(block, text, 256, 32));
        if (size(text) > 128) pieces.push(...splitBlock(block, text, 128, 16));
      }
      for (const block of pieces) {
        const text = raw.subarray(block.span.startByte, block.span.endByte).toString("utf8");
        if (!text.trim()) continue;
        const offset = record.readSpan.startByte + window.startByte;
        const material = { targetId: target.id, repoId: record.repoId, commit: record.commit, path: record.path, form: block.form,
          span: Object.freeze({ startByte: offset + block.span.startByte, endByte: offset + block.span.endByte }), spanSha256: hash(text), text,
          partial: record.partial || window.partial || block.partial === true };
        material.id = materialId(material);
        if (ids.has(material.id)) continue;
        ids.add(material.id);
        group.push({ material: Object.freeze(material), source: record, qualification: QUALIFICATION.test(text),
          priority: readingPriority(material, block.index) + (/jev|typesafe|systemone/i.test(text) ? 20 : 0), index: block.index });
      }
    }
    const oldSpans = group.filter(({ material }) => deprioritized.has(material.id)).map(({ material }) => material.span);
    const alreadyRead = ({ material }) => deprioritized.has(material.id) || oldSpans.some((span) =>
      Math.max(0, Math.min(span.endByte, material.span.endByte) - Math.max(span.startByte, material.span.startByte)) >=
      Math.min(span.endByte - span.startByte, material.span.endByte - material.span.startByte) / 2);
    group.sort((a, b) => Number(alreadyRead(a)) - Number(alreadyRead(b)) || b.priority - a.priority || a.index - b.index || b.material.text.length - a.material.text.length);
    if (group.length) { groups.push(group); allCandidates.push(...group); }
  }
  const modelData = { targets: normalizedTargets.map(({ id, repository, available, listed, fork, parent }) => ({ id, repository, available, listed, ...(fork ? { fork, parent } : {}) })),
    materials: [], omitted: allCandidates.length + bundle.errors.length + bundle.coverage.omittedSources };
  if (bundle.coverage.partialSources) modelData.coverage = { partialSources: bundle.coverage.partialSources };
  const seen = new Set(), represented = new Set(), qualificationCounts = new Map(), selectedRanges = new Map();
  // A follow-up first reads an entirely unseen source, then unseen spans in already represented files.
  groups.sort((a, b) => Number(a.some(({ material }) => deprioritized.has(material.id))) - Number(b.some(({ material }) => deprioritized.has(material.id))));
  for (const key of tainted) bundle.manifest.delete(key);
  bundle.sources = bundle.sources.filter((source) => !tainted.has(sourceKey(source)));
  const pending = normalizedTargets.map((target) => ({ cursor: 0, queues: groups.filter((group) => group[0].material.targetId === target.id && !tainted.has(sourceKey(group[0].source))).map((group) => [...group]) }));
  const next = (state) => {
    for (let tries = 0; tries < state.queues.length; tries++) {
      const queue = state.queues[state.cursor++ % state.queues.length];
      while (queue.length) {
        const candidate = queue.shift(), material = candidate.material;
        if (excluded.has(material.id) || seen.has(`${material.targetId}:${material.spanSha256}`)) continue;
        // IDs are compact digests. A collision must never give one displayed ID two meanings.
        if (bundle.materialMap.has(material.id)) continue;
        const ranges = selectedRanges.get(sourceKey(candidate.source)) ?? [];
        if (ranges.some((span) => Math.max(0, Math.min(span.endByte, material.span.endByte) - Math.max(span.startByte, material.span.startByte)) >=
            Math.min(span.endByte - span.startByte, material.span.endByte - material.span.startByte) / 2)) continue;
        if (candidate.qualification && (qualificationCounts.get(sourceKey(candidate.source)) ?? 0) >= 2) continue;
        return candidate;
      }
    }
    return null;
  };
  while (pending.some(({ queues }) => queues.some((queue) => queue.length)) && modelData.materials.length < maxMaterials) {
    for (const state of pending) {
      if (modelData.materials.length >= maxMaterials) break;
      let candidate;
      while ((candidate = next(state))) {
        const material = candidate.material;
        let text;
        try { text = redactText(material.text); } catch { state.cursor--; continue; }
        if (!safeText(text)) { state.cursor--; continue; }
        const view = { id: material.id, targetId: material.targetId, form: material.form, text, ...(material.partial ? { partial: true } : {}) };
        // Try this source's smaller complete blocks/windows before advancing to the next source.
        if (size(JSON.stringify({ ...modelData, materials: [...modelData.materials, view] })) > budget) { state.cursor--; continue; }
        modelData.materials.push(view); seen.add(`${material.targetId}:${material.spanSha256}`); represented.add(material.id);
        const key = sourceKey(candidate.source);
        if (!selectedRanges.has(key)) selectedRanges.set(key, []);
        selectedRanges.get(key).push(material.span);
        if (candidate.qualification) qualificationCounts.set(sourceKey(candidate.source), (qualificationCounts.get(sourceKey(candidate.source)) ?? 0) + 1);
        bundle.materialMap.set(material.id, material); bundle.sourceMap.set(material.id, candidate.source);
        break;
      }
    }
  }
  modelData.omitted = allCandidates.filter(({ material }) => !represented.has(material.id)).length + bundle.errors.length + bundle.coverage.omittedSources + Math.max(0, inputs.length - maxSources);
  if (size(JSON.stringify(modelData)) > budget) { bundle.materialMap.clear(); bundle.sourceMap.clear(); return bundle; }
  bundle.modelData = modelData; bundle.byteLength = size(JSON.stringify(modelData));
  bundle.status = modelData.materials.length ? "ready" : "insufficient-evidence";
  return bundle;
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function boundedProse(value, maximum, required, redactText) {
  return safeText(value) && value === value.trim() && value.length <= maximum && (!required || Boolean(value)) &&
    !/[\r\n<>]/u.test(value) && redactText(value) === value;
}

function validRef(id, target, bundle, checkedSources) {
  const material = bundle.materialMap?.get(id), source = bundle.sourceMap?.get(id);
  if (!material || !source || material.id !== id || materialId(material) !== id || material.targetId !== target.id || source.targetId !== target.id ||
      material.repoId !== source.repoId || material.commit !== target.commit || material.commit !== source.commit || material.path !== source.path ||
      source.repository.toLowerCase() !== target.repository.toLowerCase() || (target.repoId != null && source.repoId !== target.repoId)) return false;
  if (!checkedSources.has(source)) {
    if (!sourceIdentity(source, 10 * 1024 * 1024)) return false;
    checkedSources.add(source);
  }
  const span = material.span, raw = Buffer.from(source.text);
  const offset = source.readSpan?.startByte ?? 0;
  if (!exactKeys(span, ["startByte", "endByte"]) || !Number.isSafeInteger(span.startByte) || !Number.isSafeInteger(span.endByte) ||
      span.startByte < offset || span.startByte >= span.endByte || span.endByte > offset + raw.length || !FORMS.has(material.form)) return false;
  const slice = raw.subarray(span.startByte - offset, span.endByte - offset);
  return slice.toString("utf8") === material.text && Buffer.from(material.text).equals(slice) && hash(slice) === material.spanSha256;
}

/** Validate shape and immutable provenance only. The model owns kind, relation, admission, and interpretation. */
export function validateVerdict(raw, bundle, taxonomy = []) {
  try {
    if (typeof raw === "string" && size(raw) > 16000) return null;
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!exactKeys(value, VERDICT_KEYS) || !TARGET_IDS.has(value.target) || !["admit", "exclude", "need-more"].includes(value.decision) ||
        !CATALOG_KINDS.has(value.catalogKind) || !RELATIONS.has(value.jevRelation) || !BASES.has(value.reviewBasis) ||
        !Array.isArray(value.claims) || value.claims.length > 6 || !Array.isArray(value.conflicts) || value.conflicts.length > 12 ||
        !(bundle?.materialMap instanceof Map) || !(bundle.sourceMap instanceof Map)) return null;
    const target = bundle.targets?.find(({ id }) => id === value.target);
    if (!target || (value.need !== null && !NEEDS.has(value.need)) || ((value.decision === "need-more") !== (value.need !== null))) return null;
    const admitted = value.decision === "admit", categories = Array.isArray(taxonomy) ? taxonomy.map(({ category }) => category) : [];
    if (!(typeof value.category === "string" && categories.includes(value.category)) && !(value.category === null && !admitted)) return null;
    const redactText = bundle.redactText ?? ((text) => text), checkedSources = new Set();
    const refs = (ids, required) => Array.isArray(ids) && ids.length <= 12 && (!required || ids.length > 0) && new Set(ids).size === ids.length &&
      ids.every((id) => typeof id === "string" && validRef(id, target, bundle, checkedSources));
    for (const claim of value.claims) {
      if (!exactKeys(claim, ["type", "text", "support"]) || !["purpose", "mechanism", "contribution"].includes(claim.type) ||
          !boundedProse(claim.text, 300, true, redactText) || !refs(claim.support, true)) return null;
    }
    if (!refs(value.conflicts, false) || (admitted && (!target.available || !isSha(target.commit) || !value.claims.length))) return null;
    if (!["plainSummary", "plainSummaryEn"].every((key) => boundedProse(value[key], 140, admitted, redactText))) return null;
    return { target: value.target, decision: value.decision, catalogKind: value.catalogKind, jevRelation: value.jevRelation,
      reviewBasis: value.reviewBasis, claims: value.claims.map(({ type, text, support }) => ({ type, text, support: [...support] })),
      conflicts: [...value.conflicts], need: value.need, category: value.category, plainSummary: value.plainSummary, plainSummaryEn: value.plainSummaryEn };
  } catch { return null; }
}

/** Receipts contain exact raw byte spans; model-visible redaction never changes provenance. */
export function resolveMaterialRefs(bundle, verdict) {
  try {
    const target = bundle.targets?.find(({ id }) => id === verdict?.target);
    if (!target || !Array.isArray(verdict.claims) || !Array.isArray(verdict.conflicts)) return [];
    const ids = [...new Set([...verdict.claims.flatMap((claim) => claim.support ?? []), ...verdict.conflicts])], checked = new Set();
    if (!ids.every((id) => validRef(id, target, bundle, checked))) return [];
    return ids.map((id) => {
      const material = bundle.materialMap.get(id), source = bundle.sourceMap.get(id);
      const { text: _text, ...receipt } = material;
      return { ...receipt, span: { ...receipt.span }, url: source.url, sourceSha256: source.hash,
        sourceSpan: { ...source.readSpan }, sourcePartial: source.partial === true, originalBytes: source.originalBytes,
        ...(source.blobOid ? { blobOid: source.blobOid } : {}), ...(source.contentSha256 ? { contentSha256: source.contentSha256 } : {}) };
    });
  } catch { return []; }
}

export function resolveMaterialFiles(bundle, verdict) {
  const refs = resolveMaterialRefs(bundle, verdict), result = [], seen = new Set();
  for (const ref of refs) {
    const key = JSON.stringify([ref.targetId, ref.commit, ref.path, ref.sourceSpan, ref.sourceSha256]);
    if (seen.has(key)) continue;
    seen.add(key); result.push({ targetId: ref.targetId, repoId: ref.repoId, commit: ref.commit, path: ref.path, url: ref.url, hash: ref.sourceSha256,
      sourceSpan: { ...ref.sourceSpan }, sourcePartial: ref.sourcePartial, originalBytes: ref.originalBytes,
      ...(ref.blobOid ? { blobOid: ref.blobOid } : {}), ...(ref.contentSha256 ? { contentSha256: ref.contentSha256 } : {}) });
  }
  return result;
}
