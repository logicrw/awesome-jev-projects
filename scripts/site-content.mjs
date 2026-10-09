import { licenseLabel, catalogLabels } from "../src/lib/catalog-contract.mjs";
export const SITE = "https://logicrw.github.io/awesome-jev-projects/";
export const BASE = "/awesome-jev-projects/";
export const REPOSITORY = "https://github.com/logicrw/awesome-jev-projects";
export const LOCALES = ["en", "zh", "ja", "ko"];
export const COPY = {
  zh: {
    lang: "zh-CN", og: "zh_CN", suffix: "", name: "中文",
    title: "Awesome Jev — System-1 Agent 架构雷达",
    description: "查找 TypeSafe Jev 的开源项目、SDK、Agent 工具和集成示例。按场景浏览用途、Jev 决策点与固定版本源码，支持中文、English、日本語和한국어。",
    catalog: "完整项目目录", explore: "搜索与筛选", categories: "分类", source: "GitHub 仓库",
    decision: "Jev 在此条目的作用", benefit: "这个项目的用途", evidence: "源码与说明", limits: "核查范围",
    review: "目录核查", related: "同类项目", back: "返回目录", about: "关于 Awesome Jev",
    aboutText: "由社区维护的 Jev 项目与资源目录，收录集成、基准测试、开发工具、研究与学习材料，并逐条展示关系、审查依据和许可事实。",
    model: "Jev 是什么？", modelText: "Jev 是 TypeSafe 的决策模型。这里按实际接入方式整理选择、评分和概率判断等用途，并链接项目实现，方便你判断是否适合自己的任务。",
    criteria: "怎样收录？", criteriaText: "依据公开仓库材料判断与 Jev 的关系及条目类型。源码、SQL、示例和说明材料均可作为审查材料；材料类型与许可分别标注，Star 数只反映关注热度。",
    submit: "提交项目", contact: "联系维护者", languages: "语言", date: "源码核查日期", license: "许可证", unknown: "未声明",
    fallback: "中文或英文原文", noIndependent: "请按条目标注的材料依据理解结论；收录不代表独立运行验证。",
  },
  en: {
    lang: "en", og: "en_US", suffix: "En", name: "English",
    title: "Awesome Jev — System-1 Agent Architecture Radar",
    description: "Find open-source TypeSafe Jev projects, SDKs, Agent tools and integration examples. Browse use cases, decision points and fixed-version source evidence in four languages.",
    catalog: "Complete project directory", explore: "Search and filter", categories: "Categories", source: "GitHub repository",
    decision: "Jev’s role in this entry", benefit: "What this project offers", evidence: "Sources and implementation", limits: "Review scope",
    review: "Catalog review", related: "Related projects", back: "Back to directory", about: "About Awesome Jev",
    aboutText: "A community catalog of Jev integrations, benchmarks, developer tools, research, and learning resources, with per-entry relationships, review basis, and license facts.",
    model: "What is Jev?", modelText: "Jev is TypeSafe's decision model. This directory groups projects by how they use choices, scores and probability judgements, with implementation links to help you assess fit for your own task.",
    criteria: "What gets listed?", criteriaText: "Public repository material supports classification of the entry and its Jev relationship. Source, SQL, examples, and descriptive documents may all inform review; their basis and license facts are recorded separately. Stars indicate attention only.",
    submit: "Submit a project", contact: "Contact maintainer", languages: "Languages", date: "Source reviewed", license: "License", unknown: "Not declared",
    fallback: "Original Chinese or English text", noIndependent: "Read each entry’s review basis; inclusion does not establish independent execution.",
  },
  ja: {
    lang: "ja", og: "ja_JP", suffix: "Ja", name: "日本語",
    title: "Awesome Jev — System-1 Agent アーキテクチャ",
    description: "TypeSafe Jev のオープンソースプロジェクト、SDK、Agent ツール、連携事例を検索。用途、判断を行う箇所、固定バージョンのソースを4言語で確認できます。",
    catalog: "全プロジェクト一覧", explore: "検索・絞り込み", categories: "カテゴリ", source: "GitHub リポジトリ",
    decision: "この項目での Jev の役割", benefit: "このプロジェクトの用途", evidence: "ソースと実装", limits: "確認の範囲",
    review: "掲載内容の確認", related: "同じカテゴリのプロジェクト", back: "一覧に戻る", about: "Awesome Jev について",
    aboutText: "Jev の連携、ベンチマーク、開発ツール、研究、学習資料を集めたコミュニティのカタログです。関係、確認の根拠、ライセンス情報を項目ごとに表示します。",
    model: "Jev とは？", modelText: "Jev は TypeSafe の判断モデルです。選択、スコア、確率判断を実際にどう使っているかでプロジェクトを分類し、用途に合うか確認できる実装リンクを掲載しています。",
    criteria: "掲載基準は？", criteriaText: "公開リポジトリのソース、SQL、例、説明資料から、項目の種類と Jev との関係を判断します。資料の種類とライセンス情報は別に表示し、Star 数は注目度のみを示します。",
    submit: "プロジェクトを投稿", contact: "管理者に連絡", languages: "言語", date: "ソース確認日", license: "ライセンス", unknown: "記載なし",
    fallback: "中国語または英語の原文", noIndependent: "各項目の確認根拠をご覧ください。掲載は独立した実行検証を意味しません。",
  },
  ko: {
    lang: "ko", og: "ko_KR", suffix: "Ko", name: "한국어",
    title: "Awesome Jev — System-1 Agent 아키텍처 레이더",
    description: "TypeSafe Jev 오픈 소스 프로젝트, SDK, Agent 도구와 연동 사례를 찾아보세요. 용도, 판단 지점, 고정 버전 소스 근거를 네 가지 언어로 제공합니다.",
    catalog: "전체 프로젝트 목록", explore: "검색 및 필터", categories: "분류", source: "GitHub 저장소",
    decision: "이 항목에서 Jev의 역할", benefit: "프로젝트의 용도", evidence: "소스 및 구현", limits: "검토 범위",
    review: "목록 검토", related: "같은 분류의 프로젝트", back: "목록으로 돌아가기", about: "Awesome Jev 소개",
    aboutText: "Jev 연동, 벤치마크, 개발 도구, 연구 및 학습 자료를 모은 커뮤니티 목록입니다. 항목별 관계, 검토 근거 및 라이선스 정보를 표시합니다.",
    model: "Jev란?", modelText: "Jev는 TypeSafe의 판단 모델입니다. 선택, 점수 및 확률 판단의 실제 활용 방식에 따라 프로젝트를 분류하고, 작업에 적합한지 확인할 수 있도록 구현 링크를 제공합니다.",
    criteria: "수록 기준은?", criteriaText: "공개 저장소의 소스, SQL, 예시, 설명 자료로 항목 유형과 Jev 관계를 판단합니다. 자료의 종류와 라이선스는 별도로 표시하며 Star 수는 관심도만 나타냅니다.",
    submit: "프로젝트 제출", contact: "관리자에게 연락", languages: "언어", date: "소스 확인일", license: "라이선스", unknown: "명시되지 않음",
    fallback: "중국어 또는 영어 원문", noIndependent: "각 항목의 검토 근거를 확인하세요. 수록은 독립적인 실행 검증을 뜻하지 않습니다.",
  },
};

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
export function safeJSON(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
export const localePrefix = (locale) => locale === "zh" ? "" : `${locale}/`;
export function projectRoute(id, locale = "zh") {
  const parts = id.split(":");
  if (parts.length < 1 || parts.length > 2 || parts.some((p) => !/^[a-z\d][a-z\d._-]*$/i.test(p) || p === "." || p === "..")) throw new Error("Invalid public project identity");
  return `${localePrefix(locale)}projects/${parts.map(encodeURIComponent).join("/")}/`;
}
export const categorySlug = (category) => category.toLowerCase().replace(/[^a-z\d]+/g, "-").replace(/^-|-$/g, "");
export const categoryRoute = (category, locale = "zh") => `${localePrefix(locale)}categories/${categorySlug(category)}/`;
export function projectCopy(project, field, locale) {
  const value = project[`${field}${COPY[locale].suffix}`];
  if (typeof value === "string" && value.trim()) return value;
  if (field === "claimStatus") return COPY[locale].noIndependent;
  return project[`${field}En`] || project[field] || "";
}
export function pageHead({ locale, title, description, route, alternates, schema, indexable = true }) {
  const c = COPY[locale], canonical = SITE + route;
  const graph = schema["@graph"] ?? [Object.fromEntries(Object.entries(schema).filter(([key]) => key !== "@context"))];
  const structuredData = { "@context": "https://schema.org", "@graph": [...graph, {
    "@type": "DataFeed", "@id": SITE + "#agent-skill", name: "Awesome Jev Agent Skill",
    url: SITE + "skill.md", encodingFormat: "text/markdown",
    description: "Instructions and structured data for finding Jev projects, with source evidence and review limits.",
  }] };
  return `<meta name="theme-color" content="#fafaf8" />
<meta name="description" content="${escapeHTML(description)}" />
<title>${escapeHTML(title)}</title>
<link rel="canonical" href="${escapeHTML(canonical)}" />
<link rel="alternate" type="text/markdown" title="Agent Skill" href="${SITE}skill.md" />
<link rel="agent-skill" href="${SITE}skill.md" />
<link rel="alternate" type="text/markdown" title="LLM Directory" href="${SITE}llms.txt" />
${LOCALES.map((l) => `<link rel="alternate" hreflang="${COPY[l].lang}" href="${SITE + alternates(l)}" />`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${SITE + alternates("en")}" />
<meta name="robots" content="${indexable ? "index,follow,max-image-preview:large" : "noindex,follow"}" />
<meta property="og:type" content="website" /><meta property="og:site_name" content="Awesome Jev" />
<meta property="og:locale" content="${c.og}" /><meta property="og:title" content="${escapeHTML(title)}" />
<meta property="og:description" content="${escapeHTML(description)}" /><meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${SITE}og-card.png?v=radar-20260920" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:creator" content="@0xLogicrw" />
<meta name="twitter:title" content="${escapeHTML(title)}" /><meta name="twitter:description" content="${escapeHTML(description)}" />
<meta name="twitter:image" content="${SITE}og-card.png?v=radar-20260920" />
<script type="application/ld+json">${safeJSON(structuredData)}</script>`;
}

export const MACHINE_RESOURCES = ["projects.json", "llms.txt", "llms-full.txt", "skill.md", ".well-known/skills/index.json", ".well-known/agent-skills/index.json", ".well-known/skills/default/skill.md", ".well-known/skills/awesome-jev/SKILL.md", ".well-known/agent-skills/awesome-jev/SKILL.md"];
export const SKILL_COPIES = ["SKILL.md", "skills/awesome-jev/SKILL.md", "public/skill.md", "public/.well-known/skills/default/skill.md", "public/.well-known/skills/awesome-jev/SKILL.md", "public/.well-known/agent-skills/awesome-jev/SKILL.md"];
export const INSTALL_COMMANDS = ["npx skills add logicrw/awesome-jev-projects", "npx skills add https://logicrw.github.io/awesome-jev-projects/"];
export const markdownText = (value) => String(value ?? "").replace(/[\\`*_[\]<>]/g, (char) => `\\${char}`).replace(/\s+/g, " ");
const markdownUrl = (value) => String(value).replace(/[()]/g, (char) => char === "(" ? "%28" : "%29");

// Only pass partners admitted by activeSponsors. Paid placements never alter catalog rows.
export function paidPlacementMarkdown(partners, locale = "en") {
  const title = { zh: "赞助合作 · 付费展示", en: "Sponsorship · Paid placements", ja: "スポンサー · 有料掲載", ko: "스폰서십 · 유료 게재" }[locale];
  const empty = { zh: "首发合作伙伴招募中，目前没有付费赞助商。", en: "Founding partner slots are open. There are no paid sponsors yet.", ja: "最初のパートナーを募集中です。現在、有料スポンサーはいません。", ko: "첫 파트너를 모집합니다. 현재 유료 스폰서는 없습니다." }[locale];
  const note = { zh: "赞助不影响收录审核、项目描述或自然排序。", en: "Sponsorship does not change inclusion review, project descriptions, or organic ranking.", ja: "スポンサー契約は掲載審査、説明、通常の表示順を変えません。", ko: "스폰서십은 수록 심사, 설명 또는 일반 정렬 순서를 바꾸지 않습니다." }[locale];
  const link = { zh: "查看合作方案与联系方式", en: "Plans and contact", ja: "プランとお問い合わせ", ko: "플랜 및 문의" }[locale];
  const body = partners.length ? partners.map((p) => `${p.logo ? `[![${markdownText(p.name)}](${SITE + p.logo})](${markdownUrl(p.url)})\n\n` : ""}- **Sponsored**: [${markdownText(p.name)}](${markdownUrl(p.url)}) — ${markdownText(p.description[locale] || p.description.en)} (${markdownText(p.tier)}; ${p.startsAt.slice(0,10)}–${p.endsAt.slice(0,10)})`).join("\n\n") : empty;
  return `## ${title}\n\n${body}\n\n[${link}](${REPOSITORY}/blob/main/SPONSORING.md) · [Sponsors](${REPOSITORY}/blob/main/SPONSORS.md)\n\n${note}\n`;
}

export function machineDocuments(projects, partners) {
  const listed = projects.filter((project) => project.catalogStatus !== "review-pending");
  const intro = `# Awesome Jev\n\nA community catalog for TypeSafe Jev and System-1 Agent architectures, including implementations, benchmarks, tools, research, and learning resources. Review basis and license facts are recorded per entry; inclusion does not establish independent runtime verification.\n\nWebsite: ${SITE}\nRepository: ${REPOSITORY}\nCatalog entries: ${listed.length}\n\n## Install the Agent Skill\n\n\`\`\`bash\n${INSTALL_COMMANDS.join("\n")}\n\`\`\`\n\n## Machine-readable resources\n${MACHINE_RESOURCES.map((path) => `- [${path}](${SITE + path})`).join("\n")}\n`;
  const languages = `\n## Language directories\n${LOCALES.map((l)=>`- [${{zh:"Chinese",en:"English",ja:"Japanese",ko:"Korean"}[l]}](${SITE+localePrefix(l)}catalog/)`).join("\n")}\n`;
  const categories = `\n## Categories\n${[...new Set(listed.map((p)=>p.category))].sort().map((category)=>`- [${markdownText(category)}](${SITE+categoryRoute(category,"en")}): ${listed.filter((p)=>p.category===category).length}`).join("\n")}\n`;
  const disclosure = "\n" + paidPlacementMarkdown(partners);
  const full = listed.map((p)=>`## ${markdownText(p.name)}\n\n${markdownText(projectCopy(p,"plainSummary","en"))}\n\n- Repository: ${p.url}\n- Category: ${markdownText(p.category)}\n- Jev decision: ${markdownText(projectCopy(p,"jevDecisionPoint","en"))}\n- Purpose: ${markdownText(projectCopy(p,"highlightBenefit","en"))}\n- Review scope: ${markdownText(projectCopy(p,"claimStatus","en"))}\n- License: ${markdownText(licenseLabel(p.license, "en", p.licenseStatus))}${catalogLabels(p, "en").map(({label,value})=>`\n- ${markdownText(label)}: ${markdownText(value)}`).join("")}\n- Details: ${SITE+projectRoute(p.id,"en")}\n${(p.evidence??[]).slice(0,12).map((item)=>`- Source evidence: ${item.url}`).join("\n")}\n`).join("\n");
  return { llms: intro + languages + categories + disclosure, full: intro + languages + disclosure + "\n## Complete project catalog\n\n" + full };
}
