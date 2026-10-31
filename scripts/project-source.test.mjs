import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import {
  extractSubmittedRepository,
  extractSubmittedCategory,
  extractSubmittedTags,
  extractSubmittedCodePaths,
  decodeNotebookCode,
  inspectRepository,
  readLocalizedReadmes,
  collectAdditionalMaterials,
  materialForm,
} from "./project-source.mjs";

const sha = "a".repeat(40);
const repository = "owner/tool";
const readme =
  "# Jev Agent\nThis Agent chooses the next action through api.typesafe.ai.";
const repo = {
  id: 123,
  name: "tool",
  full_name: repository,
  private: false,
  visibility: "public",
  description: "A Jev Agent",
  html_url: `https://github.com/${repository}`,
};
const encoded = (text, path = "README.md") => ({
  type: "file",
  path,
  size: Buffer.byteLength(text),
  encoding: "base64",
  content: Buffer.from(text).toString("base64"),
});
const missing = () => Object.assign(new Error("Not Found"), { status: 404 });
function fixture(overrides = {}) {
  const requests = [];
  const values = {
    [`/repos/${repository}`]: repo,
    [`/repos/${repository}/commits?per_page=1`]: [
      { sha, commit: { committer: { date: "2026-09-18T00:00:00Z" } } },
    ],
    [`/repos/${repository}/readme?ref=${sha}`]: encoded(readme),
    [`/repos/${repository}/contents?ref=${sha}`]: [],
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [] },
    ...overrides,
  };
  const api = async (path) => {
    requests.push(path);
    if (!(path in values)) throw missing();
    if (values[path] instanceof Error) throw values[path];
    return values[path];
  };
  return { api, requests };
}
const verifyIntegration = (metadata, text) => ({
  verified:
    metadata.name !== "docs" &&
    /Jev/i.test(text) &&
    /api\.typesafe\.ai/.test(text),
  reason:
    metadata.name === "docs"
      ? "mention-only directory"
      : "no provider integration",
  evidence: text.split("\n").filter((line) => line.includes("api.typesafe.ai")),
});
const inspect = (f, extra = {}) =>
  inspectRepository({ api: f.api, repository, verifyIntegration, ...extra });

test("explicit submission field wins over unrelated evidence and example repositories", () => {
  for (const title of [
    "GitHub repository",
    "Project repository",
    "项目仓库",
    "Repository",
  ]) {
    const body = `An example is https://github.com/example/sample\n### ${title}\nhttps://github.com/owner/tool/tree/main/src\n### Evidence\nhttps://github.com/provider/sdk/blob/main/README.md`;
    assert.equal(extractSubmittedRepository(body), repository);
  }
  assert.equal(
    extractSubmittedRepository(
      "## 项目仓库\nowner/tool\n## 说明\nRun Agent choices",
    ),
    repository,
  );
  assert.equal(
    extractSubmittedRepository(
      "## Repository\n\n## Example\nhttps://github.com/example/sample",
    ),
    null,
  );
});

test("extractSubmittedRepository accepts natural variations of repository headings", () => {
  for (const title of [
    "Repo",
    "GitHub Repo",
    "开源仓库",
    "项目地址",
    "代码仓库",
    "仓库链接",
  ]) {
    const body = `### ${title}\nhttps://github.com/owner/tool\n`;
    assert.equal(extractSubmittedRepository(body), "owner/tool");
  }
});

test("fallback accepts repeated deep links for one repository, rejects ambiguous targets", () => {
  assert.equal(
    extractSubmittedRepository(
      "https://github.com/owner/tool/blob/main/a.py\nhttps://github.com/OWNER/TOOL/tree/main",
    ),
    "OWNER/TOOL",
  );
  assert.equal(
    extractSubmittedRepository(
      "https://github.com/owner/tool https://github.com/another/tool",
    ),
    null,
  );
  assert.equal(
    extractSubmittedRepository(
      "### Repository\nowner/tool\n### Repository\nother/tool",
    ),
    null,
  );
  assert.equal(
    extractSubmittedRepository(
      "### Repository\nowner/tool\nExample: https://github.com/example/sample",
    ),
    null,
  );
  assert.equal(
    extractSubmittedRepository(
      "owner/tool\nExample: https://github.com/example/sample",
    ),
    null,
  );
});

test("submission extraction ignores quoted-code fields and rejects URL authority tricks", () => {
  assert.equal(
    extractSubmittedRepository(
      "```md\n## Repository\nhttps://github.com/evil/example\n```\n## Repository\nowner/tool",
    ),
    repository,
  );
  for (const body of [
    "https://evil.test/?next=https://github.com/owner/tool",
    "https://github.com@evil.test/owner/tool",
    "javascript:https://github.com/owner/tool",
    "https://github.com.evil.test/owner/tool",
    "<!-- https://github.com/owner/tool -->",
    "## Repository\n$(touch /tmp/pwned)",
  ])
    assert.equal(extractSubmittedRepository(body), null, body);
});

test("public metadata and immutable source bytes produce fixed-SHA provenance", async () => {
  const f = fixture();
  const result = await inspect(f);
  assert.equal(result.status, "accepted");
  assert.equal(result.sha, sha);
  assert.equal(result.readme, readme);
  assert.equal(
    result.evidence.files[0].url,
    `https://github.com/${repository}/blob/${sha}/README.md`,
  );
  assert.equal(
    result.evidence.files[0].hash,
    createHash("sha256").update(readme).digest("hex"),
  );
  assert.ok(
    f.requests
      .filter((path) => /readme|contents|trees/.test(path))
      .every((path) => path.includes(sha)),
  );
});

test("private, inaccessible and invalid repository metadata fail before source requests", async () => {
  for (const [metadata, reason] of [
    [{ ...repo, private: true }, "repository is not public"],
    [{ ...repo, visibility: "internal" }, "repository is not public"],
    [{ ...repo, id: "123" }, "invalid repository metadata"],
    [missing(), "repository not found or inaccessible"],
  ]) {
    const f = fixture({ [`/repos/${repository}`]: metadata });
    assert.deepEqual(await inspect(f), { status: "rejected", reason });
    assert.equal(f.requests.length, 1);
  }
});

test("duplicate and exclusion checks respect canonical names, case and numeric repository identity", async () => {
  for (const existing of [
    { url: "https://github.com/OWNER/TOOL" },
    { repo: "OWNER/TOOL" },
    { repositoryId: 123, repo: "former/old-name" },
  ])
    assert.equal(
      (await inspect(fixture(), { existingProjects: [existing] })).status,
      "duplicate",
    );
  assert.equal(
    (await inspect(fixture(), { exclusions: [{ repo: "OWNER/TOOL" }] })).status,
    "rejected",
  );
  const renamed = fixture({
    [`/repos/${repository}`]: { ...repo, full_name: "owner/new-name" },
  });
  assert.equal(
    (
      await inspect(renamed, {
        existingProjects: [{ url: "https://github.com/OWNER/NEW-NAME" }],
      })
    ).status,
    "duplicate",
  );
  assert.equal(renamed.requests.length, 1);
});

test("empty repositories reject and transient API errors remain distinguishable", async () => {
  const empty = fixture({
    [`/repos/${repository}/commits?per_page=1`]: Object.assign(
      new Error("Git Repository is empty."),
      { status: 409 },
    ),
  });
  assert.equal(
    (await inspect(empty)).reason,
    "repository has no accessible commit",
  );
  const timeout = Object.assign(new Error("request timed out"), {
    name: "TimeoutError",
  });
  await assert.rejects(
    inspect(fixture({ [`/repos/${repository}`]: timeout })),
    (error) => error === timeout,
  );
  const limited = Object.assign(new Error("secondary rate limit"), {
    status: 403,
    rateLimited: true,
  });
  await assert.rejects(
    inspect(fixture({ [`/repos/${repository}/readme?ref=${sha}`]: limited })),
    (error) => error === limited,
  );
});

test("issue claims and metadata alone cannot become integration evidence", async () => {
  const unrelated = fixture({
    [`/repos/${repository}/readme?ref=${sha}`]: encoded(
      "# Traditional Scala Typesafe library",
    ),
  });
  const result = await inspect(unrelated, { issueBody: readme });
  assert.equal(result.status, "rejected");
  assert.equal(result.readme.includes("api.typesafe.ai"), false);
});

test("documentation directories remain rejected even if README contains a code sample", async () => {
  const f = fixture({ [`/repos/${repository}`]: { ...repo, name: "docs" } });
  const result = await inspect(f);
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "mention-only directory");
  assert.equal(
    f.requests.some((path) => path.includes("/git/trees/")),
    false,
  );
});

test("Chinese README discovery reads local paths at the captured SHA, never remote links", async () => {
  const native = "这个 Agent 让 Jev 从页面状态中选择下一步动作。";
  const primary = `${readme}\n[中文](docs/README.zh-CN.md)\n[evil](https://evil.test/README.zh.md)\n[other](https://github.com/other/tool/blob/main/README.zh.md)`;
  const f = fixture({
    [`/repos/${repository}/readme?ref=${sha}`]: encoded(primary),
    [`/repos/${repository}/contents/docs/README.zh-CN.md?ref=${sha}`]: encoded(
      native,
      "docs/README.zh-CN.md",
    ),
    [`/repos/${repository}/contents?ref=${sha}`]: [
      { type: "file", path: "README_zh.md" },
    ],
    [`/repos/${repository}/contents/README_zh.md?ref=${sha}`]: encoded(
      native,
      "README_zh.md",
    ),
  });
  const result = await inspect(f);
  assert.equal(result.readmeFiles.length, 3);
  assert.ok(result.readme.includes(native));
  assert.ok(
    f.requests.every(
      (path) =>
        path.startsWith(`/repos/${repository}/`) ||
        path === `/repos/${repository}`,
    ),
  );
  assert.ok(
    result.readmeFiles.every((file) => file.url.includes(`/blob/${sha}/`)),
  );
});

test("localized README requests and bytes are bounded, symlinks are not source text", async () => {
  const primary =
    `${readme}\n` +
    Array.from({ length: 10 }, (_, i) => `[中文](docs${i}/README.zh.md)`).join(
      "\n",
    );
  const f = fixture({
    [`/repos/${repository}/contents/docs0/README.zh.md?ref=${sha}`]: {
      ...encoded("字".repeat(30_001)),
      size: 90_003,
    },
    [`/repos/${repository}/contents/docs1/README.zh.md?ref=${sha}`]: {
      ...encoded(readme),
      type: "symlink",
    },
  });
  const files = await readLocalizedReadmes({
    api: f.api,
    repository,
    sha,
    readme: primary,
    readmePath: "README.md",
  });
  assert.equal(files.length, 1);
  assert.equal(
    f.requests.filter((path) => path.includes("/contents/docs")).length,
    2,
  );
});

test("implementation inspection excludes dependency files, secrets, docs, vendored/generated code and symlinks", async () => {
  const ignored = [
    "docs/jev.py",
    "vendor/jev.py",
    "node_modules/jev.js",
    ".env/jev.py",
    "dist/jev.js",
    "tests/jev.py",
    "src/jev.generated.ts",
    "src/jev.min.js",
    "package-lock.json",
  ];
  const tree = ignored.map((path) => ({
    type: "blob",
    path,
    size: 100,
    mode: "100644",
  }));
  tree.push({
    type: "blob",
    path: "src/jev-link.py",
    size: 100,
    mode: "120000",
  });
  tree.push({ type: "blob", path: "src/jev.py", size: 100, mode: "100644" });
  const f = fixture({
    [`/repos/${repository}/readme?ref=${sha}`]: encoded("# Jev decision Agent"),
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree },
    [`/repos/${repository}/contents/src/jev.py?ref=${sha}`]: encoded(
      'endpoint = "https://api.typesafe.ai"',
      "src/jev.py",
    ),
  });
  const result = await inspect(f);
  assert.equal(result.status, "accepted");
  assert.deepEqual(
    f.requests
      .filter((path) => path.includes("/contents/"))
      .map((path) => path.split("/contents/")[1].split("?")[0]),
    ["src/jev.py"],
  );
  assert.equal(result.evidence.files.at(-1).path, "src/jev.py");
});

test("large or unrelated source candidates cannot cause unbounded API scans", async () => {
  const tree = Array.from({ length: 25 }, (_, i) => ({
    type: "blob",
    path: `src/jev-${i}.py`,
    size: 20,
    mode: "100644",
  }));
  tree.unshift({
    type: "blob",
    path: "src/jev-big.py",
    size: 90_001,
    mode: "100644",
  });
  const f = fixture({
    [`/repos/${repository}/readme?ref=${sha}`]: encoded("# Jev Agent"),
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree },
  });
  assert.equal((await inspect(f)).status, "rejected");
  const codeRequests = f.requests.filter((path) =>
    path.includes("/contents/src/"),
  );
  assert.equal(codeRequests.length, 8);
  assert.ok(
    codeRequests.every(
      (path) => path.includes(sha) && !path.includes("jev-big"),
    ),
  );
});

test("strict ingestion rejects README-only integration while radar compatibility remains unchanged", async () => {
  const installOnly = "# Jev decision Agent\nInstall the SDK: npm install @typesafe/jev";
  const reviewer = () => ({ verified: true, reason: "provider + Jev + implementation", evidence: [installOnly] });
  const f = fixture({ [`/repos/${repository}/readme?ref=${sha}`]: encoded(installOnly) });
  const result = await inspect(f, { verifyIntegration: reviewer, requireCodeEvidence: true });
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "no implementation source evidence");
  assert.ok(f.requests.some((path) => path.includes(`/git/trees/${sha}`)));
  assert.equal((await inspect(fixture(), { verifyIntegration: reviewer })).status, "accepted");
});

test("strict ingestion requires source usage beyond SDK installs, metadata, comments or traditional Typesafe", async () => {
  const cases = [
    ["src/main.py", 'from typesafe import Config\nconfig = Config()'],
    ["src/Main.java", 'import com.typesafe.config.Config;\nConfig c = ConfigFactory.load();'],
    ["src/Main.java", 'import com.typesafe.config.Config;\nclass App { void test() { Config c = ConfigFactory.load(); helper.choice(); } }'],
    ["src/main.py", '# endpoint = "https://api.typesafe.ai"\nprint("hello")'],
    ["src/main.js", 'const x = 1; // Jev endpoint api.typesafe.ai\nconsole.log(x)'],
    ["src/main.py", '"""Jev endpoint https://api.typesafe.ai"""\nprint("hello")'],
    ["src/main.js", '/* Jev https://api.typesafe.ai */\nconsole.log("hello")'],
    ["scripts/install.sh", 'npm install @typesafe/jev'],
    ["src/main.ts", 'import { TypeSafeClient } from "@typesafe/sdk";\nconsole.log("not implemented");'],
    ["src/random_choice.py", 'import random\nfrom typesafe import Config\n\nconfig = Config()\nx = random.choice([1, 2, 3])'],
    ["src/Play.java", 'import com.typesafe.play.filters.CorsFilter;\nclass App { void test() { CorsFilter f = null; helper.choice(); } }'],
  ];
  for (const [path, text] of cases) {
    const f = fixture({
      [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [{ type: "blob", path, mode: "100644", size: text.length }] },
      [`/repos/${repository}/contents/${path}?ref=${sha}`]: encoded(text, path),
    });
    const result = await inspect(f, { requireCodeEvidence: true });
    assert.equal(result.status, "rejected", path + ": " + text);
    assert.equal(result.reason, "no implementation source evidence");
  }
});

test("strict ingestion rejects a bare provider URL or identifier stub as implementation evidence", async () => {
  const cases = [
    ["src/main.py", 'response = requests.post("https://api.typesafe.ai/v1/choice", json=payload)'],
    ["src/jev.js", 'const endpoint = "https://api.typesafe.ai/v1";\nexport const product = "jev";\nexport const kind = "agent";\n'],
  ];
  for (const [path, text] of cases) {
    const f = fixture({
      [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [{ type: "blob", path, mode: "100644", size: text.length }] },
      [`/repos/${repository}/contents/${path}?ref=${sha}`]: encoded(text, path),
    });
    const result = await inspect(f, { requireCodeEvidence: true });
    assert.equal(result.status, "rejected", path + ": " + text);
    assert.equal(result.reason, "no implementation source evidence");
  }
});

test("strict ingestion accepts TypeSafe SDK decision calls", async () => {
  const cases = [
    ["src/main.py", 'from typesafe import Client\nclient = Client()\nresult = client.choice(options)'],
    ["src/main.ts", 'import { TypeSafeClient } from "@typesafe/sdk";\nconst client = new TypeSafeClient();\nconst result = await client.choice(options);'],
    ["core/decision/TypeSafeBackend.kt", 'import me.ethanxu.typesafe.sdk.TypeSafeClient\nval client = TypeSafeClient()\nval decision = client.systemOne(input)'],
    ["src/call.js", 'const model = "typesafe/jev-latest";\nawait fetch("https://api.typesafe.ai/v1/choice", { method: "POST", body: JSON.stringify({ model }) });'],
    ["app/api/analyze/route.ts", 'import { experimental_evaluate as evaluate } from "ai";\nconst MODEL = "typesafe-ai/jev";\nawait evaluate({ model: MODEL });'],
    ["src/backends/typesafe.ts", 'export const TYPESAFE_BASE_URL = "https://api.typesafe.ai";\nexport const TYPESAFE_DEFAULT_MODEL = "jev-latest";\nawait postJson("typesafe", `${TYPESAFE_BASE_URL}/v1/systemone`, { Authorization: `Bearer ${apiKey}` }, body);'],
    ["slopcheck/judge.py", 'import urllib.request\nkey = os.environ["TYPESAFE_API_KEY"]\nreq = urllib.request.Request("https://api.typesafe.ai/v1/systemone", headers={"Authorization": f"Bearer {key}"})\nquestions = {"tell": {"type": "noul"}}'],
    ["lib/main.dart", "import 'package:jev_dart/jev_dart.dart';\nfinal client = JevClient(apiKey);\nfinal res = await client.choice(prompt);"],
    ["main.go", 'package main\nimport "github.com/typesafe-ai/jev-go"\nfunc main() {\n client := jev.NewClient("key")\n res, _ := client.Choice(ctx, opt)\n}'],
    ["cmd/tool/main.go", 'package main\nimport (\n  "context"\n  "github.com/typesafe-ai/jev-go"\n)\nfunc main() {\n client := jev.NewClient("k")\n client.SystemOne(ctx, req)\n}'],
    ["src/main.rs", 'use typesafe::JevClient;\n#[tokio::main]\nasync fn main() {\n let client = JevClient::new("key");\n let res = client.choice(&opt).await;\n}'],
    ["src/decision.rs", 'use jev::{Client, Choice};\npub async fn decide() {\n let client = Client::new();\n let res = client.system_one(input).await;\n}'],
    ["src/multiline.rs", 'use jev::{\n    Client,\n    Choice,\n};\npub async fn run() {\n    let client = Client::new();\n    let res = client.system_one("input").await;\n}'],
    ["src/main/java/com/example/Main.java", 'package com.example;\nimport com.typesafe.jev.TypeSafeClient;\npublic class Main {\n void run() {\n TypeSafeClient client = new TypeSafeClient();\n client.choice(opt);\n }\n}'],
  ];
  for (const [path, text] of cases) {
    const f = fixture({
      [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [{ type: "blob", path, mode: "100644", size: text.length }] },
      [`/repos/${repository}/contents/${path}?ref=${sha}`]: encoded(text, path),
    });
    const result = await inspect(f, { requireCodeEvidence: true });
    assert.equal(result.status, "accepted", path + ": " + text);
    assert.equal(result.evidence.implementationFiles.length, 1);
    assert.equal(result.evidence.implementationFiles[0].url, `https://github.com/${repository}/blob/${sha}/${path}`);
    assert.equal(result.evidence.implementationFiles[0].hash, createHash("sha256").update(text).digest("hex"));
  }
});

test("strict ingestion recognizes precise Jev models only with an OpenRouter request in source", async () => {
  const cases = [
    {
      text: "const input={model:'~typesafe/jev-latest',state,questions};\nconst response=await fetcher('https://openrouter.ai/api/alpha/decisions',{method:'POST',body:JSON.stringify(input)});",
      accepted: true,
    },
    {
      text: "const input={model:'typesafe/jev-1.13-20260917',state,questions};\nconst response=await fetch('https://openrouter.ai/api/alpha/decisions',{method:'POST',body:JSON.stringify(input)});",
      accepted: true,
    },
    {
      text: "const {OpenRouter}=await import('@openrouter/sdk');\nconst client=new OpenRouter({apiKey});\nconst result=await client.alpha.decisions.create({decisionsRequest:{model:'~typesafe/jev-latest',state,questions}});",
      accepted: true,
    },
    {
      text: "import httpx\nbase_url = 'https://openrouter.ai/api/alpha/decisions'\nmodel = 'typesafe/jev-1.13'\nawait client.post(base_url, json={'model': model})",
      accepted: true,
    },
    {
      text: "const models=['typesafe/jev-1.13-20260917']; console.log(models);",
      accepted: false,
    },
    {
      text: "fetch('https://openrouter.ai/api/alpha/decisions',{body:JSON.stringify({model:'another/llm',state,questions})});",
      accepted: false,
    },
    {
      text: "fetch('https://openrouter.ai.evil.test/api/alpha/decisions',{body:JSON.stringify({model:'~typesafe/jev-latest'})});",
      accepted: false,
    },
    {
      text: "fetch('https://openrouter.ai/api/alpha/decisions',{body:JSON.stringify({model:'not-typesafe/jev-latest'})});",
      accepted: false,
    },
    {
      text: "fetch('https://openrouter.ai/api/alpha/decisions',{body:JSON.stringify({model:'typesafe/jev-unrelated'})});",
      accepted: false,
    },
    {
      text: "// fetch('https://openrouter.ai/api/alpha/decisions',{model:'~typesafe/jev-latest'});\nconsole.log('not implemented');",
      accepted: false,
    },
  ];
  const path = "src/online.js";
  for (const { text, accepted } of cases) {
    const f = fixture({
      [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [{ type: "blob", path, mode: "100644", size: text.length }] },
      [`/repos/${repository}/contents/${path}?ref=${sha}`]: encoded(text, path),
    });
    const result = await inspect(f, { requireCodeEvidence: true });
    assert.equal(result.status, accepted ? "accepted" : "rejected", text);
    assert.equal(result.evidence.implementationFiles.length, Number(accepted));
  }
});

test("inspectRepository rejects forks before source scans", async () => {
  const text = 'from typesafe import Client\nclient = Client()\nresult = client.choice(options)';
  const path = "src/main.py";
  const f = fixture({
    [`/repos/${repository}`]: { ...repo, fork: true },
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: [{ type: "blob", path, mode: "100644", size: text.length }] },
    [`/repos/${repository}/contents/${path}?ref=${sha}`]: encoded(text, path),
  });
  const result = await inspect(f, { requireCodeEvidence: true });
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "forks are not ingested");
  assert.equal(f.requests.some((path) => path.includes("/git/trees/")), false);
});

test("submitted categories require an exact or prefixed taxonomy name, not a substring", () => {
  const taxonomy = [
    { category: "Browser & OS Action" },
    { category: "CLI & Pipelines" },
    { category: "Decision Tools" },
  ];
  assert.equal(
    extractSubmittedCategory("## 项目分类\nCLI & Pipelines (命令行与流水线管道)\n", taxonomy),
    "CLI & Pipelines",
  );
  assert.equal(
    extractSubmittedCategory("## Primary category\nBrowser & OS Action\n", taxonomy),
    "Browser & OS Action",
  );
  assert.equal(
    extractSubmittedCategory("## 项目分类\nnot Browser & OS Action\n", taxonomy),
    null,
  );
  assert.equal(
    extractSubmittedCategory("## 项目分类\nfree-airdrop\n", taxonomy),
    null,
  );
});

test("extractSubmittedCodePaths extracts repository blob links, raw URLs, tree URLs, and inline paths with trailing punctuation", () => {
  const text = `
    Check this implementation:
    (https://github.com/milvus-io/bootcamp/blob/main/bootcamp/RAG/search_with_jev/rerank_search_results.ipynb#L10-L20),
    and raw link:
    https://raw.githubusercontent.com/milvus-io/bootcamp/master/bootcamp/RAG/search_with_jev/route_search_queries.ipynb:98
    and tree link:
    https://github.com/milvus-io/bootcamp/tree/15a2212dc12c637479af0661d0038415bb83a17e/bootcamp/RAG/search_with_jev/demo.py.
    also inline code \`bootcamp/RAG/search_with_jev/helper.py\` and path: bootcamp/RAG/search_with_jev/eval.py
    unrelated link:
    https://github.com/other/repo/blob/main/foo.py
  `;
  const paths = extractSubmittedCodePaths(text, "milvus-io/bootcamp");
  assert.deepEqual(paths.sort(), [
    "bootcamp/RAG/search_with_jev/demo.py",
    "bootcamp/RAG/search_with_jev/eval.py",
    "bootcamp/RAG/search_with_jev/helper.py",
    "bootcamp/RAG/search_with_jev/rerank_search_results.ipynb",
    "bootcamp/RAG/search_with_jev/route_search_queries.ipynb",
  ].sort());
});

test("decodeNotebookCode extracts code cell content", () => {
  const notebook = JSON.stringify({
    cells: [
      { cell_type: "markdown", source: ["# Title\n"] },
      { cell_type: "code", source: ["import requests\n", "requests.post('https://api.typesafe.ai/v1/systemone')\n"] },
      { cell_type: "code", source: "print('done')" },
    ],
  });
  const code = decodeNotebookCode(notebook);
  assert.match(code, /https:\/\/api\.typesafe\.ai\/v1\/systemone/);
  assert.match(code, /print\('done'\)/);
  assert.equal(code.includes("# Title"), false);
});

test("inspectRepository finds preferred candidates located beyond 5000 entries and via suffix matching", async () => {
  const dummyEntries = Array.from({ length: 5500 }, (_, i) => ({
    type: "blob",
    path: `src/dummy/file_${String(i).padStart(5, "0")}.py`,
    mode: "100644",
    size: 20,
  }));
  const targetPath = "bootcamp/RAG/search_with_jev/rerank.ipynb";
  const notebookContent = JSON.stringify({
    cells: [
      {
        cell_type: "code",
        source: [
          'import requests, os\n',
          'API_URL = "https://api.typesafe.ai/v1/systemone"\n',
          'requests.post(API_URL, headers={"Authorization": "Bearer key"})\n',
        ],
      },
    ],
  });
  dummyEntries.push({
    type: "blob",
    path: targetPath,
    mode: "100644",
    size: notebookContent.length,
  });

  const f = fixture({
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: { tree: dummyEntries },
    [`/repos/${repository}/contents/${targetPath}?ref=${sha}`]: encoded(notebookContent, targetPath),
  });

  // Test suffix matching: author supplied only "search_with_jev/rerank.ipynb"
  const result = await inspect(f, {
    requireCodeEvidence: true,
    preferredPaths: ["search_with_jev/rerank.ipynb"],
  });
  assert.equal(result.status, "accepted");
  assert.equal(result.evidence.implementationFiles.length, 1);
  assert.equal(result.evidence.implementationFiles[0].path, targetPath);
});

test("inspectRepository accepts self-hosted Jev server implementations serving /v1/systemone", async () => {
  const serverPath = "server/src/server/app.py";
  const serverCode = `
from fastapi import FastAPI, Request
app = FastAPI()

@app.post("/v1/systemone", tags=["decisions"])
async def systemone(request: Request):
    """Answers choice, score, and noul questions from model logits directly."""
    body = await request.json()
    questions = body.get("questions", {})
    return {"answers": {"intent": {"choice": "billing", "confidence": 0.95}}}
`;
  const f = fixture({
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: {
      tree: [
        { type: "blob", path: serverPath, mode: "100644", size: serverCode.length },
      ],
    },
    [`/repos/${repository}/contents/${serverPath}?ref=${sha}`]: encoded(serverCode, serverPath),
  });

  const result = await inspect(f, {
    requireCodeEvidence: true,
    preferredPaths: [serverPath],
  });
  assert.equal(result.status, "accepted");
  assert.equal(result.evidence.implementationFiles.length, 1);
  assert.equal(result.evidence.implementationFiles[0].path, serverPath);
});

test("extractSubmittedTags extracts multiple tags separated by commas or semicolons on a single line", () => {
  const issueBody = `
### Project Tags (项目场景标签，建议选 1~3 个)

search-retrieval (搜索与检索 / Search & Retrieval), classification-ranking (分类与排序 / Classification & Ranking), typed-decisions (结构化决策 / Typed Decisions)
`;
  const tags = extractSubmittedTags(issueBody);
  assert.deepEqual(tags, [
    "search-retrieval",
    "classification-ranking",
    "typed-decisions",
  ]);

  const ideographicBody = `
## 项目标签
结构化决策、分类与排序、评测与可观测性
`;
  const ideographicTags = extractSubmittedTags(ideographicBody);
  assert.deepEqual(ideographicTags, [
    "typed-decisions",
    "classification-ranking",
    "evaluation-benchmarks",
  ]);
});

test("inspectRepository accepts cross-file joint evidence where constants and request dispatch are separated", async () => {
  const configPath = "src/config.py";
  const configCode = 'JEV_MODEL = "typesafe/jev-1.13"\nOPENROUTER_URL = "https://openrouter.ai/api/v1"';
  const routerPath = "src/router.py";
  const routerCode = 'from config import JEV_MODEL, OPENROUTER_URL\nimport httpx\nresponse = await client.post(f"{OPENROUTER_URL}/chat/completions", json={"model": JEV_MODEL})';

  const f = fixture({
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: {
      tree: [
        { type: "blob", path: configPath, mode: "100644", size: configCode.length },
        { type: "blob", path: routerPath, mode: "100644", size: routerCode.length },
      ],
    },
    [`/repos/${repository}/contents/${configPath}?ref=${sha}`]: encoded(configCode, configPath),
    [`/repos/${repository}/contents/${routerPath}?ref=${sha}`]: encoded(routerCode, routerPath),
  });

  const result = await inspect(f, { requireCodeEvidence: true });
  assert.equal(result.status, "accepted");
  assert.equal(result.evidence.implementationFiles.length, 1);
});

test("inspectRepository accepts OpenAI-compatible SDK calling OpenRouter Jev model", async () => {
  const agentPath = "agent/client.ts";
  const agentCode = `
import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
export async function routeTask(prompt: string) {
  return await client.chat.completions.create({
    model: "typesafe/jev-1.13",
    messages: [{ role: "user", content: prompt }],
  });
}
`;

  const f = fixture({
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: {
      tree: [
        { type: "blob", path: agentPath, mode: "100644", size: agentCode.length },
      ],
    },
    [`/repos/${repository}/contents/${agentPath}?ref=${sha}`]: encoded(agentCode, agentPath),
  });

  const result = await inspect(f, { requireCodeEvidence: true });
  assert.equal(result.status, "accepted");
  assert.equal(result.evidence.implementationFiles.length, 1);
  assert.equal(result.evidence.implementationFiles[0].path, agentPath);
});

test("extractSubmittedCodePaths strips line anchors (#L10-L20, :15) and matches preferred candidate", () => {
  const issueText = `
### Source Evidence
https://github.com/my-org/my-project/blob/main/packages/server/router.py#L45-L120
Also see \`src/providers/jev_eval.ts:25\`
`;
  const paths = extractSubmittedCodePaths(issueText, "my-org/my-project");
  assert.ok(paths.includes("packages/server/router.py"));
  assert.ok(paths.includes("src/providers/jev_eval.ts"));
});

function materialFixture(paths, overrides = {}) {
  const inventory = { tree: paths.map((path) => ({ path, type: "blob", mode: "100644", size: 64 })) };
  return { inventory, ...fixture({
    [`/repos/${repository}/git/trees/${sha}?recursive=1`]: inventory,
    ...Object.fromEntries(paths.map((path) => [
      `/repos/${repository}/contents/${path}?ref=${sha}`, encoded(`Material from ${path}`, path),
    ])),
    ...overrides,
  }) };
}

test("material labels cover translated docs and mobile manifests without a language admission whitelist", () => {
  for (const path of ["README", "README_zh", "README_ja.md", "docs/README", "README.en.md", "docs/guide.md", "LICENSE"])
    assert.equal(materialForm(path), "prose", path);
  for (const path of ["package.json", "app/build.gradle", "app/build.gradle.kts", "settings.gradle.kts", "Cargo.toml", "go.mod", "pom.xml", "Podfile", "Package.swift", "requirements-dev.txt", "Info.plist", "App.xcodeproj/project.pbxproj", ".gitignore"])
    assert.equal(materialForm(path), "config", path);
  assert.equal(materialForm("queries/judge.sql"), "sql");
  assert.equal(materialForm("Shared/JevService.swift"), "source");
  assert.equal(materialForm("policy/decision.custom_dsl"), "source");
  assert.equal(materialForm("lib/evaluate"), "source");
  assert.equal(materialForm("README.md/client.kt"), "source");
});

for (const [platform, codePaths] of [
  ["Android", ["app/src/main/java/com/example/JevClient.kt", "app/src/main/java/com/example/JudgeService.kt", "app/src/main/java/com/example/Client.kt", "app/src/main/java/com/example/Decision.kt", "app/src/main/java/com/example/Response.kt"]],
  ["iOS", ["Shared/JevService.swift", "Sources/Client/Judge.swift", "Shared/Client.swift", "Sources/Decision.swift", "Shared/Response.swift"]],
]) {
  test(`semantic first pass reserves five ${platform} sources despite eight translated READMEs`, async () => {
    const translations = ["zh", "ja", "ko", "de", "fr", "es", "ru", "pt"].map((lang) => `README_${lang}.md`);
    const paths = ["README.md", ...translations, "docs/README.md", "docs/jev-client.md", "package.json", "app/build.gradle.kts", "Package.swift", "Podfile", "go.mod", ...codePaths];
    const f = materialFixture(paths);
    const result = await inspect(f, { semanticReview: true });
    assert.equal(result.status, "inspected");
    assert.equal(result.sources.length, 8);
    assert.equal(result.sources.filter((source) => source.form === "source").length, 5);
    assert.equal(result.sources.filter((source) => source.form === "config").length, 2);
    assert.deepEqual(result.readmeFiles.map((source) => source.path), ["README.md"]);
    assert.ok(result.sources.slice(0, 3).some((source) => source.path === codePaths[0]));
    assert.ok(result.sources.slice(0, 3).every((source) => source.form === "source"));
    assert.ok(result.sources.every((source) => source.commit === sha && source.url.includes(`/blob/${sha}/`)));
    assert.equal(f.requests.filter((path) => path.includes("/contents/")).length, 8);
  });
}

test("deep independent code outranks translated and nested README hints and retains discovery slots", async () => {
  const hinted = Array.from({ length: 8 }, (_, index) => `src/jev-hint-${index}.ts`);
  const discovered = ["lib/Client.scala", "pkg/Judge.ex", "internal/Service.clj", "Shared/Typesafe.fs", "app/src/main/Decision.kt"];
  const f = materialFixture([...hinted, ...discovered, "README.md", "README_zh.md", "docs/README.md", "package.json", "Cargo.toml"]);
  const result = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8, preferredPaths: hinted });
  assert.equal(result.sources.length, 8);
  assert.equal(result.sources.filter((source) => hinted.includes(source.path)).length, 4);
  assert.equal(result.sources.filter((source) => source.form === "source").length, 5);
  assert.ok(result.sources.some((source) => discovered.includes(source.path)));
  assert.deepEqual(result.sources.filter((source) => source.form === "prose").map((source) => source.path), ["README.md"]);
});

test("second pass reuses category allowances and never substitutes another language README", async () => {
  const paths = ["README.md", "README_zh.md", "README_ja.md", "docs/README.md", "docs/guide.md", "package.json", "go.mod", "Podfile",
    ...Array.from({ length: 10 }, (_, index) => `lib/JevClient${index}.swift`)];
  const f = materialFixture(paths);
  const first = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8 });
  const excludePaths = first.sources.map((source) => source.path);
  const second = await collectAdditionalMaterials({ api: f.api, repository, sha, need: "usage-example", excludePaths, inventory: first.inventory });
  assert.equal(second.sources.length, 3);
  assert.ok(second.sources.every((source) => source.form === "source" && !excludePaths.includes(source.path)));
  assert.equal(f.requests.filter((path) => path.includes("/git/trees/")).length, 1);
  assert.equal([...first.sources, ...second.sources].filter((source) => source.form === "prose").length, 1);
  assert.equal([...first.sources, ...second.sources].filter((source) => source.form === "config").length, 2);
});

test("SQL, DSL and unknown readable files fill source sampling slots without claiming implementation", async () => {
  const codePaths = ["queries/Jev.sql", "policy/Judge.dsl", "lib/Client.custom", "pkg/service.ex", "internal/evaluate"];
  const f = materialFixture(["README_zh", "package.json", "Podfile", ...codePaths]);
  const result = await inspect(f, { semanticReview: true });
  assert.equal(result.sources.length, 8);
  assert.equal(result.sources.filter((source) => ["source", "sql"].includes(source.form)).length, 5);
  assert.deepEqual(result.readmeFiles.map((source) => source.path), ["README_zh"]);
  assert.equal(result.evidence.verified, false);
  assert.deepEqual(result.evidence.implementationFiles, []);
});

test("failed selected reads remain visible coverage gaps and cannot spend replacement docs slots", async () => {
  const paths = ["README.md", "README_zh.md", "package.json", "Podfile", ...Array.from({ length: 5 }, (_, index) => `src/Jev${index}.kt`)];
  const f = materialFixture(paths, {
    [`/repos/${repository}/contents/src/Jev0.kt?ref=${sha}`]: missing(),
    [`/repos/${repository}/contents/src/Jev1.kt?ref=${sha}`]: encoded("binary\0text", "src/Jev1.kt"),
    [`/repos/${repository}/contents/src/Jev2.kt?ref=${sha}`]: encoded("wrong path", "different.kt"),
  });
  const result = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8 });
  assert.equal(result.sources.length, 5);
  assert.deepEqual(result.coverage.unread, ["src/Jev0.kt", "src/Jev1.kt", "src/Jev2.kt"]);
  assert.equal(result.coverage.omitted, 4);
  assert.equal(result.sources.filter((source) => source.form === "prose").length, 1);
  assert.ok(!f.requests.some((path) => path.includes("README_zh.md")));
});

test("nominations fill unused seats only after eligible independent candidates are exhausted", async () => {
  const paths = Array.from({ length: 8 }, (_, index) => `src/Jev${index}.kt`);
  const f = materialFixture(paths);
  const result = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8, preferredPaths: paths });
  assert.equal(result.sources.length, 8);
  assert.equal(result.coverage.omitted, 0);

  const independent = ["README.md", "README_zh.md", "docs/README.md", "package.json", "Podfile", "go.mod", "Package.swift"];
  const mixed = materialFixture([...paths.slice(0, 5), ...independent]);
  const recovered = await collectAdditionalMaterials({ api: mixed.api, repository, sha, maxFiles: 8, preferredPaths: paths.slice(0, 5) });
  assert.equal(recovered.sources.length, 8);
  assert.equal(recovered.sources.filter((source) => source.form === "source").length, 5);
  assert.equal(recovered.sources.filter((source) => source.form === "config").length, 2);
  assert.equal(recovered.sources.filter((source) => source.form === "prose").length, 1);

  const docs = materialFixture(["README_zh.md", "docs/README.md", "docs/guide.md"]);
  const followup = await collectAdditionalMaterials({ api: docs.api, repository, sha, excludePaths: ["README.md"] });
  assert.equal(followup.sources.length, 0);
  assert.equal(followup.coverage.omitted, 3);
});

test("large-file windows count once and invalid or empty samples remain unread", async () => {
  const paths = ["lib/Jev0.swift", "lib/Jev1.swift", "lib/Jev2.swift", "lib/Jev3.swift"];
  const inventory = { tree: paths.map((path) => ({ type: "blob", path, mode: "100644", size: 100_000 })) };
  const requests = [];
  const api = async (path, options) => {
    requests.push(path);
    assert.equal(options.sampleMaterials, true);
    assert.ok(options.responseBytes <= 10_485_760);
    const valid = { text: "Jev client", startByte: 0, endByte: 10 };
    return { scannedBytes: 100_000, complete: true,
      windows: path.includes("Jev0") ? [valid, { ...valid, startByte: 100, endByte: 110 }] : path.includes("Jev1") ? [] : [null, { text: "", startByte: 0, endByte: 0 }, { text: " \n", startByte: 0, endByte: 2 }] };
  };
  const result = await collectAdditionalMaterials({ api, repository, sha, inventory, maxFiles: 3 });
  assert.equal(result.sources.length, 2);
  assert.equal(new Set(result.sources.map((source) => source.path)).size, 1);
  assert.equal(result.coverage.omitted, 3);
  assert.deepEqual(result.coverage.unread, ["lib/Jev1.swift", "lib/Jev2.swift", "lib/Jev3.swift"]);
  assert.equal(requests.length, 4);
});


test("a translated or nested README outranks general prose without the root README bonus", async () => {
  for (const readme of ["README_zh.md", "docs/README.md"]) {
    const f = materialFixture([readme, "docs/guide.md", "LICENSE", "NOTICE", "package.json",
      ...Array.from({ length: 5 }, (_, i) => `Shared/JevService${i}.swift`)]);
    const result = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8 });
    assert.deepEqual(result.sources.filter((s) => s.form === "prose").map((s) => s.path), [readme]);
    assert.ok(result.sources.slice(0, 3).every((s) => s.form === "source"));
  }
});


test("failed source reads use bounded same-bucket replacements to preserve the source floor", async () => {
  const codePaths = Array.from({ length: 10 }, (_, i) => `src/Jev${i}.kt`);
  const f = materialFixture(["README.md", "README_zh.md", "package.json", "Podfile", ...codePaths], {
    [`/repos/${repository}/contents/src/Jev0.kt?ref=${sha}`]: missing(),
    [`/repos/${repository}/contents/src/Jev1.kt?ref=${sha}`]: encoded("binary\0text", "src/Jev1.kt"),
  });
  const result = await collectAdditionalMaterials({ api: f.api, repository, sha, maxFiles: 8 });
  assert.equal(result.sources.filter((s) => s.form === "source").length, 5);
  assert.equal(result.sources.filter((s) => s.form === "prose").length, 1);
  assert.equal(result.sources.filter((s) => s.form === "config").length, 2);
  assert.equal(result.coverage.attemptedFiles, 10);
  assert.deepEqual(result.coverage.unread, codePaths.slice(0, 2));

  const failing = materialFixture(["README.md", "package.json", "Podfile", ...codePaths],
    Object.fromEntries(codePaths.map((path) => [`/repos/${repository}/contents/${path}?ref=${sha}`, missing()])));
  const exhausted = await collectAdditionalMaterials({ api: failing.api, repository, sha, maxFiles: 8 });
  assert.equal(exhausted.sources.filter((s) => s.form === "source").length, 0);
  assert.equal(exhausted.coverage.attemptedFiles, 12);
  assert.equal(failing.requests.filter((path) => path.includes("/contents/")).length, 12);
  assert.equal(exhausted.coverage.unread.length, 9);
});
