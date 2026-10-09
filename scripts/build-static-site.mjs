import { localDay } from "../src/lib/discovery.mjs";
import { loadAnalytics, analyticsMarkup } from "./analytics-policy.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { activeSponsors } from "../src/lib/sponsors.mjs";
import { BASE, SITE, REPOSITORY, COPY, LOCALES, MACHINE_RESOURCES, machineDocuments, escapeHTML as e, safeJSON, localePrefix, projectRoute, categoryRoute, projectCopy, pageHead } from "./site-content.mjs";
import { safePublicUrl } from "../src/lib/safe-url.mjs";
import { licenseLabel, catalogLabels } from "../src/lib/catalog-contract.mjs";

const analytics = await loadAnalytics();
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const projects = JSON.parse(await readFile(resolve(dist, "projects.json"), "utf8"));
const partners = activeSponsors(JSON.parse(await readFile(resolve(root, "src/data/sponsors.json"), "utf8")).partners);
const categories = [...new Set(projects.map((p) => p.category))].sort();
const baseHTML = await readFile(resolve(dist, "index.html"), "utf8");
// Only immutable build asset references are reused; remote source text cannot add markup.
const assets = [...baseHTML.matchAll(/<(?:script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>|link\b[^>]*(?:rel="stylesheet"|rel="modulepreload")[^>]*>)/g)].map((m) => m[0]).filter(tag => !tag.includes("theme-init.js") && !tag.includes("locale-init.js"));
const homeAssets = assets.join("\n");
const styleAssets = assets.filter((tag) => tag.includes('rel="stylesheet"')).join("\n");
const vite = await createServer({ root, server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom", logLevel: "error" });
const initialDay = localDay();
const { renderHome, categoryLabel, localeMeta } = await vite.ssrLoadModule("/src/entry-server.tsx");
for (const locale of LOCALES) Object.assign(COPY[locale], { title: localeMeta[locale].title, description: localeMeta[locale].description });
const pages = [];
const latestReviewed = projects.map((p) => p.sourceReviewedAt).filter(Boolean).sort().at(-1)?.slice(0, 10);
const link = (href, text, external = false, cls = "") => `<a${cls ? ` class="${e(cls)}"` : ""} href="${e(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${e(text)}</a>`;

function themeButton(locale) {
  const labels = {zh:["切换到暗黑模式","切换到明亮模式"],en:["Switch to dark mode","Switch to light mode"],ja:["ダークモードに切り替え","ライトモードに切り替え"],ko:["다크 모드로 전환","라이트 모드로 전환"]}[locale];
  return `<button type="button" class="theme-toggle" data-theme-toggle data-theme-dark-label="${labels[0]}" data-theme-light-label="${labels[1]}" aria-label="${labels[0]}"><svg class="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.9 13.2A9 9 0 0 1 10.8 3.1a9 9 0 1 0 10.1 10.1Z"/></svg><svg class="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></button>`;
}
function header(locale, routeForLocale) {
  const c = COPY[locale];
  return `<header class="static-header"><a class="static-brand" href="${BASE + localePrefix(locale)}${locale === "zh" ? "?lang=zh" : ""}">awesome <b>jev</b><span>DIRECTORY</span></a><nav aria-label="${e(c.languages)}">${LOCALES.map((l) => `<a lang="${COPY[l].lang}"${l === locale ? ' aria-current="page"' : ""} href="${BASE + routeForLocale(l)}${l === "zh" ? "?lang=zh" : ""}">${COPY[l].name}</a>`).join("")}</nav>${link(BASE + localePrefix(locale) + "?sponsor=1", {zh:"赞助合作",en:"Sponsor",ja:"スポンサー",ko:"스폰서"}[locale])}${link(REPOSITORY, "Star on GitHub", true, "static-github")}${themeButton(locale)}</header>`;
}
function footer(locale) {
  const c = COPY[locale];
  return `<footer class="static-footer"><p>${e(c.aboutText)}</p><nav>${link(BASE + localePrefix(locale), c.explore)}${link(BASE + localePrefix(locale) + "catalog/", c.catalog)}${link(REPOSITORY + "/issues/new?template=project.yml", c.submit, true)}${link(REPOSITORY + "/blob/main/SPONSORING.md", {zh:"赞助合作",en:"Sponsor",ja:"スポンサー",ko:"스폰서"}[locale], true)}${link("https://x.com/0xLogicrw", c.contact, true)}</nav></footer>`;
}
function frame({ locale, title, description, route, alternates, schema, content, home = false, indexable = true }) {
  const c = COPY[locale];
  return `<!doctype html><html lang="${c.lang}"><head><meta charset="UTF-8" /><script src="${BASE}theme-init.js"></script><script src="${BASE}locale-init.js"></script><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#fafafa" /><meta name="referrer" content="strict-origin-when-cross-origin" />
${pageHead({locale, title, description, route, alternates, schema, indexable})}
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml" />
${home ? homeAssets : styleAssets}<link rel="stylesheet" href="${BASE}directory.css" />${analyticsMarkup(analytics)}</head><body>${content}</body></html>`;
}
async function emit(route, html, lastmod = latestReviewed, indexable = true) {
  const destination = resolve(dist, route, "index.html");
  if (!destination.startsWith(dist + "/")) throw new Error("Invalid output path");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
  pages.push({ route, lastmod, indexable });
}
function projectList(rows, locale) {
  return `<ul class="static-project-list">${rows.map((p) => `<li><h2>${link(BASE + projectRoute(p.id, locale), p.name)}</h2><p class="static-owner">${e(p.author)} · ${e(categoryLabel(p.category, locale))}${catalogLabels(p, locale).map(({ value }) => ` · ${e(value)}`).join("")}</p><p>${e(projectCopy(p, "plainSummary", locale))}</p></li>`).join("")}</ul>`;
}
function collectionSchema(locale, route, title, rows) {
  return { "@context": "https://schema.org", "@type": "CollectionPage", "@id": SITE + route, url: SITE + route, name: title, inLanguage: COPY[locale].lang,
    isPartOf: { "@type": "WebSite", name: "Awesome Jev", url: SITE },
    mainEntity: { "@type": "ItemList", numberOfItems: rows.length, itemListElement: rows.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: SITE + projectRoute(p.id, locale) })) } };
}

try {
  for (const locale of LOCALES) {
    const c = COPY[locale], route = localePrefix(locale);
    const about = `<section class="static-about" aria-label="${e(c.about)}"><h2>${e(c.about)}</h2><p>${e(c.aboutText)}</p><div class="static-about-grid"><div><h3>${e(c.model)}</h3><p>${e(c.modelText)}</p>${link("https://typesafe.ai/", "TypeSafe ↗", true)}</div><div><h3>${e(c.criteria)}</h3><p>${e(c.criteriaText)}</p></div></div><nav>${link(BASE + route + "catalog/", c.catalog)}${categories.map((category) => link(BASE + categoryRoute(category, locale), categoryLabel(category, locale))).join("")}</nav></section>`;
    const content = `<div id="root">${renderHome(projects, locale, initialDay)}</div>${about}<script id="initial-projects" type="application/json">${safeJSON({ locale, projects, day: initialDay })}</script>`;
    await emit(route, frame({ locale, route, title: c.title, description: c.description, alternates: localePrefix, schema: collectionSchema(locale, route, c.title, projects), content, home: true }));
    const catalog = route + "catalog/";
    await emit(catalog, frame({ locale, route: catalog, title: `${c.catalog} — Awesome Jev`, description: c.description, alternates: (l) => localePrefix(l) + "catalog/", schema: collectionSchema(locale, catalog, c.catalog, projects), content: header(locale, (l) => localePrefix(l) + "catalog/") + `<main class="static-main"><h1>${e(c.catalog)}</h1><p class="static-intro">${e(c.description)}</p><nav class="static-categories">${categories.map((category) => link(BASE + categoryRoute(category, locale), `${categoryLabel(category, locale)} (${projects.filter((p) => p.category === category).length})`)).join("")}</nav>${projectList(projects, locale)}</main>` + footer(locale) }));
    for (const category of categories) {
      const rows = projects.filter((p) => p.category === category);
      const categoryPath = categoryRoute(category, locale), label = categoryLabel(category, locale);
      await emit(categoryPath, frame({ locale, route: categoryPath, title: `${label} — Jev projects | Awesome Jev`, description: `${label} · ${rows.length} · ${c.description}`, alternates: (l) => categoryRoute(category, l), schema: collectionSchema(locale, categoryPath, label, rows), content: header(locale, (l) => categoryRoute(category, l)) + `<main class="static-main"><h1>${e(label)}</h1><p class="static-intro">${rows.length} · ${e(c.noIndependent)}</p>${projectList(rows, locale)}</main>` + footer(locale) }));
    }
    for (const p of projects) {
      const projectPath = projectRoute(p.id, locale), summary = projectCopy(p, "plainSummary", locale), related = projects.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
      const sourceLinks = (p.evidence ?? []).slice(0, 12).map((source) => {
        const href = safePublicUrl(source.url);
        if (href === "#") return "";
        let display = href;
        try {
          display = decodeURIComponent(new URL(href).pathname.replace(/^\//, ""));
        } catch {}
        return `<li>${link(href, display, true)}</li>`;
      }).join("");
      const breadcrumbs = `<nav class="static-breadcrumb" aria-label="Breadcrumb">${link(BASE + route, "Awesome Jev")}<span>/</span>${link(BASE + categoryRoute(p.category, locale), categoryLabel(p.category, locale))}</nav>`;
      const schema = { "@context": "https://schema.org", "@graph": [
        { "@type": "WebPage", "@id": SITE + projectPath, url: SITE + projectPath, name: `${p.name} — Awesome Jev`, description: summary, inLanguage: c.lang, isPartOf: { "@id": SITE }, mainEntity: { "@id": SITE + projectPath + "#project" } },
        { "@type": ["learning-resource", "research", "other"].includes(p.catalogKind) ? "CreativeWork" : "SoftwareSourceCode", "@id": SITE + projectPath + "#project", name: p.name, description: summary,
          ...(["learning-resource", "research", "other"].includes(p.catalogKind) ? { url: p.url } : { codeRepository: p.url }) },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Awesome Jev", item: SITE + route }, { "@type": "ListItem", position: 2, name: categoryLabel(p.category, locale), item: SITE + categoryRoute(p.category, locale) }, { "@type": "ListItem", position: 3, name: p.name, item: SITE + projectPath }] },
      ] };
      const repoHref = safePublicUrl(p.url);
      const content = header(locale, (l) => projectRoute(p.id, l)) + `<main class="static-main project-document">${breadcrumbs}<h1>${e(p.name)}</h1><p class="static-owner">${e(p.author)}</p><p class="static-lede">${e(summary)}</p><div class="static-actions">${link(repoHref, c.source + " ↗", true, "static-primary")}${link(BASE + route + "?project=" + encodeURIComponent(p.id), c.explore)}</div><dl class="static-facts">${catalogLabels(p, locale).map(({ label, value }) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join("")}<div><dt>${e(c.license)}</dt><dd>${e(licenseLabel(p.license, locale, p.licenseStatus))}</dd></div><div><dt>GitHub Stars</dt><dd>${e(p.stars ?? "—")}</dd></div><div><dt>${e(c.date)}</dt><dd>${e(p.sourceReviewedAt?.slice(0,10) || "—")}</dd></div></dl><section><h2>${e(c.decision)}</h2><p>${e(projectCopy(p,"jevDecisionPoint",locale))}</p></section><section><h2>${e(c.benefit)}</h2><p>${e(projectCopy(p,"highlightBenefit",locale))}</p></section><section class="static-review"><h2>${e(c.limits)}</h2><p>${e(projectCopy(p,"claimStatus",locale))}</p></section><section><h2>${e(c.evidence)}</h2><ul class="static-evidence">${sourceLinks || `<li>${link(repoHref, c.source, true)}</li>`}</ul></section>${related.length ? `<section><h2>${e(c.related)}</h2>${projectList(related,locale)}</section>` : ""}</main>` + footer(locale);
      await emit(projectPath, frame({ locale, route: projectPath, title: `${p.name} — Jev · ${categoryLabel(p.category,locale)} | Awesome Jev`, description: summary.slice(0, 300), alternates: (l) => projectRoute(p.id, l), schema, content, indexable: p.catalogStatus !== "review-pending" }), p.sourceReviewedAt?.slice(0,10), p.catalogStatus !== "review-pending");
    }
  }
} finally {
  await vite.close();
}

const xml = (value) => e(value);
const sitemapEntries = [...pages.filter(page => page.indexable), ...MACHINE_RESOURCES.map((route)=>({route}))];
await writeFile(resolve(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries.map(({route,lastmod}) => `<url><loc>${xml(SITE+route)}</loc>${lastmod ? `<lastmod>${xml(lastmod)}</lastmod>` : ""}</url>`).join("\n")}</urlset>\n`);
const docs = machineDocuments(projects, partners);
await writeFile(resolve(dist, "llms.txt"), docs.llms);
await writeFile(resolve(dist, "llms-full.txt"), docs.full);
await writeFile(resolve(dist, "site-manifest.json"), JSON.stringify({ locales: LOCALES, projects: projects.length, pages: pages.length, indexablePages: pages.filter(page => page.indexable).length, resources: MACHINE_RESOURCES.length, resourcePaths: MACHINE_RESOURCES, sourceReviewedAt: latestReviewed ?? null }) + "\n");
console.log(`Static site: ${pages.length} static pages, ${MACHINE_RESOURCES.length} machine resources, ${projects.length} projects, ${LOCALES.length} languages. Sitemap and machine documents match the same dataset.`);
