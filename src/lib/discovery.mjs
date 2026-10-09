import { normalizeLicenseFacts } from './catalog-contract.mjs';
const DAY_MS = 86_400_000;
const declaredLicenses = new Set([
  'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'PostgreSQL',
  'MPL-2.0', 'GPL-2.0', 'GPL-2.0-only', 'GPL-2.0-or-later',
  'GPL-3.0', 'GPL-3.0-only', 'GPL-3.0-or-later', 'AGPL-3.0',
  'AGPL-3.0-only', 'AGPL-3.0-or-later', 'LGPL-2.1', 'LGPL-3.0',
  'Unlicense', 'CC0-1.0',
]);

const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const stars = (project) => Number.isFinite(project.stars) && project.stars >= 0 ? project.stars : null;
// Resolve conflicting duplicate IDs consistently for all selection-relevant metadata.
const selectionKey = (project) => JSON.stringify([stars(project), project.licenseStatus ?? '', normalizeLicenseFacts(project.license, project.licenseStatus), project.url ?? '']);

/** Active catalog entries only. Stars are attention signals, never a quality rating. */
export function eligibleProjects(projects) {
  const candidates = projects.filter((project) => project && typeof project.id === 'string'
    && project.id.trim() && project.catalogStatus !== 'review-pending');
  candidates.sort((a, b) => compare(a.id, b.id) || compare(selectionKey(a), selectionKey(b)));
  return candidates.filter((project, index) => index === 0 || project.id !== candidates[index - 1].id);
}

function assertInstant(date) {
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) throw new RangeError('Invalid date');
  return timestamp;
}

/** UTC calendar day for a given instant. Visitor UI uses localDay. */
export function utcDay(date = new Date()) {
  return new Date(assertInstant(date)).toISOString().slice(0, 10);
}

export function nextUtcMidnightDelay(date = new Date()) {
  const timestamp = assertInstant(date);
  return (Math.floor(timestamp / DAY_MS) + 1) * DAY_MS - timestamp;
}

/** Visitor civil calendar day in YYYY-MM-DD, using local timezone fields. */
export function localDay(date = new Date()) {
  assertInstant(date);
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Milliseconds until the next local midnight, including DST-length days. */
export function nextLocalMidnightDelay(date = new Date()) {
  const timestamp = assertInstant(date);
  const next = new Date(timestamp);
  next.setHours(24, 0, 0, 0);
  const delay = next.getTime() - timestamp;
  if (!Number.isFinite(delay) || delay <= 0) throw new RangeError('Invalid date');
  return delay;
}

function epochDay(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new RangeError('Expected a calendar day in YYYY-MM-DD format');
  const timestamp = Date.parse(`${day}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || utcDay(new Date(timestamp)) !== day) throw new RangeError('Invalid calendar day');
  return timestamp / DAY_MS;
}

function poolHash(projects) {
  let hash = 2166136261;
  for (const character of projects.map(({ id }) => id).join('\n')) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return hash;
}

/**
 * A stable catalog version gives every visitor the same daily project. Catalog
 * updates can change the pool. Consecutive calendar days rotate through every entry
 * without repetition, unlike independently hashing each date.
 * Prefer 20–50-star projects with declared open-source licenses (including GPL);
 * fall back to reviewed projects below 1k, then all reviewed projects. Missing
 * license metadata is not a claim of permission or a reason to delete a project.
 */
export function dailyProject(projects, day) {
  const dayNumber = epochDay(day);
  const eligible = eligibleProjects(projects);
  if (!eligible.length) return null;
  const longTail = eligible.filter((project) => {
    const license = normalizeLicenseFacts(project.license, project.licenseStatus);
    const declared = typeof project.license === 'object' && project.license !== null
      ? license.status === 'identified' : ['confirmed', 'declared'].includes(project.licenseStatus);
    return stars(project) >= 20 && stars(project) <= 50 && declared && declaredLicenses.has(license.spdx);
  });
  const smaller = eligible.filter((project) => stars(project) !== null && stars(project) < 1000);
  const pool = longTail.length ? longTail : smaller.length ? smaller : eligible;
  const index = ((dayNumber + poolHash(pool)) % pool.length + pool.length) % pool.length;
  return pool[index];
}

/** All eligible projects have equal probability; skip only the previous draw. */
export function drawProject(projects, previousId, randomValue = Math.random()) {
  const eligible = eligibleProjects(projects);
  if (!eligible.length) return null;
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) throw new RangeError('randomValue must be in [0, 1)');
  const pool = eligible.length > 1 ? eligible.filter(({ id }) => id !== previousId) : eligible;
  return pool[Math.floor(randomValue * pool.length)];
}

/** Cosmetic popularity tier; neither branch implies quality or runtime verification. */
export function rarity(project) {
  return stars(project) >= 1000 ? 'ssr' : 'rising';
}
