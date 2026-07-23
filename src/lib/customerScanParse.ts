import * as XLSX from "xlsx";
import JSZip from "jszip";

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

const norm = (s: string) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function pickCol(row: any, keys: string[]): string {
  for (const k of Object.keys(row)) {
    if (keys.includes(norm(k))) return String(row[k] ?? "").trim();
  }
  return "";
}

export async function parseCustomerXlsx(file: Blob): Promise<CustomerScanXlsxData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const findSheet = (rx: RegExp) => wb.SheetNames.find((n) => rx.test(n));

  const customerSheet =
    findSheet(/customer\s*database|customers?/i) || wb.SheetNames.find((n) => !/summary|methodology|watch|criteria|assumption|cross/i.test(n));
  const assumpSheet = findSheet(/assumption/i);
  const watchSheet = findSheet(/watch/i);
  const summarySheet = findSheet(/summary/i);

  const customers: CustomerRow[] = customerSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[customerSheet], { defval: "" }) as any[])
        .map((r) => ({
          company: pickCol(r, ["company", "companyname", "name"]),
          segment: pickCol(r, ["segment"]),
          region: pickCol(r, ["region", "geography"]),
          country: pickCol(r, ["country"]),
          tier: (pickCol(r, ["customerfittier", "tier", "fittier"]).toUpperCase().charAt(0) || ""),
          tierConfidence: pickCol(r, ["tierconfidence", "confidence"]),
          industryFitTier: pickCol(r, ["industryfittier"]),
          valueChainLayer: pickCol(r, ["valuechainlayer", "layer"]),
          subRoleBuyerType: pickCol(r, ["subrolebuyertype", "subrole", "buyertype"]),
          portfolioFit: pickCol(r, ["portfoliofit"]),
          knownProjects: pickCol(r, ["knownprojectsactivityrecency", "knownprojects", "projects"]),
          productRelevance: pickCol(r, ["productrelevance"]),
          crossSell: pickCol(r, ["c8clientcrosssell", "crosssell"]),
          assumptionIds: pickCol(r, ["assumptionids"]),
          discoveryMethod: pickCol(r, ["discoverymethod"]),
          sellTo: pickCol(r, ["sellto"]),
          tierRationale: pickCol(r, ["tierrationalechain", "tierrationale", "rationale"]),
          caveats: pickCol(r, ["caveats"]),
          source: pickCol(r, ["sourceevidencetierrecency", "source", "sources"]),
        }))
        .filter((r) => r.company)
    : [];

  const assumptions: AssumptionRow[] = assumpSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[assumpSheet], { defval: "" }) as any[])
        .map((r) => ({
          id: pickCol(r, ["id"]),
          area: pickCol(r, ["area"]),
          assumption: pickCol(r, ["assumption"]),
          basis: pickCol(r, ["basisevidencerationale", "basis"]),
          confidence: pickCol(r, ["confidence57", "confidence"]),
          impact: pickCol(r, ["impactwhatitaffects", "impact"]),
        }))
        .filter((r) => r.id || r.assumption)
    : [];

  const watchList = watchSheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[watchSheet], { defval: "" }) as any[])
        .map((r) => ({
          tier: pickCol(r, ["tier"]),
          company: pickCol(r, ["company"]),
          type: pickCol(r, ["type"]),
          role: pickCol(r, ["roleinecosystemwhywatched", "role"]),
          source: pickCol(r, ["source", "sources"]),
        }))
        .filter((r) => r.company)
    : [];

  const summaryRows = summarySheet
    ? (XLSX.utils.sheet_to_json(wb.Sheets[summarySheet], { header: 1, defval: "" }) as any[][])
        .map((r) => r.filter(Boolean).join("  "))
        .filter(Boolean)
    : [];

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
