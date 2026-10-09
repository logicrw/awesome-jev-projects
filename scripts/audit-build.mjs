import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { publicFields } from "./prepare-public-data.mjs";
import { SITE, BASE, LOCALES, projectRoute } from "./site-content.mjs";
const base = resolve(new URL("../dist/", import.meta.url).pathname);
const forbidden =
  /\b(?:github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-|or-v1-)?[A-Za-z0-9_-]{24,}|AIza[A-Za-z0-9_-]{35})\b|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----|\b(?:GITHUB_TOKEN|GH_TOKEN|GH_MODELS_TOKEN|RADAR_GITHUB_TOKEN|DEEPSEEK_API_KEY|MUSE_API_KEY)\b|\/Users\/[^\/\s]+\/(?:Documents|Projects|\.codex)/;
const textExtensions = /\.(?:html|json|js|css|svg|txt)$/;
async function walk(dir) {
  const paths = [];
  for (const file of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, file.name);
    if (file.isDirectory()) paths.push(...(await walk(path)));
    else paths.push(path);
  }
  return paths;
}
const files = await walk(base);
for (const file of files) {
  assert.ok(
    !file.endsWith(".map"),
    `Source map should not be published: ${file}`,
  );
  assert.ok(
    !/\/(?:radar|receipts|\.openai|scripts|\.github)\//.test(file),
    `Private build surface: ${file}`,
  );
  if (textExtensions.test(file)) {
    const body = await readFile(file, "utf8");
    if (file.endsWith(".css")) assert.ok(!/data:font\//i.test(body), `Inline font violates self-only font CSP: ${file}`);
    assert.ok(
      !forbidden.test(body),
      `Credential or private-path pattern detected in ${file}`,
    );
    assert.ok(
      !body.includes("雷达日志"),
      `Removed radar UI leaked into ${file}`,
    );
  }
}
const html = await readFile(join(base, "index.html"), "utf8");
assert.ok(html.indexOf('Content-Security-Policy')<html.indexOf('<script'), 'CSP must precede executable scripts');
assert.ok(html.indexOf('Content-Security-Policy')<html.indexOf('<link'), 'CSP must precede linked resources');
assert.equal(
  await readFile(join(base, "404.html"), "utf8"),
  html,
  "SPA fallback must match index",
);
for (const value of [
  "summary_large_image",
  "@0xLogicrw",
  "og:title",
  "og:description",
  "og:image",
  "twitter:image",
  "Content-Security-Policy",
])
  assert.ok(html.includes(value), `Missing ${value}`);
const knownFiles = new Set(files);
for (const file of files.filter((path) => path.endsWith(".html"))) {
  const page = await readFile(file, "utf8");
  const csp = page.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  assert.ok(csp && !csp.includes("'unsafe-eval'"), `Missing restrictive CSP: ${file}`);
  assert.ok(page.indexOf('Content-Security-Policy') < page.indexOf('<script'), `Late CSP: ${file}`);
  assert.equal((page.match(/rel="canonical"/g) ?? []).length, 1, `Canonical must be unique: ${file}`);
  assert.equal((page.match(/hreflang=/g) ?? []).length, 5, `Missing reciprocal language variants: ${file}`);
  for (const script of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(script[1])) continue;
    assert.ok(/type="application\/(?:ld\+)?json"/.test(script[1]), `Executable inline script: ${file}`);
    assert.doesNotThrow(() => JSON.parse(script[2]), `Invalid structured JSON: ${file}`);
    const hash = createHash("sha256").update(script[2]).digest("base64");
    assert.ok(csp.includes(`'sha256-${hash}'`), `Inline JSON CSP hash mismatch: ${file}`);
  }
  for (const ref of page.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const raw = ref[1].replaceAll("&amp;", "&");
    if (raw.startsWith("#")) continue;
    const url = new URL(raw, SITE);
    assert.equal(url.protocol, "https:", `Unsafe protocol: ${file}`);
    assert.ok(!url.username && !url.password, `Credential-bearing URL: ${file}`);
    if (url.origin !== new URL(SITE).origin) continue;
    assert.ok(url.pathname.startsWith(BASE), `Wrong Pages base: ${raw}`);
    let target = join(base, decodeURIComponent(url.pathname.slice(BASE.length)));
    if (url.pathname.endsWith("/")) target = join(target, "index.html");
    assert.ok(knownFiles.has(target), `Broken internal link ${raw} in ${file}`);
  }
}
const image = await readFile(join(base, "og-card.png"));
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
const projects = JSON.parse(
  await readFile(join(base, "projects.json"), "utf8"),
);
const ogSvg = await readFile(join(base, "og-card.svg"), "utf8");
assert.ok(
  ogSvg.includes(`>${projects.length}+</text>`),
  `og-card.svg metric must match catalog count ${projects.length}+`,
);
assert.ok(
  ogSvg.includes(`JEV-SYS1-CORE · #${projects.length}`),
  `og-card.svg core ID must match catalog count #${projects.length}`,
);
assert.equal(
  projects.filter((project) => project.pinned).length,
  14,
  "Exactly fourteen pinned seeds required",
);
for (const project of projects)
  for (const key of Object.keys(project))
    assert.ok(publicFields.includes(key), `Unexpected public field: ${key}`);
for (const locale of LOCALES) {
  for (const project of projects) {
    const page = join(base, projectRoute(project.id, locale), "index.html");
    assert.ok(knownFiles.has(page), `Missing localized project page: ${project.id}/${locale}`);
  }
}
const manifest = JSON.parse(await readFile(join(base, "site-manifest.json"), "utf8"));
assert.equal(manifest.projects, projects.length, "Stale site manifest");
const sitemap = await readFile(join(base, "sitemap.xml"), "utf8");
assert.equal((sitemap.match(/<loc>/g) ?? []).length, (manifest.indexablePages ?? manifest.pages) + (manifest.resources ?? 0), "Sitemap page count mismatch");

// Verify strict count alignment across public/dist banners, READMEs, and machine docs
const root = resolve(base, "..");
for (const bannerName of ["banner.svg", "banner-zh.svg", "banner-ja.svg", "banner-ko.svg"]) {
  const distBanner = await readFile(join(base, bannerName), "utf8");
  const publicBanner = await readFile(join(root, "public", bannerName), "utf8");
  const expectedText = `${projects.length} CATALOG ENTRIES`;
  assert.ok(distBanner.includes(expectedText), `dist/${bannerName} count mismatch: expected "${expectedText}"`);
  assert.ok(publicBanner.includes(expectedText), `public/${bannerName} count mismatch: expected "${expectedText}"`);
}

for (const readmeName of ["README.md", "README.zh-CN.md", "README.ja.md", "README.ko.md"]) {
  const readmeContent = await readFile(join(root, readmeName), "utf8");
  assert.ok(
    readmeContent.includes(`Curated%20Projects-${projects.length}%2B`),
    `${readmeName} badge count mismatch: expected ${projects.length}`
  );
  assert.ok(
    readmeContent.includes(`${projects.length} curated projects`) ||
    readmeContent.includes(`${projects.length} 个精选项目`) ||
    readmeContent.includes(`${projects.length} 件の厳選プロジェクト`) ||
    readmeContent.includes(`${projects.length} 개 엄선 프로젝트`),
    `${readmeName} intro project count mismatch: expected ${projects.length}`
  );
}

const llmsTxt = await readFile(join(base, "llms.txt"), "utf8");
assert.ok(
  llmsTxt.includes(`Catalog entries: ${projects.length}`),
  `llms.txt catalog count mismatch: expected ${projects.length}`
);
assert.ok(!html.includes('<div id="root"></div>'), "Homepage must include crawlable rendered content");
assert.ok(html.includes('id="initial-projects"'), "Missing same-build initial project snapshot");
assert.ok(
  !files.some((file) => file.endsWith("/radar.json")),
  "Internal radar data cannot be published",
);
console.log(
  `Build audit passed: ${files.length} static files, ${projects.length} projects, 14 pinned seeds, no credential patterns or radar internals.`,
);
