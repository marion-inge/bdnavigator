import * as XLSX from "xlsx";
import type {
  HypothesisData,
  ScanKey,
} from "./hypothesisTypes";
import type { Language } from "./i18n";

type Row = [string, string | number, string]; // label, value, guidance

const L = (lang: Language, en: string, de: string) => (lang === "de" ? de : en);
const yn = (lang: Language, v: boolean) => (v ? L(lang, "Yes", "Ja") : L(lang, "No", "Nein"));
const listInline = (arr?: string[]) => (arr && arr.length ? arr.join(", ") : "");

function pushList(rows: Row[], baseLabel: string, values: string[] | undefined, help = "") {
  if (!values || values.length === 0) {
    rows.push([baseLabel, "", help]);
    return;
  }
  values.forEach((v, i) => rows.push([`${baseLabel} ${i + 1}`, v, i === 0 ? help : ""]));
}

function coreRows(h: HypothesisData, lang: Language): Row[] {
  const rows: Row[] = [];
  rows.push([
    L(lang, "Hypothesis statement", "Hypothesen-Aussage"),
    h.core.hypothesisStatement || "",
    L(lang, "One sentence capturing the idea, the target customer, and the expected value. Example: 'We help [ICP] achieve [outcome] by [solution].'", "Ein Satz, der Idee, Zielkunden und Nutzen beschreibt. Beispiel: 'Wir helfen [ICP], [Ergebnis] zu erreichen, indem wir [Lösung] anbieten.'"),
  ]);
  rows.push([L(lang, "Client company", "Kunde / Unternehmen"), h.core.client.company || "",
    L(lang, "Name of the company or client sponsoring this opportunity.", "Name des Unternehmens/Kunden, der diese Opportunity vorantreibt.")]);
  rows.push([L(lang, "Business unit", "Geschäftseinheit"), h.core.client.businessUnit || "",
    L(lang, "Internal division or team that will own the solution.", "Interne Division oder Team, das die Lösung verantwortet.")]);
  rows.push([L(lang, "Offering name", "Angebotsname"), h.core.offering.name || "",
    L(lang, "Short working name for the product, service, or initiative.", "Kurzer Arbeitsname für das Produkt/die Dienstleistung.")]);
  rows.push([L(lang, "Offering description", "Angebotsbeschreibung"), h.core.offering.description || "",
    L(lang, "What the offering does and which customer problem it solves.", "Was die Lösung leistet und welches Kundenproblem sie löst.")]);
  rows.push([L(lang, "Business model", "Geschäftsmodell"), h.core.offering.businessModel || "",
    L(lang, "How will we make money? one-time / recurring / service.", "Wie verdienen wir Geld? one-time / recurring / service.")]);
  pushList(rows, L(lang, "Spec anchor", "Spec-Anker"), h.core.offering.specAnchors,
    L(lang, "Concrete features or capabilities the solution must fulfil (5–10).", "Konkrete Features/Fähigkeiten, die die Lösung erfüllen muss (5–10)."));
  h.core.targetMarkets.forEach((tm, i) => {
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "segment", "Segment")}`, tm.segment || "",
      i === 0 ? L(lang, "Segment + region pairs you address first. One row per priority market.", "Segment- und Regions-Paare, die zuerst angegangen werden. Eine Zeile pro Prioritätsmarkt.") : ""]);
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "region", "Region")}`, tm.region || "", ""]);
  });
  if (h.core.targetMarkets.length === 0) rows.push([L(lang, "Target markets", "Zielmärkte"), "",
    L(lang, "Segment + region pairs you address first.", "Segment- und Regions-Paare, die zuerst angegangen werden.")]);
  return rows;
}

function industryRows(h: HypothesisData, lang: Language): Row[] {
  const i = h.industry;
  if (!i) return [];
  const rows: Row[] = [];
  rows.push([L(lang, "Study purpose", "Studienzweck"), i.studyPurpose || "",
    L(lang, "Why we're running this study; what decision it should inform.", "Warum wir diese Studie machen; welche Entscheidung sie stützen soll.")]);
  rows.push([L(lang, "Depth", "Tiefe"), i.depth || "",
    L(lang, "Level of detail: light / baseline / deep.", "Detailgrad: light / baseline / deep.")]);
  pushList(rows, L(lang, "Segment in depth", "Segment (Tiefenanalyse)"), i.segmentsInDepth,
    L(lang, "Segments to analyse in detail.", "Segmente, die vertieft analysiert werden."));
  rows.push([L(lang, "Geography – primary", "Geografie – primär"), listInline(i.geography.primary),
    L(lang, "Primary regions to cover in depth.", "Primäre Regionen mit voller Abdeckung.")]);
  rows.push([L(lang, "Geography – baseline", "Geografie – Baseline"), listInline(i.geography.baseline),
    L(lang, "Regions covered at baseline depth.", "Regionen mit Baseline-Tiefe.")]);
  rows.push([L(lang, "Geography – light", "Geografie – leicht"), listInline(i.geography.light),
    L(lang, "Regions covered only lightly.", "Regionen mit nur leichter Abdeckung.")]);
  rows.push([L(lang, "Output: value chain map", "Output: Wertschöpfungskarte"), yn(lang, i.outputs.valueChainMap), ""]);
  rows.push([L(lang, "Output: word study", "Output: Word-Studie"), yn(lang, i.outputs.wordStudy), ""]);
  rows.push([L(lang, "Output: Excel player DB", "Output: Excel Player-DB"), yn(lang, i.outputs.excelPlayerDb), ""]);
  rows.push([L(lang, "Output: slide deck", "Output: Foliendeck"), yn(lang, i.outputs.slideDeck), ""]);
  return rows;
}

function customerRows(h: HypothesisData, lang: Language): Row[] {
  const c = h.customer;
  if (!c) return [];
  const help = (en: string, de: string) => L(lang, en, de);
  return [
    [L(lang, "Products", "Produkte"), c.products || "", help("Products in scope of the customer scan.", "Produkte im Scope des Kunden-Scans.")],
    [L(lang, "Report mode", "Report-Modus"), c.reportMode || "", help("Level and format of the output report.", "Umfang und Format des Ergebnis-Reports.")],
    [L(lang, "Use cases", "Anwendungsfälle"), c.useCases || "", help("Concrete customer use cases to validate.", "Konkrete Kunden-Use-Cases, die validiert werden sollen.")],
    [L(lang, "Business model", "Geschäftsmodell"), c.businessModel || "", help("Commercial model relevant for these customers.", "Für diese Kunden relevantes Geschäftsmodell.")],
    [L(lang, "Target market", "Zielmarkt"), c.targetMarket || "", help("Which segment / region we're scanning.", "Welches Segment / welche Region wird gescannt.")],
    [L(lang, "Customer types", "Kundentypen"), c.customerTypes || "", help("Types of customers to include (e.g. OEM, tier-1, distributor).", "Zu berücksichtigende Kundentypen (z. B. OEM, Tier-1, Distributor).")],
    [L(lang, "Preferences", "Präferenzen"), c.preferences || "", help("Preferences that guide sourcing and prioritisation.", "Präferenzen für Recherche und Priorisierung.")],
    [L(lang, "Tier criteria", "Tier-Kriterien"), c.tierCriteria || "", help("Rules used to classify customers into tiers.", "Regeln zur Einstufung von Kunden in Tiers.")],
    [L(lang, "Additional comments", "Zusätzliche Kommentare"), c.additionalComments || "", ""],
  ];
}

function competitorRows(h: HypothesisData, lang: Language): Row[] {
  const c = h.competitor;
  if (!c) return [];
  const help = (en: string, de: string) => L(lang, en, de);
  const rows: Row[] = [];
  rows.push([L(lang, "Client", "Kunde"), c.client || "", help("Client sponsoring the competitor scan.", "Kunde, der den Wettbewerber-Scan trägt.")]);
  rows.push([L(lang, "Offering name", "Angebotsname"), c.offering.name || "", help("Our offering being benchmarked.", "Unser Angebot, das gebenchmarkt wird.")]);
  rows.push([L(lang, "Offering description", "Angebotsbeschreibung"), c.offering.description || "", help("What the offering does and its scope.", "Was das Angebot leistet und dessen Scope.")]);
  pushList(rows, L(lang, "Spec anchor", "Spec-Anker"), c.offering.specAnchors,
    help("Concrete capabilities to benchmark against competitors.", "Konkrete Fähigkeiten für den Vergleich mit Wettbewerbern."));
  c.targetMarkets.forEach((tm, i) => {
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "segment", "Segment")}`, tm.segment || "", ""]);
    rows.push([`${L(lang, "Target market", "Zielmarkt")} ${i + 1} – ${L(lang, "region", "Region")}`, tm.region || "", ""]);
  });
  c.knownCompetitors.forEach((kc, i) => {
    rows.push([`${L(lang, "Known competitor", "Bekannter Wettbewerber")} ${i + 1}`, kc.name || "",
      i === 0 ? help("Competitors we already know about; add the client's belief about each.", "Bereits bekannte Wettbewerber; füge das Kundenbild zu jedem hinzu.") : ""]);
    rows.push([`${L(lang, "Known competitor", "Bekannter Wettbewerber")} ${i + 1} – ${L(lang, "client belief", "Kundenbild")}`, kc.clientBelief || "", ""]);
  });
  pushList(rows, L(lang, "Benchmark criterion", "Benchmark-Kriterium"), c.benchmarkCriteria,
    help("Criteria used to score competitors (e.g. price, coverage, quality).", "Kriterien zur Bewertung der Wettbewerber (z. B. Preis, Abdeckung, Qualität)."));
  rows.push([L(lang, "Depth cap", "Tiefen-Cap"), c.depthCap ?? "", help("Max number of competitors to analyse in depth.", "Max. Anzahl vertieft analysierter Wettbewerber.")]);
  rows.push([L(lang, "Target margin", "Zielmarge"), c.targetCosting.targetMargin || "", help("Target margin the offering must achieve.", "Zielmarge, die das Angebot erreichen muss.")]);
  rows.push([L(lang, "Current cost", "Aktuelle Kosten"), c.targetCosting.currentCost || "", help("Best estimate of current unit cost.", "Beste Schätzung der aktuellen Stückkosten.")]);
  rows.push([L(lang, "WTP anchors", "WTP-Anker"), c.targetCosting.wtpAnchors || "", help("Willingness-to-pay reference points.", "Referenzpunkte für Zahlungsbereitschaft.")]);
  rows.push([L(lang, "Framework: VPC", "Framework: VPC"), yn(lang, c.frameworks.vpc), ""]);
  rows.push([L(lang, "Framework: CBA", "Framework: CBA"), yn(lang, c.frameworks.cba), ""]);
  rows.push([L(lang, "Framework: Three-Circle", "Framework: Drei Kreise"), yn(lang, c.frameworks.threeCircle), ""]);
  rows.push([L(lang, "Framework: Positioning", "Framework: Positionierung"), yn(lang, c.frameworks.positioning), ""]);
  rows.push([L(lang, "Framework: Target Costing", "Framework: Target Costing"), yn(lang, c.frameworks.targetCosting), ""]);
  rows.push([L(lang, "Preferences", "Präferenzen"), c.preferences || "", ""]);
  rows.push([L(lang, "Additional comments", "Zusätzliche Kommentare"), c.additionalComments || "", ""]);
  return rows;
}

function marketPotentialRows(h: HypothesisData, lang: Language): Row[] {
  const m = h.marketPotential;
  if (!m) return [];
  const help = (en: string, de: string) => L(lang, en, de);
  const rows: Row[] = [
    [L(lang, "Price per unit / seat", "Preis pro Einheit / Seat"), m.pricePerUnitOrSeat || "", help("Assumed price per unit or per seat.", "Angenommener Preis pro Einheit oder Seat.")],
    [L(lang, "Recurring or one-time", "Wiederkehrend oder einmalig"), m.recurringOrOneTime || "", help("Revenue pattern: recurring or one-time.", "Erlösmuster: wiederkehrend oder einmalig.")],
    [L(lang, "Base year", "Basisjahr"), m.baseYear || "", help("Base year the model starts from.", "Basisjahr, ab dem das Modell rechnet.")],
    [L(lang, "Currency", "Währung"), m.currency || "", ""],
    [L(lang, "Win-rate assumption", "Annahme Gewinnrate"), m.winRateAssumption || "", help("Assumed share of pursued deals we win.", "Angenommener Anteil gewonnener Deals.")],
    [L(lang, "Adoption assumption", "Annahme Adoption"), m.adoptionAssumption || "", help("Assumed adoption curve or steady-state share.", "Angenommene Adoption-Kurve bzw. Endanteil.")],
    [L(lang, "Addressable share assumption", "Annahme adressierbarer Anteil"), m.addressableShareAssumption || "", help("Share of the market that is realistically addressable.", "Realistisch adressierbarer Marktanteil.")],
    [L(lang, "Scenario – conservative", "Szenario – konservativ"), m.scenarios.conservative || "", help("Downside scenario description or driver values.", "Downside-Szenario Beschreibung / Treiberwerte.")],
    [L(lang, "Scenario – realistic", "Szenario – realistisch"), m.scenarios.realistic || "", help("Base-case scenario.", "Base-Case-Szenario.")],
    [L(lang, "Scenario – aggressive", "Szenario – aggressiv"), m.scenarios.aggressive || "", help("Upside scenario.", "Upside-Szenario.")],
  ];
  m.unitsPerCustomerType.forEach((u, i) => {
    rows.push([`${L(lang, "Customer type", "Kundentyp")} ${i + 1}`, u.customerType || "",
      i === 0 ? help("Units expected per customer type per year.", "Erwartete Einheiten pro Kundentyp und Jahr.") : ""]);
    rows.push([`${L(lang, "Units", "Einheiten")} ${i + 1}`, u.units || "", ""]);
  });
  return rows;
}

function buyingCenterRows(h: HypothesisData, lang: Language): Row[] {
  const b = h.buyingCenter;
  if (!b) return [];
  const help = (en: string, de: string) => L(lang, en, de);
  return [
    [L(lang, "Offering description", "Angebotsbeschreibung"), b.offeringDescription || "", help("Offering the buying-center map should cover.", "Angebot, das die Buying-Center-Analyse abdecken soll.")],
    [L(lang, "Seed input type", "Seed-Input-Typ"), b.seedInputType || "", help("Where the initial contact list comes from.", "Woher die initiale Kontaktliste stammt.")],
    [L(lang, "Shortlist rule", "Shortlist-Regel"), b.shortlistRule || "", help("Rule used to shortlist accounts / contacts.", "Regel zur Shortlist-Bildung.")],
    [L(lang, "Depth", "Tiefe"), b.depth || "", help("Analysis depth: light / baseline / deep.", "Analyse-Tiefe: light / baseline / deep.")],
    [L(lang, "Delivery notes", "Liefer-Notizen"), b.deliveryNotes || "", ""],
  ];
}

const SCAN_LABELS: Record<ScanKey, { en: string; de: string }> = {
  industry:         { en: "Industry Scan", de: "Branchen-Scan" },
  customer:         { en: "Customer Scan", de: "Kunden-Scan" },
  competitor:       { en: "Competitor Scan", de: "Wettbewerber-Scan" },
  market_potential: { en: "Market Potential Scan", de: "Marktpotenzial-Scan" },
  buying_center:    { en: "Buying Center Scan", de: "Buying Center-Scan" },
};

function addSheet(wb: XLSX.WorkBook, name: string, title: string, rows: Row[], lang: Language) {
  const header: any[] = [
    L(lang, "Field", "Feld"),
    L(lang, "Value", "Wert"),
    L(lang, "Guidance", "Hinweis"),
  ];
  const aoa: any[][] = [[title, "", ""], ["", "", ""], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 40 }, { wch: 60 }, { wch: 70 }];
  if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14 } };
  ["A3", "B3", "C3"].forEach((c) => { if (ws[c]) ws[c].s = { font: { bold: true } }; });
  // wrap guidance column
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let r = 3; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: 2 });
    if (ws[addr]) ws[addr].s = { alignment: { wrapText: true, vertical: "top" } };
    const bAddr = XLSX.utils.encode_cell({ r, c: 1 });
    if (ws[bAddr]) ws[bAddr].s = { alignment: { wrapText: true, vertical: "top" } };
  }
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
    lang,
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
    addSheet(wb, label, label, s.rows, lang);
  }
  const safeTitle = (ideaTitle || "idea").replace(/[^\w\-]+/g, "_").slice(0, 60);
  XLSX.writeFile(wb, `ScanInputSheets_${safeTitle}.xlsx`);
}
