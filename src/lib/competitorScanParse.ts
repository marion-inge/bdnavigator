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
  // --- richer profile fields -------------------------------------------------
  description: string;
  offering: string;
  strengths: string;
  weaknesses: string;
  differentiation: string;
  pricing: string;
  businessModel: string;
  revenue: string;
  employees: string;
  founded: string;
  website: string;
  references: string;
  strategySignals: string;
  threatLevel: string;
  recency: string;
  notes: string;
  /** Every column that is not mapped above, preserved verbatim. */
  extra: { label: string; value: string }[];
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

import {
  findSheetName, sheetRows, findHeaderRow, buildColMap, dataRows, cell, cellNum, str, num, norm,
} from "./xlsxParseUtils";

export async function parseCompetitorXlsx(file: Blob): Promise<CompetitorScanData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const excluded = /assumption|watch|benchmark|share|win|trend|source|summary|methodolog|framework|cover|read\s*me/i;

  // --- Competitor Database --------------------------------------------------
  const dbSheet =
    findSheetName(wb, [/competitor\s*database/i, /competitor/i, /longlist|shortlist/i, /database|db\b/i]) ||
    wb.SheetNames.find((n) => !excluded.test(n));
  const dbRows = sheetRows(wb, dbSheet);
  const dbHdr = findHeaderRow(dbRows, [
    "company", "competitor", "tier", "camp", "regions", "momentum", "discovery method", "overlap",
  ]);
  const dbMap = buildColMap(dbRows[dbHdr] || []);
  const dbHeader = (dbRows[dbHdr] || []).map(str);
  const competitors: CompetitorRow[] = [];
  let shortlistMode = true;
  for (const r of dataRows(dbRows, dbHdr)) {
    const used = new Set<number>();
    const g = (aliases: string[], strict = false) => {
      const i = strict ? exactIndex(dbMap, aliases) : colIndex(dbMap, aliases);
      if (i >= 0) used.add(i);
      return i >= 0 ? str(r[i]) : "";
    };
    const gn = (aliases: string[]) => {
      const i = colIndex(dbMap, aliases);
      if (i >= 0) used.add(i);
      return i >= 0 ? num(r[i]) : null;
    };

    const company = g(["company", "competitor", "name", "organisation", "organization"]) || str(r[0]);
    if (!company) continue;
    if (/watch\s*list/i.test(company)) { shortlistMode = false; continue; }
    if (/^(company|competitor|name)$/i.test(company)) continue;
    const decision = g(["shortlist decision", "decision", "status"]);
    const row: CompetitorRow = {
      company,
      camp: g(["camp", "group", "category", "archetype"]),
      tier: g(["competitor tier", "tier"]).replace(/\s*\(.*\)/, "").trim(),
      tierConfidence: g(["tier confidence", "confidence"]),
      O: gn(["offering overlap", "overlap score", "o score", "o"]),
      P: gn(["market presence", "presence", "p score", "p"]),
      E: gn(["encounter evidence", "encounter", "e score", "e"]),
      shortlistScore: gn(["shortlist score", "score", "total"]),
      shortlistDecision: decision,
      hq: g(["hq", "headquarters", "country", "location"]),
      ownership: g(["ownership", "owner", "listed"]),
      regions: g(["regions", "region", "geography", "markets served"]),
      momentum: g(["momentum", "trend"]),
      discoveryMethod: g(["discovery method", "discovery"]),
      assumptionIds: g(["assumption ids", "assumption id", "assumptions"]),
      overlap: g(["offering overlap note", "overlap note", "offering description", "offering summary", "overlap comment"], true),
      source: g(["source", "sources", "evidence"]),
      description: g(["description", "company description", "profile", "summary", "about", "what they do"]),
      offering: g(["offering", "products", "product", "product portfolio", "solutions", "key products"]),
      strengths: g(["strengths", "strength", "key strengths"]),
      weaknesses: g(["weaknesses", "weakness", "gaps", "limitations"]),
      differentiation: g(["differentiation", "differentiator", "usp", "value proposition", "positioning"]),
      pricing: g(["pricing", "price", "price level", "pricing signals", "price point"]),
      businessModel: g(["business model", "revenue model", "model"]),
      revenue: g(["revenue", "turnover", "sales", "segment revenue"]),
      employees: g(["employees", "headcount", "staff", "size"]),
      founded: g(["founded", "year founded", "established"]),
      website: g(["website", "url", "web", "homepage"]),
      references: g(["reference customers", "references", "customers", "installed base", "key accounts", "proof"]),
      strategySignals: g(["strategy signals", "strategic signals", "signals", "strategy", "recent moves", "m&a"]),
      threatLevel: g(["threat", "threat level", "risk"]),
      recency: g(["recency", "recency flag", "as of", "last verified", "date"]),
      notes: g(["notes", "note", "comment", "comments", "remarks"]),
      extra: [],
      isShortlist: shortlistMode && !/watch|excluded/i.test(decision),
    };
    row.extra = dbHeader
      .map((h, i) => ({ label: h, value: str(r[i]) }))
      .filter((x, i) => x.label && x.value && !used.has(i));
    competitors.push(row);
  }


  // --- Watch List -----------------------------------------------------------
  const watchRows = sheetRows(wb, findSheetName(wb, [/watch/i]));
  const watchHdr = findHeaderRow(watchRows, ["company", "camp", "reason", "o", "p", "e"]);
  const watchMap = buildColMap(watchRows[watchHdr] || []);
  const watch: WatchRow[] = dataRows(watchRows, watchHdr)
    .map((r) => ({
      company: cell(r, watchMap, ["company", "competitor", "name"]),
      camp: cell(r, watchMap, ["camp", "group", "category"]),
      O: cellNum(r, watchMap, ["offering overlap", "o"]),
      P: cellNum(r, watchMap, ["market presence", "p"]),
      E: cellNum(r, watchMap, ["encounter evidence", "e"]),
      reason: cell(r, watchMap, ["reason", "why watched", "rationale", "note"]),
    }))
    .filter((r) => r.company && !/^company$/i.test(r.company));

  // --- Benchmarking Matrix --------------------------------------------------
  const bmRows = sheetRows(wb, findSheetName(wb, [/benchmark/i, /matrix/i]));
  const bmHdrIdx = findHeaderRow(bmRows, ["criterion", "criteria", "category"]);
  let bmCompetitors: string[] = [];
  const criteria: BenchmarkCriterion[] = [];
  if (bmHdrIdx >= 0) {
    const hdr = (bmRows[bmHdrIdx] || []).map(str);
    const meta = new Set(["criterion", "criteria", "category", "weight", "notes"]);
    const isRef = (h: string) => /ref|client|our|baseline/i.test(h);
    const compCols: { name: string; idx: number }[] = [];
    let refIdx = -1;
    hdr.forEach((h, i) => {
      const n = norm(h);
      if (!h) return;
      if (meta.has(n)) return;
      if (refIdx < 0 && isRef(h)) { refIdx = i; return; }
      compCols.push({ name: h, idx: i });
    });
    bmCompetitors = compCols.map((c) => c.name);
    const critIdx = hdr.findIndex((h) => /criteri/i.test(h));
    const catIdx = hdr.findIndex((h) => /categor/i.test(h));
    for (const r of dataRows(bmRows, bmHdrIdx)) {
      const criterion = str(r[critIdx >= 0 ? critIdx : 0]);
      if (!criterion) continue;
      const scores: Record<string, string> = {};
      compCols.forEach((c) => { scores[c.name] = str(r[c.idx]); });
      criteria.push({
        criterion,
        category: catIdx >= 0 ? str(r[catIdx]) : "",
        ref: refIdx >= 0 ? str(r[refIdx]) : "",
        scores,
      });
    }
  }

  // --- Market Share ---------------------------------------------------------
  const msRows = sheetRows(wb, findSheetName(wb, [/market\s*share/i, /share/i]));
  const marketShareContext: { label: string; value: string }[] = [];
  const marketShare: MarketShareRow[] = [];
  const msHdrIdx = findHeaderRow(msRows, ["competitor", "share", "method", "confidence"]);
  for (let i = 0; i < (msHdrIdx >= 0 ? msHdrIdx : msRows.length); i++) {
    const label = str(msRows[i]?.[0]); const val = str(msRows[i]?.[1]);
    if (label && val && !/shares stated/i.test(label) && !/market share/i.test(label)) {
      marketShareContext.push({ label, value: val });
    }
  }
  if (msHdrIdx >= 0) {
    const msMap = buildColMap(msRows[msHdrIdx] || []);
    for (const r of dataRows(msRows, msHdrIdx)) {
      const comp = cell(r, msMap, ["competitor", "competitor group", "company", "player"]) || str(r[0]);
      if (!comp) continue;
      if (/reconciliation/i.test(comp)) {
        marketShareContext.push({ label: comp, value: str(r[1]) });
        continue;
      }
      marketShare.push({
        competitor: comp,
        share: cell(r, msMap, ["share", "share range", "estimate"]),
        method: cell(r, msMap, ["method", "method tag"]),
        confidence: cell(r, msMap, ["confidence"]),
        basis: cell(r, msMap, ["basis", "evidence", "source", "note"]),
      });
    }
  }

  // --- Win-Rate Modifiers ---------------------------------------------------
  const wrRows = sheetRows(wb, findSheetName(wb, [/win\s*-?\s*rate/i, /modifier/i]));
  const wrHdr = findHeaderRow(wrRows, ["segment", "region", "density", "modifier"]);
  const wrMap = buildColMap(wrRows[wrHdr] || []);
  const winRate: WinRateRow[] = dataRows(wrRows, wrHdr)
    .map((r) => ({
      segment: cell(r, wrMap, ["segment"]),
      region: cell(r, wrMap, ["region", "geography"]),
      density: cell(r, wrMap, ["density", "competitive density"]),
      gaining: cell(r, wrMap, ["gaining", "gaining competitor", "momentum"]),
      modifier: cellNum(r, wrMap, ["modifier", "win rate modifier"]) ?? cell(r, wrMap, ["modifier"]),
      confidence: cell(r, wrMap, ["confidence"]),
      basis: cell(r, wrMap, ["basis", "rationale", "note", "assumption"]),
    }))
    .filter((r) => r.segment && !/^note$/i.test(r.segment));

  // --- Trends ---------------------------------------------------------------
  const trRows = sheetRows(wb, findSheetName(wb, [/trend/i, /signal/i]));
  const trHdr = findHeaderRow(trRows, ["competitor", "momentum", "direction", "signal"]);
  const trMap = buildColMap(trRows[trHdr] || []);
  const trends: TrendRow[] = [];
  const convergent: ConvergentTrend[] = [];
  let convergentMode = false;
  for (const r of dataRows(trRows, trHdr)) {
    const a = cell(r, trMap, ["competitor", "company", "trend"]) || str(r[0]);
    if (!a) continue;
    if (/convergent trends/i.test(a)) { convergentMode = true; continue; }
    if (convergentMode) {
      convergent.push({ trend: a, detail: str(r[1]) });
    } else {
      trends.push({
        competitor: a,
        momentum: cell(r, trMap, ["momentum"]) || str(r[1]),
        direction: cell(r, trMap, ["direction", "strategic direction", "signal"]) || str(r[2]),
      });
    }
  }

  // --- Assumptions ----------------------------------------------------------
  const asRows = sheetRows(wb, findSheetName(wb, [/assumption/i]));
  const asHdr = findHeaderRow(asRows, ["id", "area", "assumption", "basis", "confidence", "impact"]);
  const asMap = buildColMap(asRows[asHdr] || []);
  const assumptions: AssumptionRow[] = dataRows(asRows, asHdr)
    .map((r) => ({
      id: cell(r, asMap, ["id", "assumption id"]),
      area: cell(r, asMap, ["area", "topic"]),
      assumption: cell(r, asMap, ["assumption", "description"]),
      basis: cell(r, asMap, ["basis", "evidence", "rationale"]),
      confidence: cell(r, asMap, ["confidence"]),
      impact: cell(r, asMap, ["impact", "affects"]),
    }))
    .filter((r) => r.id || r.assumption);

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

