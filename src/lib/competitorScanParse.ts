import * as XLSX from "xlsx";

export interface CompetitorRow {
  company: string;
  camp: string;
  tier: string;          // A / B / C / D
  tierConfidence: string;
  O: number | null;
  P: number | null;
  E: number | null;
  shortlistScore: number | null;
  shortlistDecision: string;
  hq: string;
  ownership: string;
  regions: string;
  momentum: string;      // GAINING / HOLDING / LOSING
  discoveryMethod: string;
  assumptionIds: string;
  overlap: string;
  source: string;
  isShortlist: boolean;
}

export interface BenchmarkCriterion {
  criterion: string;
  category: string;
  ref: string;
  scores: Record<string, string>; // competitor -> ++, +, =, -, --, ?
}

export interface MarketShareRow {
  competitor: string;
  share: string;
  method: string;
  confidence: string;
  basis: string;
}

export interface WinRateRow {
  segment: string;
  region: string;
  density: string;
  gaining: string;
  modifier: number | string;
  confidence: string;
  basis: string;
}

export interface TrendRow {
  competitor: string;
  momentum: string;
  direction: string;
}

export interface ConvergentTrend {
  trend: string;
  detail: string;
}

export interface WatchRow {
  company: string;
  camp: string;
  O: number | null;
  P: number | null;
  E: number | null;
  reason: string;
}

export interface AssumptionRow {
  id: string;
  area: string;
  assumption: string;
  basis: string;
  confidence: string;
  impact: string;
}

export interface CompetitorScanData {
  competitors: CompetitorRow[];
  watch: WatchRow[];
  benchmarking: {
    competitors: string[];
    criteria: BenchmarkCriterion[];
  };
  marketShareContext: { label: string; value: string }[];
  marketShare: MarketShareRow[];
  winRate: WinRateRow[];
  trends: TrendRow[];
  convergent: ConvergentTrend[];
  assumptions: AssumptionRow[];
}

const num = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v: any) => (v === null || v === undefined ? "" : String(v).trim());

function sheetRows(wb: XLSX.WorkBook, name: string): any[][] {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
}

export async function parseCompetitorXlsx(file: Blob): Promise<CompetitorScanData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  // --- Competitor Database (headers at row 3, data from row 4). Watch marker at some row breaks it into shortlist vs watch pre-list.
  const dbRows = sheetRows(wb, "Competitor Database");
  const competitors: CompetitorRow[] = [];
  let shortlistMode = true;
  const headerIdx = dbRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "company");
  if (headerIdx >= 0) {
    for (let i = headerIdx + 1; i < dbRows.length; i++) {
      const r = dbRows[i];
      const first = str(r[0]);
      if (!first) continue;
      if (/watch list/i.test(first)) { shortlistMode = false; continue; }
      competitors.push({
        company: first,
        camp: str(r[1]),
        tier: str(r[2]).replace(/\s*\(.*\)/, "").trim(),
        tierConfidence: str(r[3]),
        O: num(r[4]),
        P: num(r[5]),
        E: num(r[6]),
        shortlistScore: num(r[7]),
        shortlistDecision: str(r[8]),
        hq: str(r[9]),
        ownership: str(r[10]),
        regions: str(r[11]),
        momentum: str(r[12]),
        discoveryMethod: str(r[13]),
        assumptionIds: str(r[14]),
        overlap: str(r[15]),
        source: str(r[16]),
        isShortlist: shortlistMode,
      });
    }
  }

  // --- Watch List sheet
  const watchRows = sheetRows(wb, "Watch List");
  const watchHdr = watchRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "company");
  const watch: WatchRow[] = [];
  if (watchHdr >= 0) {
    for (let i = watchHdr + 1; i < watchRows.length; i++) {
      const r = watchRows[i];
      if (!str(r[0])) continue;
      watch.push({
        company: str(r[0]),
        camp: str(r[1]),
        O: num(r[2]),
        P: num(r[3]),
        E: num(r[4]),
        reason: str(r[5]),
      });
    }
  }

  // --- Benchmarking Matrix
  const bmRows = sheetRows(wb, "Benchmarking Matrix");
  const bmHdrIdx = bmRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "criterion");
  let bmCompetitors: string[] = [];
  const criteria: BenchmarkCriterion[] = [];
  if (bmHdrIdx >= 0) {
    const hdr = bmRows[bmHdrIdx];
    // columns 0=Criterion, 1=Category, 2=AVL ref, 3.. = competitors
    bmCompetitors = hdr.slice(3).map(str).filter(Boolean);
    for (let i = bmHdrIdx + 1; i < bmRows.length; i++) {
      const r = bmRows[i];
      const criterion = str(r[0]);
      if (!criterion) continue;
      const scores: Record<string, string> = {};
      bmCompetitors.forEach((c, idx) => { scores[c] = str(r[3 + idx]); });
      criteria.push({ criterion, category: str(r[1]), ref: str(r[2]), scores });
    }
  }

  // --- Market Share
  const msRows = sheetRows(wb, "Market Share Model");
  const marketShareContext: { label: string; value: string }[] = [];
  const marketShare: MarketShareRow[] = [];
  const msHdrIdx = msRows.findIndex((r) => /competitor\s*\/\s*group/i.test(String(r?.[0] ?? "")));
  // context = rows before header where col A is a label and col B is text
  for (let i = 0; i < (msHdrIdx >= 0 ? msHdrIdx : msRows.length); i++) {
    const label = str(msRows[i]?.[0]); const val = str(msRows[i]?.[1]);
    if (label && val && !/shares stated/i.test(label) && !/market share/i.test(label)) {
      marketShareContext.push({ label, value: val });
    }
  }
  if (msHdrIdx >= 0) {
    for (let i = msHdrIdx + 1; i < msRows.length; i++) {
      const r = msRows[i];
      const comp = str(r[0]);
      if (!comp) continue;
      if (/reconciliation/i.test(comp)) {
        marketShareContext.push({ label: comp, value: str(r[1]) });
        continue;
      }
      marketShare.push({
        competitor: comp,
        share: str(r[1]),
        method: str(r[2]),
        confidence: str(r[3]),
        basis: str(r[4]),
      });
    }
  }

  // --- Win-Rate Modifiers
  const wrRows = sheetRows(wb, "Win-Rate Modifiers");
  const wrHdr = wrRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "segment");
  const winRate: WinRateRow[] = [];
  if (wrHdr >= 0) {
    for (let i = wrHdr + 1; i < wrRows.length; i++) {
      const r = wrRows[i];
      const seg = str(r[0]);
      if (!seg || /^note$/i.test(seg)) continue;
      winRate.push({
        segment: seg,
        region: str(r[1]),
        density: str(r[2]),
        gaining: str(r[3]),
        modifier: num(r[4]) ?? str(r[4]),
        confidence: str(r[5]),
        basis: str(r[6]),
      });
    }
  }

  // --- Trends
  const trRows = sheetRows(wb, "Trends & Signals");
  const trHdr = trRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "competitor");
  const trends: TrendRow[] = [];
  const convergent: ConvergentTrend[] = [];
  let convergentMode = false;
  if (trHdr >= 0) {
    for (let i = trHdr + 1; i < trRows.length; i++) {
      const r = trRows[i];
      const a = str(r[0]);
      if (!a) continue;
      if (/convergent trends/i.test(a)) { convergentMode = true; continue; }
      if (convergentMode) {
        convergent.push({ trend: a, detail: str(r[1]) });
      } else {
        trends.push({ competitor: a, momentum: str(r[1]), direction: str(r[2]) });
      }
    }
  }

  // --- Assumptions
  const asRows = sheetRows(wb, "Assumptions");
  const asHdr = asRows.findIndex((r) => String(r?.[0] ?? "").toLowerCase() === "id");
  const assumptions: AssumptionRow[] = [];
  if (asHdr >= 0) {
    for (let i = asHdr + 1; i < asRows.length; i++) {
      const r = asRows[i];
      if (!str(r[0])) continue;
      assumptions.push({
        id: str(r[0]),
        area: str(r[1]),
        assumption: str(r[2]),
        basis: str(r[3]),
        confidence: str(r[4]),
        impact: str(r[5]),
      });
    }
  }

  return {
    competitors,
    watch,
    benchmarking: { competitors: bmCompetitors, criteria },
    marketShareContext,
    marketShare,
    winRate,
    trends,
    convergent,
    assumptions,
  };
}
