/** Pure candidate routing; source relevance and submission intent belong to the model. */
import { normalizeRepository } from "../src/lib/submission.mjs";

/** Preserve whole URL boundaries so nested/lookalike hosts cannot masquerade as GitHub. */
export function githubRepositoryReferences(text) {
  if (typeof text !== "string") return [];
  const candidates = text.slice(0, 100_000).match(
    /git@github\.com:[^\s<>"'`()\]，。；！？、]+|[a-z][a-z\d+.-]*:[^\s<>"'`()\]，。；！？、]+|(?<![\w@./:+-])(?:www\.)?github\.com\/[^\s<>"'`()\]，。；！？、]+/gi,
  ) ?? [];
  const identities = new Map();
  for (const candidate of candidates) {
    const url = normalizeRepository(candidate.replace(/[.,;!，。；！？]+$/u, ""));
    if (url) identities.set(url.toLowerCase(), url.slice("https://github.com/".length));
  }
  return [...identities.values()];
}

export function isSubmission(issue) {
  if (!issue || typeof issue !== "object") return false;
  const labeled = (Array.isArray(issue.labels) ? issue.labels : []).some(
    (label) => (typeof label === "string" ? label : label?.name) === "project-submission",
  );
  const titled = /^\s*\[(?:project|submission|submit|new\s*project)\]/i.test(issue.title ?? "");
  const headed =
    /^#{1,6}\s+(?:GitHub repository|Project repository|项目仓库|仓库地址|repository|开源仓库|代码仓库|项目地址|Repo)(?:\s*[\(（][\s\S]*?[\)）])?\s*$/im.test(issue.body ?? "") ||
    /^\s*(?:repository|github repository|project repository|项目仓库|仓库地址|开源仓库|代码仓库|repo)[\s:：]+\s*https?:\/\/github\.com\//im.test(issue.body ?? "");
  return labeled || titled || headed || githubRepositoryReferences(`${issue.title ?? ""}\n${issue.body ?? ""}`).length > 0;
}
