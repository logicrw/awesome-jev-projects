import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Code2,
  Copy,
  ExternalLink,
  Filter,
  Gamepad2,
  GitFork,
  Github,
  Globe,
  Handshake,
  Layers,
  Network,
  Plus,
  Radar,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Terminal,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { validateSubmission, createIssueUrl } from "./lib/submission.mjs";
import { safePublicUrl } from "./lib/safe-url.mjs";
import { getAvatarSources, isAvatarCached, markAvatarCached, prefetchAvatars } from "./lib/avatar.mjs";
import type { SubmissionErrors, SubmissionValues } from "./lib/submission.mjs";
import { translate, categoryLabel, readLocale, locales, localeMeta, localizedProjectText, projectPath, popularSearches } from "./lib/i18n";
import type { Locale } from "./lib/i18n";
import { FeaturedPartners } from "./components/FeaturedPartners";
import { SponsorDialog } from "./components/SponsorDialog";
import { HelloJev } from "./components/HelloJev.tsx";
import { CopyCloneButton } from "./components/CopyCloneButton.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";
import { DailyProject } from "./components/DailyProject.tsx";
import { GachaDialog } from "./components/GachaDialog.tsx";
import { CardDispenser } from "./components/CardDispenser.tsx";
import { Jevy } from "./components/Jevy.tsx";
import { MaintainerCard } from "./components/MaintainerCard.tsx";
import { MobileWebviewBar } from "./components/MobileWebviewBar.tsx";
import "./styles/hero-engineering.css";
import "./styles/maintainer.css";
import { eligibleProjects } from "./lib/discovery.mjs";
import { sponsorCopy } from "./lib/sponsors.mjs";
import { resolveTagId, tagLabel, tagDescription, tagOptions } from "./lib/tags.mjs";
import { createProjectSearch, searchProjects, browseSort, matchesQuickFilter } from "./lib/search.mjs";
import {
  useCatalogSWR,
  CATALOG_REVALIDATE_MS,
  parseProjectSnapshot,
  catalogAddedCount,
  catalogFingerprint,
  shouldRevalidateCatalog,
  validProject,
} from "./hooks/useCatalogSWR";
import {
  useExplorerState,
  EXPLORER_URL_DEBOUNCE_MS,
  readExplorerState,
  writeExplorerSearchParams,
  localeNavigationUrl,
  tagSelectionState,
  projectHasTag,
  KNOWN_CATEGORIES,
  type ExplorerState,
  type QuickFilterMode,
  type SortMode,
} from "./hooks/useExplorerState";

export {
  createProjectSearch,
  searchProjects,
  CATALOG_REVALIDATE_MS,
  parseProjectSnapshot,
  catalogAddedCount,
  catalogFingerprint,
  shouldRevalidateCatalog,
  validProject,
  EXPLORER_URL_DEBOUNCE_MS,
  readExplorerState,
  writeExplorerSearchParams,
  localeNavigationUrl,
  tagSelectionState,
  projectHasTag,
  KNOWN_CATEGORIES,
  type ExplorerState,
};

export type Project = {
  language?: string | null;
  id: string;
  name: string;
  author: string;
  url: string;
  category: string;
  plainSummary: string;
  jevDecisionPoint: string;
  highlightBenefit: string;
  tags: string[];
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  license: string | null;
  licenseStatus?: "unconfirmed" | "declared" | "confirmed" | "custom";
  lastCommitAt: string | null;
  createdAt: string | null;
  summarySource: string;
  claimStatus: string;
  avatarUrl?: string;
  metadataFetchedAt?: string;
  evidence?: { url: string; note?: string }[];
  pinned?: boolean;
  catalogStatus?: "review-pending" | "active";
  sourceStatus?: string;
  reviewReason?: string;
  reviewReasonEn?: string;
  reviewReasonJa?: string;
  reviewReasonKo?: string;
  plainSummaryEn?: string;
  jevDecisionPointEn?: string;
  highlightBenefitEn?: string;
  claimStatusEn?: string;
  plainSummaryJa?: string;
  jevDecisionPointJa?: string;
  highlightBenefitJa?: string;
  claimStatusJa?: string;
  plainSummaryKo?: string;
  jevDecisionPointKo?: string;
  highlightBenefitKo?: string;
  claimStatusKo?: string;
};
const categoryInfo: Record<string, { icon: LucideIcon }> = {
  "SDK & Integrations": { icon: Braces },
  "Evaluation & Observability": { icon: SlidersHorizontal,
  },
  "Voice & Conversation": { icon: Terminal },
  "Data & Search": { icon: Search },
  "Classification & Taxonomy": { icon: Layers },
  "SDK & Decision Frameworks": { icon: Braces },
  "Creative Tools": { icon: Sparkles },
  "Benchmarks & Evaluation": { icon: SlidersHorizontal },
  "Decision Tools": { icon: Workflow },
  "Browser & OS Action": { icon: Globe },
  "MCP & Integrations": { icon: Braces },
  "CLI & Pipelines": { icon: Terminal },
  "Routing & Cost Optimization": { icon: Workflow },
  "Context GC & Filter": { icon: Layers },
  "Codebase & Graph Pathfinding": { icon: Network },
  "High-Frequency & Simulation": { icon: Gamepad2 },
  "Domain & Vertical Tools": { icon: ShieldCheck },
  "Security & Guardrails": { icon: ShieldCheck },
};
const format = (n: number | null) =>
  n === null ? "—" : new Intl.NumberFormat("en-US").format(n);
const date = (s: string | null | undefined, locale: Locale) =>
  s && Number.isFinite(Date.parse(s))
    ? new Date(s).toLocaleString(localeMeta[locale].language, {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";
const safeUrl = (u: string | null | undefined): string => safePublicUrl(u);
function ProjectAvatar({ project }: { project: Project }) {
  const sources = useMemo(
    () => getAvatarSources(project.author, project.avatarUrl, import.meta.env.BASE_URL),
    [project.author, project.avatarUrl]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setSourceIndex(0);
    setReady(false);
    setFailed(false);
  }, [project.author, project.avatarUrl]);

  const currentSrc = sources[sourceIndex] ?? null;
  const isCached = Boolean(currentSrc && isAvatarCached(currentSrc));
  const isReady = ready || isCached;

  useEffect(() => {
    if (currentSrc && imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      markAvatarCached(currentSrc);
      setReady(true);
    }
  }, [currentSrc]);

  const handleError = () => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setFailed(true);
    }
  };

  return (
    <span className="avatar-frame" aria-hidden="true">
      <span className="avatar-fallback" hidden={isReady}>
        {project.author.slice(0, 2).toUpperCase()}
      </span>
      {currentSrc && !failed && (
        <img
          ref={imageRef}
          key={currentSrc}
          src={currentSrc}
          alt=""
          className="avatar"
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          data-ready={isReady}
          onLoad={() => {
            markAvatarCached(currentSrc);
            setReady(true);
          }}
          onError={handleError}
        />
      )}
    </span>
  );
}
const getSaved = () => {
  if (typeof window === "undefined") return [];
  try {
    const x = JSON.parse(localStorage.getItem("awesome-jev:saved") ?? "[]");
    return Array.isArray(x) ? x.filter((y) => typeof y === "string") : [];
  } catch {
    return [];
  }
};
function Modal({
  title,
  onClose,
  children,
  locale,
  descriptionId,
}: {
  locale: Locale;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  descriptionId?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const startedOutside = useRef(false);
  useEffect(() => {
    const el = ref.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (el.open) el.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        startedOutside.current =
          e.clientX < bounds.left ||
          e.clientX > bounds.right ||
          e.clientY < bounds.top ||
          e.clientY > bounds.bottom;
      }}
      onClick={(e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const outside =
          e.clientX < bounds.left ||
          e.clientX > bounds.right ||
          e.clientY < bounds.top ||
          e.clientY > bounds.bottom;
        if (e.target === e.currentTarget && startedOutside.current && outside)
          onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          ref={closeButtonRef}
          type="button"
          className="icon-button"
          aria-label={translate("关闭弹窗", locale)}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

const quickFilterCopy: Record<ExplorerState["quickFilter"], { label: string; description: string; icon: LucideIcon }> = {
  all: { label: "全部", description: "浏览完整项目目录", icon: Layers },
  popular: { label: "1k+ 顶流", description: "GitHub Stars 达到 1,000 的热门项目。", icon: Star },
  rising: { label: "潜力新秀", description: "近 90 天创建、当前有 10–999 Stars 的项目，按快照筛选。", icon: Sparkles },
  commercial: { label: "商业友好", description: "采用 MIT、Apache、BSD 等宽松开源许可。", icon: ShieldCheck },
};

export type AppProps = { initialProjects?: Project[]; initialLocale?: Locale; initialDay?: string };
function App({ initialProjects, initialLocale, initialDay }: AppProps = {}) {
  const [locale] = useState<Locale>(() => initialLocale ?? readLocale());
  const [heroTab, setHeroTab] = useState<"discover" | "quickstart" | "mechanism">("discover");
  const heroId = useId();
  const projectSummaryId = useId();

  const {
    projects,
    loadState,
    catalogAdded,
    updatedAt,
    retry,
  } = useCatalogSWR({ initialProjects });

  useEffect(() => {
    prefetchAvatars(projects, import.meta.env.BASE_URL);
  }, [projects]);

  const [saved, setSaved] = useState<string[]>(getSaved);

  const {
    query,
    searchTerm,
    category,
    tag,
    quickFilter,
    sort,
    onlySaved,
    visibleLimit,
    showFilters,
    activeFilterCount,
    explorerState,
    setQuery,
    setSearchTerm,
    setCategory,
    setTag,
    setQuickFilter,
    setSort,
    setOnlySaved,
    setVisibleLimit,
    setShowFilters,
    selectTag,
    clearSearch,
    reset,
    fuse,
    visible,
    displayed,
    searchRowRef,
    tagFilterRef,
  } = useExplorerState({
    projects,
    saved,
    loadState,
    initialProjects,
  });

  const t = (text: string) => translate(text, locale);
  const label = (category: string) => categoryLabel(category, locale);
  const projectText = (
    project: Project,
    key: "plainSummary" | "jevDecisionPoint" | "highlightBenefit" | "claimStatus" | "reviewReason",
  ) => {
    const localized = localizedProjectText(project, key, locale);
    return <span lang={localeMeta[localized.language].language}>{localized.text}</span>;
  };
  const changeLocale = (next: Locale) => {
    if (typeof window === "undefined" || !locales.includes(next) || next === locale) return;
    try { localStorage.setItem("awesome-jev:locale", next); }
    catch { /* The destination path still selects the requested language. */ }
    const url = localeNavigationUrl(window.location.href, next, explorerState, import.meta.env.BASE_URL);
    window.location.assign(url.href);
  };
  useEffect(() => {
    try { localStorage.setItem("awesome-jev:locale", locale); }
    catch { /* Current-visit language still works. */ }
    document.documentElement.lang = localeMeta[locale].language;
    document.title = localeMeta[locale].title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", localeMeta[locale].description);
  }, [locale]);
  const [modal, setModal] = useState<"submit" | "agentSkill" | "sponsor" | "gacha" | null>(null);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("sponsor") === "1") setModal("sponsor");
  }, []);
  const [active, setActive] = useState<Project | null>(null);
  const [toast, setToast] = useState("");
  const [agentCopyStatus, setAgentCopyStatus] = useState("");
  const [repo, setRepo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [decision, setDecision] = useState("");
  const [formErrors, setFormErrors] = useState<SubmissionErrors>({});
  const [issueDraftUrl, setIssueDraftUrl] = useState<string | null>(null);
  const [shareFallback, setShareFallback] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const submissionFormRef = useRef<HTMLFormElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = categoryListRef.current;
    if (!container) return;
    let frame = 0;
    const centerCategory = () => {
      window.cancelAnimationFrame(frame);
      if (!window.matchMedia("(max-width: 768px)").matches) return;
      const activeCategory = container.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!activeCategory) return;
      const bounds = container.getBoundingClientRect();
      const activeBounds = activeCategory.getBoundingClientRect();
      const start = container.scrollLeft;
      const target = Math.max(0, Math.min(container.scrollWidth - container.clientWidth,
        start + activeBounds.left - bounds.left + activeBounds.width / 2 - container.clientWidth / 2));
      if (Math.abs(target - start) < 1) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        container.scrollLeft = target;
        return;
      }
      const began = performance.now();
      const move = (time: number) => {
        const progress = Math.min(1, (time - began) / 180);
        container.scrollLeft = start + (target - start) * (1 - (1 - progress) ** 3);
        if (progress < 1) frame = window.requestAnimationFrame(move);
      };
      frame = window.requestAnimationFrame(move);
    };
    centerCategory();
    window.addEventListener("resize", centerCategory);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("resize", centerCategory); };
  }, [category, projects, locale]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2400);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const editable = e.target instanceof HTMLElement && e.target.matches(
        'input,textarea,select,[contenteditable="true"]',
      );
      if (
        (e.key === "/" && !editable && !e.metaKey && !e.ctrlKey && !e.altKey) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        if (!document.querySelector("dialog[open]")) {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
        if (showFilters) {
          setShowFilters(false);
          return;
        }
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    const fromHash = () => {
      const id =
        new URLSearchParams(location.hash.slice(1)).get("project") ??
        new URLSearchParams(location.search).get("project");
      if(id)setModal(null);
      setActive(projects.find((p) => p.id === id) ?? null);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [projects, showFilters, setShowFilters]);
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category))],
    [projects],
  );
  const tags = useMemo(() => tagOptions(projects, locale), [projects, locale]);
  const selectedTag = tags.find((option) => option.id === tag);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: "search_jev_projects",
      title: "Search Jev projects",
      description:
        "Search the same project dataset shown on this page. Returns project summaries and source links; does not change filters or bookmarks.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string" }, category: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (input: unknown) => {
        const q = input as { query?: unknown; category?: unknown };
        if (
          !q ||
          typeof q.query !== "string" ||
          (q.category !== undefined && typeof q.category !== "string")
        )
          throw new Error("query and category must be strings");
        const found = q.query ? searchProjects(fuse, q.query) : projects;
        return {
          projects: found
            .filter((p) => !q.category || p.category === q.category)
            .slice(0, 20)
            .map((p) => ({
              id: p.id,
              name: p.name,
              summary: localizedProjectText(p, "plainSummary", locale).text,
              decision: localizedProjectText(p, "jevDecisionPoint", locale).text,
              url: p.url,
            })),
          snapshotAt: updatedAt,
        };
      },
    };
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* Optional API; normal UI remains available. */
    }
    return () => lifecycle.abort();
  }, [projects, fuse, updatedAt, locale]);
  const trending = useMemo(
    () =>
      [...projects]
        .filter((p) => p.stars !== null && p.catalogStatus !== "review-pending")
        .sort((a, b) => b.stars! - a.stars!)
        .slice(0, 4),
    [projects],
  );
  const explorableCount = useMemo(() => eligibleProjects(projects).length, [projects]);
  const toggleSaved = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("awesome-jev:saved", JSON.stringify(next));
      setToast(next.includes(id) ? t("已加入本机收藏") : t("已取消收藏"));
    } catch {
      setToast(t(next.includes(id) ? "已收藏，本次浏览有效；浏览器未允许保存" : "已取消收藏，本次浏览有效；浏览器未允许保存"));
    }
  };
  const getShareText = (p: Project, url: string) => {
    const plain = localizedProjectText(p, "plainSummary", locale);
    const decision = localizedProjectText(p, "jevDecisionPoint", locale);
    if (locale === "zh") {
      return `⚡ 在 Awesome Jev 发现了【${p.name}】（${p.stars == null ? "—" : format(p.stars)}★）\n💡 用途：${plain.text}\n🎯 Jev 决策点：${decision.text}\n🔗 探索项目：${url}`;
    }
    if (locale === "ja") {
      return `⚡ Awesome Jev で【${p.name}】（${p.stars == null ? "—" : format(p.stars)}★）を発見！\n💡 用途：${plain.text}\n🎯 Jev 判断：${decision.text}\n🔗 詳細：${url}`;
    }
    if (locale === "ko") {
      return `⚡ Awesome Jev에서 [${p.name}] (${p.stars == null ? "—" : format(p.stars)}★) 발견!\n💡 용도: ${plain.text}\n🎯 Jev 판단: ${decision.text}\n🔗 둘러보기: ${url}`;
    }
    return `⚡ Discovered ${p.name} (${p.stars == null ? "—" : format(p.stars)}★) on Awesome Jev\n💡 Purpose: ${plain.text}\n🎯 Jev Decision: ${decision.text}\n🔗 Explore: ${url}`;
  };

  const share = async (p: Project) => {
    const url = `${location.origin}${projectPath(p.id, locale, import.meta.env.BASE_URL)}`;
    const text = getShareText(p, url);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${p.name} — Awesome Jev`,
          text,
          url,
        });
        setShareFallback(null);
        setToast(t("已打开分享"));
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareFallback(null);
      setToast(t("项目分享文案已复制"));
    } catch {
      setShareFallback({ id: p.id, url });
      openProject(p);
      setToast(t("无法自动复制，请使用详情中的项目链接。"));
    }
  };

  const copyMarkdown = async (p: Project) => {
    const plain = localizedProjectText(p, "plainSummary", locale);
    const md = `[${p.name}](${p.url}) — ${plain.text}`;
    try {
      await navigator.clipboard.writeText(md);
      setToast(t("Markdown 引用已复制"));
    } catch {
      setToast(t("无法自动复制，请使用详情中的项目链接。"));
    }
  };

  const copyBadge = async (p: Project) => {
    const url = `${location.origin}${projectPath(p.id, locale, import.meta.env.BASE_URL)}`;
    const badgeMd = `[![Featured in Awesome Jev](https://img.shields.io/badge/Awesome%20Jev-Featured-2563eb?style=flat-square)](${url})`;
    try {
      await navigator.clipboard.writeText(badgeMd);
      setToast(t("README 徽章已复制"));
    } catch {
      setToast(t("无法自动复制，请使用详情中的项目链接。"));
    }
  };
  const shareSite = async () => {
    const url = `${location.origin}${import.meta.env.BASE_URL}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Awesome Jev — System-1 Agent 架构雷达",
          text: t("把思考留给大模型，把选择题交给 Jev。"),
          url,
        });
        setToast(t("已打开分享"));
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(t("本站链接已复制"));
    } catch {
      setToast(t("本站链接已复制"));
    }
  };
  const openProject = (p: Project) => {
    setModal(null);
    location.hash = `project=${encodeURIComponent(p.id)}`;
    setActive(p);
  };
  const closeProject = () => {
    const url = new URL(location.href);
    url.hash = "";
    url.searchParams.delete("project");
    history.replaceState(null, "", url.pathname + url.search);
    setActive(null);
    setShareFallback(null);
  };
  const updateSubmission = (field: keyof SubmissionValues, value: string) => {
    ({ repo: setRepo, purpose: setPurpose, decision: setDecision })[field](
      value,
    );
    setFormErrors((previous) => ({ ...previous, [field]: undefined }));
    setIssueDraftUrl(null);
  };
  const discoveryUi = {
    zh: ["抽张灵感卡", "正在准备卡片…", "卡片暂时无法加载，浏览列表仍可正常使用。", "重试"],
    en: ["Draw a card", "Preparing a card…", "The card view could not load. The catalog is still available.", "Retry"],
    ja: ["カードを引く", "カードを準備中…", "カードを読み込めませんでした。一覧は引き続き利用できます。", "再試行"],
    ko: ["카드 뽑기", "카드를 준비하는 중…", "카드를 불러오지 못했습니다. 목록은 계속 사용할 수 있습니다.", "다시 시도"],
  }[locale];
  const discoveryEntry = discoveryUi[0];
  const submitShort = { zh: "提交项目", en: "Submit", ja: "投稿", ko: "제출" }[locale];
  const sponsorShort = { zh: "赞助合作", en: "Sponsor", ja: "協賛", ko: "후원" }[locale];
  const heroStatus = {
    zh: { ready: "System-1 雷达就绪", count: "个项目已索引", note: "把状态变成选项。", detail: "Choice · Score · Noul", status: "目录状态，非模型 API 的实时运行状态" },
    en: { ready: "System-1 Radar Ready", count: "repos indexed", note: "Turn state into choices.", detail: "Choice · Score · Noul", status: "Catalog status, not live model API health" },
    ja: { ready: "System-1 レーダー稼働", count: "件を索引済み", note: "状態を、選択肢へ。", detail: "Choice · Score · Noul", status: "カタログの状態です。モデル API の稼働監視ではありません" },
    ko: { ready: "System-1 레이더 준비", count: "개 프로젝트 색인", note: "상태를 선택지로.", detail: "Choice · Score · Noul", status: "카탈로그 상태이며 모델 API의 실시간 상태가 아닙니다" },
  }[locale];
  const openGacha = () => { closeProject(); setModal("gacha"); };
  const openSponsor = () => {
    closeProject();
    setModal("sponsor");
  };
  const copySkillCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setAgentCopyStatus(t("安装命令已复制"));
    } catch {
      setAgentCopyStatus(t("无法自动复制，请手动复制命令。"));
    }
  };
  const openSubmission = () => {
    closeProject();
    setFormErrors({});
    setIssueDraftUrl(null);
    setModal("submit");
  };
  const submitProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { values, errors } = validateSubmission(
      { repo, purpose, decision },
      locale,
    );
    setFormErrors(errors);
    setIssueDraftUrl(null);
    const first = (["repo", "purpose", "decision"] as const).find(
      (field) => errors[field],
    );
    if (first) {
      requestAnimationFrame(() =>
        submissionFormRef.current
          ?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            `[name="${first}"]`,
          )
          ?.focus(),
      );
      return;
    }
    setRepo(values.repo);
    setPurpose(values.purpose);
    setDecision(values.decision);
    const url = createIssueUrl(values, locale);
    // Keep this synchronous inside the user gesture; no awaited work before opening.
    window.open(url, "_blank", "noopener,noreferrer");
    setIssueDraftUrl(url);
  };
  return (
    <>
      <a className="skip-link" href="#project-results">{t("跳转到项目列表")}</a>
      <header className="header">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            reset();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="brand-icon">
            <Zap size={23} fill="currentColor" />
          </span>
          awesome<span className="brand-jev">jev</span>
          <span className="beta">RADAR</span>
        </a>
        <nav className="header-nav" aria-label={t("主导航")}>
          <button
            className={!onlySaved ? "nav-item active" : "nav-item"}
            aria-pressed={!onlySaved}
            onClick={() => {
              setOnlySaved(false);
              setCategory("all");
            }}
          >
            {t("探索项目")}
          </button>
          <button
            className={onlySaved ? "nav-item active" : "nav-item"}
            onClick={() => setOnlySaved(true)}
            aria-label={`${t("我的收藏")} ${saved.length}`}
            aria-pressed={onlySaved}
          >
            <Bookmark
              className="mobile-bookmark"
              size={18}
              aria-hidden="true"
            />
            <span className="saved-label">{t("我的收藏")}</span>
            <span className="nav-count">{saved.length}</span>
          </button>
        </nav>
        <div className="header-actions">
          <div className="header-ecosystem" role="group" aria-label={t("生态入口")}>
          <button className="sponsor-entry-button" type="button" onClick={openSponsor} aria-haspopup="dialog" aria-label={sponsorCopy[locale].entry}>
            <Handshake size={15} aria-hidden="true" />
            <span className="sponsor-label-full">{sponsorCopy[locale].entry}</span>
            <span className="sponsor-label-short" aria-hidden="true">{sponsorShort}</span>
          </button>
          <button
            className="agent-skill-btn"
            onClick={() => {
              closeProject();
              setAgentCopyStatus("");
              setModal("agentSkill");
            }}
            aria-label={t("查看 Agent Skill 与接入指南")}
            title={t("查看 Agent Skill 与接入指南")}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Agent Skill</span>
          </button>
          <a
            className="github-star-btn"
            href="https://github.com/logicrw/awesome-jev-projects"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Star on GitHub（新标签页打开）")}
            title={t("到 GitHub 支持这个项目")}
          >
            <Star size={17} strokeWidth={1.75} aria-hidden="true" />
            <span className="star-label-full">{t("Star on GitHub")}</span>
            <span className="star-label-short" aria-hidden="true">Star</span>
          </a>
          </div>
          <button className="button dark submit-top" onClick={openSubmission} aria-label={t("提交项目")} aria-haspopup="dialog">
            <Plus size={15} />
            <span className="submit-label-full">{t("提交项目")}</span>
            <span className="submit-label-short" aria-hidden="true">{submitShort}</span>
          </button>
          <div className="header-utilities" role="group" aria-label={t("显示与语言")}>
          <ThemeToggle locale={locale} />
          <label className="language-control">
            <Globe size={15} aria-hidden="true" />
            <select
              className="language-toggle"
              aria-label={t("选择语言")}
              value={locale}
              onChange={(e) => changeLocale(e.target.value as Locale)}
            >
              {locales.map((value) => <option key={value} value={value} lang={localeMeta[value].language}>{localeMeta[value].label}</option>)}
            </select>
          </label>
          </div>
        </div>
      </header>
      <main className="page">
        <section className="hero hero-tactile" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <div className="hero-engine-status" title={heroStatus.status}>
              <span className="hero-led" aria-hidden="true" />
              <span>{heroStatus.ready}</span>
              <span className="hero-index-count"><b>{projects.length.toLocaleString(locale)}</b> {heroStatus.count}</span>
            </div>
            <h1 id="hero-heading"><span>{t("把思考留给大模型，")}</span><strong>{t("把选择题交给 Jev。")}</strong></h1>
            <p>{t("从社区源码里，查看 Jev 的接入方式与决策位置。")}</p>
            <div className="hero-maker-row">
              <div className="hero-maker-copy">
                <p>{heroStatus.note}</p>
                <div className="hero-primitives" aria-label={heroStatus.detail}>
                  <span className="primitive-chip">CHOICE</span>
                  <span className="primitive-dot" aria-hidden="true">·</span>
                  <span className="primitive-chip">SCORE</span>
                  <span className="primitive-dot" aria-hidden="true">·</span>
                  <span className="primitive-chip">NOUL</span>
                </div>
                <div className="hero-links-row">
                  <a
                    className="text-link"
                    href="https://typesafe.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("认识 TypeSafe 的决策模型")}
                    <ArrowUpRight size={15} />
                  </a>
                  <a
                    className="hero-curator-seal"
                    href="https://x.com/0xLogicrw"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Curated by @0xLogicrw"
                    aria-label="Curated by @0xLogicrw"
                  >
                    <span className="seal-tag">CURATED</span>
                    <span className="seal-author">@0xLogicrw</span>
                    <ArrowUpRight size={11} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <Jevy locale={locale} />
            </div>
          </div>
          <div className="hero-workbench">
            <div className="hero-tool-row">
            <div className="hero-tabs" role="tablist" aria-label={t("了解与接入 Jev")} onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const tabs = ["discover", "quickstart", "mechanism"] as const;
              const direction = event.key === "ArrowLeft" ? -1 : 1;
              const next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[2] : tabs[(tabs.indexOf(heroTab) + direction + tabs.length) % tabs.length];
              setHeroTab(next);
              document.getElementById(`${heroId}-${next}-tab`)?.focus();
            }}>
              <button id={`${heroId}-discover-tab`} type="button" role="tab" aria-selected={heroTab === "discover"} aria-controls={`${heroId}-discover-panel`} tabIndex={heroTab === "discover" ? 0 : -1} onClick={() => setHeroTab("discover")}>
                <Layers size={14} /> {t("发现项目")}
              </button>
              <button id={`${heroId}-quickstart-tab`} type="button" role="tab" aria-selected={heroTab === "quickstart"} aria-controls={`${heroId}-quickstart-panel`} tabIndex={heroTab === "quickstart" ? 0 : -1} onClick={() => setHeroTab("quickstart")}>
                <Terminal size={14} /> {t("快速接入")}
              </button>
              <button id={`${heroId}-mechanism-tab`} type="button" role="tab" aria-selected={heroTab === "mechanism"} aria-controls={`${heroId}-mechanism-panel`} tabIndex={heroTab === "mechanism" ? 0 : -1} onClick={() => setHeroTab("mechanism")}>
                <Workflow size={14} /> {t("决策流程")}
              </button>
            </div>
            <button type="button" className="discovery-entry" hidden={heroTab === "discover"} onClick={openGacha} aria-haspopup="dialog"><Sparkles size={14} aria-hidden="true" /><span>{discoveryEntry}</span></button>
            </div>
            <div id={`${heroId}-discover-panel`} role="tabpanel" aria-labelledby={`${heroId}-discover-tab`} hidden={heroTab !== "discover"}>
              <CardDispenser locale={locale} projectCount={explorableCount} onDraw={openGacha} />
            </div>
            <div id={`${heroId}-quickstart-panel`} role="tabpanel" aria-labelledby={`${heroId}-quickstart-tab`} hidden={heroTab !== "quickstart"}>
              <HelloJev locale={locale} />
            </div>
            <div id={`${heroId}-mechanism-panel`} role="tabpanel" aria-labelledby={`${heroId}-mechanism-tab`} hidden={heroTab !== "mechanism"}>
          <div className="decision-canvas" aria-label={t("Jev 决策机制示意")}>
            <div className="canvas-heading">
              <span>{t("输入 → 判断")}</span>
              <span className="mono">System 1</span>
            </div>
            <div className="decision-flow">
              <div className="flow-in">
                <Code2 size={20} />
                <span>{t("任务与选项")}</span>
              </div>
              <span className="connector" />
              <div className="jev-node">
                <Zap size={23} fill="currentColor" />
                <strong>jev</strong>
              </div>
              <span className="connector" />
              <div className="flow-out">
                <span>
                  <CheckCheck size={16} />
                  {t("选一个")}
                </span>
                <span>
                  <SlidersHorizontal size={16} />
                  {t("打个分")}
                </span>
                <span>
                  <Workflow size={16} />
                  {t("下一步")}
                </span>
              </div>
            </div>
            <div className="canvas-footer">
              {t("把思考留给大模型，把选择题交给 Jev。")}
              <ArrowRight size={14} />
            </div>
          </div>
            </div>
          </div>
        </section>
        <section className="stats" aria-label={t("生态统计")}>
          <div>
            <span className="stat-value">
              {projects.length.toString().padStart(2, "0")}
            </span>
            <span>{t("已审校项目")}</span>
          </div>
          <div>
            <span className="stat-value">
              {categories.length.toString().padStart(2, "0")}
            </span>
            <span>{t("架构分类")}</span>
          </div>
          <div>
            <span className="stat-value">
              {tags.length.toString().padStart(2, "0")}
            </span>
            <span>{t("主题标签")}</span>
          </div>
          <div className="data-updated">
            <span>{t("数据更新")}</span>
            <strong>{updatedAt ? date(updatedAt, locale) : "—"}</strong>
          </div>
        </section>
        {trending.length > 0 && (
          <div className="ticker">
            <span className="ticker-label">
              <Sparkles size={14} />
              {t("热门项目")}
            </span>
            <div className="ticker-items">
              {trending.map((p) => (
                <button key={p.id} onClick={() => openProject(p)}>
                  {p.name}
                  <span>
                    <Star size={12} />
                    {format(p.stars)}
                  </span>
                </button>
              ))}
            </div>
            <span className="ticker-note">{t("按当前星数")}</span>
          </div>
        )}
        <section className="explorer" id="explore">
          <aside className="sidebar">
            <DailyProject projects={projects} locale={locale} initialDay={initialDay} onOpen={openProject} />
            <MaintainerCard locale={locale} />
            <div className="side-title">
              {t("分类")} <span>{categories.length}</span>
            </div>
            <div className="category-list" ref={categoryListRef} aria-label={t("分类")}>
              <button
                className={category === "all" ? "category active" : "category"}
                onClick={() => setCategory("all")}
                aria-pressed={category === "all"}
              >
                <Layers size={16} />
                <span>{t("全部项目")}</span>
                <b>{projects.length}</b>
              </button>
              {categories.map((c) => {
                const Icon = categoryInfo[c]?.icon ?? Code2;
                return (
                  <button
                    className={category === c ? "category active" : "category"}
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                  >
                    <Icon size={16} />
                    <span>{label(c)}</span>
                    {c === "Browser & OS Action" && (
                      <span className="category-hot-badge" title="Top community use case">HOT</span>
                    )}
                    <b>{projects.filter((p) => p.category === c).length}</b>
                  </button>
                );
              })}
            </div>
            <div className="side-note">
              <span className="mini-radar">
                <Radar size={19} />
              </span>
              <h3>{t("让好项目被看见")}</h3>
              <p>
                {t("在做一个 Jev 项目？")}
                <br />
                {t("把你的下一步，分享给大家。")}
              </p>
              <button onClick={openSubmission}>
                {t("提交到雷达")} <ArrowUpRight size={15} />
              </button>
            </div>
            <a
              className="side-source"
              href="https://github.com/logicrw/awesome-jev-projects"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Awesome Jev · 项目目录")} <ExternalLink size={12} />
            </a>
          </aside>
          <div className="results" id="project-results" tabIndex={-1}>
            <div className="search-row" ref={searchRowRef}>
              <form
                className="search-box"
                role="search"
                onSubmit={(event) => event.preventDefault()}
              >
                <Search size={19} aria-hidden="true" />
                <input
                  ref={searchRef}
                  id="project-search"
                  name="q"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-label={t("搜索项目")}
                  aria-controls="project-results"
                  value={query}
                  maxLength={200}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    "搜项目、作者或场景（如：Playwright、Claude、降本路由、Rust、上下文）...",
                  )}
                />
                {query ? (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => {
                      clearSearch();
                      searchRef.current?.focus();
                    }}
                    aria-label={t("清空搜索")}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <kbd aria-hidden="true">/</kbd>
                )}
              </form>
              <button
                type="button"
                className="toolbar-gacha-button"
                onClick={openGacha}
                aria-haspopup="dialog"
              >
                <Sparkles size={15} aria-hidden="true" />
                <span>{t("抽张灵感")}</span>
              </button>
              <button
                type="button"
                className={`filter-button ${showFilters ? "selected" : ""} ${activeFilterCount > 0 ? "has-active" : ""}`}
                aria-label={t("展开筛选")}
                aria-expanded={showFilters}
                aria-controls="filter-panel"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={17} />
                <span>{t("筛选")}</span>
                {activeFilterCount > 0 ? (
                  <span className="filter-badge" aria-hidden="true">{activeFilterCount}</span>
                ) : (
                  tag !== "all" && <i />
                )}
              </button>
              {showFilters && (
                <div
                  id="filter-panel"
                  className="filter-panel filter-popover"
                  role="region"
                  aria-label={t("筛选")}
                >
                  <div className="filter-popover-header">
                    <div className="filter-popover-title">
                      <Filter size={15} aria-hidden="true" />
                      <span>{t("筛选")}</span>
                      {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                    </div>
                    <div className="filter-popover-actions">
                      {activeFilterCount > 0 && (
                        <button type="button" className="filter-reset-link" onClick={reset}>
                          <RotateCcw size={12} aria-hidden="true" />
                          <span>{t("重置筛选")}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="filter-close-btn"
                        onClick={() => setShowFilters(false)}
                        aria-label={t("关闭弹窗")}
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="filter-section">
                    <span className="filter-section-title">{t("快速浏览")}</span>
                    <div className="filter-quick-chips" role="group" aria-label={t("快速浏览")}>
                      {(Object.keys(quickFilterCopy) as ExplorerState["quickFilter"][]).map((mode) => {
                        const QuickIcon = quickFilterCopy[mode].icon;
                        const active = quickFilter === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            className={`filter-chip ${active ? "active" : ""}`}
                            aria-pressed={active}
                            onClick={() => setQuickFilter(active && mode !== "all" ? "all" : mode)}
                            title={t(quickFilterCopy[mode].description)}
                          >
                            <QuickIcon size={13} aria-hidden="true" />
                            <span>{t(quickFilterCopy[mode].label)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="filter-section">
                    <div className="filter-section-header">
                      <span className="filter-section-title">{t("技术标签")}</span>
                      {tag !== "all" && (
                        <span className="filter-section-hint">{tagLabel(tag, locale)}</span>
                      )}
                    </div>
                    <div className="filter-tag-chips" role="group" aria-label={t("技术标签")}>
                      <button
                        type="button"
                        className={`filter-chip ${tag === "all" ? "active" : ""}`}
                        aria-pressed={tag === "all"}
                        onClick={() => selectTag("all")}
                      >
                        <span>{t("全部标签")}</span>
                      </button>
                      {tags.map((option) => {
                        const active = tag === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={`filter-chip ${active ? "active" : ""}`}
                            aria-pressed={active}
                            onClick={() => selectTag(active ? "all" : option.id)}
                            title={option.description}
                          >
                            <span>{option.name}</span>
                            <span className="filter-chip-count">{option.count}</span>
                          </button>
                        );
                      })}
                    </div>
                    <select
                      ref={tagFilterRef}
                      className="sr-only"
                      aria-label={t("技术标签")}
                      aria-describedby={selectedTag ? "tag-filter-description" : undefined}
                      title={selectedTag?.optionLabel ?? t("全部标签")}
                      value={tag}
                      onChange={(event) => selectTag(event.target.value)}
                      tabIndex={-1}
                    >
                      <option value="all">{t("全部标签")}</option>
                      {tags.map((option) => (
                        <option key={option.id} value={option.id}>{option.optionLabel}</option>
                      ))}
                    </select>
                    {selectedTag && (
                      <p id="tag-filter-description" className="tag-filter-description" title={selectedTag.description}>
                        {selectedTag.description}
                      </p>
                    )}
                  </div>

                  <div className="filter-popover-footer">
                    <span className="filter-popover-count">
                      {visible.length} {locale === "zh" ? "个匹配项目" : locale === "ja" ? "件の一致" : locale === "ko" ? "개 프로젝트 일치" : `${visible.length === 1 ? "project" : "projects"} matched`}
                    </span>
                    <button type="button" className="button dark filter-done-btn" onClick={() => setShowFilters(false)}>
                      {locale === "zh" ? "查看结果" : locale === "ja" ? "結果を見る" : locale === "ko" ? "결과 보기" : "View results"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="search-suggestions" role="group" aria-label={t("热门搜索")}>
              <span>{t("热门搜索")}</span>
              {popularSearches[locale].map((suggestion) => (
                <button key={suggestion.query} type="button" aria-pressed={query.trim() === suggestion.query} onClick={() => {
                  reset();
                  setQuery(suggestion.query);
                  setSearchTerm(suggestion.query);
                }}>{suggestion.label}</button>
              ))}
            </div>
            <div className="quick-filters" role="group" aria-label={t("快速浏览")}>
              {(Object.keys(quickFilterCopy) as ExplorerState["quickFilter"][]).map((mode) => {
                const QuickIcon = quickFilterCopy[mode].icon;
                return <button key={mode} type="button" aria-pressed={quickFilter === mode} onClick={() => setQuickFilter(mode)} title={t(quickFilterCopy[mode].description)}>
                  <QuickIcon size={14} /><span>{t(quickFilterCopy[mode].label)}</span>
                </button>;
              })}
            </div>
            {quickFilter !== "all" && <p className="quick-filter-description">{t(quickFilterCopy[quickFilter].description)}</p>}
            {(query || tag !== "all" || quickFilter !== "all" || onlySaved) && (
              <div className="active-filters" aria-label={t("筛选结果")}>
                {query && <button onClick={clearSearch} aria-label={`${t("清空搜索")}: ${query}`}>{query}<X size={13} /></button>}
                {tag !== "all" && <button onClick={() => setTag("all")} aria-label={`${t("清除该筛选")}: ${tagLabel(tag, locale)}`}>{tagLabel(tag, locale)}<X size={13} /></button>}
                {quickFilter !== "all" && <button onClick={() => setQuickFilter("all")} aria-label={`${t("清除该筛选")}: ${t(quickFilterCopy[quickFilter].label)}`}>{t(quickFilterCopy[quickFilter].label)}<X size={13} /></button>}
                {onlySaved && <button onClick={() => setOnlySaved(false)}>{t("我的收藏")}<X size={13} /></button>}
                <button className="reset-all" onClick={reset}>{t("重置筛选")}</button>
              </div>
            )}
            <FeaturedPartners locale={locale} onSponsor={openSponsor} category={category} />
            <div className="results-heading">
              <h2>
                {onlySaved
                  ? t("我的收藏")
                  : category === "all"
                    ? t("发现项目")
                    : label(category)}
                <span>{visible.length}</span>
              </h2>
              {searchTerm.trim() ? <span className="sort-label relevance-label">{t("按匹配度排序")}</span> : <label className="sort-label">
                <ArrowDownWideNarrow size={15} />
                <select
                  aria-label={t("排序方式")}
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ExplorerState["sort"])}
                >
                  <option value="stars">{t("最多 Stars")}</option>
                  <option value="created">{t("最近创建")}</option>
                  <option value="updated">{t("最近更新")}</option>
                </select>
              </label>}
            </div>
            <span className="sr-only" role="status" aria-live="polite">
              {loadState === "ready"
                ? `${visible.length} ${t("个匹配项目")}`
                : t("正在读取项目")}
            </span>
            <div className="project-grid" aria-busy={loadState === "loading"}>
              {displayed.map((p) => {
                const Icon = categoryInfo[p.category]?.icon ?? Code2;
                return (
                  <article
                    className="project-card"
                    key={p.id}
                    data-project-id={p.id}
                    onClick={(event) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest("button, a, input, select, textarea, label")) {
                        return;
                      }
                      const selection = window.getSelection();
                      if (selection && selection.toString().trim().length > 0) {
                        return;
                      }
                      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                        openProject(p);
                      }
                    }}
                  >
                    <div className="card-top">
                      <div className="project-identity">
                        <ProjectAvatar project={p} />
                        <div>
                          <h3 className="project-heading"><a
                            className="project-title"
                            href={projectPath(p.id, locale, import.meta.env.BASE_URL)}
                            onClick={(event) => {
                              if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                                event.preventDefault(); openProject(p);
                              }
                            }}
                          >
                            {p.name}
                            <ArrowUpRight size={15} />
                          </a></h3>
                          <a
                            href={`https://github.com/${encodeURIComponent(p.author)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="author"
                          >
                            {p.author}
                          </a>
                        </div>
                      </div>
                      <button
                        className={`icon-button save-button ${saved.includes(p.id) ? "saved" : ""}`}
                        aria-label={`${saved.includes(p.id) ? t("取消收藏") : t("收藏")} ${p.name}`}
                        aria-pressed={saved.includes(p.id)}
                        onClick={() => toggleSaved(p.id)}
                      >
                        <Bookmark
                          size={18}
                          fill={saved.includes(p.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="card-category">
                      <Icon size={13} />
                      {label(p.category)}
                      {p.license ? (
                        <span className="license-note" title={`${t("开源协议")}: ${p.license}`}>{p.license}</span>
                      ) : (
                        <span className="license-note is-unconfirmed" title={t("代码已公开开源，作者暂未指定标准许可证文件")}>{t("暂无开源协议")}</span>
                      )}
                      {p.summarySource === "readme-extractive" && (
                        <span className="auto-label">{t("来源摘要")}</span>
                      )}
                    </div>
                    <p className="plain-summary">
                      {projectText(p, "plainSummary")}
                    </p>
                    <div className="decision-block">
                      <div>
                        <Zap size={13} fill="currentColor" />
                        <span>{t("JEV 在这里做什么")}</span>
                      </div>
                      <p>{projectText(p, "jevDecisionPoint")}</p>
                    </div>
                    <p className="benefit">
                      <ArrowRight size={14} />
                      {projectText(p, "highlightBenefit")}
                    </p>
                    <div className="tags">
                      {p.tags.slice(0, 3).map((value) => {
                        const id = resolveTagId(value);
                        if (!id) return null;
                        return <button
                          key={id}
                          type="button"
                          aria-label={`${t("按标签筛选")}: ${tagLabel(id, locale)}`}
                          aria-pressed={tag === id}
                          title={tagDescription(id, locale)}
                          onClick={() => selectTag(tag === id ? "all" : id, true)}
                        >
                          {tagLabel(id, locale)}
                        </button>;
                      })}
                    </div>
                    <div className="card-bottom">
                      <div className="repo-metrics">
                        <span title={t("最近同步的 GitHub Stars")}>
                          <Star size={15} />
                          {format(p.stars)}
                        </span>
                        <span title={t("Fork 数")}>
                          <GitFork size={14} />
                          {format(p.forks)}
                        </span>
                      </div>
                      <div className="repo-actions">
                        <CopyCloneButton url={p.url} locale={locale} />
                        <button
                          type="button"
                          className="share-link-button"
                          aria-label={`${t("分享链接")}: ${p.name}`}
                          title={t("分享链接")}
                          onClick={(event) => {
                            event.stopPropagation();
                            share(p);
                          }}
                        >
                          <Share2 size={13} aria-hidden="true" />
                          <span>{t("分享")}</span>
                        </button>
                        <a
                          className="github-link"
                          href={safeUrl(p.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github size={15} />
                          GitHub
                          <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {visible.length > displayed.length && (
              <div className="load-more">
                <button className="button" onClick={() => {
                  const nextIndex = displayed.length + 1;
                  setVisibleLimit((count) => count + 24);
                  requestAnimationFrame(() => {
                    const firstNewProject = document.querySelector<HTMLElement>(`.project-grid article:nth-child(${nextIndex}) .project-title`);
                    firstNewProject?.focus({ preventScroll: true });
                    firstNewProject?.scrollIntoView({ block: "start" });
                  });
                }}>
                  {t("加载更多项目")} <Plus size={16} />
                </button>
                <span aria-live="polite">{t("已显示")} {displayed.length} / {visible.length}</span>
              </div>
            )}
            {loadState === "loading" && (
              <div className="empty-state" role="status">
                {t("正在读取项目…")}
              </div>
            )}
            {loadState === "error" && (
              <div className="empty-state" role="alert">
                <p>{t("项目数据暂时无法读取。")}</p>
                <button
                  className="button"
                  onClick={retry}
                >
                  {t("重试")}
                </button>
              </div>
            )}
            {loadState === "ready" && !visible.length && (
              <div className="empty-state">
                <Search size={30} />
                <h3>
                  {onlySaved && !saved.length
                    ? t("把想试的项目，留在这里。")
                    : t("还没有找到这样的项目")}
                </h3>
                <p>
                  {onlySaved && !saved.length
                    ? t("点击项目右上角的书签，即可收藏到本机。")
                    : t("试试更短的关键词，或放宽筛选条件。")}
                </p>
                <div className="empty-actions">
                  {query && (
                    <button className="button dark" onClick={clearSearch}>
                      {t("清空搜索")}
                      <X size={15} />
                    </button>
                  )}
                  {(category !== "all" ||
                    tag !== "all" ||
                    quickFilter !== "all" ||
                    onlySaved) && (
                    <button className="button" onClick={reset}>
                      {onlySaved && !saved.length
                        ? t("浏览全部项目")
                        : t("重置筛选")}
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="result-footer">
              <span>
                {visible.length} / {projects.length} {t("个项目")}
              </span>
              <span>
                {t("性能数据来自项目说明，未经本站独立复测")}{" "}
                <CircleHelp size={13} />
              </span>
            </div>
          </div>
        </section>
        <footer className="footer">
          <a
            className="footer-brand"
            href="https://github.com/logicrw/awesome-jev-projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Zap size={16} />
            {t("Awesome Jev · 项目目录")}
          </a>
          <button
            type="button"
            className="footer-link-button"
            onClick={shareSite}
            title={t("分享本站")}
          >
            <Share2 size={13} aria-hidden="true" />
            {t("分享本站")}
          </button>
          <button
            type="button"
            className="footer-link-button"
            onClick={() => {
              closeProject();
              setAgentCopyStatus("");
              setModal("agentSkill");
            }}
          >
            <Sparkles size={13} />
            {t("Agent Skill 接入")}
          </button>
          <button type="button" className="footer-link-button" onClick={openSponsor} aria-haspopup="dialog">
            <Handshake size={14} aria-hidden="true" />
            {sponsorCopy[locale].entry}
          </button>
          <span>{t("GitHub 数据定时同步")}</span>
          <a
            href="https://github.com/logicrw/awesome-jev-projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
            <ArrowUpRight size={13} />
          </a>
        </footer>
      </main>
      {modal === "gacha" && (
        <GachaDialog projects={projects} locale={locale} onClose={() => setModal(null)} />
      )}
      {modal === "sponsor" && (
        <SponsorDialog locale={locale} projectCount={projects.length} onClose={() => setModal(null)} />
      )}
      {modal === "submit" && (
        <Modal
          locale={locale}
          title={t("把你的项目带上雷达")}
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            {t("让大家看懂你做了什么，以及 Jev 在哪一步帮上了忙。")}
          </p>
          <form
            ref={submissionFormRef}
            className="submit-form"
            noValidate
            onSubmit={submitProject}
          >
            {Object.values(formErrors).some(Boolean) && (
              <p className="form-error-summary" role="alert">
                {t("请检查下面标出的信息，填写内容已保留。")}
              </p>
            )}
            <div className="form-field">
              <label htmlFor="submission-repo">{t("GitHub 仓库")}</label>
              <input
                id="submission-repo"
                name="repo"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-required="true"
                value={repo}
                onChange={(e) => updateSubmission("repo", e.target.value)}
                placeholder={t("owner/repo 或 GitHub 链接")}
                aria-invalid={Boolean(formErrors.repo)}
                aria-describedby={
                  formErrors.repo ? "repo-hint repo-error" : "repo-hint"
                }
              />
              <p id="repo-hint" className="field-hint">
                {t("支持仓库简称、文件链接和分支链接，会自动提取仓库地址。")}
              </p>
              {formErrors.repo && (
                <p id="repo-error" className="field-error">
                  {formErrors.repo}
                </p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="submission-purpose">
                {t("一句话，它能做什么？")}
              </label>
              <input
                id="submission-purpose"
                name="purpose"
                type="text"
                aria-required="true"
                value={purpose}
                onChange={(e) => updateSubmission("purpose", e.target.value)}
                placeholder={t("比如：帮 Claude Code 过滤不相关的日志")}
                aria-invalid={Boolean(formErrors.purpose)}
                aria-describedby={
                  formErrors.purpose ? "purpose-error" : undefined
                }
              />
              {formErrors.purpose && (
                <p id="purpose-error" className="field-error">
                  {formErrors.purpose}
                </p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="submission-decision">
                {t("Jev 负责哪一个判断？")}
              </label>
              <textarea
                id="submission-decision"
                name="decision"
                aria-required="true"
                value={decision}
                onChange={(e) => updateSubmission("decision", e.target.value)}
                placeholder={t(
                  "它拿到什么输入？需要选择、打分，还是判断下一步？",
                )}
                rows={3}
                aria-invalid={Boolean(formErrors.decision)}
                aria-describedby={
                  formErrors.decision ? "decision-error" : undefined
                }
              />
              {formErrors.decision && (
                <p id="decision-error" className="field-error">
                  {formErrors.decision}
                </p>
              )}
            </div>
            <button className="button dark issue-submit" type="submit">
              <Github size={17} />
              {t("前往 GitHub 创建 Issue")}
              <ArrowUpRight size={15} />
            </button>
            {issueDraftUrl && (
              <div className="issue-draft-feedback" role="status">
                <p>
                  {t("已准备好 Issue 草稿。若新标签页未打开，可以直接继续：")}
                </p>
                <a
                  href={safeUrl(issueDraftUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("打开 GitHub Issue 草稿")}
                  <ArrowUpRight size={14} />
                </a>
              </div>
            )}
            <p className="fine-print">
              {t(
                "填写后点击继续，我们会检查并整理仓库地址。跳转后由你确认发布。",
              )}
            </p>
          </form>
        </Modal>
      )}
      {modal === "agentSkill" && (
        <Modal
          locale={locale}
          title={t("Agent Skill 与接入指南")}
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            {t("为 AI 编码助手（Claude Code、Cursor、Windsurf、Copilot）提供开箱即用的专业能力包。")}
          </p>
          <div className="agent-skill-dialog">
            <div className="agent-skill-section">
              <label className="agent-skill-label">{t("一键安装 Skill（推荐）")}</label>
              <div className="agent-command-box">
                <code>npx skills add logicrw/awesome-jev-projects</code>
                <button
                  type="button"
                  className="button"
                  onClick={() => void copySkillCommand("npx skills add logicrw/awesome-jev-projects")}
                  title={t("复制命令")}
                >
                  <Copy size={14} />
                  <span>{t("复制")}</span>
                </button>
              </div>
              <div className="agent-command-box">
                <code>npx skills add https://logicrw.github.io/awesome-jev-projects/</code>
                <button
                  type="button"
                  className="button"
                  onClick={() => void copySkillCommand("npx skills add https://logicrw.github.io/awesome-jev-projects/")}
                  title={t("复制命令")}
                >
                  <Copy size={14} />
                  <span>{t("复制")}</span>
                </button>
              </div>
            </div>

            <div className="agent-skill-section">
              <p className="agent-copy-status" role="status" aria-live="polite">{agentCopyStatus}</p>
              <label className="agent-skill-label">{t("Agent 可用核心能力")}</label>
              <ul className="agent-feature-list">
                <li>
                  <strong>{t("项目检索与推荐：")}</strong>
                  {t("按专业分类检索实战开源项目，涵盖 DOM 决策、模型路由降本、上下文 GC 等。")}
                </li>
                <li>
                  <strong>{t("架构模式与源码证据：")}</strong>
                  {t("获取 System-1 决策协同器架构，查阅每个项目的真实 Jev 决策点与 GitHub 源码证据。")}
                </li>
                <li>
                  <strong>{t("标准化 Issue 提交规范：")}</strong>
                  {t("指导 Agent 或开发者按照雷达格式规范提交新的 Jev 项目。")}
                </li>
              </ul>
            </div>

            <div className="agent-skill-section">
              <label className="agent-skill-label">{t("机器可读接口")}</label>
              <div className="agent-endpoints-grid">
                <a
                  className="agent-endpoint-card"
                  href={`${import.meta.env.BASE_URL}skill.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div>
                    <strong>skill.md</strong>
                    <span>{t("Agent Skill 标准定义 (Markdown)")}</span>
                  </div>
                  <ExternalLink size={14} />
                </a>
                <a
                  className="agent-endpoint-card"
                  href={`${import.meta.env.BASE_URL}llms.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div>
                    <strong>llms.txt</strong>
                    <span>{t("精简路线图与重点项目 (Markdown)")}</span>
                  </div>
                  <ExternalLink size={14} />
                </a>
                <a
                  className="agent-endpoint-card"
                  href={`${import.meta.env.BASE_URL}projects.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div>
                    <strong>projects.json</strong>
                    <span>
                      {t("完整项目结构化数据集 (JSON)")} ({projects.length})
                    </span>
                  </div>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {active && (
        <Modal
          locale={locale}
          title={active.name}
          descriptionId={projectSummaryId}
          onClose={closeProject}
        >
          <div className="detail-author">
            <span>{active.author}</span>
            <span className="tag">{label(active.category)}</span>
          </div>
          <p id={projectSummaryId} className="detail-summary">
            {projectText(active, "plainSummary")}
          </p>
          <div className="decision-block">
            <div>
              <Zap size={14} />
              {t("JEV 决策点")}
            </div>
            <p>{projectText(active, "jevDecisionPoint")}</p>
          </div>
          <p className="detail-benefit">
            {projectText(active, "highlightBenefit")}
          </p>
          <dl className="detail-grid">
            <div>
              <dt>Stars / Forks</dt>
              <dd>
                {format(active.stars)} / {format(active.forks)}
              </dd>
            </div>
            <div>
              <dt>Issues + PR</dt>
              <dd>{format(active.openIssues)}</dd>
            </div>
            <div>
              <dt>{t("开源协议")}</dt>
              <dd>
                {active.licenseStatus === "unconfirmed" || !active.license ? (
                  <>
                    <span>{t("暂无开源协议")}</span>
                    <span className="license-hint">
                      {" ("}{t("代码公开可用，未附带标准 LICENSE 文件")}{")"}
                    </span>
                  </>
                ) : (
                  active.license
                )}
              </dd>
            </div>
            <div>
              <dt>{t("最近提交")}</dt>
              <dd>{date(active.lastCommitAt, locale)}</dd>
            </div>
          </dl>
          <div className="evidence">
            <h3>{t("来源与说明")}</h3>
            <p>{projectText(active, "claimStatus")}</p>
            {active.evidence?.map((e, i) => (
              <a key={i} href={safeUrl(e.url)} target="_blank" rel="noopener noreferrer">
                {t("查看来源证据")} {i + 1}
                <ExternalLink size={13} />
              </a>
            ))}
            <span>
              {t("数据更新")}：{date(active.metadataFetchedAt, locale)}
            </span>
          </div>
          <div className="detail-connect-bar">
            <div className="detail-connect-info">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>{t("对这个项目或 Jev 落地有想法？与维护者交流：")}</span>
            </div>
            <a
              href="https://x.com/0xLogicrw"
              target="_blank"
              rel="noopener noreferrer"
              className="detail-connect-btn"
              title="X (Twitter) @0xLogicrw"
            >
              <span>@0xLogicrw</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
          {shareFallback?.id === active.id && (
            <label className="share-fallback">
              {t("项目链接")}
              <input
                aria-label={t("手动复制项目链接")}
                readOnly
                value={shareFallback.url}
                onFocus={(e) => e.currentTarget.select()}
              />
              <span>{t("选中后复制即可分享。")}</span>
            </label>
          )}
          <div className="detail-actions">
            <a
              className="button dark"
              href={safeUrl(active.url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} />
              {t("打开仓库")}
              <ArrowUpRight size={15} />
            </a>
            <a className="button" href={projectPath(active.id, locale, import.meta.env.BASE_URL)}>
              <ExternalLink size={15} />{t("独立项目页")}
            </a>
            <button className="button" onClick={() => share(active)} title={t("分享链接")}>
              <Share2 size={15} />
              {t("分享链接")}
            </button>
            <button className="button" onClick={() => copyMarkdown(active)} title={t("复制 Markdown 引用")}>
              <Copy size={15} />
              {t("复制 Markdown 引用")}
            </button>
            <button className="button" onClick={() => copyBadge(active)} title={t("复制 README 徽章")}>
              <Code2 size={15} />
              {t("复制 README 徽章")}
            </button>
            <a
              className="button twitter-share-btn"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                getShareText(active, `${location.origin}${projectPath(active.id, locale, import.meta.env.BASE_URL)}`)
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title={t("分享到 X")}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>{t("分享到 X")}</span>
            </a>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      <MobileWebviewBar locale={locale} />
    </>
  );
}
export default App;
