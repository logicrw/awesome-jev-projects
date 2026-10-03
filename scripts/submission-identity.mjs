/** Pure submission-envelope recognition; no source scanners, network or model dependencies. */
export function isSubmission(issue) {
  const labeled = (issue.labels ?? []).some(
    (label) => (typeof label === "string" ? label : label?.name) === "project-submission",
  );
  const titled = /^\s*\[(?:project|submission|submit|new\s*project)\]/i.test(issue.title ?? "");
  const headed =
    /^#{1,6}\s+(?:GitHub repository|Project repository|项目仓库|仓库地址|repository|开源仓库|代码仓库|项目地址|Repo)(?:\s*[\(（][\s\S]*?[\)）])?\s*$/im.test(
      issue.body ?? "",
    ) ||
    /^\s*(?:repository|github repository|project repository|项目仓库|仓库地址|开源仓库|代码仓库|repo)[\s:：]+\s*https?:\/\/github\.com\//im.test(
      issue.body ?? "",
    );
  return labeled || titled || headed;
}
