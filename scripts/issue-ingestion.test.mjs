import test from "node:test";
import { createSummaryEnricher } from "./source-enrichment.mjs";
import assert from "node:assert/strict";
import { assetDigest, DERIVED_DOCUMENTS } from "./ingestion-assets.mjs";
import {
  prepareSubmission,
  publishSubmission,
  acknowledgePublished,
  bodyHash,
  successComment,
  isSubmission,
} from "./issue-ingestion.mjs";
const repository = "logicrw/awesome-jev-projects";
const issue = {
  number: 12,
  title: "[Project] Useful Jev tool",
  state: "open",
  body: "## 项目仓库\nhttps://github.com/example/jev-tool\n\n## 一句话介绍\n给 Agent 的终端日志做过滤，只留下与任务有关的内容。",
  comments: 0,
  user: { login: "example" },
  author_association: "NONE",
};
const meta = {
  id: 42,
  full_name: "example/jev-tool",
  name: "jev-tool",
  private: false,
  description: "A Jev tool for filtering irrelevant Agent logs.",
  owner: {
    login: "example",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
  },
  stargazers_count: 2,
  forks_count: 0,
  open_issues_count: 0,
  created_at: "2026-09-01T00:00:00Z",
};
const sha = "a".repeat(40);
const inspected = {
  status: "accepted",
  repo: meta,
  sha,
  commits: [{ sha, commit: { committer: { date: "2026-09-01T00:00:00Z" } } }],
  readme: "Jev source",
  evidence: {
    files: [
      {
        path: "src/jev.ts",
        url: `https://github.com/example/jev-tool/blob/${sha}/src/jev.ts`,
        hash: "proof",
      },
    ],
  },
};
const fallback = {
  plainSummary: "给 Agent 的终端日志做过滤，只留下与任务有关的内容。",
  plainSummaryEn: meta.description,
  jevDecisionPoint: "判断每一段日志与任务是否相关。",
  highlightBenefit: "减少后续处理的无关日志。",
  category: "Context GC & Filter",
  tags: ["Agent"],
  summarySource: "source-first",
};
const project = {
  id: "example:jev-tool",
  author: "example",
  url: "https://github.com/example/jev-tool",
  repoId: 42,
  ingestion: {
    repository,
    issueNumber: 12,
    issueBodySha256: bodyHash(issue.body),
  },
};
const contents = (rows) => ({
  sha: "blob-sha",
  encoding: "base64",
  content: Buffer.from(JSON.stringify(rows)).toString("base64"),
});
function assetBundleFor(rows) {
  return {
    version: 1, reviewedSourceSha: sha,
    candidateSha256: assetDigest(JSON.stringify(rows, null, 2) + "\n"),
    files: DERIVED_DOCUMENTS.map((path) => ({ path, content: Buffer.from(path.endsWith(".svg") ? '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n' : "generated document\n").toString("base64") })),
  };
}

test("non-submissions, ambiguous URLs, and duplicate projects never reach AI", async () => {
  let calls = 0;
  const base = {
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    enrich: async () => {
      calls++;
      return fallback;
    },
  };
  assert.equal(
    (
      await prepareSubmission({
        ...base,
        issue: { ...issue, title: "Bug report", body: "Error in startup" },
      })
    ).status,
    "ignored",
  );
  assert.equal(
    (
      await prepareSubmission({
        ...base,
        issue: { ...issue, title: "Project help please", body: "Please help" },
      })
    ).status,
    "ignored",
  );
  assert.equal(isSubmission({ title: "Project help please", body: "" }), false);
  assert.equal(isSubmission({ title: "Submit a patch", body: "" }), false);
  assert.equal(isSubmission({ title: "submit:", body: "" }), false);
  assert.equal(isSubmission({ title: "[Project] x", body: "" }), true);
  assert.equal(isSubmission({ title: "Hello", labels: ["project-submission"] }), true);
  assert.equal(isSubmission({ title: "Hello", labels: [{ name: "project-submission" }] }), true);
  assert.equal(isSubmission({ title: "Hello", body: "## GitHub repository\n" }), true);
  assert.equal(isSubmission({ title: "Hello", body: "### GitHub repository (项目仓库地址)\n" }), true);
  assert.equal(isSubmission({ title: "Hello", body: "### 项目仓库 (Repository)\n" }), true);
  assert.equal(
    (
      await prepareSubmission({
        ...base,
        issue: {
          ...issue,
          body: "## 项目仓库\nhttps://github.com/a/b\nhttps://github.com/c/d",
        },
      })
    ).status,
    "rejected",
  );
  assert.equal(
    (
      await prepareSubmission({
        ...base,
        issue,
        inspect: async () => ({
          status: "duplicate",
          reason: "already listed",
        }),
      })
    ).status,
    "duplicate",
  );
  assert.equal(calls, 0);
});
test("verified ingestion fixes repository identity and retains immutable evidence and provenance", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async (input) => {
      assert.equal(input.requireCodeEvidence, true);
      return inspected;
    },
    enrich: async (input) => {
      assert.equal(input.issueTrusted, true);
      assert.equal(input.issueBody, issue.body);
      return { ...fallback, enrichment: { internal: "provider diagnostic" } };
    },
    now: () => "2026-09-18T00:00:00Z",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.project.url, "https://github.com/example/jev-tool");
  assert.equal(result.project.runtimeVerified, false);
  assert.notEqual(result.project.catalogStatus, "review-pending");
  assert.equal(result.project.ingestion.issueBodySha256, bodyHash(issue.body));
  assert.equal(result.project.sourceVerification.sha, sha);
  assert.equal(result.project.plainSummary, fallback.plainSummary);
  assert.equal(Object.hasOwn(result.project, "enrichment"), false);
});
function publisher({ rows = [], head = sha, afterTree, onRef, large = false, assets = assetBundleFor([...rows, project]) } = {}) {
  const calls = [];
  const preparedCommit = "c".repeat(40);
  let currentHead = head;
  const api = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (path.endsWith("/issues/12")) return issue;
    if (path === "/repos/example/jev-tool") return meta;
    if (path.endsWith("/git/ref/heads/main")) return { object: { sha: currentHead } };
    if (path.includes("/contents/")) {
      assert.ok(path.endsWith(`?ref=${sha}`), "snapshot must be read at the reviewed immutable revision");
      return large ? { sha: "immutable-blob", encoding: "none", size: 1_100_000 } : contents(rows);
    }
    if (path.includes("/git/blobs/")) return contents(rows);
    if (path.endsWith("/git/blobs")) {
      assert.equal(options.method, "POST");
      assert.equal(options.body.encoding, "base64");
      return { sha: "f".repeat(40) };
    }
    if (path.endsWith(`/git/commits/${sha}`)) return { tree: { sha: "b".repeat(40) } };
    if (path.endsWith("/git/trees")) {
      assert.equal(options.method, "POST");
      assert.equal(options.body.base_tree, "b".repeat(40));
      assert.equal(options.body.tree.length, 1 + assets.files.length);
      assert.equal(options.body.tree[0].path, "src/data/projects.json");
      assert.deepEqual(JSON.parse(options.body.tree[0].content), [...rows, project]);
      assert.deepEqual(options.body.tree.slice(1).map(({ path }) => path), assets.files.map(({ path }) => path));
      assert.ok(options.body.tree.slice(1).every(({ sha: blob, mode, type }) => blob === "f".repeat(40) && mode === "100644" && type === "blob"));
      if (afterTree) currentHead = afterTree;
      return { sha: "d".repeat(40) };
    }
    if (path.endsWith("/git/commits")) {
      assert.equal(options.method, "POST");
      assert.deepEqual(options.body.parents, [sha]);
      assert.equal(options.body.tree, "d".repeat(40));
      return { sha: preparedCommit };
    }
    if (path.endsWith("/git/refs/heads/main")) {
      assert.equal(options.method, "PATCH");
      assert.deepEqual(options.body, { sha: preparedCommit, force: false });
      if (onRef) return onRef({ setHead: (value) => { currentHead = value; }, preparedCommit });
      currentHead = preparedCommit;
      return {};
    }
    assert.fail(`Unexpected request ${path}`);
  };
  return { api, calls, preparedCommit, run: () => publishSubmission({ api, repository, project, reviewedSourceSha: sha, assetBundle: assets }) };
}
test("publication preserves the reviewed snapshot and atomically advances only its parent", async () => {
  const other = { id: "other:repo", url: "https://github.com/other/repo" };
  const f = publisher({ rows: [other] });
  assert.deepEqual(await f.run(), { status: "ingested", changed: true, commit: f.preparedCommit });
  assert.equal(f.calls.filter((c) => c.path.endsWith("/git/refs/heads/main")).length, 1);
  assert.deepEqual(f.calls.filter((call) => call.path.endsWith("/git/blobs")).map(({ body }) => body.content), assetBundleFor([other, project]).files.map(({ content }) => content));
});
test("binary avatars are included with the validated docs and dataset in the same atomic tree", async () => {
  const assets = assetBundleFor([project]);
  const avatar = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), Buffer.alloc(240)]).toString("base64");
  assets.files.push({ path: "public/avatars/example.png", content: avatar });
  const f = publisher({ assets });
  assert.equal((await f.run()).status, "ingested");
  assert.equal(f.calls.filter((call) => call.path.endsWith("/git/blobs")).at(-1).body.content, avatar);
});
test("publication rejects missing or differently validated assets before creating any object", async () => {
  for (const assets of [null, assetBundleFor([]), { ...assetBundleFor([project]), reviewedSourceSha: "e".repeat(40) }]) {
    const f = publisher({ assets });
    await assert.rejects(f.run(), /Validated assets/);
    assert.equal(f.calls.filter((call) => call.method).length, 0);
  }
});
test("a code or schema commit after review blocks publication before every mutation", async () => {
  const f = publisher({ head: "e".repeat(40) });
  const result = await f.run();
  assert.equal(result.status, "changed");
  assert.equal(result.retryable, true);
  assert.equal(f.calls.filter((c) => c.method).length, 0);
});
test("an advanced main during object preparation never updates the branch", async () => {
  const f = publisher({ afterTree: "e".repeat(40) });
  assert.equal((await f.run()).status, "changed");
  assert.equal(f.calls.filter((c) => c.method === "PATCH").length, 0);
});
test("a main update in the final check-write window is rejected rather than overwritten", async () => {
  const f = publisher({ onRef: ({ setHead }) => {
    setHead("e".repeat(40));
    throw Object.assign(new Error("Update is not a fast forward"), { status: 422 });
  } });
  assert.equal((await f.run()).status, "changed");
  assert.equal(f.calls.filter((c) => c.method === "PATCH").length, 1);
  assert.ok(f.calls.filter((c) => c.method === "PATCH").every((c) => c.body.force === false));
});
test("unknown branch-write outcome is read back without a second mutation", async () => {
  const f = publisher({ onRef: ({ setHead, preparedCommit }) => {
    setHead(preparedCommit);
    throw new TypeError("lost response");
  } });
  assert.deepEqual(await f.run(), { status: "ingested", changed: true, commit: f.preparedCommit });
  assert.equal(f.calls.filter((c) => c.method === "PATCH").length, 1);
});
test("edited or closed submissions and privatized repositories do not publish", async () => {
  for (const changed of [{ ...issue, body: "withdrawn" }, { ...issue, state: "closed" }]) {
    let calls = 0;
    const r = await publishSubmission({ repository, project, reviewedSourceSha: sha, api: async () => { calls++; return changed; } });
    assert.equal(r.status, "changed"); assert.equal(calls, 1);
  }
  const r = await publishSubmission({ repository, project, reviewedSourceSha: sha,
    api: async (path) => path.endsWith("/issues/12") ? issue : { ...meta, private: true } });
  assert.equal(r.status, "changed");
});
test("a different submission of the same project does not overwrite the winner", async () => {
  const old = { ...project, ingestion: { ...project.ingestion, issueNumber: 9 } };
  const f = publisher({ rows: [old] });
  assert.equal((await f.run()).status, "duplicate");
  assert.equal(f.calls.filter((c) => c.method).length, 0);
});
function notifier({
  published = [project],
  existingComment = false,
  edited = false,
  commentFailure = false,
  issueOverride = null,
} = {}) {
  const currentIssue = issueOverride || issue;
  const calls = [];
  const api = async (path, options = {}) => {
    calls.push({ path, ...options });
    if (path.includes("?state=open")) return [currentIssue];
    if (path.includes("/comments?"))
      return existingComment
        ? [
            {
              user: { login: "github-actions[bot]" },
              body: "<!-- awesome-jev-ingestion:12:42 -->",
            },
          ]
        : [];
    if (options.method === "POST") {
      if (commentFailure) throw new Error("comment unavailable");
      assert.equal(options.body.body.split("\n\n")[0], successComment);
      return {};
    }
    if (options.method === "DELETE") {
      assert.ok(path.endsWith("/labels/needs-evidence"));
      return {};
    }
    if (options.method === "PATCH") {
      assert.deepEqual(options.body, {
        state: "closed",
        state_reason: "completed",
      });
      return {};
    }
    return edited ? { ...currentIssue, body: "edited" } : currentIssue;
  };
  return {
    calls,
    run: () =>
      acknowledgePublished({
        api,
        repository,
        projects: [project],
        publishedProjects: published,
      }),
  };
}
test("notification requires live inclusion and rechecks current issue content", async () => {
  for (const options of [{ published: [] }, { edited: true }]) {
    const n = notifier(options);
    await n.run();
    assert.equal(n.calls.filter((c) => c.method).length, 0);
  }
});
test("successful publication comments exactly once before closing as completed", async () => {
  const n = notifier();
  assert.deepEqual(await n.run(), [{ issue: 12, status: "completed" }]);
  assert.deepEqual(
    n.calls.filter((c) => c.method).map((c) => c.method),
    ["POST", "PATCH"],
  );
  const rerun = notifier({ existingComment: true });
  await rerun.run();
  assert.deepEqual(
    rerun.calls.filter((c) => c.method).map((c) => c.method),
    ["PATCH"],
  );
});
test("successful publication strips needs-evidence label if present", async () => {
  const n = notifier({
    issueOverride: { ...issue, labels: [{ name: "needs-evidence" }] },
  });
  assert.deepEqual(await n.run(), [{ issue: 12, status: "completed" }]);
  assert.deepEqual(
    n.calls.filter((c) => c.method).map((c) => c.method),
    ["POST", "DELETE", "PATCH"],
  );
});
test("failed success comment leaves the issue open for reconciliation", async () => {
  const n = notifier({ commentFailure: true });
  await assert.rejects(n.run());
  assert.equal(
    n.calls.some((c) => c.method === "PATCH"),
    false,
  );
});

test("a previously committed submission can resume deployment without calling AI", async () => {
  const prior = { ...project, ...fallback };
  let modelCalls = 0;
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [prior],
    taxonomy: [],
    api: async () => {},
    inspect: async () => ({ status: "duplicate", repo: meta }),
    enrich: async () => {
      modelCalls++;
      return fallback;
    },
  });
  assert.equal(result.status, "resume");
  assert.equal(result.project, prior);
  assert.equal(modelCalls, 0);
});
test("large canonical files use their immutable blob and retain branch CAS", async () => {
  const f = publisher({ large: true });
  assert.equal((await f.run()).status, "ingested");
  assert.ok(f.calls.some((c) => c.path.endsWith("/git/blobs/immutable-blob")));
});


test("third-party Issue prose is not treated as repository-author copy", async () => {
  for (const [login, association, trusted] of [
    ["stranger", "NONE", false],
    ["curator", "OWNER", true],
    ["EXAMPLE", "NONE", true],
  ]) {
    const result = await prepareSubmission({
      issue: { ...issue, user: { login }, author_association: association },
      repository, projects: [], taxonomy: [], api: async () => {},
      inspect: async () => inspected,
      enrich: async (input) => {
        assert.equal(input.issueTrusted, trusted);
        return fallback;
      },
    });
    assert.equal(result.status, "ready");
  }
});


test("source-first ingestion without Models still satisfies all four English fields", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async () => ({
      ...inspected,
      repo: { ...meta, language: "TypeScript" },
    }),
    enrich: createSummaryEnricher({ token: "" }),
  });
  assert.equal(result.status, "ready");
  for (const key of [
    "plainSummaryEn",
    "jevDecisionPointEn",
    "highlightBenefitEn",
    "claimStatusEn",
  ]) {
    assert.equal(typeof result.project[key], "string", key);
    assert.ok(result.project[key].trim(), key);
    assert.ok(!/\p{Script=Han}/u.test(result.project[key]), key);
  }
  assert.equal(result.project.plainSummaryEn, meta.description);
});

test("submitted category and tags in issue body are extracted and canonicalized", async () => {
  const result = await prepareSubmission({
    repository,
    projects: [],
    taxonomy: [{ category: "CLI & Pipelines", patterns: ["cli"], tags: ["CLI"] }],
    api: async () => {},
    issue: {
      ...issue,
      body: `### GitHub repository\nhttps://github.com/example/jev-tool\n\n### Primary Category\nCLI & Pipelines\n\n### Project Tags\n- cli-git-gates (CLI 与 Git 门禁 / CLI & Git Gates)\n- security-guardrails (安全与护栏 / Security & Guardrails)\n\n### What does it do?\nCLI gate tool with Jev.\n\n### Where does Jev make a decision?\nsrc/jev.ts#L10`,
    },
    inspect: async () => inspected,
    enrich: createSummaryEnricher({ token: "" }),
  });
  assert.equal(result.status, "ready");
  assert.equal(result.project.category, "CLI & Pipelines");
  assert.deepEqual(result.project.tags, ["cli-git-gates", "security-guardrails"]);
});

test("invalid prepared identities cannot select API paths or mutate the catalog", async () => {
  for (const patch of [
    { url: "https://github.com/example/jev-tool/issues" },
    { url: "https://user:password@github.com/example/jev-tool" },
    { url: "https://github.com/example/jev-tool?redirect=evil" },
    { url: "https://github.com.evil.example/example/jev-tool" },
    { repoId: -1 },
    { id: "other:project" },
  ]) {
    let calls = 0;
    await assert.rejects(publishSubmission({ repository, project: { ...project, ...patch }, api: async () => { calls++; } }), /Invalid prepared project identity/);
    assert.equal(calls, 0);
  }
});

test("automatic acknowledgement describes integration evidence, never a security certification", () => {
  assert.match(successComment, /源码集成检查/);
  assert.doesNotMatch(successComment, /代码审查|安全认证|安全审查/);
  assert.doesNotMatch(successComment, /共建|Pull Request|PR/);
});


test("publication without a reviewed SHA fails before any API request", async () => {
  for (const reviewedSourceSha of [undefined, "main", "x".repeat(40)]) {
    let calls = 0;
    await assert.rejects(publishSubmission({ repository, project, reviewedSourceSha, api: async () => { calls++; } }), /Exact reviewed source SHA/);
    assert.equal(calls, 0);
  }
});

test("prepareSubmission uses Muse Reviewer verdict to accept candidate and populate fields", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [{ category: "CLI & Pipelines", patterns: ["cli"], tags: ["CLI"] }],
    api: async () => {},
    inspect: async () => ({
      ...inspected,
      status: "rejected",
      reason: "no implementation source evidence",
    }),
    reviewer: async ({ repo, codeSources }) => {
      assert.equal(repo.name, "jev-tool");
      assert.equal(codeSources.length, 1);
      return {
        verified: true,
        confidence: 0.98,
        reason: "在 src/jev.ts 中调用了 typesafe choice 原语。",
        category: "CLI & Pipelines",
        tags: ["cli-git-gates"],
        jevDecisionPoint: "在 git hook 中对代码规范进行打分决策。",
        plainSummary: "给 Agent 的终端日志做过滤。",
        plainSummaryEn: "Filters logs for agents using Jev.",
      };
    },
    enrich: async ({ fallback }) => fallback,
    now: () => "2026-09-18T00:00:00Z",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.project.category, "CLI & Pipelines");
  assert.deepEqual(result.project.tags, ["cli-git-gates", "typed-decisions"]);
  assert.equal(result.project.jevDecisionPoint, "在 git hook 中对代码规范进行打分决策。");
  assert.equal(result.project.plainSummary, "给 Agent 的终端日志做过滤。");
  assert.equal(result.project.plainSummaryEn, "Filters logs for agents using Jev.");
});

test("prepareSubmission uses Muse Reviewer verdict to reject candidate with needsEvidence and reason", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async () => inspected,
    reviewer: async () => ({
      verified: false,
      confidence: 0.9,
      reason: "代码中仅有 Jev 的注释提及，未检测到任何实际的 API 或原语调用。",
    }),
    enrich: async ({ fallback }) => fallback,
  });
  assert.equal(result.status, "rejected");
  assert.equal(result.needsEvidence, true);
  assert.equal(result.issueNumber, 12);
  assert.match(result.reason, /代码中仅有 Jev 的注释提及/);
});

test("prepareSubmission fast-rejects structural issues with needsEvidence false and no reviewer call", async () => {
  let reviewerCalls = 0;
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async () => ({ status: "rejected", reason: "repository is not public" }),
    reviewer: async () => {
      reviewerCalls++;
      return { verified: true };
    },
    enrich: async ({ fallback }) => fallback,
  });
  assert.equal(result.status, "rejected");
  assert.equal(result.reason, "repository is not public");
  assert.equal(result.needsEvidence, false);
  assert.equal(reviewerCalls, 0);
});

test("prepareSubmission returns transient-retry when reviewer fails with transient error", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async () => ({
      ...inspected,
      status: "rejected",
      reason: "no implementation source evidence",
    }),
    reviewer: async () => ({
      verified: null,
      status: "http-error",
      retryable: true,
      reason: "HTTP 503",
    }),
    enrich: async ({ fallback }) => fallback,
  });
  assert.equal(result.status, "transient-retry");
  assert.equal(result.retryable, true);
  assert.equal(result.needsEvidence, false);
  assert.equal(result.issueNumber, 12);
  assert.equal(result.issueBodySha, bodyHash(issue.body));
  assert.equal(result.reason, "HTTP 503");
});

test("prepareSubmission returns transient-retry when reviewer circuit is open", async () => {
  const result = await prepareSubmission({
    issue,
    repository,
    projects: [],
    taxonomy: [],
    api: async () => {},
    inspect: async () => ({
      ...inspected,
      status: "rejected",
      reason: "no implementation source evidence",
    }),
    reviewer: async () => ({
      verified: null,
      status: "circuit-open",
      retryable: true,
      reason: "circuit-open",
    }),
    enrich: async ({ fallback }) => fallback,
  });
  assert.equal(result.status, "transient-retry");
  assert.equal(result.retryable, true);
  assert.equal(result.needsEvidence, false);
  assert.equal(result.issueNumber, 12);
});

