// ============================================================
// IP-NEXUS - COMPLETE GLOBAL IPO OFFICES CATALOG
// 190+ countries and territories with IP offices
// ============================================================

export * from './types';
export { INTERNATIONAL_OFFICES } from './international';
export { EUROPE_OFFICES } from './europe';
export { AMERICAS_OFFICES } from './americas';
export { ASIA_PACIFIC_OFFICES } from './asia-pacific';
export { MIDDLE_EAST_OFFICES } from './middle-east';
export { AFRICA_OFFICES } from './africa';

import { IPOOfficeData } from './types';
import { INTERNATIONAL_OFFICES } from './international';
import { EUROPE_OFFICES } from './europe';
import { AMERICAS_OFFICES } from './americas';
import { ASIA_PACIFIC_OFFICES } from './asia-pacific';
import { MIDDLE_EAST_OFFICES } from './middle-east';
import { AFRICA_OFFICES } from './africa';

// Complete catalog of all global IP offices
export const ALL_IPO_OFFICES: IPOOfficeData[] = [
  ...INTERNATIONAL_OFFICES,
  ...EUROPE_OFFICES,
  ...AMERICAS_OFFICES,
  ...ASIA_PACIFIC_OFFICES,
  ...MIDDLE_EAST_OFFICES,
  ...AFRICA_OFFICES,
];

// Get office by code
export function getOfficeByCode(code: string): IPOOfficeData | undefined {
  return ALL_IPO_OFFICES.find(o => o.code === code || o.codeAlt === code);
}

// Get offices by region
export function getOfficesByRegion(region: string): IPOOfficeData[] {
  return ALL_IPO_OFFICES.filter(o => o.region === region);
}

// Get offices by tier
export function getOfficesByTier(tier: 1 | 2 | 3): IPOOfficeData[] {
  return ALL_IPO_OFFICES.filter(o => o.tier === tier);
}

// Statistics
export function getOfficeStats() {
  return {
    total: ALL_IPO_OFFICES.length,
    byTier: {
      tier1: ALL_IPO_OFFICES.filter(o => o.tier === 1).length,
      tier2: ALL_IPO_OFFICES.filter(o => o.tier === 2).length,
      tier3: ALL_IPO_OFFICES.filter(o => o.tier === 3).length,
    },
    byRegion: {
      europe: EUROPE_OFFICES.length,
      americas: AMERICAS_OFFICES.length,
      asia_pacific: ASIA_PACIFIC_OFFICES.length,
      middle_east: MIDDLE_EAST_OFFICES.length,
      africa: AFRICA_OFFICES.length,
      international: INTERNATIONAL_OFFICES.length,
    },
    madridMembers: ALL_IPO_OFFICES.filter(o => o.isMadridMember).length,
    pctMembers: ALL_IPO_OFFICES.filter(o => o.isPctMember).length,
    withApi: ALL_IPO_OFFICES.filter(o => o.hasApi).length,
    withEFiling: ALL_IPO_OFFICES.filter(o => o.eFilingAvailable).length,
  };
}

console.log('📊 IPO Offices Catalog loaded:', getOfficeStats());
