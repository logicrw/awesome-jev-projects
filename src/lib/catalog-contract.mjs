/** Public facts and presentation only; license identification is not a grant of permission. */
const LICENSE_STATUSES = new Set(["identified", "custom", "undeclared"]);
const spdxId = (value) => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9.+-]{0,99}$/.test(value)
  && !/^(?:NOASSERTION|NONE|other|unknown|unspecified|proprietary|custom)$/i.test(value);
const boundedText = (value) => typeof value === "string" && value.trim().length <= 160
  && !/[\u0000-\u001f\u007f<>]/u.test(value) ? value.trim() : "";
function sourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["github.com", "api.github.com", "spdx.org", "opensource.org"].includes(url.hostname)
      && !url.username && !url.password && !url.port && !url.search && !url.hash && value.length <= 2048 ? url.href : undefined;
  } catch { return undefined; }
}

/** Read old string/null records without rewriting their canonical content. */
export function normalizeLicenseFacts(value, legacyStatus) {
  const legacy = typeof legacyStatus === "string" ? legacyStatus.trim().toLowerCase() : "";
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const status = legacy === "unconfirmed" ? "undeclared" : ["custom", "restricted"].includes(legacy) ? "custom" :
      LICENSE_STATUSES.has(value.status) ? value.status : "undeclared";
    const identified = status === "identified" && spdxId(value.spdx);
    const result = { status: identified ? "identified" : status === "custom" ? "custom" : "undeclared", spdx: identified ? value.spdx : null };
    const name = boundedText(value.name), url = sourceUrl(value.url);
    if (name) result.name = name;
    if (url) result.url = url;
    return result;
  }
  const name = boundedText(value);
  if (legacy === "unconfirmed" || !name || /^(?:NONE|unknown|unspecified)$/i.test(name)) {
    return { status: ["custom", "restricted"].includes(legacy) ? "custom" : "undeclared", spdx: null };
  }
  if (["custom", "restricted"].includes(legacy) || !spdxId(name)) return { status: "custom", spdx: null, name };
  return { status: "identified", spdx: name };
}

/** Only provider metadata enters this helper; repository prose cannot declare an SPDX grant. */
export function licenseFactsFromRepo(repo) {
  const license = repo?.license;
  if (!license || typeof license !== "object" || Array.isArray(license)) return { status: "undeclared", spdx: null };
  return normalizeLicenseFacts({ status: spdxId(license.spdx_id) ? "identified" : "custom",
    spdx: spdxId(license.spdx_id) ? license.spdx_id : null, name: license.name, url: license.url });
}

export function isLicenseValue(value) {
  if (value === null || typeof value === "string") return true;
  if (!value || typeof value !== "object" || Array.isArray(value) || !LICENSE_STATUSES.has(value.status)) return false;
  if (value.status === "identified" ? !spdxId(value.spdx) : value.spdx !== null) return false;
  return (value.name === undefined || (typeof value.name === "string" && boundedText(value.name) === value.name))
    && (value.url === undefined || sourceUrl(value.url) === value.url);
}

export function licenseSpdx(value, legacyStatus) {
  return normalizeLicenseFacts(value, legacyStatus).spdx;
}
const licenseCopy = {
  zh: { custom: "自定义许可", undeclared: "未声明许可" },
  en: { custom: "Custom license", undeclared: "License not declared" },
  ja: { custom: "独自ライセンス", undeclared: "ライセンス未記載" },
  ko: { custom: "사용자 정의 라이선스", undeclared: "라이선스 미명시" },
};
export function licenseLabel(value, locale = "zh", legacyStatus) {
  const facts = normalizeLicenseFacts(value, legacyStatus);
  return facts.spdx ?? (licenseCopy[locale] ?? licenseCopy.en)[facts.status];
}

export const catalogKinds = Object.freeze(["learning-resource", "benchmark", "integration", "developer-tool", "research", "other"]);
export const jevRelations = Object.freeze(["implemented", "described", "discussed", "unrelated", "uncertain"]);
export const reviewBases = Object.freeze(["implementation-material", "descriptive-material", "mixed"]);
const classificationFields = { catalogKind: catalogKinds, jevRelation: jevRelations, reviewBasis: reviewBases };
export function isCatalogClassification(project) {
  return Object.entries(classificationFields).every(([field, values]) => project[field] === undefined || values.includes(project[field]));
}
const catalogCopy = {
  zh: {
    fields: ["条目类型", "Jev 关系", "审查依据"],
    kind: ["学习资源", "基准测试", "集成项目", "开发工具", "研究", "其他"],
    relation: ["含 Jev 实现", "描述 Jev 接入", "讨论 Jev", "与 Jev 无关", "Jev 关系未明确"],
    basis: ["实现材料", "说明材料", "实现与说明材料"],
  },
  en: {
    fields: ["Entry type", "Jev relationship", "Review basis"],
    kind: ["Learning resource", "Benchmark", "Integration", "Developer tool", "Research", "Other"],
    relation: ["Jev implementation", "Jev integration described", "Jev discussion", "Unrelated to Jev", "Jev relationship uncertain"],
    basis: ["Implementation material", "Descriptive material", "Implementation and descriptive material"],
  },
  ja: {
    fields: ["項目の種類", "Jev との関係", "確認の根拠"],
    kind: ["学習資料", "ベンチマーク", "連携プロジェクト", "開発ツール", "研究", "その他"],
    relation: ["Jev の実装あり", "Jev 連携の説明", "Jev に関する議論", "Jev と無関係", "Jev との関係は不明"],
    basis: ["実装資料", "説明資料", "実装資料と説明資料"],
  },
  ko: {
    fields: ["항목 유형", "Jev 관계", "검토 근거"],
    kind: ["학습 자료", "벤치마크", "연동 프로젝트", "개발 도구", "연구", "기타"],
    relation: ["Jev 구현 포함", "Jev 연동 설명", "Jev 관련 논의", "Jev와 무관", "Jev 관계 불명확"],
    basis: ["구현 자료", "설명 자료", "구현 및 설명 자료"],
  },
};
/** Missing legacy fields stay missing; source-reviewed prose is never relabeled by inference. */
export function catalogLabels(project, locale = "zh") {
  const copy = catalogCopy[locale] ?? catalogCopy.en;
  return Object.entries(classificationFields).flatMap(([field, values], index) => {
    const position = values.indexOf(project[field]);
    return position < 0 ? [] : [{ field, label: copy.fields[index], value: copy[["kind", "relation", "basis"][index]][position] }];
  });
}
