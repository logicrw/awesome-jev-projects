export type CatalogLocale = "zh" | "en" | "ja" | "ko";
export type LicenseFacts = ({ status: "identified"; spdx: string } |
  { status: "custom" | "undeclared"; spdx: null }) & {
  name?: string;
  url?: string;
};
export type LicenseValue = LicenseFacts | string | null;
export type CatalogKind = "learning-resource" | "benchmark" | "integration" | "developer-tool" | "research" | "other";
export type JevRelation = "implemented" | "described" | "discussed" | "unrelated" | "uncertain";
export type ReviewBasis = "implementation-material" | "descriptive-material" | "mixed";
export interface CatalogClassification { catalogKind?: CatalogKind; jevRelation?: JevRelation; reviewBasis?: ReviewBasis }
export const catalogKinds: readonly CatalogKind[];
export const jevRelations: readonly JevRelation[];
export const reviewBases: readonly ReviewBasis[];
export function normalizeLicenseFacts(value: unknown, legacyStatus?: string): LicenseFacts;
export function licenseFactsFromRepo(repo: unknown): LicenseFacts;
export function isLicenseValue(value: unknown): value is LicenseValue;
export function licenseSpdx(value: unknown, legacyStatus?: string): string | null;
export function licenseLabel(value: unknown, locale?: CatalogLocale, legacyStatus?: string): string;
export function isCatalogClassification(project: Record<string, unknown> | CatalogClassification): boolean;
export function catalogLabels(project: CatalogClassification, locale?: CatalogLocale): { field: keyof CatalogClassification; label: string; value: string }[];
