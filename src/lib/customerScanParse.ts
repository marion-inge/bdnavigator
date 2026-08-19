import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  findSheetName, sheetRows, findHeaderRow, buildColMap, dataRows, cell, str,
} from "./xlsxParseUtils";

export interface CustomerRow {
  company: string;
  segment: string;
  region: string;
  country: string;
  tier: string; // A-E first char
  tierConfidence: string;
  industryFitTier: string;
  valueChainLayer: string;
  subRoleBuyerType: string;
  portfolioFit: string;
  knownProjects: string;
  productRelevance: string;
  crossSell: string;
  assumptionIds: string;
  discoveryMethod: string;
  sellTo: string;
  tierRationale: string;
  caveats: string;
  source: string;
}

export interface AssumptionRow {
  id: string;
  area: string;
  assumption: string;
  basis: string;
  confidence: string;
  impact: string;
}

export interface CustomerScanXlsxData {
  customers: CustomerRow[];
  assumptions: AssumptionRow[];
  watchList: { tier: string; company: string; type: string; role: string; source: string }[];
  summarySheet: string[];
}

export async function parseCustomerXlsx(file: Blob): Promise<CustomerScanXlsxData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const excluded = /summary|methodology|watch|criteria|assumption|cross|source|glossar|cover|read\s*me/i;

  const customerSheet =
    findSheetName(wb, [
      /customer\s*database/i,
      /customer/i,
      /compan(y|ies)/i,
      /account/i,
      /database|db\b/i,
    ]) || wb.SheetNames.find((n) => !excluded.test(n));

  const assumpSheet = findSheetName(wb, [/assumption/i]);
  const watchSheet = findSheetName(wb, [/watch/i]);
  const summarySheet = findSheetName(wb, [/summary|executive|overview/i]);

  // ---- Customers -----------------------------------------------------------
  const custRows = sheetRows(wb, customerSheet);
  const custHdr = findHeaderRow(custRows, [
    "company", "customer", "segment", "region", "country", "tier", "discovery method",
  ]);
  const custMap = buildColMap(custRows[custHdr] || []);

  const customers: CustomerRow[] = dataRows(custRows, custHdr)
    .map((r) => {
      const tierRaw = cell(r, custMap, ["customer fit tier", "customerfittier", "fit tier", "tier"]);
      return {
        company: cell(r, custMap, ["company", "company name", "customer", "name", "organisation", "organization", "account"]),
        segment: cell(r, custMap, ["segment", "sub segment", "industry"]),
        region: cell(r, custMap, ["region", "geography", "geo"]),
        country: cell(r, custMap, ["country", "hq country", "location"]),
        tier: (tierRaw.toUpperCase().replace(/[^A-E]/g, "").charAt(0) || ""),
        tierConfidence: cell(r, custMap, ["tier confidence", "confidence"]),
        industryFitTier: cell(r, custMap, ["industry fit tier", "industryfittier"]),
        valueChainLayer: cell(r, custMap, ["value chain layer", "layer"]),
        subRoleBuyerType: cell(r, custMap, ["sub role buyer type", "sub role", "buyer type", "role"]),
        portfolioFit: cell(r, custMap, ["portfolio fit"]),
        knownProjects: cell(r, custMap, ["known projects", "projects", "activity"]),
        productRelevance: cell(r, custMap, ["product relevance", "relevance", "use case"]),
        crossSell: cell(r, custMap, ["cross sell", "c8 client cross sell", "client usage"]),
        assumptionIds: cell(r, custMap, ["assumption ids", "assumption id", "assumptions"]),
        discoveryMethod: cell(r, custMap, ["discovery method", "discovery"]),
        sellTo: cell(r, custMap, ["sell to", "what to sell", "offering"]),
        tierRationale: cell(r, custMap, ["tier rationale", "rationale", "reasoning"]),
        caveats: cell(r, custMap, ["caveat", "caveats", "risk"]),
        source: cell(r, custMap, ["source", "sources", "evidence"]),
      };
    })
    .filter((r) => r.company && !/^(company|customer|name)$/i.test(r.company));

  // ---- Assumptions ---------------------------------------------------------
  const asRows = sheetRows(wb, assumpSheet);
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

  // ---- Watch list ----------------------------------------------------------
  const wRows = sheetRows(wb, watchSheet);
  const wHdr = findHeaderRow(wRows, ["company", "tier", "type", "role", "source"]);
  const wMap = buildColMap(wRows[wHdr] || []);
  const watchList = dataRows(wRows, wHdr)
    .map((r) => ({
      tier: cell(r, wMap, ["tier"]),
      company: cell(r, wMap, ["company", "name", "organisation", "organization"]),
      type: cell(r, wMap, ["type", "category"]),
      role: cell(r, wMap, ["role", "why watched", "reason"]),
      source: cell(r, wMap, ["source", "sources"]),
    }))
    .filter((r) => r.company);

  // ---- Summary -------------------------------------------------------------
  const summaryRows = sheetRows(wb, summarySheet)
    .map((r) => r.map(str).filter(Boolean).join("  "))
    .filter(Boolean);

  return { customers, assumptions, watchList, summarySheet: summaryRows };
}


// --------------------------------------------------------------------------
// DOCX text extraction: pulls headings + paragraphs from word/document.xml
// --------------------------------------------------------------------------

export interface DocxSection {
  heading: string;
  level: number;
  paragraphs: string[];
}

export async function parseCustomerDocx(file: Blob): Promise<DocxSection[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const xml = await zip.file("word/document.xml")?.async("string");
  if (!xml) return [];

  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const paras = Array.from(doc.getElementsByTagName("w:p"));

  const sections: DocxSection[] = [];
  let current: DocxSection | null = null;

  for (const p of paras) {
    const runs = Array.from(p.getElementsByTagName("w:t"))
      .map((t) => t.textContent || "")
      .join("");
    const text = runs.trim();
    if (!text) continue;

    const pStyle = p.getElementsByTagName("w:pStyle")[0]?.getAttribute("w:val") || "";
    const headingMatch = pStyle.match(/heading(\d)/i) || pStyle.match(/title/i);
    const isHeading = !!headingMatch;
    const level = headingMatch
      ? (headingMatch[0].toLowerCase() === pStyle.toLowerCase() && /title/i.test(pStyle) ? 1 : parseInt(headingMatch[1] || "1", 10))
      : 0;

    if (isHeading) {
      current = { heading: text, level, paragraphs: [] };
      sections.push(current);
    } else if (current) {
      current.paragraphs.push(text);
    } else {
      current = { heading: "", level: 0, paragraphs: [text] };
      sections.push(current);
    }
  }
  // drop empty sections
  return sections.filter((s) => s.heading || s.paragraphs.length);
}
