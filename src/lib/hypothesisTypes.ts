// Hypothesis Builder data model
export type HypothesisStatus = "draft" | "confirmed";
export type ScanKey =
  | "industry"
  | "customer"
  | "competitor"
  | "market_potential"
  | "buying_center";

export const ALL_SCAN_KEYS: ScanKey[] = [
  "industry",
  "customer",
  "competitor",
  "market_potential",
  "buying_center",
];

export interface HypothesisCore {
  hypothesisStatement: string;
  client: { company: string; businessUnit: string };
  offering: {
    name: string;
    description: string;
    specAnchors: string[];
    businessModel: "one-time" | "recurring" | "service" | "";
  };
  targetMarkets: Array<{ segment: string; region: string }>;
}

export interface HypothesisIndustry {
  studyPurpose: string;
  segmentsInDepth: string[];
  depth: string;
  geography: { primary: string[]; baseline: string[]; light: string[] };
  outputs: {
    valueChainMap: boolean;
    wordStudy: boolean;
    excelPlayerDb: boolean;
    slideDeck: boolean;
  };
}

export interface HypothesisCustomer {
  products: string;
  reportMode: string;
  useCases: string;
  businessModel: string;
  targetMarket: string;
  customerTypes: string;
  preferences: string;
  tierCriteria: string;
  additionalComments: string;
}

export interface HypothesisCompetitor {
  client: string;
  offering: { name: string; description: string; specAnchors: string[] };
  targetMarkets: Array<{ segment: string; region: string }>;
  knownCompetitors: Array<{ name: string; clientBelief: string }>;
  benchmarkCriteria: string[];
  depthCap: number;
  targetCosting: { targetMargin: string; currentCost: string; wtpAnchors: string };
  frameworks: {
    vpc: boolean;
    cba: boolean;
    threeCircle: boolean;
    positioning: boolean;
    targetCosting: boolean;
  };
  preferences: string;
  additionalComments: string;
}

export interface HypothesisMarketPotential {
  pricePerUnitOrSeat: string;
  unitsPerCustomerType: Array<{ customerType: string; units: string }>;
  recurringOrOneTime: "recurring" | "one_time" | "";
  baseYear: string;
  currency: string;
  winRateAssumption: string;
  adoptionAssumption: string;
  addressableShareAssumption: string;
  scenarios: { conservative: string; realistic: string; aggressive: string };
}

export interface HypothesisBuyingCenter {
  offeringDescription: string;
  seedInputType: string;
  shortlistRule: string;
  depth: string;
  deliveryNotes: string;
}

export interface HypothesisData {
  status: HypothesisStatus;
  selectedScans: ScanKey[];
  updatedAt: string;
  aiDraftedAt?: string;
  core: HypothesisCore;
  industry?: HypothesisIndustry;
  customer?: HypothesisCustomer;
  competitor?: HypothesisCompetitor;
  marketPotential?: HypothesisMarketPotential;
  buyingCenter?: HypothesisBuyingCenter;
}

export function createDefaultHypothesis(): HypothesisData {
  return {
    status: "draft",
    selectedScans: [],
    updatedAt: new Date().toISOString(),
    core: {
      hypothesisStatement: "",
      client: { company: "", businessUnit: "" },
      offering: { name: "", description: "", specAnchors: [], businessModel: "" },
      targetMarkets: [],
    },
  };
}

export function createDefaultIndustry(): HypothesisIndustry {
  return {
    studyPurpose: "",
    segmentsInDepth: [],
    depth: "",
    geography: { primary: [], baseline: [], light: [] },
    outputs: { valueChainMap: false, wordStudy: false, excelPlayerDb: false, slideDeck: false },
  };
}
export function createDefaultCustomer(): HypothesisCustomer {
  return {
    products: "", reportMode: "", useCases: "", businessModel: "", targetMarket: "",
    customerTypes: "", preferences: "", tierCriteria: "", additionalComments: "",
  };
}
export function createDefaultCompetitor(): HypothesisCompetitor {
  return {
    client: "",
    offering: { name: "", description: "", specAnchors: [] },
    targetMarkets: [],
    knownCompetitors: [],
    benchmarkCriteria: [],
    depthCap: 12,
    targetCosting: { targetMargin: "", currentCost: "", wtpAnchors: "" },
    frameworks: { vpc: false, cba: false, threeCircle: false, positioning: false, targetCosting: false },
    preferences: "",
    additionalComments: "",
  };
}
export function createDefaultMarketPotential(): HypothesisMarketPotential {
  return {
    pricePerUnitOrSeat: "",
    unitsPerCustomerType: [],
    recurringOrOneTime: "",
    baseYear: "",
    currency: "EUR",
    winRateAssumption: "",
    adoptionAssumption: "",
    addressableShareAssumption: "",
    scenarios: { conservative: "", realistic: "", aggressive: "" },
  };
}
export function createDefaultBuyingCenter(): HypothesisBuyingCenter {
  return {
    offeringDescription: "",
    seedInputType: "",
    shortlistRule: "",
    depth: "",
    deliveryNotes: "",
  };
}

/** Merge an AI draft into an existing hypothesis. If overwrite=false, only fill empty fields. */
export function mergeHypothesisDraft(
  existing: HypothesisData,
  draft: Partial<HypothesisData>,
  overwrite: boolean,
): HypothesisData {
  const isEmpty = (v: any): boolean =>
    v === undefined || v === null || v === "" ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && !Array.isArray(v) && Object.values(v).every(isEmpty));

  const mergeObj = (base: any, incoming: any): any => {
    if (incoming === undefined || incoming === null) return base;
    if (Array.isArray(incoming)) {
      if (overwrite && incoming.length > 0) return incoming;
      if (!base || (Array.isArray(base) && base.length === 0)) return incoming;
      return base;
    }
    if (typeof incoming !== "object") {
      if (overwrite && !isEmpty(incoming)) return incoming;
      if (isEmpty(base) && !isEmpty(incoming)) return incoming;
      return base;
    }
    const out: any = { ...(base || {}) };
    for (const k of Object.keys(incoming)) {
      out[k] = mergeObj(out[k], incoming[k]);
    }
    return out;
  };

  const merged: HypothesisData = {
    ...existing,
    core: mergeObj(existing.core, draft.core),
    industry: draft.industry ? mergeObj(existing.industry, draft.industry) : existing.industry,
    customer: draft.customer ? mergeObj(existing.customer, draft.customer) : existing.customer,
    competitor: draft.competitor ? mergeObj(existing.competitor, draft.competitor) : existing.competitor,
    marketPotential: draft.marketPotential ? mergeObj(existing.marketPotential, draft.marketPotential) : existing.marketPotential,
    buyingCenter: draft.buyingCenter ? mergeObj(existing.buyingCenter, draft.buyingCenter) : existing.buyingCenter,
    aiDraftedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return merged;
}
