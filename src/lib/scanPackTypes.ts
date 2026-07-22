// Scan Pack data model — persists the five market-intelligence scans + assembler
// as a per-idea execution layer downstream of the Hypothesis Builder.

import type { HypothesisData } from "./hypothesisTypes";

export type ScanPackKey =
  | "industry"
  | "customer"
  | "competitor"
  | "market_potential"
  | "buying_center"
  | "assembler";

export const SCAN_PACK_KEYS: ScanPackKey[] = [
  "industry",
  "customer",
  "competitor",
  "market_potential",
  "buying_center",
  "assembler",
];

export const NON_ASSEMBLER_KEYS: Exclude<ScanPackKey, "assembler">[] = [
  "industry",
  "customer",
  "competitor",
  "market_potential",
  "buying_center",
];

export type ScanStatus = "not_started" | "intake_ready" | "running" | "done";

export interface ScanFileMeta {
  id: string;
  name: string;
  path: string;
  size: number;
  mime: string;
  uploadedAt: string;
}

export interface ScanCardState {
  status: ScanStatus;
  startedAt?: string;
  completedAt?: string;
  summary: string;
  keyFindings: string[];
  files: ScanFileMeta[];
  updatedAt: string;
}

export type ScanPackData = Record<ScanPackKey, ScanCardState>;

export function createDefaultScanCard(): ScanCardState {
  return {
    status: "not_started",
    summary: "",
    keyFindings: [],
    files: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultScanPack(): ScanPackData {
  return {
    industry: createDefaultScanCard(),
    customer: createDefaultScanCard(),
    competitor: createDefaultScanCard(),
    market_potential: createDefaultScanCard(),
    buying_center: createDefaultScanCard(),
    assembler: createDefaultScanCard(),
  };
}

/** Recommended dependency order (soft, except assembler which is hard-gated). */
export const SCAN_RECOMMENDED_PREDECESSORS: Record<ScanPackKey, ScanPackKey[]> = {
  industry: [],
  customer: ["industry"],
  competitor: ["industry"],
  market_potential: ["customer"],
  buying_center: ["customer"],
  assembler: ["industry", "customer", "competitor", "market_potential", "buying_center"],
};

export const SCAN_ORDER_BADGE: Record<ScanPackKey, string> = {
  industry: "1",
  customer: "2",
  competitor: "3a",
  market_potential: "3b",
  buying_center: "3c",
  assembler: "4",
};

/** Which hypothesis section maps to which scan (assembler = no intake). */
export function hypothesisSectionExists(h: HypothesisData | undefined, scan: ScanPackKey): boolean {
  if (!h) return false;
  switch (scan) {
    case "industry": return !!h.industry;
    case "customer": return !!h.customer;
    case "competitor": return !!h.competitor;
    case "market_potential": return !!h.marketPotential;
    case "buying_center": return !!h.buyingCenter;
    case "assembler": return false;
  }
}

/** Automatic status upgrade: bump not_started → intake_ready when hypothesis section exists. */
export function autoUpgradeStatuses(pack: ScanPackData, h: HypothesisData | undefined): ScanPackData {
  const next: ScanPackData = { ...pack };
  for (const k of NON_ASSEMBLER_KEYS) {
    if (next[k].status === "not_started" && hypothesisSectionExists(h, k)) {
      next[k] = { ...next[k], status: "intake_ready" };
    }
  }
  return next;
}

export function progressCounts(pack: ScanPackData | undefined) {
  if (!pack) return { done: 0, total: 6 };
  const done = SCAN_PACK_KEYS.filter((k) => pack[k].status === "done").length;
  return { done, total: 6 };
}
