import * as XLSX from "xlsx";
import type {
  HypothesisData,
  ScanKey,
} from "./hypothesisTypes";
import type { Language } from "./i18n";

type Row = [string, string | number];

const L = (lang: Language, en: string, de: string) => (lang === "de" ? de : en);
const yn = (lang: Language, v: boolean) => (v ? L(lang, "Yes", "Ja") : L(lang, "No", "Nein"));
const listInline = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");

function pushList(rows: Row[], baseLabel: string, values?: string[]) {
  if (!values || values.length === 0) {
    rows.push([baseLabel, ""]);
    return;
  }
  values.forEach((v, i) => rows.push([`${baseLabel} ${i + 1}`, v]));
}

function coreRows(h: HypothesisData, lang: Language): Row[] {
  const rows: Row[] = [];
  rows.push([L(lang, "Hypothesis statement", "Hypothesen-Aussage"), h.core.hypothesisStatement || ""]);
  rows.push([L(lang, "Client company", "Kunde / Unternehmen"), h.core.client.company || ""]);
  rows.push([L(lang, "Business unit", "Geschäftseinheit"), h.core.client.businessUnit || ""]);
  rows.push([L(lang, "Offering name", "Angebotsname"), h.core.offering.name || ""]);
  rows.push([L(lang, "Offering description", "Angebotsbeschreibung"), h.core.offering.description || ""]);
  rows.push([L(lang, "Business model", "Geschäftsmodell"), h.core.offering.businessModel || ""]);
  pushList(rows, L(lang, "Spec anchor", "Spec-Anker"), h.core.offering.specAnchors);
  h.core.targetMarkets.forEach((tm, i) => {
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "segment", "Segment")}`, tm.segment || ""]);
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "region", "Region")}`, tm.region || ""]);
  });
  if (h.core.targetMarkets.length === 0) rows.push([L(lang, "Target markets", "Zielmärkte"), ""]);
  return rows;
}

function industryRows(h: HypothesisData, lang: Language): Row[] {
  const i = h.industry;
  if (!i) return [];
  const rows: Row[] = [];
  rows.push([L(lang, "Study purpose", "Studienzweck"), i.studyPurpose || ""]);
  rows.push([L(lang, "Depth", "Tiefe"), i.depth || ""]);
  pushList(rows, L(lang, "Segment in depth", "Segment (Tiefenanalyse)"), i.segmentsInDepth);
  rows.push([L(lang, "Geography – primary", "Geografie – primär"), listInline(i.geography.primary)]);
  rows.push([L(lang, "Geography – baseline", "Geografie – Baseline"), listInline(i.geography.baseline)]);
  rows.push([L(lang, "Geography – light", "Geografie – leicht"), listInline(i.geography.light)]);
  rows.push([L(lang, "Output: value chain map", "Output: Wertschöpfungskarte"), yn(lang, i.outputs.valueChainMap)]);
  rows.push([L(lang, "Output: word study", "Output: Word-Studie"), yn(lang, i.outputs.wordStudy)]);
  rows.push([L(lang, "Output: Excel player DB", "Output: Excel Player-DB"), yn(lang, i.outputs.excelPlayerDb)]);
  rows.push([L(lang, "Output: slide deck", "Output: Foliendeck"), yn(lang, i.outputs.slideDeck)]);
  return rows;
}

function customerRows(h: HypothesisData, lang: Language): Row[] {
  const c = h.customer;
  if (!c) return [];
  return [
    [L(lang, "Products", "Produkte"), c.products || ""],
    [L(lang, "Report mode", "Report-Modus"), c.reportMode || ""],
    [L(lang, "Use cases", "Anwendungsfälle"), c.useCases || ""],
    [L(lang, "Business model", "Geschäftsmodell"), c.businessModel || ""],
    [L(lang, "Target market", "Zielmarkt"), c.targetMarket || ""],
    [L(lang, "Customer types", "Kundentypen"), c.customerTypes || ""],
    [L(lang, "Preferences", "Präferenzen"), c.preferences || ""],
    [L(lang, "Tier criteria", "Tier-Kriterien"), c.tierCriteria || ""],
    [L(lang, "Additional comments", "Zusätzliche Kommentare"), c.additionalComments || ""],
  ];
}

function competitorRows(h: HypothesisData, lang: Language): Row[] {
  const c = h.competitor;
  if (!c) return [];
  const rows: Row[] = [];
  rows.push([L(lang, "Client", "Kunde"), c.client || ""]);
  rows.push([L(lang, "Offering name", "Angebotsname"), c.offering.name || ""]);
  rows.push([L(lang, "Offering description", "Angebotsbeschreibung"), c.offering.description || ""]);
  pushList(rows, L(lang, "Spec anchor", "Spec-Anker"), c.offering.specAnchors);
  c.targetMarkets.forEach((tm, i) => {
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "segment", "Segment")}`, tm.segment || ""]);
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "region", "Region")}`, tm.region || ""]);
  });
  c.knownCompetitors.forEach((kc, i) => {
    rows.push([`${L(lang, "Known competitor", "Bekannter Wettbewerber")} ${i + 1}`, kc.name || ""]);
    rows.push([`${L(lang, "Known competitor", "Bekannter Wettbewerber")} ${i + 1} – ${L(lang, "client belief", "Kundenbild")}`, kc.clientBelief || ""]);
  });
  pushList(rows, L(lang, "Benchmark criterion", "Benchmark-Kriterium"), c.benchmarkCriteria);
  rows.push([L(lang, "Depth cap", "Tiefen-Cap"), c.depthCap ?? ""]);
  rows.push([L(lang, "Target margin", "Zielmarge"), c.targetCosting.targetMargin || ""]);
  rows.push([L(lang, "Current cost", "Aktuelle Kosten"), c.targetCosting.currentCost || ""]);
  rows.push([L(lang, "WTP anchors", "WTP-Anker"), c.targetCosting.wtpAnchors || ""]);
  rows.push([L(lang, "Framework: VPC", "Framework: VPC"), yn(lang, c.frameworks.vpc)]);
  rows.push([L(lang, "Framework: CBA", "Framework: CBA"), yn(lang, c.frameworks.cba)]);
  rows.push([L(lang, "Framework: Three-Circle", "Framework: Drei Kreise"), yn(lang, c.frameworks.threeCircle)]);
  rows.push([L(lang, "Framework: Positioning", "Framework: Positionierung"), yn(lang, c.frameworks.positioning)]);
  rows.push([L(lang, "Framework: Target Costing", "Framework: Target Costing"), yn(lang, c.frameworks.targetCosting)]);
  rows.push([L(lang, "Preferences", "Präferenzen"), c.preferences || ""]);
  rows.push([L(lang, "Additional comments", "Zusätzliche Kommentare"), c.additionalComments || ""]);
  return rows;
}

function marketPotentialRows(h: HypothesisData, lang: Language): Row[] {
  const m = h.marketPotential;
  if (!m) return [];
  const rows: Row[] = [
    [L(lang, "Price per unit / seat", "Preis pro Einheit / Seat"), m.pricePerUnitOrSeat || ""],
    [L(lang, "Recurring or one-time", "Wiederkehrend oder einmalig"), m.recurringOrOneTime || ""],
    [L(lang, "Base year", "Basisjahr"), m.baseYear || ""],
    [L(lang, "Currency", "Währung"), m.currency || ""],
    [L(lang, "Win-rate assumption", "Annahme Gewinnrate"), m.winRateAssumption || ""],
    [L(lang, "Adoption assumption", "Annahme Adoption"), m.adoptionAssumption || ""],
    [L(lang, "Addressable share assumption", "Annahme adressierbarer Anteil"), m.addressableShareAssumption || ""],
    [L(lang, "Scenario – conservative", "Szenario – konservativ"), m.scenarios.conservative || ""],
    [L(lang, "Scenario – realistic", "Szenario – realistisch"), m.scenarios.realistic || ""],
    [L(lang, "Scenario – aggressive", "Szenario – aggressiv"), m.scenarios.aggressive || ""],
  ];
  m.unitsPerCustomerType.forEach((u, i) => {
    rows.push([`${L(lang, "Customer type", "Kundentyp")} ${i + 1}`, u.customerType || ""]);
    rows.push([`${L(lang, "Units", "Einheiten")} ${i + 1}`, u.units || ""]);
  });
  return rows;
}

function buyingCenterRows(h: HypothesisData, lang: Language): Row[] {
  const b = h.buyingCenter;
  if (!b) return [];
  return [
    [L(lang, "Offering description", "Angebotsbeschreibung"), b.offeringDescription || ""],
    [L(lang, "Seed input type", "Seed-Input-Typ"), b.seedInputType || ""],
    [L(lang, "Shortlist rule", "Shortlist-Regel"), b.shortlistRule || ""],
    [L(lang, "Depth", "Tiefe"), b.depth || ""],
    [L(lang, "Delivery notes", "Liefer-Notizen"), b.deliveryNotes || ""],
  ];
}

const SCAN_LABELS: Record<ScanKey, { en: string; de: string }> = {
  industry:         { en: "Industry Scan", de: "Branchen-Scan" },
  customer:         { en: "Customer Scan", de: "Kunden-Scan" },
  competitor:       { en: "Competitor Scan", de: "Wettbewerber-Scan" },
  market_potential: { en: "Market Potential Scan", de: "Marktpotenzial-Scan" },
  buying_center:    { en: "Buying Center Scan", de: "Buying Center-Scan" },
};

function addSheet(wb: XLSX.WorkBook, name: string, title: string, rows: Row[]) {
  const aoa: any[][] = [[title, ""], ["", ""], ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 40 }, { wch: 80 }];
  // Try to bold the title cell (A1)
  if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14 } };
  const sheetName = name.slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

export function exportHypothesisXlsx(
  hypothesis: HypothesisData,
  ideaTitle: string,
  lang: Language,
) {
  const wb = XLSX.utils.book_new();
  addSheet(
    wb,
    L(lang, "Core Hypothesis", "Kern-Hypothese"),
    L(lang, "Core / Hypothesis", "Kern / Hypothese"),
    coreRows(hypothesis, lang),
  );
  const scanBuilders: Array<{ key: ScanKey; rows: Row[] }> = [
    { key: "industry",         rows: industryRows(hypothesis, lang) },
    { key: "customer",         rows: customerRows(hypothesis, lang) },
    { key: "competitor",       rows: competitorRows(hypothesis, lang) },
    { key: "market_potential", rows: marketPotentialRows(hypothesis, lang) },
    { key: "buying_center",    rows: buyingCenterRows(hypothesis, lang) },
  ];
  for (const s of scanBuilders) {
    if (s.rows.length === 0) continue;
    const label = SCAN_LABELS[s.key][lang];
    addSheet(wb, label, label, s.rows);
  }
  const safeTitle = (ideaTitle || "idea").replace(/[^\w\-]+/g, "_").slice(0, 60);
  XLSX.writeFile(wb, `ScanInputSheets_${safeTitle}.xlsx`);
}
