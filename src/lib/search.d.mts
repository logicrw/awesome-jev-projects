import type { LicenseValue, CatalogClassification } from './catalog-contract.mjs';
/** Only textual properties are indexed; numeric source locations are ignored. */
export interface SearchEvidence {
  readonly url?: string;
  readonly note?: string;
  readonly text?: string;
  readonly snippet?: string;
}
export type SearchEvidenceLine = string | number | Pick<SearchEvidence, 'text' | 'snippet'>;

/** Optional metadata understood by the index. Kept separate from the legacy
 * generic constraint: old records may use these names for unrelated values.
 * New callers can opt into SearchableProject & SearchMetadata validation.
 */
export interface SearchMetadata {
  readonly topics?: readonly string[];
  readonly description?: string;
  readonly repoDescription?: string;
  readonly repositoryDescription?: string;
  readonly evidenceLines?: string | readonly SearchEvidenceLine[];
  readonly evidence?: readonly SearchEvidence[];
}

export interface SearchableProject extends CatalogClassification {
  id: string;
  name?: string;
  author?: string;
  url?: string;
  category?: string;
  language?: string | null;
  tags?: readonly string[];
  plainSummary?: string;
  plainSummaryEn?: string;
  plainSummaryJa?: string;
  plainSummaryKo?: string;
  jevDecisionPoint?: string;
  jevDecisionPointEn?: string;
  jevDecisionPointJa?: string;
  jevDecisionPointKo?: string;
  highlightBenefit?: string;
  highlightBenefitEn?: string;
  highlightBenefitJa?: string;
  highlightBenefitKo?: string;
  stars?: number | null;
  createdAt?: string | null;
  lastCommitAt?: string | null;
  license?: LicenseValue;
  licenseStatus?: string;
}
/** Opaque index: construct with createProjectSearch, retain across queries. */
export interface ProjectSearch<T extends SearchableProject> {
  readonly projects: readonly T[];
}
export type QuickFilter = 'all' | 'popular' | 'rising' | 'commercial';
export type BrowseSort = 'stars' | 'created' | 'newest' | 'updated';
export function createProjectSearch<T extends SearchableProject>(projects: readonly T[]): ProjectSearch<T>;
export function searchProjects<T extends SearchableProject>(index: ProjectSearch<T>, query: string): T[];
export function browseSort<T extends SearchableProject>(projects: readonly T[], mode?: BrowseSort): T[];
export function matchesQuickFilter(project: SearchableProject, mode?: QuickFilter, now?: Date | number | string): boolean;
