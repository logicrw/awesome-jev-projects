import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLicenseFacts, licenseFactsFromRepo, licenseLabel, isLicenseValue, catalogLabels } from "../src/lib/catalog-contract.mjs";
import { publicProjects } from "./prepare-public-data.mjs";
import { dailyProject } from "../src/lib/discovery.mjs";
import { createProjectSearch, searchProjects, matchesQuickFilter } from "../src/lib/search.mjs";
import { machineDocuments } from "./site-content.mjs";

const project = {
  id: "logicrw:learning", name: "Learning example", author: "logicrw", url: "https://github.com/logicrw/learning",
  category: "Decision Tools", catalogKind: "learning-resource", jevRelation: "discussed", reviewBasis: "descriptive-material",
  plainSummary: "介绍结构化决策的学习资料。", plainSummaryEn: "Learning material about structured decisions.",
  plainSummaryJa: "構造化された判断についての学習資料。", plainSummaryKo: "구조화된 판단에 관한 학습 자료입니다.",
  jevDecisionPoint: "介绍问题设计与决策模式。", jevDecisionPointEn: "Describes question design and decision patterns.",
  highlightBenefit: "帮助理解设计选择。", highlightBenefitEn: "Explains design choices.",
  claimStatus: "依据说明材料分类，未经独立运行验证。", claimStatusEn: "Classified from descriptive material; not independently executed.",
  tags: ["typed-decisions"], stars: 30, forks: 0, openIssues: 0, summarySource: "ai-material-review",
  license: { status: "undeclared", spdx: null }, lastCommitAt: null, createdAt: null,
};

test("license metadata distinguishes identified, custom and undeclared facts without altering legacy input", () => {
  assert.deepEqual(licenseFactsFromRepo({ license: null }), { status: "undeclared", spdx: null });
  assert.deepEqual(licenseFactsFromRepo({ license: { spdx_id: "NOASSERTION", name: "Project terms" } }),
    { status: "custom", spdx: null, name: "Project terms" });
  assert.deepEqual(licenseFactsFromRepo({ license: { spdx_id: "MIT", name: "MIT License", url: "https://api.github.com/licenses/mit" } }),
    { status: "identified", spdx: "MIT", name: "MIT License", url: "https://api.github.com/licenses/mit" });
  assert.deepEqual(normalizeLicenseFacts("Apache-2.0", "confirmed"), { status: "identified", spdx: "Apache-2.0" });
  assert.deepEqual(normalizeLicenseFacts("MIT", " CUSTOM "), { status: "custom", spdx: null, name: "MIT" });
  assert.deepEqual(normalizeLicenseFacts("MIT", "unconfirmed"), { status: "undeclared", spdx: null });
  for (const value of [null, "MIT", { status: "custom", spdx: null }, { status: "identified", spdx: "MIT" }]) assert.equal(isLicenseValue(value), true);
  for (const value of [42, [], {}, { status: "identified", spdx: null }, { status: "custom", spdx: "MIT" },
    { status: "identified", spdx: "NOASSERTION" }]) assert.equal(isLicenseValue(value), false);
});

test("public projection retains explicit classification and safely normalizes license objects only", () => {
  const source = { ...project, license: { status: "custom", spdx: null, name: "Project terms", internalDiagnostic: "private" } };
  const before = JSON.stringify(source);
  const [published, legacy, absent] = publicProjects([source, { id: "legacy", license: "MIT" }, { id: "old", license: null }]);
  assert.deepEqual(published.license, { status: "custom", spdx: null, name: "Project terms" });
  assert.equal(published.catalogKind, "learning-resource");
  assert.equal(published.jevRelation, "discussed");
  assert.equal(published.reviewBasis, "descriptive-material");
  assert.equal(published.plainSummary, source.plainSummary);
  assert.equal(published.verificationStatus, undefined);
  assert.deepEqual(legacy, { id: "legacy", license: "MIT" });
  assert.deepEqual(absent, { id: "old", license: null });
  assert.equal(JSON.stringify(source), before);
  assert.deepEqual(catalogLabels(legacy), []);
});

test("license objects preserve search filters and the licensed daily recommendation pool", () => {
  const identified = { ...project, id: "identified", license: { status: "identified", spdx: "MIT" } };
  const custom = { ...project, id: "custom", license: { status: "custom", spdx: null, name: "MIT-like terms" } };
  assert.equal(matchesQuickFilter(identified, "commercial"), true);
  assert.equal(matchesQuickFilter({ ...identified, licenseStatus: "restricted" }, "commercial"), false);
  assert.equal(matchesQuickFilter(custom, "commercial"), false);
  assert.equal(matchesQuickFilter(project, "commercial"), false);
  assert.equal(dailyProject([custom, project, identified], "2026-10-09").id, "identified");
  const index = createProjectSearch([project, { ...identified, catalogKind: "integration", jevRelation: "implemented", reviewBasis: "implementation-material" }]);
  assert.deepEqual(searchProjects(index, "学习资源").map(({ id }) => id), [project.id]);
  assert.deepEqual(searchProjects(index, "descriptive material").map(({ id }) => id), [project.id]);
});

test("machine documents expose classification and license facts without claiming every entry is an implementation", () => {
  const documents = machineDocuments([project], []);
  assert.match(documents.full, /- License: License not declared/);
  assert.match(documents.full, /- Entry type: Learning resource/);
  assert.match(documents.full, /- Jev relationship: Jev discussion/);
  assert.match(documents.full, /- Review basis: Descriptive material/);
  assert.doesNotMatch(documents.full, /\[object Object\]|Every listed project is verified/);
  assert.match(machineDocuments([{ ...project, license: "MIT" }], []).full, /- License: MIT/);
});

test("catalog snapshot validation and refresh accept object facts while rejecting malformed status", async () => {
  const { createServer } = await import("vite");
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  try {
    const { validProject, catalogFingerprint } = await server.ssrLoadModule("/src/hooks/useCatalogSWR.ts");
    assert.equal(validProject(project), true);
    assert.equal(validProject({ ...project, license: "MIT" }), true);
    assert.equal(validProject({ ...project, license: { status: "custom", spdx: "MIT" } }), false);
    assert.equal(validProject({ ...project, catalogKind: "verified-safe" }), false);
    for (const change of [{ license: { status: "identified", spdx: "MIT" } }, { catalogKind: "integration" },
      { jevRelation: "described" }, { reviewBasis: "mixed" }]) {
      assert.notEqual(catalogFingerprint([project]), catalogFingerprint([{ ...project, ...change }]));
    }
  } finally { await server.close(); }
});

test("four-language cards display license and evidence levels without object coercion or invented implementation", async () => {
  const [{ createServer }, { createElement }, { renderToStaticMarkup }] = await Promise.all([
    import("vite"), import("react"), import("react-dom/server"),
  ]);
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  try {
    const { default: App } = await server.ssrLoadModule("/src/App.tsx");
    for (const locale of ["zh", "en", "ja", "ko"]) {
      const html = renderToStaticMarkup(createElement(App, { initialProjects: [project], initialLocale: locale }));
      assert.ok(html.includes(licenseLabel(project.license, locale)), locale);
      for (const { value } of catalogLabels(project, locale)) assert.ok(html.includes(value), `${locale}: ${value}`);
      assert.doesNotMatch(html, /\[object Object\]/);
      assert.doesNotMatch(html, /代码已公开开源|integration-detected/);
      assert.equal(licenseLabel({ status: "custom", spdx: null }, locale).length > 0, true);
    }
  } finally { await server.close(); }
});
