/** Bounded lexical evidence, not a type resolver, call graph, or execution proof. */
import { createHash } from "node:crypto";

const EXTENSION = /\.(?:py|[cm]?js|jsx|ts|tsx|go|rs|java|kt|rb|php|cs|cpp|cc|c|h|hpp|swift|sh|lua|dart|ipynb)$/i;
const EXCLUDED = /(?:^|\/)(?:docs?|documentation|node_modules|vendor|dist|build|coverage|\.git|\.github|\.env[^/]*|fixtures?|tests?|__tests__|generated|__pycache__)(?:\/|$)|(?:\.min\.[cm]?js|\.generated\.[^/]+|\.g\.[^/]+)$/i;
const NON_CALLS = new Set(["if", "while", "for", "switch", "catch", "with", "sizeof", "typeof", "function", "def", "class", "fn", "func", "fun"]);
const VERDICT_KEYS = ["verified", "role", "witness", "reasonCode", "category", "plainSummary", "plainSummaryEn"];
const bytes = (value) => Buffer.byteLength(value, "utf8");
const digest = (text) => createHash("sha256").update(text).digest("hex");

function safeSource(source, maxSourceBytes) {
  if (!source || typeof source.path !== "string" || source.path.length > 600 ||
      /^[/.]|[\\\u0000-\u001f\u007f?#]/u.test(source.path) ||
      source.path.split("/").some((part) => !part || part === "." || part === "..") ||
      !EXTENSION.test(source.path) || EXCLUDED.test(source.path) ||
      typeof source.text !== "string" || bytes(source.text) > maxSourceBytes || source.text.includes("\0") ||
      typeof source.hash !== "string" || !/^[a-f\d]{64}$/i.test(source.hash) || digest(source.text) !== source.hash.toLowerCase()) return false;
  try {
    const url = new URL(source.url);
    const parts = url.pathname.split("/").slice(1).map(decodeURIComponent);
    return url.protocol === "https:" && url.hostname === "github.com" && !url.port && !url.username && !url.password &&
      !url.search && !url.hash && parts.length >= 5 && parts[0] && parts[1] && parts[2] === "blob" &&
      /^[a-f\d]{40,64}$/i.test(parts[3]) && parts.slice(4).join("/") === source.path;
  } catch { return false; }
}

/** Preserve newlines/indentation while excluding comments and quoted text from operation detection. */
function lex(text, path) {
  const tokens = [], issues = new Set();
  const hashComments = /\.(?:py|rb|sh|ipynb)$/i.test(path);
  const lua = /\.lua$/i.test(path);
  let i = 0, line = 1, significant;
  const add = (type, end) => {
    const value = text.slice(i, end);
    tokens.push({ type, value, start: i, end, line, endLine: line + (value.match(/\n/g)?.length ?? 0) });
    if (type !== "space" && type !== "comment") significant = value;
    line += value.match(/\n/g)?.length ?? 0;
    i = end;
  };
  while (i < text.length) {
    const char = text[i], pair = text.slice(i, i + 2);
    if (/\s/u.test(char)) { let end = i + 1; while (end < text.length && /\s/u.test(text[end])) end++; add("space", end); continue; }
    if ((hashComments && char === "#") || (i === 0 && pair === "#!") || (!hashComments && !lua && pair === "//") || (lua && pair === "--" && text.slice(i, i + 4) !== "--[[")) {
      const end = text.indexOf("\n", i), value = text.slice(i, end < 0 ? text.length : end);
      const directive = /\.go$/i.test(path) && /^\/\/(?:go:build\s|\s*\+build\s)/.test(value);
      add(directive ? "directive" : "comment", end < 0 ? text.length : end); continue;
    }
    if ((!hashComments && !lua && pair === "/*") || (lua && text.slice(i, i + 4) === "--[[")) {
      const close = lua ? "]]" : "*/", end = text.indexOf(close, i + (lua ? 4 : 2));
      if (end < 0) { issues.add("unterminated-comment"); add("comment", text.length); }
      else add("comment", end + close.length);
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      const triple = hashComments && text.slice(i, i + 3) === char.repeat(3);
      const quote = triple ? char.repeat(3) : char;
      let end = i + quote.length, closed = false;
      for (; end < text.length; end++) {
        if (text[end] === "\\") { end++; continue; }
        if (text.slice(end, end + quote.length) === quote) { end += quote.length; closed = true; break; }
      }
      if (!closed) issues.add("unterminated-string");
      add(triple ? "long-string" : "string", Math.min(end, text.length));
      if (char === "`" && tokens.at(-1).value.includes("${")) issues.add("template-expression-unresolved");
      continue;
    }
    // Slash expressions are not interpreted as call syntax. Preserve their literal representation.
    if (!hashComments && !lua && char === "/") {
      const prior = significant;
      if (!prior || /^(?:=|\(|\[|,|:|!|return|=>)$/.test(prior)) {
        let end = i + 1, bracket = false, closed = false;
        for (; end < text.length && text[end] !== "\n"; end++) {
          if (text[end] === "\\") { end++; continue; }
          if (text[end] === "[") bracket = true;
          if (text[end] === "]") bracket = false;
          if (text[end] === "/" && !bracket) { end++; closed = true; break; }
        }
        if (closed) { while (/[a-z]/i.test(text[end] ?? "") && end < text.length) end++; add("regex", end); continue; }
      }
    }
    if (/[\p{L}_$]/u.test(char)) { let end = i + char.length; while (end < text.length && /[\p{L}\p{N}_$]/u.test(text[end])) end++; add("identifier", end); continue; }
    if (/\d/.test(char)) { let end = i + 1; while (end < text.length && /[\w.]/.test(text[end])) end++; add("number", end); continue; }
    add("punctuation", i + (["=>", "?.", "==", "!=", "&&", "||", "++", "--", "::"].includes(pair) ? 2 : 1));
  }
  return { tokens, issues };
}

function isCallAt(code, index) {
  const token = code[index];
  if (token.type !== "identifier" || NON_CALLS.has(token.value) || code[index + 1]?.value !== "(" ||
      ["function", "def", "class", "fn", "func", "fun"].includes(code[index - 1]?.value)) return false;
  if (code[index - 1]?.type === "identifier" && !["new", "return", "await", "throw", "yield", "defer", "go"].includes(code[index - 1].value)) {
    let depth = 0;
    for (let next = index + 1; next < code.length; next++) {
      if (code[next].value === "(") depth++;
      if (code[next].value === ")" && --depth === 0) return code[next + 1]?.value !== "{";
    }
  }
  return true;
}

function operation(tokens) {
  const code = tokens.filter((t) => !["space", "comment", "string", "long-string", "regex"].includes(t.type));
  return code.some((_, index) => isCallAt(code, index));
}

function normalizeIdentifiers(tokens, path, issues) {
  // Only a flat JS/TS module has a scope we can establish here without an AST.
  const code = tokens.filter((t) => !["space", "comment", "string", "long-string", "regex"].includes(t.type));
  if (!/\.[cm]?[jt]s$/i.test(path) || code.some((t) => ["{", "}", "function", "class", "=>", "eval", "with", "for", "while", "if", "switch", "catch", "try"].includes(t.value))) {
    issues.add("identifiers-preserved-lexical-only"); return new Map();
  }
  const names = new Map();
  for (let i = 0; i < code.length - 2; i++) {
    if (["const", "let", "var"].includes(code[i].value) && code[i + 1].type === "identifier" && code[i + 2].value === "=") {
      const name = code[i + 1].value;
      if (names.has(name)) { issues.add("identifiers-preserved-redeclaration"); return new Map(); }
      names.set(name, `v${names.size + 1}`);
    }
  }
  return names;
}

function render(tokens, names, redactText, issues) {
  let result = "", prior;
  const significant = tokens.filter((t) => t.type !== "space" && t.type !== "comment");
  const positions = new Map(significant.map((token, index) => [token, index]));
  for (const token of tokens) {
    if (token.type === "comment") { result += token.value.replace(/[^\n]/g, " "); continue; }
    let value = token.value;
    if (token.type === "long-string" && !result.slice(result.lastIndexOf("\n") + 1).trim()) {
      // Standalone Python documentation contributes no implementation operation.
      result += "\n".repeat(token.endLine - token.line); continue;
    }
    if (token.type === "string" || token.type === "long-string") {
      const at = positions.get(token), before = significant.slice(Math.max(0, at - 3), at).map((t) => t.value);
      const content = value.slice(1, -1);
      const slot = (before.at(-2) ?? "").replace(/^["'`]|["'`]$/g, "");
      const moduleSlot = before.at(-1) === "from" || before.at(-1) === "import" || before.at(-1) === "include" ||
        (before.at(-1) === "(" && ["require", "import"].includes(before.at(-2)));
      const keyedSlot = ["=", ":"].includes(before.at(-1)) && /^(?:model(?:_id|Id|_name|Name)?|checkpoint|weights|endpoint|base_url|baseURL|url|route|path)$/i.test(slot);
      const endpointArgument = before.at(-1) === "(" && /^[\w$]+$/.test(before.at(-2) ?? "") &&
        /^(?:https?:\/\/|\/)[^\s"'`]{1,150}$/.test(content);
      const objectKey = significant[at + 1]?.value === ":" && ["{", ","].includes(before.at(-1)) && /^[A-Za-z_$][\w$.-]{0,63}$/.test(content);
      // A compact spelling alone confers no trust or semantic role. Ordinary values and
      // choice labels remain opaque, even when they resemble ALL_CAPS protocol names.
      const semanticSlot = moduleSlot || keyedSlot || endpointArgument || objectKey;
      if (token.type === "long-string" || bytes(value) > 160 || (content !== "" && !semanticSlot) || (value.startsWith("`") && value.includes("${"))) {
        value = `"[opaque-string:${digest(value).slice(0, 12)}]"` + "\n".repeat(token.endLine - token.line);
        issues.add("literal-elided");
      } else value = redactText(value);
    } else if (token.type === "identifier" && names.has(value) && ![".", "?.", "::"].includes(prior?.value)) value = names.get(value);
    result += value;
    if (token.type !== "space") prior = token;
  }
  return redactText(result).split("\n").map((line) => line.replace(/[\t ]+$/g, "")).join("\n");
}

/** Only standalone function/class declarations may be omitted; module assignments and guards stay. */
function declarationRanges(lines, path) {
  const ranges = [];
  if (/\.(?:py|ipynb)$/i.test(path)) {
    for (let i = 0; i < lines.length; i++) {
      if (!/^(?:async\s+)?(?:def|class)\s+/.test(lines[i])) continue;
      let start = i;
      while (start > 0 && /^@/.test(lines[start - 1])) start--;
      let end = i + 1;
      while (end < lines.length && (!lines[end].trim() || /^\s/.test(lines[end]))) end++;
      ranges.push({ start, end, name: /(?:def|class)\s+([\w$]+)/.exec(lines[i])?.[1] }); i = end - 1;
    }
    return ranges;
  }
  if (!/\.[cm]?[jt]sx?$/i.test(path)) return ranges;
  let depth = 0, active = null;
  for (let i = 0; i < lines.length; i++) {
    if (depth === 0 && /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s*\*?\s+|class\s+)/.test(lines[i])) active = { start: i, opened: false, name: /(?:function\s*\*?|class)\s+([\w$]+)/.exec(lines[i])?.[1] };
    const { tokens } = lex(lines[i], path);
    for (const token of tokens) {
      if (token.type !== "punctuation") continue;
      if (token.value === "{") { depth++; if (active) active.opened = true; }
      if (token.value === "}") depth--;
    }
    if (active?.opened && depth === 0) { ranges.push({ start: active.start, end: i + 1, name: active.name }); active = null; }
    if (depth < 0) return [];
  }
  return depth === 0 ? ranges : [];
}

function compactLines(lines) {
  return lines.filter((line) => line.trim()).join("\n").trim();
}

function retainedRanges(indexes) {
  const result = [];
  for (const index of indexes) {
    if (result.at(-1)?.[1] === index) result.at(-1)[1] = index + 1;
    else result.push([index + 1, index + 1]);
  }
  return result;
}

/** Conservative same-spelling def/use closure. Ambiguous scopes are retained, never resolved by guess. */
function relationshipCandidates(lines, path, inheritedIssues) {
  const text = lines.join("\n"), parsed = lex(text, path);
  const tokens = parsed.tokens.filter((t) => !["space", "comment", "string", "long-string", "regex"].includes(t.type));
  const perLine = Array.from({ length: lines.length }, () => []), references = new Map(), definitions = new Map();
  const add = (map, name, line) => { if (!map.has(name)) map.set(name, new Set()); map.get(name).add(line); };
  for (const token of tokens) {
    perLine[token.line - 1].push(token);
    if (token.type === "identifier") add(references, token.value, token.line - 1);
  }
  const assigned = new Map(), declarationNames = new Map();
  for (let line = 0; line < lines.length; line++) {
    const list = perLine[line];
    if (list.some((t) => t.value === "import")) {
      list.filter((t) => t.type === "identifier").forEach((t) => add(definitions, t.value, line));
    }
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].type === "identifier" && (list[i + 1].value === "=" || (list[i + 1].value === ":" && list[i + 2]?.value === "=")) && ![".", "?.", "::"].includes(list[i - 1]?.value)) {
        add(definitions, list[i].value, line);
        if (!assigned.has(line)) assigned.set(line, new Set());
        assigned.get(line).add(list[i].value);
      }
    }
    const declaration = /\b(?:function\s*\*?|def|class|fn|func|fun)\s+([\w$]+)/.exec(lines[line]);
    if (declaration) { add(definitions, declaration[1], line); declarationNames.set(line, declaration[1]); }
  }
  // Preserve lexical containers, including constant guards. Parenthesis and object groups stay whole.
  const groups = [], stack = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (["(", "[", "{"].includes(token.value)) {
      const line = token.line - 1, before = tokens[i - 1]?.value;
      const block = token.value === "{" && (before === ")" || before === "=>" || ["else", "try", "finally", "do"].includes(before) || /\b(?:class|function)\b/.test(lines[line]));
      stack.push({ open: token.value, start: line, block, control: token.value === "(" && ["if", "while", "for", "switch", "catch"].includes(before) });
    } else if ([")", "]", "}"].includes(token.value)) {
      const group = stack.pop();
      if (!group || ({ "(": ")", "[": "]", "{": "}" })[group.open] !== token.value) return [];
      groups.push({ ...group, end: token.line - 1 });
    }
  }
  if (stack.length) return [];
  const python = /\.(?:py|ipynb)$/i.test(path);
  const rubyGroups = [];
  if (/\.rb$/i.test(path)) {
    const rubyStack = [];
    for (let line = 0; line < lines.length; line++) {
      const code = lines[line].trim();
      if (/^(?:if|unless|case|while|until|for|def|class|module|begin)\b/.test(code) || /\bdo(?:\s*\|[^|]*\|)?\s*$/.test(code)) rubyStack.push({ start: line, clauses: [] });
      else if (/^(?:else|elsif|when|rescue|ensure)\b/.test(code)) { if (!rubyStack.length) return []; rubyStack.at(-1).clauses.push(line); }
      else if (/^end\b/.test(code)) { const block = rubyStack.pop(); if (!block) return []; rubyGroups.push({ ...block, end: line }); }
    }
    if (rubyStack.length) return [];
  }
  // Compilation controls are semantic input, even when spelled as comments.
  const directives = lines.map((line, index) => ({ line, index })).filter(({ line }) =>
    (/\.(?:c|cc|cpp|h|hpp|cs)$/i.test(path) && /^\s*#/.test(line)) ||
    (/\.go$/i.test(path) && /^\s*\/\/(?:go:build\s|\s*\+build\s)/.test(line)) ||
    (/\.rs$/i.test(path) && /^\s*#\s*!?\[/.test(line))
  ).map(({ index }) => index);
  const anchors = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (!isCallAt(tokens, i)) continue;
    const line = token.line - 1;
    const receiver = [".", "?.", "::"].includes(tokens[i - 1]?.value) && tokens[i - 2]?.type === "identifier" ? tokens[i - 2].value : null;
    const output = assigned.get(line) ?? new Set();
    const score = (receiver ? 2 : 0) + [...output].filter((name) => (references.get(name)?.size ?? 0) > 1).length * 3;
    anchors.push({ line, receiver, output, score });
  }
  anchors.sort((a, b) => b.score - a.score || a.line - b.line);
  const result = [], seen = new Set();
  for (const anchor of anchors.slice(0, 24)) {
    const selected = new Set([anchor.line, ...directives]), forward = new Set(anchor.output);
    if (anchor.receiver) for (const line of references.get(anchor.receiver) ?? []) selected.add(line);
    let exhausted = false;
    for (let pass = 0; pass < 12; pass++) {
      const prior = selected.size;
      for (const name of forward) {
        for (const line of references.get(name) ?? []) {
          selected.add(line);
          for (const next of assigned.get(line) ?? []) forward.add(next);
        }
      }
      for (const line of [...selected]) {
        for (const token of perLine[line]) if (token.type === "identifier") for (const definition of definitions.get(token.value) ?? []) selected.add(definition);
        if (declarationNames.has(line)) {
          for (const reference of references.get(declarationNames.get(line)) ?? []) selected.add(reference);
          const body = groups.find((group) => group.block && group.start === line);
          if (body && !(anchor.line >= body.start && anchor.line <= body.end)) {
            for (let bodyLine = body.start; bodyLine <= body.end; bodyLine++) selected.add(bodyLine);
          }
        }
        // A newline does not remove a JS single-statement conditional guard.
        if (!python) {
          let before = line - 1;
          while (before >= 0 && !lines[before].trim()) before--;
          if (before >= 0 && /^\s*(?:if|while|for)\s*\(/.test(lines[before]) && /\)\s*$/.test(lines[before])) selected.add(before);
        }
        // Java/Kotlin/TS decorator annotations belong to the selected declaration.
        if (/\.(?:java|kt|ts|tsx)$/i.test(path)) {
          for (let decorator = line - 1; decorator >= 0 && /^\s*@/.test(lines[decorator]); decorator--) selected.add(decorator);
        }
        if (python && lines[line].trim()) {
          let indent = lines[line].match(/^\s*/)[0].length;
          for (let parent = line - 1; parent >= 0 && indent > 0; parent--) {
            if (!lines[parent].trim()) continue;
            const parentIndent = lines[parent].match(/^\s*/)[0].length;
            if (parentIndent < indent && /:\s*$/.test(lines[parent])) {
              selected.add(parent); indent = parentIndent;
              for (let decorator = parent - 1; decorator >= 0 && /^\s*@/.test(lines[decorator]); decorator--) selected.add(decorator);
            }
          }
        }
      }
      for (const group of groups) if ([...selected].some((line) => line >= group.start && line <= group.end)) {
        if (group.block) { selected.add(group.start); selected.add(group.end); }
        else for (let line = group.start; line <= group.end; line++) selected.add(line);
      }
      for (const group of groups.filter((group) => group.control)) {
        let statement = group.end + 1;
        while (statement < lines.length && !lines[statement].trim()) statement++;
        if (selected.has(statement)) for (let line = group.start; line <= group.end; line++) selected.add(line);
      }
      for (const group of rubyGroups) if ([...selected].some((line) => line >= group.start && line <= group.end)) {
        selected.add(group.start); selected.add(group.end);
        group.clauses.forEach((line) => selected.add(line));
      }
      if (selected.size > 100) { exhausted = true; break; }
      if (selected.size === prior) break;
      if (pass === 11) exhausted = true;
    }
    if (exhausted) continue;
    const indexes = [...selected].sort((a, b) => a - b), code = compactLines(indexes.map((i) => lines[i]));
    if (!code || seen.has(code) || !operation(lex(code, path).tokens)) continue;
    seen.add(code);
    result.push({ code, kind: "operation", startLine: indexes[0] + 1, endLine: indexes.at(-1) + 1, ranges: retainedRanges(indexes), issues: [...inheritedIssues, "lexical-slice", "unselected-effects-unresolved"] });
  }
  return result;
}

function candidatesFor(source, redactText) {
  const parsed = lex(source.text, source.path), issues = parsed.issues;
  if ([...issues].some((issue) => issue.startsWith("unterminated-"))) return { candidates: [], issues };
  const names = normalizeIdentifiers(parsed.tokens, source.path, issues);
  const rendered = render(parsed.tokens, names, redactText, issues), lines = rendered.split("\n");
  const whole = compactLines(lines), candidates = [];
  if (whole) candidates.push({ code: whole, startLine: 1, endLine: lines.length, ranges: [[1, lines.length]], kind: operation(parsed.tokens) ? "operation" : "context", issues: [...issues] });
  candidates.push(...relationshipCandidates(lines, source.path, issues));
  const ranges = declarationRanges(lines, source.path);
  if (ranges.length > 1 && ranges.length <= 32) {
    const covered = new Set(ranges.flatMap(({ start, end }) => Array.from({ length: end - start }, (_, i) => start + i)));
    for (const range of ranges) {
      // Keep every module assignment/guard and declarations named by retained code.
      // These are conservative lexical references, not resolved runtime call edges.
      const selected = new Set([range]);
      let indexes = [], code = "";
      for (let pass = 0; pass <= ranges.length; pass++) {
        indexes = lines.map((_, i) => i).filter((i) => !covered.has(i) || [...selected].some((r) => i >= r.start && i < r.end));
        code = compactLines(indexes.map((i) => lines[i]));
        const identifiers = new Set(lex(code, source.path).tokens.filter((token) => token.type === "identifier").map((token) => token.value));
        const added = ranges.filter((r) => !selected.has(r) && r.name && identifiers.has(r.name));
        if (!added.length) break;
        added.forEach((r) => selected.add(r));
      }
      if (selected.size === ranges.length) continue;
      const local = lex(code, source.path);
      if (operation(local.tokens)) candidates.push({ code, startLine: indexes[0] + 1, endLine: indexes.at(-1) + 1, ranges: retainedRanges(indexes), kind: "operation", issues: [...issues, "other-declarations-omitted", "cross-scope-effects-unresolved"] });
    }
  }
  return { candidates, issues };
}

/** maxBytes bounds UTF-8 JSON bytes, not exact model tokens. No submitted code is executed. */
export function buildEvidenceBundle({ codeSources = [], maxBytes = 4200, maxSourceBytes = 120000, maxFiles = 8, maxLines = 100, redactText = (text) => text } = {}) {
  const modelData = { v: 1, nodes: [], omitted: 0, unresolved: [] };
  const bundle = { status: "insufficient-evidence", modelData, nodeMap: new Map(), sources: [], redactText };
  if (!Array.isArray(codeSources) || !Number.isSafeInteger(maxBytes) || maxBytes < 0 || !Number.isSafeInteger(maxSourceBytes) || maxSourceBytes < 1 || !Number.isSafeInteger(maxFiles) || maxFiles < 1 || !Number.isSafeInteger(maxLines) || maxLines < 1 || typeof redactText !== "function") return bundle;
  const seen = new Set(), allIssues = new Set();
  for (const input of codeSources.slice(0, maxFiles)) {
    if (!safeSource(input, maxSourceBytes) || seen.has(input.path)) { modelData.omitted++; continue; }
    const source = Object.freeze({ path: input.path, text: input.text, hash: input.hash, url: input.url });
    seen.add(source.path);
    let prepared;
    try { prepared = candidatesFor(source, redactText); } catch { modelData.omitted++; continue; }
    let chosen;
    for (const candidate of prepared.candidates) {
      if (candidate.code.split("\n").length > maxLines) continue;
      const id = `s${bundle.sources.length + 1}`;
      const node = { id, kind: candidate.kind, code: candidate.code };
      const issueCodes = { "identifiers-preserved-lexical-only": "scope", "identifiers-preserved-redeclaration": "scope", "literal-elided": "literal", "template-expression-unresolved": "template", "lexical-slice": "slice", "unselected-effects-unresolved": "effects", "other-declarations-omitted": "declarations", "cross-scope-effects-unresolved": "effects" };
      const unresolved = [...new Set([...allIssues, ...candidate.issues.map((issue) => issueCodes[issue] ?? issue)])];
      // Reserve the final omitted count before packing, so metadata cannot break the bound.
      const trial = { ...modelData, nodes: [...modelData.nodes, node], omitted: codeSources.length, unresolved };
      if (bytes(JSON.stringify(trial)) <= maxBytes) { chosen = { candidate, node, unresolved }; break; }
    }
    if (!chosen) { modelData.omitted++; continue; }
    modelData.nodes.push(chosen.node);
    chosen.unresolved.forEach((issue) => allIssues.add(issue));
    modelData.unresolved = [...allIssues];
    bundle.sources.push(source);
    bundle.nodeMap.set(chosen.node.id, { source, kind: chosen.candidate.kind, startLine: chosen.candidate.startLine, endLine: chosen.candidate.endLine, ranges: chosen.candidate.ranges });
  }
  modelData.omitted += Math.max(0, codeSources.length - maxFiles);
  bundle.status = modelData.nodes.some((node) => node.kind === "operation") ? "ready" : "insufficient-evidence";
  bundle.byteLength = bytes(JSON.stringify(modelData));
  if (bundle.byteLength > maxBytes) { bundle.modelData = null; bundle.status = "insufficient-evidence"; bundle.byteLength = 0; }
  return bundle;
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function validSummary(value, required, redactText) {
  return typeof value === "string" && value.length <= 140 && bytes(value) <= 560 && value === value.trim() &&
    (!required || value.length > 0) && !/[\u0000-\u001f\u007f<>]|https?:\/\/|!\[|\]\(/u.test(value) && redactText(value) === value;
}

/** Return null for every malformed/unsupported output; never coerce a verdict or invent confidence. */
export function validateVerdict(raw, bundle, taxonomy = []) {
  try {
    if (typeof raw === "string" && bytes(raw) > 6000) return null;
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!exactKeys(value, VERDICT_KEYS) || typeof value.verified !== "boolean" ||
        !["client", "server", "middleware", "none"].includes(value.role) ||
        !["implementation-observed", "not-integrated", "insufficient-evidence"].includes(value.reasonCode) ||
        !exactKeys(value.witness, ["entry", "operation", "result"]) || !(bundle?.nodeMap instanceof Map)) return null;
    if (value.verified ? value.role === "none" || value.reasonCode !== "implementation-observed" : value.reasonCode === "implementation-observed") return null;
    const categories = Array.isArray(taxonomy) ? taxonomy.map((row) => row?.category) : [];
    if (!(typeof value.category === "string" && categories.includes(value.category)) && !(value.verified === false && value.category === null)) return null;
    for (const field of ["entry", "operation", "result"]) {
      const ids = value.witness[field];
      if (!Array.isArray(ids) || ids.length > 4 || (value.verified && !ids.length) || new Set(ids).size !== ids.length ||
          ids.some((id) => typeof id !== "string" || !bundle.nodeMap.has(id))) return null;
      if (field === "operation" && ids.some((id) => bundle.nodeMap.get(id).kind !== "operation")) return null;
    }
    if (value.verified && bundle.status !== "ready") return null;
    if (!["plainSummary", "plainSummaryEn"].every((key) => validSummary(value[key], value.verified, bundle.redactText ?? ((text) => text)))) return null;
    // Rebuild the exact approved shape. Unknown fields never cross this boundary.
    return { verified: value.verified, role: value.role, witness: { entry: [...value.witness.entry], operation: [...value.witness.operation], result: [...value.witness.result] }, reasonCode: value.reasonCode, category: value.category, plainSummary: value.plainSummary, plainSummaryEn: value.plainSummaryEn };
  } catch { return null; }
}

/** Resolve only known operation witnesses; returned paths/URLs/hashes originate in the local snapshot. */
export function resolveWitnessFiles(bundle, verdict) {
  if (verdict?.verified !== true || !(bundle?.nodeMap instanceof Map) || !Array.isArray(verdict.witness?.operation) || !verdict.witness.operation.length) return [];
  const result = [], seen = new Set();
  for (const id of verdict.witness.operation) {
    const node = bundle.nodeMap.get(id);
    if (!node || node.kind !== "operation") return [];
    const key = `${node.source.path}\0${node.source.hash}`;
    if (!seen.has(key)) { seen.add(key); result.push(node.source); }
  }
  return result;
}
