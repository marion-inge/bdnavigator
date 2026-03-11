import type { GeographicalRegion, MarketYearValue } from "./types";

export interface TamOverviewData {
  scopeDefinition: string;
  geographicCoverage: string;
  assumptions: string;
  scopeExclusions: string;
  fullGlobalPotential: string;
  marketDevelopment: string;
  drivers: string;
  geographicalRegions: GeographicalRegion[];
  sources: string;
  sourceAssessment: string;
  derivationMethod: string;
  supportingModelNotes: string;
}

export interface SalesChannelEntry {
  id: string;
  channelName: string;
  channelType: "direct" | "indirect" | "digital" | "partner" | "other";
  reach: string;
  costLevel: "low" | "medium" | "high";
  targetSegments: string;
  rating: number; // 1-5
  notes: string;
}

export interface SalesChannelAnalysis {
  entries: SalesChannelEntry[];
  channelStrategy: string;
  channelMix: string;
}

export interface SamOverviewData {
  samVsTamExplanation: string;
  includedIndustries: string;
  excludedIndustries: string;
  geographicFocus: string;
  geographicExclusions: string;
  targetGroups: string;
  unreachableGroups: string;
  relevanceOutlook: string;
  featureAdaptations: string;
  priceEvolution: string;
  resourceScenarios: string;
  requiredInvestments: string;
  geographicalRegions: GeographicalRegion[];
  salesChannelAnalysis?: SalesChannelAnalysis;
}

export interface SomOverviewData {
  projections: MarketYearValue[];
  marketShareVsSam: string;
  growthRate: string;
  visibilityRate: string;
  salesCapacity: string;
  pipeline: string;
  licenseToOperate: string;
  salesCapacityScenario: string;
  marketingBudgetScenario: string;
  positioningScenario: string;
  geographicalRegions: GeographicalRegion[];
  // Numeric market assumption parameters for Business Case bridge
  portfolioCoveragePct?: number;
  visibilityPct?: number;
  visibilityGrowthPct?: number;
  hitratePct?: number;
}

export interface InternalInterviewEntry {
  id: string;
  date: string;
  intervieweeName: string;
  role: string;
  department: string;
  keyInsights: string;
  recommendations: string;
  quotes: string;
}

export function createDefaultTamOverview(): TamOverviewData {
  return {
    scopeDefinition: "", geographicCoverage: "", assumptions: "", scopeExclusions: "",
    fullGlobalPotential: "", marketDevelopment: "", drivers: "", geographicalRegions: [],
    sources: "", sourceAssessment: "", derivationMethod: "", supportingModelNotes: "",
  };
}

export function createDefaultSamOverview(): SamOverviewData {
  return {
    samVsTamExplanation: "", includedIndustries: "", excludedIndustries: "",
    geographicFocus: "", geographicExclusions: "", targetGroups: "", unreachableGroups: "",
    relevanceOutlook: "", featureAdaptations: "", priceEvolution: "",
    resourceScenarios: "", requiredInvestments: "", geographicalRegions: [],
  };
}

export function createDefaultSomOverview(): SomOverviewData {
  return {
    projections: [1, 2, 3, 4, 5].map(y => ({ year: y, value: 0 })),
    marketShareVsSam: "", growthRate: "", visibilityRate: "",
    salesCapacity: "", pipeline: "", licenseToOperate: "",
    salesCapacityScenario: "", marketingBudgetScenario: "", positioningScenario: "",
  geographicalRegions: [],
  };
}

export interface CombinedInterpretation {
  overallPotential: string;
  samDevelopment: string;
  somDevelopment: string;
  gapsAndLevers: string;
}
