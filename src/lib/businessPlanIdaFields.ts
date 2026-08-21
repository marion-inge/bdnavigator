/**
 * Field map for IDA-powered Business Plan extraction.
 *
 * Each field describes:
 *  - path: dot path inside the proposal returned by the edge function
 *  - label: shown in the diff dialog
 *  - get(scoring, sa): read the CURRENT value from app state
 *  - apply(scoring, sa, value): return a NEW {scoring, sa} with the accepted value written in
 *
 * Most fields are strings; geographic breakdown tables are handled as structured
 * region rows because they are a core TAM/SAM/SOM input.
 */
import type { DetailedScoring, GeographicalRegion, StrategicAnalyses, CompetitorAnalysisEntry, CompetitorEntry, CustomerSegment, CustomerSegmentEntry, CustomerFoundEntry, CustomersFoundData } from "./types";
import { createDefaultTamOverview, createDefaultSamOverview, createDefaultSomOverview } from "./businessPlanTypes";

const defaultCustomersFound = (): CustomersFoundData => ({
  entries: [], researchScope: "", bottomUpAssumptions: "", averageValuePerCustomer: 0, description: "",
});

const fmtCustomersFound = (entries: CustomerFoundEntry[] | undefined): string => {
  if (!entries?.length) return "";
  return entries.map((e) =>
    `Company: ${e.company}\nCountry: ${e.country}\nGeography: ${e.geography}\nTier: ${e.tier}\nCustomer type: ${e.customerType}\nSegment: ${e.segment}\nParent group: ${e.parentGroup}\nVariant count: ${e.variantCount}\nEstimated value (M€): ${e.estimatedValue}\nStatus: ${e.status}\nRationale: ${e.rationale}\nSources: ${e.sources}\nNotes: ${e.notes}`,
  ).join("\n\n");
};

const parseCustomersFound = (text: string): CustomerFoundEntry[] => {
  const blocks = text.split(/\n\s*\n/g).map((b) => b.trim()).filter(Boolean);
  const out: CustomerFoundEntry[] = [];
  for (const block of blocks) {
    const lines = block.split(/\n/g).map((l) => l.trim()).filter(Boolean);
    const get = (label: string) => lines.find((l) => l.toLowerCase().startsWith(label))?.split(/:(.*)/s)[1]?.trim() || "";
    const company = get("company") || lines[0]?.replace(/^[-•]\s*/, "").trim() || "";
    if (!company) continue;
    const tierRaw = (get("tier") || "").toUpperCase().match(/[A-E]/)?.[0] || "";
    const estRaw = get("estimated value") || get("estimated");
    const est = parseFloat(String(estRaw).replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/)?.[0] || "0");
    out.push({
      id: crypto.randomUUID(),
      company,
      country: get("country"),
      geography: get("geography"),
      tier: (tierRaw as CustomerFoundEntry["tier"]) || "",
      customerType: get("customer type") || get("type"),
      segment: get("segment"),
      parentGroup: get("parent group") || get("parent"),
      variantCount: get("variant count") || get("variants"),
      estimatedValue: Number.isFinite(est) ? est : 0,
      status: get("status") || "active",
      rationale: get("rationale"),
      sources: get("sources") || get("source"),
      notes: get("notes"),
    });
  }
  return out;
};

export type ProposalGroup = "overview" | "tam" | "sam" | "som";

export interface IdaFieldDef {
  /** Dot path within the proposal payload, e.g. "tam.pestel.political". */
  path: string;
  /** Display label (English / German). */
  labelEn: string;
  labelDe: string;
  /** Multi-line in the dialog. */
  multiline?: boolean;
  /** Section header to group fields under in the dialog. */
  section: string;
  get: (scoring: DetailedScoring, sa: StrategicAnalyses) => string;
  apply: (scoring: DetailedScoring, sa: StrategicAnalyses, value: string) => { scoring: DetailedScoring; sa: StrategicAnalyses };
}

// ─── helpers ──────────────────────────────────────────────────────────────
const ovTam = (s: DetailedScoring) => (s as any).tamOverview || createDefaultTamOverview();
const ovSam = (s: DetailedScoring) => (s as any).samOverview || createDefaultSamOverview();
const ovSom = (s: DetailedScoring) => (s as any).somOverview || createDefaultSomOverview();

const setTamOv = (s: DetailedScoring, patch: Record<string, any>): DetailedScoring => ({
  ...s, tamOverview: { ...ovTam(s), ...patch },
} as any);
const setSamOv = (s: DetailedScoring, patch: Record<string, any>): DetailedScoring => ({
  ...s, samOverview: { ...ovSam(s), ...patch },
} as any);
const setSomOv = (s: DetailedScoring, patch: Record<string, any>): DetailedScoring => ({
  ...s, somOverview: { ...ovSom(s), ...patch },
} as any);

const setTamModel = (sa: StrategicAnalyses, key: keyof StrategicAnalyses["tam"], patch: any): StrategicAnalyses => ({
  ...sa, tam: { ...sa.tam, [key]: { ...(sa.tam as any)[key], ...patch } },
});
const setSamModel = (sa: StrategicAnalyses, key: keyof StrategicAnalyses["sam"], patch: any): StrategicAnalyses => ({
  ...sa, sam: { ...sa.sam, [key]: { ...(sa.sam as any)[key], ...patch } },
});
const setSomModel = (sa: StrategicAnalyses, key: keyof StrategicAnalyses["som"], patch: any): StrategicAnalyses => ({
  ...sa, som: { ...sa.som, [key]: { ...(sa.som as any)[key], ...patch } },
});

const ovField = (
  area: "tam" | "sam" | "som",
  ovKey: string,
  labelEn: string,
  labelDe: string,
  multiline = true,
): IdaFieldDef => ({
  path: `${area === "tam" ? "overview.tam" : area === "sam" ? "overview.sam" : "overview.som"}.${ovKey}`,
  labelEn, labelDe, multiline,
  section: area === "tam" ? "TAM Overview" : area === "sam" ? "SAM Overview" : "SOM Overview",
  get: (s) => (area === "tam" ? ovTam(s) : area === "sam" ? ovSam(s) : ovSom(s))[ovKey] || "",
  apply: (s, sa, v) => ({
    sa,
    scoring: area === "tam" ? setTamOv(s, { [ovKey]: v }) : area === "sam" ? setSamOv(s, { [ovKey]: v }) : setSomOv(s, { [ovKey]: v }),
  }),
});

const modelField = (
  area: "tam" | "sam" | "som",
  modelKey: string,
  fieldKey: string,
  section: string,
  labelEn: string,
  labelDe: string,
  multiline = true,
): IdaFieldDef => ({
  path: `${area}.${modelKey}.${fieldKey}`,
  labelEn, labelDe, multiline, section,
  get: (_s, sa) => (((sa as any)[area]?.[modelKey]) || {})[fieldKey] || "",
  apply: (s, sa, v) => ({
    scoring: s,
    sa: area === "tam"
      ? setTamModel(sa, modelKey as any, { [fieldKey]: v })
      : area === "sam"
      ? setSamModel(sa, modelKey as any, { [fieldKey]: v })
      : setSomModel(sa, modelKey as any, { [fieldKey]: v }),
  }),
});

// Porter forces nest one level deeper (each force has .description)
const porterForce = (forceKey: string, labelEn: string, labelDe: string): IdaFieldDef => ({
  path: `tam.porter.${forceKey}`,
  labelEn, labelDe, multiline: true, section: "Porter's Five Forces",
  get: (_s, sa) => ((sa.tam.porter as any)?.[forceKey]?.description as string) ?? "",
  apply: (s, sa, v) => ({
    scoring: s,
    sa: {
      ...sa,
      tam: {
        ...sa.tam,
        porter: {
          ...sa.tam.porter,
          [forceKey]: { ...(sa.tam.porter as any)[forceKey], description: v },
        },
      },
    },
  }),
});

// ─── projection helpers (numeric 5-year arrays) ───────────────────────────
import type { MarketYearValue } from "./types";

const fmtProj = (proj: MarketYearValue[] | undefined): string => {
  if (!proj?.length) return "";
  return proj
    .slice()
    .sort((a, b) => a.year - b.year)
    .map((p) => `Year ${p.year}: ${p.value} M€`)
    .join("\n");
};

const parseProj = (text: string): MarketYearValue[] => {
  const out: MarketYearValue[] = [];
  const re = /year\s*(\d+)\s*[:\-]\s*([\d.,]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const year = parseInt(m[1], 10);
    const value = parseFloat(m[2].replace(/,/g, ""));
    if (!Number.isNaN(year) && !Number.isNaN(value)) out.push({ year, value });
  }
  // Ensure 5 years 1..5
  const map = new Map(out.map((p) => [p.year, p.value]));
  return [1, 2, 3, 4, 5].map((y) => ({ year: y, value: map.get(y) ?? 0 }));
};

const fmtRegions = (regions: GeographicalRegion[] | undefined): string => {
  if (!regions?.length) return "";
  return regions
    .map((r) => `Region: ${r.region}\nMarket size: ${r.marketSize}\nPotential: ${r.potential}/5\nNotes: ${r.notes}`)
    .join("\n\n");
};

const normalizePotential = (value: unknown): number => {
  const n = typeof value === "number" ? value : parseInt(String(value || "").match(/\d+/)?.[0] || "3", 10);
  return Math.max(1, Math.min(5, Number.isFinite(n) ? n : 3));
};

const parseRegions = (text: string): GeographicalRegion[] => {
  const blocks = text.split(/\n\s*\n/g).map((b) => b.trim()).filter(Boolean);
  const out: GeographicalRegion[] = [];
  for (const block of blocks) {
    const lines = block.split(/\n/g).map((l) => l.trim()).filter(Boolean);
    const get = (label: string) => lines.find((l) => l.toLowerCase().startsWith(label))?.split(/:(.*)/s)[1]?.trim() || "";
    const region = get("region") || lines[0]?.replace(/^[-•]\s*/, "").trim();
    const marketSize = get("market size") || get("market") || "";
    const potential = normalizePotential(get("potential"));
    const notes = get("notes") || lines.slice(1).join("; ");
    if (region) out.push({ region, marketSize, potential, notes });
  }
  return out;
};





const fmtCompetitors = (entries: CompetitorAnalysisEntry[] | undefined): string => {
  if (!entries?.length) return "";
  return entries
    .map((e) =>
      `Name: ${e.name}\nMarket share: ${e.marketShare}\nThreat level: ${e.threatLevel}/5\nStrengths: ${e.strengths}\nWeaknesses: ${e.weaknesses}\nStrategy: ${e.strategy}`,
    )
    .join("\n\n");
};

const parseCompetitors = (text: string): CompetitorAnalysisEntry[] => {
  const blocks = text.split(/\n\s*\n/g).map((b) => b.trim()).filter(Boolean);
  const out: CompetitorAnalysisEntry[] = [];
  for (const block of blocks) {
    const lines = block.split(/\n/g).map((l) => l.trim()).filter(Boolean);
    const get = (label: string) =>
      lines.find((l) => l.toLowerCase().startsWith(label))?.split(/:(.*)/s)[1]?.trim() || "";
    const name = get("name") || lines[0]?.replace(/^[-•]\s*/, "").trim() || "";
    if (!name) continue;
    const threatRaw = get("threat level") || get("threat");
    const threat = Math.max(1, Math.min(5, parseInt(threatRaw.match(/\d+/)?.[0] || "3", 10)));
    out.push({
      id: crypto.randomUUID(),
      name,
      marketShare: get("market share"),
      threatLevel: threat,
      strengths: get("strengths"),
      weaknesses: get("weaknesses"),
      strategy: get("strategy"),
    });
  }
  return out;
};

const parseMarketShareNumber = (value: string): number => {
  const n = parseFloat(String(value || "").replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/)?.[0] || "0");
  return Number.isFinite(n) ? n : 0;
};

const parseSegmentSizeNumber = (value: string): number => {
  const n = parseFloat(String(value || "").replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/)?.[0] || "0");
  return Number.isFinite(n) ? n : 0;
};

const toVisibleCompetitorEntries = (entries: CompetitorAnalysisEntry[]): CompetitorEntry[] =>
  entries.map((entry) => ({
    name: entry.name,
    marketShare: parseMarketShareNumber(entry.marketShare),
    threatLevel: entry.threatLevel,
  }));

const fmtCustomerSegments = (entries: CustomerSegmentEntry[] | undefined): string => {
  if (!entries?.length) return "";
  return entries
    .map((e) =>
      `Name: ${e.name}\nSize: ${e.size}\nNeeds: ${e.needs}\nWillingness to pay: ${e.willingnessToPay}\nPriority: ${e.priority}`,
    )
    .join("\n\n");
};

const parseCustomerSegments = (text: string): CustomerSegmentEntry[] => {
  const blocks = text.split(/\n\s*\n/g).map((b) => b.trim()).filter(Boolean);
  const out: CustomerSegmentEntry[] = [];
  for (const block of blocks) {
    const lines = block.split(/\n/g).map((l) => l.trim()).filter(Boolean);
    const get = (label: string) =>
      lines.find((l) => l.toLowerCase().startsWith(label))?.split(/:(.*)/s)[1]?.trim() || "";
    const name = get("name") || lines[0]?.replace(/^[-•]\s*/, "").trim() || "";
    if (!name) continue;
    const rawPri = (get("priority") || "medium").toLowerCase();
    const priority: CustomerSegmentEntry["priority"] =
      rawPri.startsWith("h") ? "high" : rawPri.startsWith("l") ? "low" : "medium";
    out.push({
      id: crypto.randomUUID(),
      name,
      size: get("size"),
      needs: get("needs"),
      willingnessToPay: get("willingness to pay") || get("willingness") || get("wtp"),
      priority,
    });
  }
  return out;
};

const toVisibleCustomerSegments = (entries: CustomerSegmentEntry[]): CustomerSegment[] =>
  entries.map((entry) => ({
    name: entry.name,
    size: parseSegmentSizeNumber(entry.size),
    description: [entry.needs, entry.willingnessToPay ? `Willingness to pay: ${entry.willingnessToPay}` : "", `Priority: ${entry.priority}`]
      .filter(Boolean)
      .join("\n"),
  }));

const customerSegmentationDescriptionField: IdaFieldDef = {
  path: "sam.customerSegmentation.description",
  labelEn: "Description",
  labelDe: "Beschreibung",
  multiline: true,
  section: "Customer Landscape",
  get: (s, sa) => s.marketAttractiveness?.analysis?.targetCustomers || (sa.sam as any)?.customerSegmentation?.description || "",
  apply: (s, sa, v) => ({
    scoring: {
      ...s,
      marketAttractiveness: {
        ...s.marketAttractiveness,
        analysis: { ...s.marketAttractiveness.analysis, targetCustomers: v },
      },
    } as DetailedScoring,
    sa: setSamModel(sa, "customerSegmentation" as any, { description: v }),
  }),
};

const customerSegmentationRationaleField: IdaFieldDef = {
  path: "sam.customerSegmentation.rationale",
  labelEn: "Rationale",
  labelDe: "Begründung",
  multiline: true,
  section: "Customer Landscape",
  get: (s, sa) => s.marketAttractiveness?.analysis?.customerRelationship || (sa.sam as any)?.customerSegmentation?.rationale || "",
  apply: (s, sa, v) => ({
    scoring: {
      ...s,
      marketAttractiveness: {
        ...s.marketAttractiveness,
        analysis: { ...s.marketAttractiveness.analysis, customerRelationship: v },
      },
    } as DetailedScoring,
    sa: setSamModel(sa, "customerSegmentation" as any, { rationale: v }),
  }),
};



const regionField = (area: "tam" | "sam" | "som"): IdaFieldDef => ({
  path: `${area === "tam" ? "overview.tam" : area === "sam" ? "overview.sam" : "overview.som"}.geographicalRegions`,
  labelEn: `${area.toUpperCase()} geographic breakdown`,
  labelDe: `${area.toUpperCase()} geografische Aufschlüsselung`,
  multiline: true,
  section: area === "tam" ? "TAM Overview" : area === "sam" ? "SAM Overview" : "SOM Overview",
  get: (s) => fmtRegions((area === "tam" ? ovTam(s) : area === "sam" ? ovSam(s) : ovSom(s)).geographicalRegions),
  apply: (s, sa, v) => {
    const regions = parseRegions(v);
    return {
      sa,
      scoring: area === "tam"
        ? setTamOv(s, { geographicalRegions: regions })
        : area === "sam"
        ? setSamOv(s, { geographicalRegions: regions })
        : setSomOv(s, { geographicalRegions: regions }),
    };
  },
});

const tamProjectionsField: IdaFieldDef = {
  path: "overview.tam.projections",
  labelEn: "TAM 5-year projections (M€)",
  labelDe: "TAM 5-Jahres-Projektionen (M€)",
  multiline: true,
  section: "TAM Overview",
  get: (s) => fmtProj(s.marketAttractiveness?.analysis?.tamProjections),
  apply: (s, sa, v) => ({
    sa,
    scoring: {
      ...s,
      marketAttractiveness: {
        ...s.marketAttractiveness,
        analysis: { ...s.marketAttractiveness.analysis, tamProjections: parseProj(v) },
      },
    } as DetailedScoring,
  }),
};

const tamGrowthRateField: IdaFieldDef = {
  path: "overview.tam.marketGrowthRate",
  labelEn: "Market growth rate (CAGR statement)",
  labelDe: "Marktwachstumsrate (CAGR-Aussage)",
  multiline: false,
  section: "TAM Overview",
  get: (s) => s.marketAttractiveness?.analysis?.marketGrowthRate || "",
  apply: (s, sa, v) => ({
    sa,
    scoring: {
      ...s,
      marketAttractiveness: {
        ...s.marketAttractiveness,
        analysis: { ...s.marketAttractiveness.analysis, marketGrowthRate: v },
      },
    } as DetailedScoring,
  }),
};

const samProjectionsField: IdaFieldDef = {
  path: "overview.sam.projections",
  labelEn: "SAM 5-year projections (M€)",
  labelDe: "SAM 5-Jahres-Projektionen (M€)",
  multiline: true,
  section: "SAM Overview",
  get: (s) => fmtProj(s.marketAttractiveness?.analysis?.samProjections),
  apply: (s, sa, v) => ({
    sa,
    scoring: {
      ...s,
      marketAttractiveness: {
        ...s.marketAttractiveness,
        analysis: { ...s.marketAttractiveness.analysis, samProjections: parseProj(v) },
      },
    } as DetailedScoring,
  }),
};

const somProjectionsField: IdaFieldDef = {
  path: "overview.som.projections",
  labelEn: "SOM 5-year projections (M€)",
  labelDe: "SOM 5-Jahres-Projektionen (M€)",
  multiline: true,
  section: "SOM Overview",
  get: (s) => fmtProj((s as any).somOverview?.projections),
  apply: (s, sa, v) => ({
    sa,
    scoring: setSomOv(s, { projections: parseProj(v) }),
  }),
};

// ─── full field list ──────────────────────────────────────────────────────
export const TAM_FIELDS: IdaFieldDef[] = [
  // TAM Overview
  tamProjectionsField,
  tamGrowthRateField,
  regionField("tam"),
  ovField("tam", "scopeDefinition", "Scope definition", "Umfangsdefinition"),
  ovField("tam", "geographicCoverage", "Geographic coverage", "Geografische Abdeckung"),
  ovField("tam", "assumptions", "Assumptions", "Annahmen"),
  ovField("tam", "scopeExclusions", "Scope exclusions", "Ausschlüsse"),
  ovField("tam", "fullGlobalPotential", "Full global potential", "Globales Gesamtpotenzial"),
  ovField("tam", "marketDevelopment", "Market development", "Marktentwicklung"),
  ovField("tam", "drivers", "Drivers", "Treiber"),
  ovField("tam", "sources", "Sources", "Quellen"),
  ovField("tam", "sourceAssessment", "Source assessment", "Quellenbewertung"),
  ovField("tam", "derivationMethod", "Derivation method", "Herleitungsmethode"),
  ovField("tam", "supportingModelNotes", "Supporting model notes", "Hinweise zu Modellen"),
  // Market Research
  modelField("tam", "marketResearch", "secondaryResearch", "Market Research", "Secondary research", "Sekundärforschung"),
  modelField("tam", "marketResearch", "primaryResearch", "Market Research", "Primary research", "Primärforschung"),
  modelField("tam", "marketResearch", "keyFigures", "Market Research", "Key figures", "Kennzahlen"),
  modelField("tam", "marketResearch", "methodology", "Market Research", "Methodology", "Methodik"),
  modelField("tam", "marketResearch", "centralInsights", "Market Research", "Central insights", "Zentrale Erkenntnisse"),
  modelField("tam", "marketResearch", "description", "Market Research", "Description", "Beschreibung"),
  modelField("tam", "marketResearch", "rationale", "Market Research", "Rationale", "Begründung"),
  // PESTEL
  modelField("tam", "pestel", "political", "PESTEL", "Political", "Politisch"),
  modelField("tam", "pestel", "economic", "PESTEL", "Economic", "Wirtschaftlich"),
  modelField("tam", "pestel", "social", "PESTEL", "Social", "Sozial"),
  modelField("tam", "pestel", "technological", "PESTEL", "Technological", "Technologisch"),
  modelField("tam", "pestel", "environmental", "PESTEL", "Environmental", "Ökologisch"),
  modelField("tam", "pestel", "legal", "PESTEL", "Legal", "Rechtlich"),
  modelField("tam", "pestel", "description", "PESTEL", "Description", "Beschreibung"),
  modelField("tam", "pestel", "rationale", "PESTEL", "Rationale", "Begründung"),
  // Value Chain
  modelField("tam", "valueChain", "description", "Value Chain", "Description", "Beschreibung"),
  modelField("tam", "valueChain", "rationale", "Value Chain", "Rationale", "Begründung"),
  // Porter
  porterForce("competitiveRivalry", "Competitive rivalry", "Wettbewerbsrivalität"),
  porterForce("threatOfNewEntrants", "Threat of new entrants", "Bedrohung durch neue Anbieter"),
  porterForce("threatOfSubstitutes", "Threat of substitutes", "Bedrohung durch Substitute"),
  porterForce("bargainingPowerBuyers", "Bargaining power of buyers", "Verhandlungsmacht der Käufer"),
  porterForce("bargainingPowerSuppliers", "Bargaining power of suppliers", "Verhandlungsmacht der Lieferanten"),
  modelField("tam", "porter", "description", "Porter's Five Forces", "Description", "Beschreibung"),
  modelField("tam", "porter", "rationale", "Porter's Five Forces", "Rationale", "Begründung"),
  // SWOT
  modelField("tam", "swot", "strengths", "SWOT", "Strengths", "Stärken"),
  modelField("tam", "swot", "weaknesses", "SWOT", "Weaknesses", "Schwächen"),
  modelField("tam", "swot", "opportunities", "SWOT", "Opportunities", "Chancen"),
  modelField("tam", "swot", "threats", "SWOT", "Threats", "Risiken"),
  modelField("tam", "swot", "description", "SWOT", "Description", "Beschreibung"),
  modelField("tam", "swot", "rationale", "SWOT", "Rationale", "Begründung"),
];

export const SAM_FIELDS: IdaFieldDef[] = [
  // SAM Overview
  samProjectionsField,
  regionField("sam"),
  ovField("sam", "samVsTamExplanation", "SAM vs TAM explanation", "SAM vs TAM Erläuterung"),
  ovField("sam", "includedIndustries", "Included industries", "Eingeschlossene Branchen"),
  ovField("sam", "excludedIndustries", "Excluded industries", "Ausgeschlossene Branchen"),
  ovField("sam", "geographicFocus", "Geographic focus", "Geografischer Fokus"),
  ovField("sam", "geographicExclusions", "Geographic exclusions", "Geografische Ausschlüsse"),
  ovField("sam", "targetGroups", "Target groups", "Zielgruppen"),
  ovField("sam", "unreachableGroups", "Unreachable groups", "Nicht erreichbare Gruppen"),
  ovField("sam", "relevanceOutlook", "Relevance outlook", "Relevanzausblick"),
  ovField("sam", "featureAdaptations", "Feature adaptations", "Feature-Anpassungen"),
  ovField("sam", "priceEvolution", "Price evolution", "Preisentwicklung"),
  ovField("sam", "resourceScenarios", "Resource scenarios", "Ressourcenszenarien"),
  ovField("sam", "requiredInvestments", "Required investments", "Erforderliche Investitionen"),
  // Customer Landscape (customerSegmentation narrative + entries table)
  customerSegmentationDescriptionField,
  customerSegmentationRationaleField,
  {
    path: "sam.customerSegmentation.entries",
    labelEn: "Customer segment entries", labelDe: "Kundensegment-Einträge", multiline: true, section: "Customer Landscape",
    get: (s, sa) => fmtCustomerSegments((s.marketAttractiveness?.analysis?.customerSegments || []).map((segment) => ({
      id: crypto.randomUUID(),
      name: segment.name,
      size: String(segment.size ?? ""),
      needs: segment.description || "",
      willingnessToPay: "",
      priority: "medium" as const,
    }))) || fmtCustomerSegments((sa.sam as any)?.customerSegmentation?.entries),
    apply: (s, sa, v) => {
      const entries = parseCustomerSegments(v);
      const visibleSegments = toVisibleCustomerSegments(entries);
      const targetCustomers = s.marketAttractiveness.analysis.targetCustomers?.trim()
        ? s.marketAttractiveness.analysis.targetCustomers
        : entries.map((entry) => entry.name).filter(Boolean).join("; ");

      return {
        scoring: {
          ...s,
          marketAttractiveness: {
            ...s.marketAttractiveness,
            analysis: {
              ...s.marketAttractiveness.analysis,
              targetCustomers,
              customerSegments: visibleSegments,
            },
          },
        } as DetailedScoring,
        sa: setSamModel(sa, "customerSegmentation" as any, { entries }),
      };
    },
  },
  // Customers Found (detailed customer database — mirrors Customer Scan output)
  {
    path: "sam.customersFound.description",
    labelEn: "Customers Found — description", labelDe: "Gefundene Kunden — Beschreibung",
    multiline: true, section: "Customers Found",
    get: (_s, sa) => ((sa.sam as any)?.customersFound || defaultCustomersFound()).description || "",
    apply: (s, sa, v) => ({
      scoring: s,
      sa: setSamModel(sa, "customersFound" as any, { ...((sa.sam as any)?.customersFound || defaultCustomersFound()), description: v }),
    }),
  },
  {
    path: "sam.customersFound.researchScope",
    labelEn: "Customers Found — research scope", labelDe: "Gefundene Kunden — Recherche-Umfang",
    multiline: true, section: "Customers Found",
    get: (_s, sa) => ((sa.sam as any)?.customersFound || defaultCustomersFound()).researchScope || "",
    apply: (s, sa, v) => ({
      scoring: s,
      sa: setSamModel(sa, "customersFound" as any, { ...((sa.sam as any)?.customersFound || defaultCustomersFound()), researchScope: v }),
    }),
  },
  {
    path: "sam.customersFound.bottomUpAssumptions",
    labelEn: "Customers Found — bottom-up assumptions", labelDe: "Gefundene Kunden — Bottom-up-Annahmen",
    multiline: true, section: "Customers Found",
    get: (_s, sa) => ((sa.sam as any)?.customersFound || defaultCustomersFound()).bottomUpAssumptions || "",
    apply: (s, sa, v) => ({
      scoring: s,
      sa: setSamModel(sa, "customersFound" as any, { ...((sa.sam as any)?.customersFound || defaultCustomersFound()), bottomUpAssumptions: v }),
    }),
  },
  {
    path: "sam.customersFound.averageValuePerCustomer",
    labelEn: "Customers Found — average value per customer (M€)", labelDe: "Gefundene Kunden — Ø Wert je Kunde (M€)",
    multiline: false, section: "Customers Found",
    get: (_s, sa) => {
      const v = ((sa.sam as any)?.customersFound || defaultCustomersFound()).averageValuePerCustomer;
      return v ? String(v) : "";
    },
    apply: (s, sa, v) => {
      const n = parseFloat(String(v).replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/)?.[0] || "0");
      return {
        scoring: s,
        sa: setSamModel(sa, "customersFound" as any, {
          ...((sa.sam as any)?.customersFound || defaultCustomersFound()),
          averageValuePerCustomer: Number.isFinite(n) ? n : 0,
        }),
      };
    },
  },
  {
    path: "sam.customersFound.entries",
    labelEn: "Customers Found — entries", labelDe: "Gefundene Kunden — Einträge",
    multiline: true, section: "Customers Found",
    get: (_s, sa) => fmtCustomersFound(((sa.sam as any)?.customersFound || defaultCustomersFound()).entries),
    apply: (s, sa, v) => {
      const entries = parseCustomersFound(v);
      return {
        scoring: s,
        sa: setSamModel(sa, "customersFound" as any, {
          ...((sa.sam as any)?.customersFound || defaultCustomersFound()),
          entries,
        }),
      };
    },
  },
  // BMC
  modelField("sam", "businessModelling", "valueProposition", "Business Model Canvas", "Value proposition", "Wertangebot"),
  modelField("sam", "businessModelling", "customerSegments", "Business Model Canvas", "Customer segments", "Kundensegmente"),
  modelField("sam", "businessModelling", "channels", "Business Model Canvas", "Channels", "Kanäle"),
  modelField("sam", "businessModelling", "customerRelationships", "Business Model Canvas", "Customer relationships", "Kundenbeziehungen"),
  modelField("sam", "businessModelling", "revenueStreams", "Business Model Canvas", "Revenue streams", "Einnahmequellen"),
  modelField("sam", "businessModelling", "keyResources", "Business Model Canvas", "Key resources", "Schlüsselressourcen"),
  modelField("sam", "businessModelling", "keyActivities", "Business Model Canvas", "Key activities", "Schlüsselaktivitäten"),
  modelField("sam", "businessModelling", "keyPartners", "Business Model Canvas", "Key partners", "Schlüsselpartner"),
  modelField("sam", "businessModelling", "costStructure", "Business Model Canvas", "Cost structure", "Kostenstruktur"),
  modelField("sam", "businessModelling", "description", "Business Model Canvas", "Description", "Beschreibung"),
  modelField("sam", "businessModelling", "rationale", "Business Model Canvas", "Rationale", "Begründung"),
  // Lean Canvas
  modelField("sam", "leanCanvas", "problem", "Lean Canvas", "Problem", "Problem"),
  modelField("sam", "leanCanvas", "solution", "Lean Canvas", "Solution", "Lösung"),
  modelField("sam", "leanCanvas", "uniqueValueProposition", "Lean Canvas", "Unique value proposition", "Alleinstellungsmerkmal"),
  modelField("sam", "leanCanvas", "unfairAdvantage", "Lean Canvas", "Unfair advantage", "Unfairer Vorteil"),
  modelField("sam", "leanCanvas", "customerSegments", "Lean Canvas", "Customer segments", "Kundensegmente"),
  modelField("sam", "leanCanvas", "keyMetrics", "Lean Canvas", "Key metrics", "Kennzahlen"),
  modelField("sam", "leanCanvas", "channels", "Lean Canvas", "Channels", "Kanäle"),
  modelField("sam", "leanCanvas", "costStructure", "Lean Canvas", "Cost structure", "Kostenstruktur"),
  modelField("sam", "leanCanvas", "revenueStreams", "Lean Canvas", "Revenue streams", "Einnahmequellen"),
  modelField("sam", "leanCanvas", "description", "Lean Canvas", "Description", "Beschreibung"),
  modelField("sam", "leanCanvas", "rationale", "Lean Canvas", "Rationale", "Begründung"),
  // Risk narrative (scoring.risk.details)
  {
    path: "sam.risk.details",
    labelEn: "Risk narrative", labelDe: "Risiko-Beschreibung", multiline: true, section: "Risk",
    get: (s) => s.risk?.details || "",
    apply: (s, sa, v) => ({ sa, scoring: { ...s, risk: { ...s.risk, details: v } } }),
  },
];

export const SOM_FIELDS: IdaFieldDef[] = [
  // SOM Overview
  somProjectionsField,
  regionField("som"),
  ovField("som", "marketShareVsSam", "Market share vs SAM", "Marktanteil vs SAM"),
  ovField("som", "growthRate", "Growth rate", "Wachstumsrate"),
  ovField("som", "visibilityRate", "Visibility rate", "Sichtbarkeitsquote"),
  ovField("som", "salesCapacity", "Sales capacity", "Vertriebskapazität"),
  ovField("som", "pipeline", "Pipeline", "Pipeline"),
  ovField("som", "licenseToOperate", "License to operate", "License to Operate"),
  ovField("som", "salesCapacityScenario", "Sales capacity scenario", "Vertriebskapazität-Szenario"),
  ovField("som", "marketingBudgetScenario", "Marketing budget scenario", "Marketingbudget-Szenario"),
  ovField("som", "positioningScenario", "Positioning scenario", "Positionierungs-Szenario"),
  // Competitors narrative + entries table
  modelField("som", "competitorAnalysis", "description", "Competitors", "Description", "Beschreibung"),
  modelField("som", "competitorAnalysis", "rationale", "Competitors", "Rationale", "Begründung"),
  {
    path: "som.competitorAnalysis.entries",
    labelEn: "Competitor entries", labelDe: "Wettbewerber-Einträge", multiline: true, section: "Competitors",
    get: (s, sa) => fmtCompetitors((sa.som as any)?.competitorAnalysis?.entries) || fmtCompetitors((s.marketAttractiveness?.analysis?.competitorEntries || []).map((entry) => ({
      id: crypto.randomUUID(),
      name: entry.name,
      marketShare: String(entry.marketShare ?? ""),
      threatLevel: entry.threatLevel || 3,
      strengths: "",
      weaknesses: "",
      strategy: "",
    }))),
    apply: (s, sa, v) => {
      const entries = parseCompetitors(v);
      return {
        scoring: {
          ...s,
          marketAttractiveness: {
            ...s.marketAttractiveness,
            analysis: {
              ...s.marketAttractiveness.analysis,
              competitorEntries: toVisibleCompetitorEntries(entries),
            },
          },
        } as DetailedScoring,
        sa: setSomModel(sa, "competitorAnalysis" as any, { entries }),
      };
    },
  },
  // VPC
  modelField("som", "valuePropositionCanvas", "customerJobs", "Value Proposition Canvas", "Customer jobs", "Kundenaufgaben"),
  modelField("som", "valuePropositionCanvas", "customerPains", "Value Proposition Canvas", "Customer pains", "Kundenprobleme"),
  modelField("som", "valuePropositionCanvas", "customerGains", "Value Proposition Canvas", "Customer gains", "Kundengewinne"),
  modelField("som", "valuePropositionCanvas", "productsServices", "Value Proposition Canvas", "Products & services", "Produkte & Services"),
  modelField("som", "valuePropositionCanvas", "painRelievers", "Value Proposition Canvas", "Pain relievers", "Problemlöser"),
  modelField("som", "valuePropositionCanvas", "gainCreators", "Value Proposition Canvas", "Gain creators", "Gewinnerzeuger"),
  modelField("som", "valuePropositionCanvas", "description", "Value Proposition Canvas", "Description", "Beschreibung"),
  modelField("som", "valuePropositionCanvas", "rationale", "Value Proposition Canvas", "Rationale", "Begründung"),
  // CBA
  modelField("som", "customerBenefitAnalysis", "functionalBenefits", "Customer Benefit Analysis", "Functional benefits", "Funktionale Vorteile"),
  modelField("som", "customerBenefitAnalysis", "emotionalBenefits", "Customer Benefit Analysis", "Emotional benefits", "Emotionale Vorteile"),
  modelField("som", "customerBenefitAnalysis", "socialBenefits", "Customer Benefit Analysis", "Social benefits", "Soziale Vorteile"),
  modelField("som", "customerBenefitAnalysis", "selfExpressiveBenefits", "Customer Benefit Analysis", "Self-expressive benefits", "Selbstausdrucks-Vorteile"),
  modelField("som", "customerBenefitAnalysis", "description", "Customer Benefit Analysis", "Description", "Beschreibung"),
  modelField("som", "customerBenefitAnalysis", "rationale", "Customer Benefit Analysis", "Rationale", "Begründung"),
  // Three Circles
  modelField("som", "threeCircleModel", "ourValue", "Three Circles", "Our value", "Unser Wert"),
  modelField("som", "threeCircleModel", "competitorValue", "Three Circles", "Competitor value", "Wert der Wettbewerber"),
  modelField("som", "threeCircleModel", "customerNeeds", "Three Circles", "Customer needs", "Kundenbedürfnisse"),
  modelField("som", "threeCircleModel", "ourUnique", "Three Circles", "Our unique", "Unser Alleinstellungsmerkmal"),
  modelField("som", "threeCircleModel", "theirUnique", "Three Circles", "Their unique", "Deren Alleinstellungsmerkmal"),
  modelField("som", "threeCircleModel", "commonValue", "Three Circles", "Common value", "Gemeinsamer Wert"),
  modelField("som", "threeCircleModel", "unmetNeeds", "Three Circles", "Unmet needs", "Unerfüllte Bedürfnisse"),
  modelField("som", "threeCircleModel", "description", "Three Circles", "Description", "Beschreibung"),
  modelField("som", "threeCircleModel", "rationale", "Three Circles", "Rationale", "Begründung"),
  // Positioning
  modelField("som", "positioningStatement", "targetAudience", "Positioning", "Target audience", "Zielgruppe"),
  modelField("som", "positioningStatement", "category", "Positioning", "Category", "Kategorie"),
  modelField("som", "positioningStatement", "keyBenefit", "Positioning", "Key benefit", "Hauptnutzen"),
  modelField("som", "positioningStatement", "reasonToBelieve", "Positioning", "Reason to believe", "Grund zu glauben"),
  modelField("som", "positioningStatement", "competitiveAlternative", "Positioning", "Competitive alternative", "Wettbewerbsalternative"),
  modelField("som", "positioningStatement", "differentiator", "Positioning", "Differentiator", "Differenzierung"),
  modelField("som", "positioningStatement", "statement", "Positioning", "Statement", "Statement"),
  modelField("som", "positioningStatement", "description", "Positioning", "Description", "Beschreibung"),
  modelField("som", "positioningStatement", "rationale", "Positioning", "Rationale", "Begründung"),
  // Target Costing (narrative only)
  modelField("som", "targetCosting", "marketPriceRationale", "Target Costing", "Market price rationale", "Marktpreis-Begründung"),
  modelField("som", "targetCosting", "marginRationale", "Target Costing", "Margin rationale", "Margen-Begründung"),
  modelField("som", "targetCosting", "gapAnalysis", "Target Costing", "Gap analysis", "Lückenanalyse"),
  modelField("som", "targetCosting", "actionPlan", "Target Costing", "Action plan", "Maßnahmenplan"),
  modelField("som", "targetCosting", "overallAssessment", "Target Costing", "Overall assessment", "Gesamtbewertung"),
];

export const ALL_FIELDS: IdaFieldDef[] = [...TAM_FIELDS, ...SAM_FIELDS, ...SOM_FIELDS];

export function fieldsForGroup(group: ProposalGroup | "all"): IdaFieldDef[] {
  // The "Customers Found" database lives under sam.* but is also shown on the TAM
  // overview (bottom-up TAM), so offer it when filling TAM too.
  if (group === "tam") return [...TAM_FIELDS, ...SAM_FIELDS.filter(f => f.section === "Customers Found")];
  if (group === "sam") return SAM_FIELDS;
  if (group === "som") return [...SOM_FIELDS, ...SAM_FIELDS.filter(f => f.section === "Customers Found")];
  if (group === "overview") return [
    ...TAM_FIELDS.filter(f => f.section === "TAM Overview"),
    ...SAM_FIELDS.filter(f => f.section === "SAM Overview"),
    ...SOM_FIELDS.filter(f => f.section === "SOM Overview"),
  ];
  return ALL_FIELDS;
}

/** Look up a proposed value by its dot path inside the proposal object. */
export function readProposal(proposal: any, path: string): string {
  const parts = path.split(".");
  let cur: any = proposal;
  for (const p of parts) {
    if (cur == null) return "";
    cur = cur[p];
  }
  if (cur == null) return "";
  if (typeof cur === "string") return cur;
  // Pretty-print 5-year projection arrays as "Year N: V M€"
  if (Array.isArray(cur) && cur.every((p) => p && typeof p === "object" && "year" in p && "value" in p)) {
    return cur
      .slice()
      .sort((a: any, b: any) => a.year - b.year)
      .map((p: any) => `Year ${p.year}: ${p.value} M€`)
      .join("\n");
  }
  if (Array.isArray(cur) && cur.every((r) => r && typeof r === "object" && "region" in r)) {
    return fmtRegions(cur as GeographicalRegion[]);
  }
  if (Array.isArray(cur) && cur.every((r) => r && typeof r === "object" && "name" in r && ("strengths" in r || "weaknesses" in r || "threatLevel" in r))) {
    return fmtCompetitors(cur as CompetitorAnalysisEntry[]);
  }
  if (Array.isArray(cur) && cur.every((r) => r && typeof r === "object" && "name" in r && ("willingnessToPay" in r || "priority" in r || "needs" in r))) {
    return fmtCustomerSegments(cur as CustomerSegmentEntry[]);
  }
  if (Array.isArray(cur) && cur.every((r) => r && typeof r === "object" && "company" in r && ("tier" in r || "customerType" in r))) {
    return fmtCustomersFound(cur as CustomerFoundEntry[]);
  }
  return String(cur);
}
