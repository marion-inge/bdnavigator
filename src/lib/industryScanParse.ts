import * as XLSX from "xlsx";
import JSZip from "jszip";
import { parseCustomerDocx, DocxSection } from "./customerScanParse";

export interface PlayerRow {
  company: string;
  tier: string;
  tierConfidence: string;
  segment: string;
  country: string;
  region: string;
  valueChainLayer: string;
  subRole: string;
  portfolioFit: string;
  kind: string; // customer / competitor / partner...
  discoveryMethod: string;
  notes: string;
  source: string;
}

export interface MarketSizingRow {
  segment: string;
  region: string;
  baseYearSizeUsdBn: number | null;
  baseYear: string;
  cagrConservative: number | null;
  cagrRealistic: number | null;
  cagrAggressive: number | null;
  cagrConfidence: string;
  addressableShare: string;
  segmentShare: string;
  competitiveDensity: string;
  notes: string;
  source: string;
}

export interface FrameworkRow {
  framework: string;
  item: string;
  category: string;
  region: string;
  description: string;
  direction: string;
  feeds: string;
  confidence: string;
  source: string;
}

export interface IndustryScanXlsxData {
  players: PlayerRow[];
  marketSizing: MarketSizingRow[];
  frameworks: FrameworkRow[];
  portfolioSegment: { offering: string; cells: { segment: string; assessment: string }[] }[];
  methodology: { item: string; detail: string }[];
  summaryRows: string[];
}

const norm = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function pick(row: any, keys: string[]): string {
  for (const k of Object.keys(row)) {
    if (keys.includes(norm(k))) return String(row[k] ?? "").trim();
  }
  return "";
}

function toNum(v: string): number | null {
  if (!v) return null;
  const cleaned = v.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function parseIndustryXlsx(file: Blob): Promise<IndustryScanXlsxData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const find = (rx: RegExp) => wb.SheetNames.find((n) => rx.test(n));

  const playerSheet = find(/player|company|database/i);
  const sizingSheet = find(/sizing|market.?sizing/i);
  const frameworkSheet = find(/framework|strategic/i);
  const portfolioSheet = find(/portfolio.*segment/i);
  const methodSheet = find(/method/i);
  const summarySheet = find(/summary/i);

  const players: PlayerRow[] = playerSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[playerSheet], { defval: "" }) as any[])
        .map((r) => ({
          company: pick(r, ["company", "companyname", "name"]),
          tier: (pick(r, ["clientfittier", "tier", "fittier"]).toUpperCase().charAt(0) || ""),
          tierConfidence: pick(r, ["tierconfidence"]),
          segment: pick(r, ["segmentresearchsource", "segment"]),
          country: pick(r, ["country"]),
          region: pick(r, ["region", "geography"]),
          valueChainLayer: pick(r, ["valuechainlayer", "layer"]),
          subRole: pick(r, ["subrole"]),
          portfolioFit: pick(r, ["portfoliofit"]),
          kind: pick(r, ["kind", "type"]),
          discoveryMethod: pick(r, ["discoverymethod"]),
          notes: pick(r, ["notes"]),
          source: pick(r, ["sourceevidencetierrecency", "source", "sources"]),
        }))
        .filter((r) => r.company)
    : [];

  const marketSizing: MarketSizingRow[] = sizingSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[sizingSheet], { defval: "" }) as any[])
        .map((r) => ({
          segment: pick(r, ["segment"]),
          region: pick(r, ["regionorblended", "region"]),
          baseYearSizeUsdBn: toNum(pick(r, ["baseyearmarketsizeusdbn", "baseyearsizeusdbn", "marketsizeusdbn"])),
          baseYear: pick(r, ["baseyear"]),
          cagrConservative: toNum(pick(r, ["cagrconservative"])),
          cagrRealistic: toNum(pick(r, ["cagrrealistic"])),
          cagrAggressive: toNum(pick(r, ["cagraggressive"])),
          cagrConfidence: pick(r, ["cagrconfidence"]),
          addressableShare: pick(r, ["addressableshareread", "addressableshare"]),
          segmentShare: pick(r, ["segmentsharenote", "segmentshare"]),
          competitiveDensity: pick(r, ["competitivedensityread", "competitivedensity"]),
          notes: pick(r, ["notes"]),
          source: pick(r, ["sourcetierrecency", "source"]),
        }))
        .filter((r) => r.segment)
    : [];

  const frameworks: FrameworkRow[] = frameworkSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[frameworkSheet], { defval: "" }) as any[])
        .map((r) => ({
          framework: pick(r, ["framework"]),
          item: pick(r, ["item"]),
          category: pick(r, ["categoryforcequadrant", "category"]),
          region: pick(r, ["regionscope", "region"]),
          description: pick(r, ["description"]),
          direction: pick(r, ["direction"]),
          feeds: pick(r, ["feeds"]),
          confidence: pick(r, ["confidence"]),
          source: pick(r, ["sourcetierrecency", "source"]),
        }))
        .filter((r) => r.framework || r.item)
    : [];

  let portfolioSegment: IndustryScanXlsxData["portfolioSegment"] = [];
  if (portfolioSheet) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[portfolioSheet], { header: 1, defval: "" }) as any[][];
    if (rows.length >= 2) {
      const header = rows[0].map((h) => String(h ?? "").trim());
      portfolioSegment = rows.slice(1).filter((r) => r[0]).map((r) => ({
        offering: String(r[0]),
        cells: header.slice(1).map((seg, i) => ({ segment: seg, assessment: String(r[i + 1] ?? "") })).filter((c) => c.segment),
      }));
    }
  }

  const methodology = methodSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[methodSheet], { defval: "" }) as any[])
        .map((r) => ({ item: pick(r, ["item"]), detail: pick(r, ["detail"]) }))
        .filter((r) => r.item || r.detail)
    : [];

  const summaryRows = summarySheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[summarySheet], { header: 1, defval: "" }) as any[][])
        .map((r) => r.filter(Boolean).join("  "))
        .filter(Boolean)
    : [];

  return { players, marketSizing, frameworks, portfolioSegment, methodology, summaryRows };
}

export async function parseIndustryDocx(file: Blob): Promise<DocxSection[]> {
  // Reuse the same DOCX parser — heading-aware
  return parseCustomerDocx(file);
}

// Re-export for consumers convenience
export { JSZip };
