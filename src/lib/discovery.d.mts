import type { LicenseValue, CatalogClassification } from './catalog-contract.mjs';
export interface DiscoverableProject extends CatalogClassification {
  id: string;
  stars?: number | null;
  catalogStatus?: string;
  licenseStatus?: string;
  license?: LicenseValue;
  url?: string;
}
export function eligibleProjects<T extends DiscoverableProject>(projects: readonly T[]): T[];
export function utcDay(date?: Date): string;
export function nextUtcMidnightDelay(date?: Date): number;
export function localDay(date?: Date): string;
export function nextLocalMidnightDelay(date?: Date): number;
export function dailyProject<T extends DiscoverableProject>(projects: readonly T[], day: string): T | null;
export function drawProject<T extends DiscoverableProject>(projects: readonly T[], previousId?: string, randomValue?: number): T | null;
export function rarity(project: DiscoverableProject): 'ssr' | 'rising';
