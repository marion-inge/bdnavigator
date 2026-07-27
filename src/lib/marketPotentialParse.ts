import * as XLSX from "xlsx";
import { parseCustomerDocx, DocxSection } from "./customerScanParse";

export interface CoverRow { label: string; value: string; }

export interface ScenarioDriver {
  driver: string;
  conservative: number | string | null;
  realistic: number | string | null;
  aggressive: number | string | null;
  basis: string;
  confidence: string;
}
export interface ScenarioResult {
  layer: string;
  conservative: number | null;
  realistic: number | null;
  aggressive: number | null;
  note: string;
}

export interface BottomUpRow {
  company: string;
  custFit: string;
  tierConf: string;
  segment: string;
  region: string;
  archetype: string;
  assetsCons: number | null;
  assetsReal: number | null;
  assetsAggr: number | null;
  priceMod: number | null;
  wrCons: number | null;
  wrReal: number | null;
  wrAggr: number | null;
  custPotCons: number | null;
  custPotReal: number | null;
  custPotAggr: number | null;
  somCons: number | null;
  somReal: number | null;
  somAggr: number | null;
}

export interface TriangulationRow {
  estimate: string;
  value: string;
  basis: string;
  recency: string;
  confidence: string;
}

export interface SensitivityRow {
  driver: string;
  low: number | null;
  high: number | null;
  swing: number | null;
  rank: number | null;
}
export interface ReachBandRow {
  band: string;
  samArr: number | null;
  somArr: number | null;
  read: string;
}

export interface AssumptionRow {
  id: string;
  area: string;
  assumption: string;
  basis: string;
  confidence: string;
  impact: string;
}

export interface BreakdownRow {
  group: string;
  accounts: number | null;
  samArr: number | null;
  somArr: number | null;
  samPct: number | null;
}
export interface BreakdownGroup {
  label: string; // By tier / segment / geography
  rows: BreakdownRow[];
}

export interface MarketPotentialData {
  cover: CoverRow[];
  headline: CoverRow[];
  scenarioDrivers: ScenarioDriver[];
  scenarioResults: ScenarioResult[];
  bottomUp: BottomUpRow[];
  triangulation: TriangulationRow[];
  reconciliationNote: string;
  sensitivity: SensitivityRow[];
  reachBands: ReachBandRow[];
  concentrationNote: string;
  assumptions: AssumptionRow[];
  breakdowns: BreakdownGroup[];
}

const num = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? n : null;
};
const str = (v: any) => (v === null || v === undefined ? "" : String(v).trim());

export async function parseMarketPotentialXlsx(blob: Blob): Promise<MarketPotentialData> {
  const buf = await blob.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = (name: string) => wb.Sheets[name];
  const rows = (name: string): any[][] => {
    const s = sheet(name);
    if (!s) return [];
    return XLSX.utils.sheet_to_json(s, { header: 1, defval: null }) as any[][];
  };

  // Cover
  const coverAll = rows("Cover");
  const cover: CoverRow[] = [];
  const headline: CoverRow[] = [];
  let inHeadline = false;
  for (const r of coverAll) {
    const label = str(r?.[0]);
    const val = str(r?.[1]);
    if (!label && !val) continue;
    if (/^HEADLINE/i.test(label)) { inHeadline = true; continue; }
    if (/^DECISION FLAG|^RETRIEVAL|CONFIDENTIAL ·/i.test(label)) { inHeadline = false; continue; }
    if (inHeadline) headline.push({ label, value: val });
    else if (val) cover.push({ label, value: val });
  }

  // Scenarios
  const sc = rows("Scenarios");
  const scenarioDrivers: ScenarioDriver[] = [];
  const scenarioResults: ScenarioResult[] = [];
  let mode: "drivers" | "results" | null = null;
  for (const r of sc) {
    const c0 = str(r?.[0]);
    if (/DRIVER ASSUMPTIONS/i.test(c0)) { mode = "drivers"; continue; }
    if (/^RESULTS/i.test(c0)) { mode = "results"; continue; }
    if (/^Driver$/i.test(c0) || /^Layer/i.test(c0)) continue;
    if (!c0) continue;
    if (mode === "drivers") {
      const val = r?.[1];
      if (val === null || val === undefined) continue;
      scenarioDrivers.push({
        driver: c0,
        conservative: typeof val === "number" ? val : str(val),
        realistic: typeof r?.[2] === "number" ? r[2] : str(r?.[2]),
        aggressive: typeof r?.[3] === "number" ? r[3] : str(r?.[3]),
        basis: str(r?.[4]),
        confidence: str(r?.[5]),
      });
    } else if (mode === "results") {
      if (num(r?.[1]) === null) continue;
      scenarioResults.push({
        layer: c0,
        conservative: num(r?.[1]),
        realistic: num(r?.[2]),
        aggressive: num(r?.[3]),
        note: str(r?.[4]),
      });
    }
  }

  // Bottom-Up Build
  const bu = rows("Bottom-Up Build");
  const bottomUp: BottomUpRow[] = [];
  let seenHeader = false;
  for (const r of bu) {
    const c0 = str(r?.[0]);
    if (!seenHeader) {
      if (/^Company$/i.test(c0)) seenHeader = true;
      continue;
    }
    if (!c0) continue;
    bottomUp.push({
      company: c0,
      custFit: str(r?.[1]),
      tierConf: str(r?.[2]),
      segment: str(r?.[3]),
      region: str(r?.[4]),
      archetype: str(r?.[5]),
      assetsCons: num(r?.[6]),
      assetsReal: num(r?.[7]),
      assetsAggr: num(r?.[8]),
      priceMod: num(r?.[9]),
      wrCons: num(r?.[10]),
      wrReal: num(r?.[11]),
      wrAggr: num(r?.[12]),
      custPotCons: num(r?.[13]),
      custPotReal: num(r?.[14]),
      custPotAggr: num(r?.[15]),
      somCons: num(r?.[16]),
      somReal: num(r?.[17]),
      somAggr: num(r?.[18]),
    });
  }

  // Triangulation
  const tr = rows("Triangulation");
  const triangulation: TriangulationRow[] = [];
  let reconciliationNote = "";
  let trSeen = false;
  for (const r of tr) {
    const c0 = str(r?.[0]);
    if (!c0) continue;
    if (/^Estimate$/i.test(c0)) { trSeen = true; continue; }
    if (/^RECONCILIATION/i.test(c0)) { reconciliationNote = c0.replace(/^RECONCILIATION\s*[—-]\s*/, ""); continue; }
    if (/CONFIDENTIAL ·/i.test(c0)) continue;
    if (!trSeen) continue;
    triangulation.push({
      estimate: c0,
      value: str(r?.[1]) || (typeof r?.[1] === "number" ? r[1].toString() : ""),
      basis: str(r?.[2]),
      recency: str(r?.[3]),
      confidence: str(r?.[4]),
    });
  }

  // Sensitivity
  const se = rows("Sensitivity");
  const sensitivity: SensitivityRow[] = [];
  const reachBands: ReachBandRow[] = [];
  let concentrationNote = "";
  let seMode: "sens" | "reach" | null = null;
  for (const r of se) {
    const c0 = str(r?.[0]);
    if (!c0) continue;
    if (/^Driver \(flex/i.test(c0)) { seMode = "sens"; continue; }
    if (/^REACH BANDS/i.test(c0)) { seMode = "reach"; continue; }
    if (/^Band$/i.test(c0)) continue;
    if (/^Concentration risk/i.test(c0)) { concentrationNote = c0; continue; }
    if (/CONFIDENTIAL ·/i.test(c0)) continue;
    if (seMode === "sens" && num(r?.[1]) !== null) {
      sensitivity.push({
        driver: c0,
        low: num(r?.[1]),
        high: num(r?.[2]),
        swing: num(r?.[3]),
        rank: num(r?.[4]),
      });
    } else if (seMode === "reach" && num(r?.[1]) !== null) {
      reachBands.push({
        band: c0,
        samArr: num(r?.[1]),
        somArr: num(r?.[2]),
        read: str(r?.[3]),
      });
    }
  }

  // Assumptions
  const asm = rows("Assumptions");
  const assumptions: AssumptionRow[] = [];
  let asmSeen = false;
  for (const r of asm) {
    const c0 = str(r?.[0]);
    if (!c0) continue;
    if (/^ID$/i.test(c0)) { asmSeen = true; continue; }
    if (/CONFIDENTIAL ·/i.test(c0)) continue;
    if (!asmSeen) continue;
    assumptions.push({
      id: c0,
      area: str(r?.[1]),
      assumption: str(r?.[2]),
      basis: str(r?.[3]),
      confidence: str(r?.[4]),
      impact: str(r?.[5]),
    });
  }

  // Breakdowns
  const bd = rows("Breakdowns");
  const breakdowns: BreakdownGroup[] = [];
  let currentGroup: BreakdownGroup | null = null;
  for (const r of bd) {
    const c0 = str(r?.[0]);
    if (!c0) continue;
    if (/^By /i.test(c0)) {
      currentGroup = { label: c0, rows: [] };
      breakdowns.push(currentGroup);
      continue;
    }
    if (/^Group$/i.test(c0)) continue;
    if (/CONFIDENTIAL ·/i.test(c0)) continue;
    if (/^Breakdowns/i.test(c0)) continue;
    if (currentGroup && num(r?.[1]) !== null) {
      currentGroup.rows.push({
        group: c0,
        accounts: num(r?.[1]),
        samArr: num(r?.[2]),
        somArr: num(r?.[3]),
        samPct: num(r?.[4]),
      });
    }
  }

  return {
    cover, headline, scenarioDrivers, scenarioResults, bottomUp,
    triangulation, reconciliationNote, sensitivity, reachBands, concentrationNote,
    assumptions, breakdowns,
  };
}

export { parseCustomerDocx };
export type { DocxSection };
