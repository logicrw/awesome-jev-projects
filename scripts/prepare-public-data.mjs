import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { normalizeLicenseFacts, catalogKinds, jevRelations, reviewBases } from "../src/lib/catalog-contract.mjs";
export const publicFields = [
  "id",
  "name",
  "author",
  "url",
  "category",
  "catalogKind",
  "jevRelation",
  "reviewBasis",
  "plainSummary",
  "plainSummaryEn",
  "jevDecisionPoint",
  "jevDecisionPointEn",
  "highlightBenefit",
  "highlightBenefitEn",
  "tags",
  "topics",
  "description",
  "evidenceLines",
  "stars",
  "forks",
  "openIssues",
  "license",
  "language",
  "lastCommitAt",
  "createdAt",
  "metadataFetchedAt",
  "avatarUrl",
  "summarySource",
  "claimStatus",
  "claimStatusEn",
  "plainSummaryJa",
  "plainSummaryKo",
  "jevDecisionPointJa",
  "jevDecisionPointKo",
  "highlightBenefitJa",
  "highlightBenefitKo",
  "claimStatusJa",
  "claimStatusKo",
  "licenseStatus",
  "sourceReviewedAt",
  "catalogStatus",
  "reviewReason",
  "reviewReasonEn",
  "reviewReasonJa",
  "reviewReasonKo",
  "evidence",
  "pinned",
];
const searchMetadataFields = new Set(["topics", "description", "evidenceLines"]);
// Only deliberately public prose belongs here. Do not copy raw source, internal
// evidence objects, evidenceNote, or coerce numeric line references into text.
function publicProse(value, limit) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return undefined;
  if (/(?:~\/|\/(?:Users|home|private|tmp|var|Volumes)\/|[A-Z]:\\)|\b(?:github_pat_[A-Za-z\d_]{16,}|gh[pousr]_[A-Za-z\d]{16,}|sk-[A-Za-z\d_-]{20,}|AKIA[A-Z\d]{16})\b|-----BEGIN [\w ]*PRIVATE KEY-----|\bBearer\s+\S+|\b[A-Z_]*(?:API_KEY|TOKEN|SECRET|PASSWORD)\s*[:=]|[?&](?:api[_-]?key|token|access_token)=/iu.test(text)) return undefined;
  if (/```|~~~|<\/?[a-z][^>]*>|(?:^|\n)\s*(?:(?:import|export)\s|(?:const|let|var)\s+\w+\s*=|(?:def|function)\s+\w+\s*\(|from\s+\S+\s+import\s|(?:class|interface)\s+\w+[^\n]*[{:]|#include\s|#!)/iu.test(text)) return undefined;
  return text.replace(/\s+/gu, " ");
}
function publicSearchMetadata(row) {
  const metadata = {};
  const topics = [...new Set((Array.isArray(row.topics) ? row.topics : [])
    .map((topic) => publicProse(topic, 50)?.toLowerCase())
    .filter((topic) => topic && /^[a-z0-9][a-z0-9-]{0,49}$/u.test(topic)))].slice(0, 20);
  if (topics.length) metadata.topics = topics;
  const description = publicProse(row.description, 1000);
  if (description) metadata.description = description;
  // The public shape is string[]. Legacy numeric arrays and strings such as
  // "L15-L45" identify source locations, not searchable implementation prose.
  const lines = Array.isArray(row.evidenceLines) ? row.evidenceLines : [row.evidenceLines];
  const evidenceLines = [...new Set(lines.map((line) => publicProse(line, 400))
    .filter((line) => line && !/^(?:lines?\s*)?#?L?\d+(?:\s*[-–,:]\s*#?L?\d+)*$/iu.test(line.normalize('NFKC'))))].slice(0, 12);
  if (evidenceLines.length) metadata.evidenceLines = evidenceLines;
  return metadata;
}
export function publicProjects(rows) {
  return rows.map((row) => {
    const project = Object.fromEntries(
      publicFields
        .filter((key) => row[key] !== undefined && !searchMetadataFields.has(key))
        .map((key) => [key, row[key]]),
    );
    if (project.license && typeof project.license === "object") project.license = normalizeLicenseFacts(project.license);
    for (const [key, values] of Object.entries({ catalogKind: catalogKinds, jevRelation: jevRelations, reviewBasis: reviewBases })) {
      if (project[key] !== undefined && !values.includes(project[key])) delete project[key];
    }
    if (row.catalogStatus === "review-pending") {
      const pending = {
        "": ["此条目待复核，暂不作为已确认的 Jev 集成推荐。", "保留记录供追踪；请先查看复核原因与来源。"],
        En: ["This entry is pending review, not a verified Jev integration recommendation.", "The record is preserved for follow-up. Check the review reason and sources first."],
        Ja: ["この項目は確認待ちであり、検証済みの Jev 連携としては推奨していません。", "追跡用に記録を保持しています。先に確認待ちの理由と出典をご確認ください。"],
        Ko: ["이 항목은 검토 대기 중이며 검증된 Jev 연동으로 추천하지 않습니다.", "추후 확인을 위해 기록을 보존합니다. 먼저 검토 사유와 출처를 확인하세요."],
      };
      for (const [suffix, copy] of Object.entries(pending)) {
        const reason = row[`reviewReason${suffix}`] || copy[0];
        project[`plainSummary${suffix}`] = reason;
        project[`jevDecisionPoint${suffix}`] = copy[0];
        project[`highlightBenefit${suffix}`] = copy[1];
        project[`claimStatus${suffix}`] = reason;
      }
      project.summarySource = "review-pending";
      project.license = null;
      project.licenseStatus = "unconfirmed";
      project.evidence = (row.reviewSources ?? []).map(({ url }) => ({ url }));
    } else {
      Object.assign(project, publicSearchMetadata(row));
    }
    return project;
  });
}
export async function syncOgCard(count) {
  const svgPath = new URL("../public/og-card.svg", import.meta.url);
  try {
    const svg = await readFile(svgPath, "utf8");
    const updatedSvg = svg
      .replace(
        /(<text [^>]*font-size="30"[^>]*fill="#f0ca7d">)\d+\+(<\/text>)/,
        `$1${count}+$2`
      )
      .replace(
        /(JEV-SYS1-CORE · #)\d+/,
        `$1${count}`
      );
    if (svg !== updatedSvg) {
      await writeFile(svgPath, updatedSvg, "utf8");
      console.log(`Updated public/og-card.svg project count to ${count}+`);
    }
    // If sips is available on macOS, regenerate public/og-card.png
    try {
      const pngPath = new URL("../public/og-card.png", import.meta.url);
      const res = spawnSync("sips", ["-s", "format", "png", fileURLToPath(svgPath), "--out", fileURLToPath(pngPath)], { stdio: "pipe" });
      if (res.status === 0) {
        console.log(`Regenerated public/og-card.png to match ${count}+ projects.`);
      }
    } catch {
      // Ignore if sips is not available (e.g. Linux CI)
    }
  } catch {
    // Ignore if public/og-card.svg is not found
  }
}
export async function preparePublicData() {
  const rows = JSON.parse(
    await readFile(
      new URL("../src/data/projects.json", import.meta.url),
      "utf8",
    ),
  );
  if (!Array.isArray(rows) || rows.length < 14)
    throw new Error("Missing canonical project dataset");
  await mkdir(new URL("../public/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../public/projects.json", import.meta.url),
    JSON.stringify(publicProjects(rows)) + "\n",
  );
  await syncOgCard(rows.length);
  console.log(
    `Prepared ${rows.length} public project records; no radar logs or configuration included.`,
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await preparePublicData();
