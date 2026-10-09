import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../App";
import { isLicenseValue, isCatalogClassification } from "../lib/catalog-contract.mjs";

export const CATALOG_REVALIDATE_MS = 60_000;

export function validProject(x: unknown): x is Project {
  if (!x || typeof x !== "object") return false;
  const p = x as Project;
  return (
    [
      "id",
      "name",
      "author",
      "category",
      "plainSummary",
      "jevDecisionPoint",
      "highlightBenefit",
      "url",
      "claimStatus",
      "summarySource",
    ].every((k) => typeof p[k as keyof Project] === "string") &&
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(p.url) &&
    ["stars", "forks", "openIssues"].every(
      (k) =>
        p[k as keyof Project] === null ||
        (typeof p[k as keyof Project] === "number" &&
          Number.isFinite(p[k as keyof Project]) &&
          Number(p[k as keyof Project]) >= 0),
    ) &&
    isLicenseValue(p.license) && isCatalogClassification(p) &&
    ["lastCommitAt", "createdAt"].every(
      (k) =>
        p[k as keyof Project] === null ||
        typeof p[k as keyof Project] === "string",
    ) &&
    (
      [
        "plainSummaryEn",
        "jevDecisionPointEn",
        "highlightBenefitEn",
        "claimStatusEn",
        "plainSummaryJa",
        "jevDecisionPointJa",
        "highlightBenefitJa",
        "claimStatusJa",
        "plainSummaryKo",
        "jevDecisionPointKo",
        "highlightBenefitKo",
        "claimStatusKo",
      ] as const
    ).every((k) => p[k] === undefined || typeof p[k] === "string") &&
    Array.isArray(p.tags) &&
    p.tags.every((t) => typeof t === "string") &&
    (!p.avatarUrl ||
      (typeof p.avatarUrl === "string" &&
        p.avatarUrl.startsWith("https://avatars.githubusercontent.com/"))) &&
    (!p.evidence ||
      (Array.isArray(p.evidence) &&
        p.evidence.every(
          (e) =>
            !!e &&
            typeof e === "object" &&
            typeof e.url === "string" &&
            e.url.startsWith("https://") &&
            (!e.note || typeof e.note === "string"),
        )))
  );
}

export function parseProjectSnapshot(rows: unknown): Project[] | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const validRows = rows.filter(validProject);
  return validRows.length === 0 ? null : validRows;
}

export function catalogAddedCount(
  previous: readonly Pick<Project, "id">[],
  next: readonly Pick<Project, "id">[],
): number {
  const previousIds = new Set(previous.map((project) => project.id));
  return next.reduce((count, project) => count + (previousIds.has(project.id) ? 0 : 1), 0);
}

export function catalogFingerprint(
  rows: readonly (Pick<Project, "id" | "stars" | "metadataFetchedAt"> &
    Partial<Pick<Project, "license" | "licenseStatus" | "catalogKind" | "jevRelation" | "reviewBasis">>)[],
): string {
  return rows.map((project) => JSON.stringify([project.id, project.stars, project.metadataFetchedAt,
    project.license, project.licenseStatus, project.catalogKind, project.jevRelation, project.reviewBasis])).join("\n");
}

export function shouldRevalidateCatalog(
  lastAt: number,
  now: number,
  minInterval = CATALOG_REVALIDATE_MS,
): boolean {
  return now - lastAt >= minInterval;
}

export type CatalogLoadState = "loading" | "ready" | "error";

export interface UseCatalogSWROptions {
  initialProjects?: Project[];
  revalidateInterval?: number;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface UseCatalogSWRResult {
  projects: Project[];
  loadState: CatalogLoadState;
  catalogAdded: number;
  updatedAt: string;
  retry: () => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export function useCatalogSWR(options: UseCatalogSWROptions = {}): UseCatalogSWRResult {
  const {
    initialProjects,
    revalidateInterval = CATALOG_REVALIDATE_MS,
    baseUrl = import.meta.env.BASE_URL,
    timeoutMs = 15000,
  } = options;

  const [projects, setProjects] = useState<Project[]>(() => initialProjects?.filter(validProject) ?? []);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const catalogEtagRef = useRef<string | null>(null);
  const lastCatalogRevalidateAt = useRef(0);
  const [catalogAdded, setCatalogAdded] = useState(0);
  const [loadState, setLoadState] = useState<CatalogLoadState>(
    initialProjects ? "ready" : "loading",
  );
  const [loadAttempt, setLoadAttempt] = useState(0);

  const retry = () => setLoadAttempt((n) => n + 1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const controller = new AbortController();
    let cancelled = false;

    const revalidate = (force = false) => {
      const now = Date.now();
      if (!force && !shouldRevalidateCatalog(lastCatalogRevalidateAt.current, now, revalidateInterval)) return;
      lastCatalogRevalidateAt.current = now;
      if (projectsRef.current.length === 0) setLoadState("loading");
      const headers = new Headers();
      if (catalogEtagRef.current) headers.set("If-None-Match", catalogEtagRef.current);
      fetch(`${baseUrl}projects.json`, {
        cache: "no-cache",
        headers,
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(timeoutMs)]),
      })
        .then(async (response) => {
          const etag = response.headers.get("ETag");
          if (etag) catalogEtagRef.current = etag;
          if (response.status === 304) return null;
          if (!response.ok) throw new Error("Project snapshot unavailable");
          return response.json();
        })
        .then((rows) => {
          if (cancelled || rows == null) return;
          const validRows = parseProjectSnapshot(rows);
          if (!validRows) throw new Error("Empty project snapshot");
          const previous = projectsRef.current;
          if (catalogFingerprint(previous) === catalogFingerprint(validRows)) {
            setLoadState("ready");
            return;
          }
          const added = catalogAddedCount(previous, validRows);
          setProjects(validRows);
          setLoadState("ready");
          if (added > 0 && previous.length > 0) setCatalogAdded(added);
        })
        .catch(() => {
          if (cancelled || controller.signal.aborted) return;
          if (projectsRef.current.length === 0) setLoadState("error");
        });
    };

    revalidate(true);

    const onVisibility = () => {
      if (document.visibilityState === "visible") revalidate(false);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) revalidate(false);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [loadAttempt, initialProjects, baseUrl, revalidateInterval, timeoutMs]);

  useEffect(() => {
    if (!catalogAdded) return;
    const timer = setTimeout(() => setCatalogAdded(0), 5600);
    return () => clearTimeout(timer);
  }, [catalogAdded]);

  const updatedAt = useMemo(
    () =>
      projects.reduce(
        (latest, project) =>
          project.metadataFetchedAt && project.metadataFetchedAt > latest
            ? project.metadataFetchedAt
            : latest,
        "",
      ),
    [projects],
  );

  return {
    projects,
    loadState,
    catalogAdded,
    updatedAt,
    retry,
    setProjects,
  };
}
