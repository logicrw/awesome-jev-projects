import { tagSearchText } from './tags.mjs';
import { licenseSpdx, catalogLabels } from './catalog-contract.mjs';

const normalize = (value) => typeof value === 'string'
  ? value.normalize('NFKC').toLocaleLowerCase('en').replace(/[‐‑‒–—−]/gu, '-').replace(/\s+/gu, ' ').trim()
  : '';
const identity = (value) => normalize(value).replace(/:/gu, '/');
const compareText = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const stableCompare = (a, b) => compareText(identity(a.id), identity(b.id))
  || compareText(identity(a.name), identity(b.name));
const count = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
const timestamp = (value) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  return typeof value === 'string' && value.trim() ? Date.parse(value) : NaN;
};
const dateScore = (value) => Number.isFinite(timestamp(value)) ? timestamp(value) : -Infinity;

// Synonyms are alternatives for one concept, not independent required words.
const concepts = [
  ['爬虫', '抓取', '数据采集', 'browser', 'crawler', 'scrape', 'scraping'],
  ['省钱', '省成本', '降本', '降本路由', '模型路由降本', 'コスト', '비용', 'cost optimization', 'token saver', 'router', 'model routing'],
  ['评测', '跑分', '基准测试', 'benchmark', 'evaluation', 'eval'],
  ['自动化', 'automation', 'workflow', 'browser'],
  ['大模型', '小模型', 'llm', 'slm', 'model'],
  ['浏览器', '浏览器自动化', 'ブラウザ', '브라우저', 'browser automation', 'browser'],
  ['上下文', '上下文 gc', 'コンテキスト', '컨텍스트', 'context gc', 'context', 'compaction'],
];
// Expand deliberate scenario vocabulary, not every English alternative: a query
// for "browser" should not unexpectedly expand into all generic workflows.
const triggers = new Map();
for (const alternatives of concepts) {
  for (const term of alternatives) {
    if (/[^\x00-\x7F]/u.test(term) || ['browser automation', 'model routing', 'context gc'].includes(term)) {
      if (!triggers.has(term)) triggers.set(term, alternatives.map(normalize));
    }
  }
}
const triggerNames = [...triggers.keys()].sort((a, b) => b.length - a.length);

function queryGroups(query) {
  const group = term => ({ alternatives: triggers.get(term) ?? [term], units: term.split(/\s+/u).length });
  if (triggers.has(query)) return [group(query)];
  const groups = [];
  let rest = query;
  // Longest known phrases preserve Chinese scenarios without splitting every Han
  // character. Unknown whitespace-separated words remain separate concepts.
  while (rest && groups.length < 12) {
    let candidate;
    let offset = Infinity;
    for (const term of triggerNames) {
      const index = rest.indexOf(term);
      if (index < 0 || index > offset) continue;
      const before = rest.slice(0, index);
      const after = rest.slice(index + term.length);
      if (/^[a-z]/u.test(term) && ((before && /[a-z0-9]$/u.test(before)) || /^[a-z0-9]/u.test(after))) continue;
      if (index < offset || term.length > (candidate?.length ?? 0)) {
        candidate = term;
        offset = index;
      }
    }
    if (!candidate) {
      groups.push(...rest.split(/\s+/u).filter(Boolean).map(group));
      break;
    }
    groups.push(...rest.slice(0, offset).split(/\s+/u).filter(Boolean).map(group));
    groups.push(group(candidate));
    rest = rest.slice(offset + candidate.length).trim();
  }
  return groups.slice(0, 12);
}


const literalTechnologies = new Set(['playwright', 'rust', 'claude']);
const cjkPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+/gu;
const lineReference = /^(?:lines?\s*)?#?l?\d+(?:\s*[-–,:]\s*#?l?\d+)*$/iu;
const compareScore = (a, b) => b - a;

function strings(value) {
  return (Array.isArray(value) ? value : [value]).filter(item => typeof item === 'string' && item.trim());
}
function evidenceText(project) {
  const lines = (Array.isArray(project.evidenceLines) ? project.evidenceLines : [project.evidenceLines])
    .flatMap(item => typeof item === 'string' ? [item] : item && typeof item === 'object'
      ? strings(item.text).concat(strings(item.snippet)) : [])
    .filter(item => !lineReference.test(normalize(item)));
  return lines.concat((Array.isArray(project.evidence) ? project.evidence : [])
    .flatMap(item => item && typeof item === 'object'
      ? [...strings(item.note), ...strings(item.text), ...strings(item.snippet)] : []));
}
function words(value) {
  return value.replace(cjkPattern, ' ').match(/[\p{L}\p{N}]+/gu) ?? [];
}
function grams(value) {
  const result = new Set();
  for (const run of value.match(cjkPattern) ?? []) {
    const characters = Array.from(run);
    for (let i = 0; i + 1 < characters.length; i++) result.add(characters[i] + characters[i + 1]);
  }
  return [...result];
}
function urlIdentity(value) {
  if (typeof value !== 'string' || /\s/u.test(value.trim())) return null;
  try {
    const input = /^(?:www\.)?github\.com\//iu.test(value) ? `https://${value}` : value;
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol) || !/^(?:www\.)?github\.com$/iu.test(url.hostname)) return null;
    const path = decodeURIComponent(url.pathname).split('/').filter(Boolean);
    if (path.length < 2) return null;
    return identity(`${path[0]}/${path[1].replace(/\.git$/iu, '')}`);
  } catch { return null; }
}
function urlPath(value) {
  try { return normalize(decodeURIComponent(new URL(value).pathname)); }
  catch { return ''; }
}
function canonicalUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    // GitHub repository identities ignore case and view parameters. Other HTTP
    // resources can distinguish path case, query parameters and fragments.
    if (/^(?:www\.)?github\.com$/iu.test(url.hostname)) {
      return normalize(`${url.origin}${decodeURIComponent(url.pathname).replace(/\/+$/u, '')}`);
    }
    return url.href;
  } catch { return ''; }
}
function literalMatcher(term) {
  if (/[^\x00-\x7F]/u.test(term)) return text => text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&').replace(/ /gu, '[\\s_-]+');
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'u');
  return text => pattern.test(text);
}
function makeField(values, weight, native) {
  const text = strings(values).map(normalize).filter(Boolean);
  const tokens = new Set(text.flatMap(words));
  const cjkTokens = new Set(text.flatMap(grams));
  // Presence is capped, so repetition cannot buy relevance. Length only breaks
  // ties within a field's band: a long topic still outweighs a short summary.
  const density = .85 + .15 / (1 + Math.log2(1 + tokens.size + cjkTokens.size));
  return { text, tokens, cjkTokens, weight: weight * density, native };
}
function makeDocument(project) {
  const name = identity(project.name), author = identity(project.author);
  const camelNames = [project.name, project.id]
    .flatMap(str => typeof str === 'string' ? [str.replace(/([a-z0-9])([A-Z])/gu, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/gu, '$1 $2')] : [])
    .map(normalize)
    .filter(Boolean);
  const path = urlPath(project.url);
  const url = canonicalUrl(project.url);
  const urlSlug = (urlIdentity(project.url) ?? path).split('/').filter(Boolean).at(-1) ?? '';
  const names = [...new Set([name, ...camelNames, identity(project.id), author && name ? `${author}/${name}` : '',
    urlIdentity(project.url), identity(path.replace(/^\/+|\/+$/gu, ''))].filter(Boolean))];
  const topics = strings(project.topics).map(normalize);
  const rawTags = strings(project.tags);
  const tags = rawTags.map(tag => normalize(tagSearchText(tag)).replace(/\b9\s?hz\b/gu, ''));
  const localized = field => ['', 'En', 'Ja', 'Ko'].flatMap(suffix => strings(project[field + suffix]));
  const summaries = [...localized('plainSummary'), ...localized('highlightBenefit'),
    ...strings(project.description), ...strings(project.repoDescription), ...strings(project.repositoryDescription), ...evidenceText(project)];
  const decisions = localized('jevDecisionPoint');
  const fields = [
    makeField([...names, author, path], 10, true),
    makeField(topics, 6, true), makeField(rawTags, 6, false), makeField(tags, 6, false),
    makeField(summaries, 4, true), makeField(decisions, 3, true),
    makeField(strings(project.language), 1, true), makeField(strings(project.category), 1, false),
    makeField(['zh', 'en', 'ja', 'ko'].flatMap(locale => catalogLabels(project, locale).map(({ value }) => value)), 1, false),
  ];
  const content = [...summaries, ...decisions].map(normalize);
  return { project, names, author, url, urlSlug, urlTokens: [...new Set(words(path))], topics, content, fields,
    identities: [...names, author, urlSlug].filter(Boolean),
    cjkTokens: [...new Set(fields.flatMap(field => [...field.cjkTokens]))],
    nameWords: names.map(value => words(value).join(' ')),
    nativeTokens: new Set(fields.filter(field => field.native).flatMap(field => [...field.tokens])),
    stableKey: `${identity(project.id)}\u0000${name}` };
}
function addPosting(index, token, documentId, score) {
  let documents = index.get(token);
  if (!documents) index.set(token, documents = new Map());
  documents.set(documentId, Math.max(documents.get(documentId) ?? 0, score));
}

/** Native in-memory postings; original records and browse ordering stay intact. */
export function createProjectSearch(projects) {
  const items = Array.isArray(projects) ? projects.filter(project => project && typeof project === 'object') : [];
  const documents = items.map(makeDocument);
  const tokens = new Map(), nativeTokens = new Map(), cjkTokens = new Map(), nativeCjkTokens = new Map();
  for (const [id, document] of documents.entries()) for (const field of document.fields) {
    for (const token of field.tokens) {
      addPosting(tokens, token, id, field.weight);
      if (field.native) addPosting(nativeTokens, token, id, field.weight);
    }
    for (const token of field.cjkTokens) {
      addPosting(cjkTokens, token, id, field.weight);
      if (field.native) addPosting(nativeCjkTokens, token, id, field.weight);
    }
  }
  const wordLengths = new Map();
  for (const token of tokens.keys()) {
    if (!/^[a-z]{5,}$/u.test(token)) continue;
    const bucket = wordLengths.get(token.length) ?? [];
    bucket.push(token); wordLengths.set(token.length, bucket);
  }
  return { projects: [...items], documents, tokens, nativeTokens, cjkTokens, nativeCjkTokens, wordLengths };
}

// One edit (including an adjacent transposition), with no full-vocabulary Fuse
// scan per document. Short words and synonym expansions never get fuzzy matches.
function oneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  if (a.length === b.length) {
    return a.slice(i + 1) === b.slice(i + 1)
      || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  }
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}
function wordMatches(index, term, nativeOnly, fuzzy) {
  const postings = nativeOnly || literalTechnologies.has(term) ? index.nativeTokens : index.tokens;
  const result = new Map();
  const exact = postings.get(term);
  if (exact) {
    for (const [id, score] of exact) {
      result.set(id, { score, exact: true, coverage: 1 });
    }
  }
  if (term.length >= 2 && !/^\d+$/u.test(term) && !literalTechnologies.has(term) && term !== 'context') {
    for (const [candidate, docs] of postings) {
      if (candidate.startsWith(term) && candidate !== term) {
        const ratio = Math.max(0.6, term.length / candidate.length);
        for (const [id, score] of docs) {
          const prev = result.get(id);
          const newScore = score * ratio * 0.9;
          if (!prev || newScore > prev.score) {
            result.set(id, { score: newScore, exact: true, coverage: ratio });
          }
        }
      }
    }
    if (result.size > 0) return result;
  }
  if (!fuzzy || term === 'context' || !/^[a-z]{5,}$/u.test(term)) return result;
  for (let length = term.length - 1; length <= term.length + 1; length++) {
    for (const candidate of index.wordLengths.get(length) ?? []) {
      if (!oneEdit(term, candidate)) continue;
      const hits = (nativeOnly || literalTechnologies.has(candidate) ? index.nativeTokens : index.tokens).get(candidate);
      for (const [id, score] of hits ?? []) {
        if (score * .75 > (result.get(id)?.score ?? 0)) result.set(id, { score: score * .75, exact: false, coverage: .75 });
      }
    }
  }
  return result;
}
function termMatches(index, term, allowFuzzy) {
  const termWords = words(term);
  const termGrams = grams(term);
  const nativeOnly = termWords.some(word => literalTechnologies.has(word));
  // Single Latin tokens are O(postings), without allocating a document scan.
  if (!termGrams.length && termWords.length === 1 && term === termWords[0]) return wordMatches(index, term, nativeOnly, allowFuzzy);
  if (!termWords.length && !termGrams.length) return new Map();
  const parts = termWords.map(word => wordMatches(index, word, nativeOnly, false));
  const candidates = new Map();
  const cjkIndex = nativeOnly ? index.nativeCjkTokens : index.cjkTokens;
  for (const part of parts) for (const [id, hit] of part) candidates.set(id, hit.score);
  for (const gram of termGrams) for (const [id, score] of cjkIndex.get(gram) ?? []) candidates.set(id, Math.max(candidates.get(id) ?? 0, score));
  const result = new Map();
  const isLiteral = literalMatcher(term);
  for (const [id] of candidates) {
    if (!parts.every(part => part.has(id))) continue;
    const matched = termGrams.filter(gram => cjkIndex.get(gram)?.has(id)).length;
    if (termGrams.length && matched / termGrams.length < .6) continue;
    const document = index.documents[id];
    let score = 0;
    for (const field of document.fields) {
      if (nativeOnly && !field.native) continue;
      if (field.text.some(isLiteral)) score = Math.max(score, field.weight);
    }
    if (score) { result.set(id, { score, exact: true, coverage: 1 }); continue; }
    if (!allowFuzzy || termGrams.length < 2) continue;
    const coverage = matched / termGrams.length;
    if (matched >= 2 && coverage >= .6) result.set(id, { score: (candidates.get(id) ?? 0) * coverage * .75, exact: false, coverage });
  }
  return result;
}
function identityTier(document, query, wordQuery, queryUrl) {
  if (queryUrl && document.url === queryUrl) return { tier: 0, score: 1150 };
  if (document.names.includes(query)) return { tier: 0, score: 1100 };
  if (document.urlSlug === query) return { tier: 0, score: 1080 };
  if (document.author === query) return { tier: 0, score: 1050 };
  if (document.identities.some(value => value.startsWith(query))) return { tier: 1, score: 550 };
  if (wordQuery && document.nameWords.some(value => ` ${value} `.includes(` ${wordQuery} `))) return { tier: 1, score: 520 };
  if (query.length >= 2 && !/^\d+$/u.test(query) && document.identities.some(value => value.split(/[-_/:.]/).some(part => part.startsWith(query)))) return { tier: 1, score: 510 };
  if (wordQuery && wordQuery.length >= 2 && !/^\d+$/u.test(wordQuery) && document.nameWords.some(value => words(value).some(word => word.startsWith(wordQuery)))) return { tier: 1, score: 500 };
  return null;
}

/** Four disjoint tiers. Full concepts suppress partial matches; if none exist,
 * at least half the input words (minimum two) can qualify. Synonym phrases keep
 * their input-word coverage without counting their expanded alternatives.
 * Two-word/technology queries
 * retain their precision contract, and unknown CJK phrases may use bigrams.
 * Neither Stars nor browseSort participates in relevance scoring.
 */
export function searchProjects(index, rawQuery) {
  const raw = normalize(rawQuery).slice(0, 200);
  if (!raw) return [...index.projects];
  const query = urlIdentity(raw) ?? identity(raw);
  const queryUrl = canonicalUrl(rawQuery);
  const uniqueGroups = new Map();
  for (const group of queryGroups(query)) {
    const { alternatives, units } = group;
    const key = [...alternatives].sort().join('\u0000');
    if (!alternatives.some(term => words(term).length || grams(term).length)) continue;
    const previous = uniqueGroups.get(key);
    uniqueGroups.set(key, { alternatives, units: Math.max(units, previous?.units ?? 0) });
  }
  const groups = [...uniqueGroups.values()];
  const totalUnits = groups.reduce((sum, group) => sum + group.units, 0);
  const required = words(query).filter(word => literalTechnologies.has(word));
  const wordQuery = grams(query).length ? '' : words(query).join(' ');
  const cache = new Map();
  const matches = groups.map(({ alternatives, units }) => {
    const group = new Map();
    for (const [position, term] of alternatives.entries()) {
      const fuzzy = alternatives.length === 1;
      const key = `${fuzzy}:${term}`;
      if (!cache.has(key)) cache.set(key, termMatches(index, term, fuzzy));
      for (const [id, hit] of cache.get(key)) {
        const candidate = { ...hit, score: hit.score * (position ? .97 : 1) };
        const previous = group.get(id);
        if (!previous || (candidate.exact && !previous.exact) || candidate.exact === previous.exact && candidate.score > previous.score) group.set(id, candidate);
      }
    }
    return { hits: group, units };
  });
  const ranked = [];
  let hasFull = false;
  for (const [id, document] of index.documents.entries()) {
    const identityHit = identityTier(document, query, wordQuery, queryUrl);
    if (identityHit) { hasFull = true; ranked.push({ ...identityHit, coverage: 1, document }); continue; }
    if (!groups.length) continue;
    if (required.some(term => !document.nativeTokens.has(term))) continue;
    const hits = matches.flatMap(group => {
      const hit = group.hits.get(id);
      return hit ? [{ ...hit, units: group.units }] : [];
    });
    const full = hits.length === groups.length && hits.every(hit => hit.exact);
    if (!hits.length) continue;
    const matchedUnits = hits.reduce((sum, hit) => sum + hit.units, 0);
    const weighted = hits.reduce((sum, hit) => sum + hit.score * hit.units, 0) / (10 * totalUnits);
    const coverage = hits.reduce((sum, hit) => sum + hit.coverage * hit.units, 0) / totalUnits;
    if (full) {
      hasFull = true;
      ranked.push({ tier: 2, score: 100 + Math.min(399, weighted * 350), coverage: 1, document });
    } else if (hits.length === groups.length || (totalUnits >= 3 && matchedUnits >= Math.max(2, Math.ceil(totalUnits / 2)))) {
      ranked.push({ tier: 3, score: Math.min(99, 1 + coverage * 75 + weighted * 20), coverage, document });
    }
  }
  return ranked.filter(hit => !hasFull || hit.tier !== 3)
    .sort((a, b) => a.tier - b.tier || (a.tier === 3 ? b.coverage - a.coverage : 0)
      || compareScore(a.score, b.score) || compareText(a.document.stableKey, b.document.stableKey))
    .map(hit => hit.document.project);
}

/** Call only in browse mode (an empty query), then apply presentation filters. */
export function browseSort(projects, mode = 'stars') {
  return [...projects].sort((a, b) => {
    if (mode === 'created' || mode === 'newest') {
      const left = dateScore(a.createdAt);
      const right = dateScore(b.createdAt);
      return (left === right ? 0 : left > right ? -1 : 1) || stableCompare(a, b);
    }
    if (mode === 'updated') {
      const left = dateScore(a.lastCommitAt);
      const right = dateScore(b.lastCommitAt);
      return (left === right ? 0 : left > right ? -1 : 1) || stableCompare(a, b);
    }
    return count(b.stars) - count(a.stars) || stableCompare(a, b);
  });
}

const permissiveLicenses = new Set([
  'mit', 'apache-2.0', 'bsd-2-clause', 'bsd-3-clause', '0bsd', 'isc',
  'postgresql', 'zlib', 'bsl-1.0', 'unlicense', 'cc0-1.0',
]);

/** Rising is a creation-date/Stars snapshot, not measured star growth.
 * Commercial is a narrow permissive-SPDX filter, not a compliance guarantee.
 */
export function matchesQuickFilter(project, mode = 'all', now = Date.now()) {
  if (mode !== 'all' && project.catalogStatus === 'review-pending') return false;
  if (mode === 'popular') return count(project.stars) >= 1000;
  if (mode === 'rising') {
    const created = timestamp(project.createdAt);
    const reference = timestamp(now);
    const age = reference - created;
    return Number.isFinite(age) && age >= 0 && age <= 90 * 24 * 60 * 60 * 1000
      && count(project.stars) >= 10 && count(project.stars) < 1000;
  }
  if (mode === 'commercial') {
    return permissiveLicenses.has(normalize(licenseSpdx(project.license, project.licenseStatus)));
  }
  return mode === 'all';
}
