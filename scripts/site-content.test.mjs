import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { escapeHTML, safeJSON, projectRoute, pageHead, LOCALES } from "./site-content.mjs";
import { secureHTML, contentSecurityPolicy } from "./finalize-pages.mjs";

test("project source text cannot break out of HTML or JSON data scripts", () => {
  const payload = '</script><script src="https://evil.test/takeover.js"></script><img src=x onerror=alert(1)>';
  assert.ok(!escapeHTML(payload).includes("<"));
  const json = safeJSON({ description: payload });
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), { description: payload });
  const head = pageHead({locale:"en", title:payload, description:payload, route:"", alternates:()=>"", schema:{description:payload}});
  assert.equal((head.match(/<script/g) ?? []).length, 1);
  assert.ok(!head.includes('<img'));
});
test("localized static routes preserve legacy identities and reject traversal", () => {
  for (const locale of LOCALES) {
    const prefix=locale==='zh'?'':locale+'/';
    assert.equal(projectRoute('jev-ultrafast',locale),prefix+'projects/jev-ultrafast/');
    assert.equal(projectRoute('owner:repo',locale),prefix+'projects/owner/repo/');
  }
  for (const id of ['../escape','owner:..','owner:repo/../../x','x:y:z','owner:%2e%2e','<script>']) assert.throws(()=>projectRoute(id));
});
test("CSP hashes structured data but refuses executable inline scripts", () => {
  const html='<html><head><meta charset="UTF-8"><script type="application/ld+json">{"name":"Jev"}</script></head></html>';
  assert.match(contentSecurityPolicy(html),/script-src 'self' 'sha256-/);
  assert.ok(secureHTML(html).indexOf('Content-Security-Policy') < secureHTML(html).indexOf('<script'));
  assert.throws(()=>secureHTML('<meta charset="UTF-8"><script>alert(1)</script>'));
  assert.throws(()=>secureHTML('<meta charset="UTF-8"><script type="module">alert(1)</script>'));
});

test("banners and README documents strictly match canonical project count", async () => {
  const root = new URL("../", import.meta.url);
  const projects = JSON.parse(await readFile(new URL("src/data/projects.json", root), "utf8"));
  const expectedCount = projects.length;

  for (const bannerName of ["banner.svg", "banner-zh.svg", "banner-ja.svg", "banner-ko.svg"]) {
    const banner = await readFile(new URL(`public/${bannerName}`, root), "utf8");
    assert.ok(
      banner.includes(`${expectedCount} CATALOG ENTRIES`),
      `Banner public/${bannerName} must show ${expectedCount} CATALOG ENTRIES`
    );
  }

  for (const readme of ["README.md", "README.zh-CN.md", "README.ja.md", "README.ko.md"]) {
    const content = await readFile(new URL(readme, root), "utf8");
    assert.ok(
      content.includes(`Curated%20Projects-${expectedCount}%2B`),
      `${readme} badge must match canonical project count ${expectedCount}`
    );
  }
});
