export type Stage =
  | "idea"
  | "rough_scoring"
  | "gate1"
  | "detailed_scoring"
  | "gate2"
  | "business_case"
  | "gate3"
  | "go_to_market"
  | "closed";

export type GateDecision = "go" | "hold" | "no-go";

export interface ScoringCriterion {
  id: string;
  score: number; // 1-5
  comment: string;
}

export interface Scoring {
  marketAttractiveness: ScoringCriterion;
  strategicFit: ScoringCriterion;
  feasibility: ScoringCriterion;
  commercialViability: ScoringCriterion;
  risk: ScoringCriterion;
}

export interface CustomerSegment {
  name: string;
  size: number; // percentage or absolute
  description: string;
}

export interface CompetitorEntry {
  name: string;
  marketShare: number; // percentage
  threatLevel: number; // 1-5
}

export interface GeographicalRegion {
  region: string;
  potential: number; // 1-5
  marketSize: string;
  notes: string;
}

export interface DetailedMarketAnalysis {
  // Marktpotential
  tam: string;
  tamDescription: string;
  sam: string;
  samDescription: string;
  marketGrowthRate: string;
  // Customer Landscape
  targetCustomers: string;
  customerRelationship: string;
  customerSegments: CustomerSegment[];
  // Competitor Landscape
  competitors: string;
  competitivePosition: string;
  competitorEntries: CompetitorEntry[];
  // Geographical Focus
  geographicalRegions: GeographicalRegion[];
}

export interface RevenueProjection {
  year: number;
  revenue: number;
  costs: number;
}

export interface FeasibilityMilestone {
  id: string;
  name: string;
  targetDate: string;
  status: "planned" | "in_progress" | "completed" | "delayed";
}

export interface RiskItem {
  id: string;
  name: string;
  category: "market" | "technical" | "regulatory" | "execution" | "financial";
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
}

export interface AlignmentDimension {
  key: string;
  label: string;
  current: number; // 1-5 current capability
  required: number; // 1-5 required level
}

export interface CapabilityGap {
  id: string;
  capability: string;
  currentLevel: number; // 1-5
  requiredLevel: number; // 1-5
  action: string;
  priority: "high" | "medium" | "low";
}

export interface DetailedScoring {
  marketAttractiveness: { score: number; analysis: DetailedMarketAnalysis };
  strategicFit: { score: number; details: string; alignmentDimensions?: AlignmentDimension[]; capabilityGaps?: CapabilityGap[] };
  feasibility: { score: number; details: string; trl?: number; milestones?: FeasibilityMilestone[] };
  commercialViability: {
    score: number;
    details: string;
    pricingModel: string;
    unitPrice: number;
    grossMargin: number;
    projections: RevenueProjection[];
    breakEvenUnits: number;
  };
  risk: { score: number; details: string; riskItems?: RiskItem[] };
}

export interface BusinessCase {
  investmentCost: number;
  expectedRevenue: number;
  roi: number;
  breakEvenMonths: number;
  paybackPeriod: number;
  npv: number;
  notes: string;
}

export interface GateRecord {
  id: string;
  gate: "gate1" | "gate2" | "gate3";
  decision: GateDecision;
  comment: string;
  decider: string;
  date: string; // ISO date
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  industry: string;
  geography: string;
  technology: string;
  owner: string;
  stage: Stage;
  scoring: Scoring;
  detailedScoring?: DetailedScoring;
  businessCase?: BusinessCase;
  gates: GateRecord[];
  createdAt: string;
}

export const SCORING_WEIGHTS: Record<keyof Scoring, number> = {
  marketAttractiveness: 3,
  strategicFit: 3,
  feasibility: 2,
  commercialViability: 2,
  risk: 1,
};

export function calculateTotalScore(scoring: Scoring): number {
  const entries = Object.entries(SCORING_WEIGHTS) as [keyof Scoring, number][];
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, weight] of entries) {
    const score = key === "risk" ? 6 - scoring[key].score : scoring[key].score;
    weightedSum += score * weight;
    totalWeight += weight;
  }
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function createDefaultScoring(): Scoring {
  const makeCriterion = (id: string): ScoringCriterion => ({
    id,
    score: 3,
    comment: "",
  });
  return {
    marketAttractiveness: makeCriterion("marketAttractiveness"),
    strategicFit: makeCriterion("strategicFit"),
    feasibility: makeCriterion("feasibility"),
    commercialViability: makeCriterion("commercialViability"),
    risk: makeCriterion("risk"),
  };
}

export function createDefaultDetailedScoring(): DetailedScoring {
  return {
    marketAttractiveness: {
      score: 3,
      analysis: { tam: "", tamDescription: "", sam: "", samDescription: "", marketGrowthRate: "", targetCustomers: "", customerRelationship: "", customerSegments: [], competitors: "", competitivePosition: "", competitorEntries: [], geographicalRegions: [] },
    },
    strategicFit: { score: 3, details: "", alignmentDimensions: [], capabilityGaps: [] },
    feasibility: { score: 3, details: "", trl: 1, milestones: [] },
    commercialViability: {
      score: 3,
      details: "",
      pricingModel: "",
      unitPrice: 0,
      grossMargin: 0,
      projections: [
        { year: 1, revenue: 0, costs: 0 },
        { year: 2, revenue: 0, costs: 0 },
        { year: 3, revenue: 0, costs: 0 },
        { year: 4, revenue: 0, costs: 0 },
        { year: 5, revenue: 0, costs: 0 },
      ],
      breakEvenUnits: 0,
    },
    risk: { score: 3, details: "", riskItems: [] },
  };
}

export function createDefaultBusinessCase(): BusinessCase {
  return {
    investmentCost: 0,
    expectedRevenue: 0,
    roi: 0,
    breakEvenMonths: 0,
    paybackPeriod: 0,
    npv: 0,
    notes: "",
  };
}

export const STAGE_ORDER: Stage[] = [
  "idea",
  "rough_scoring",
  "gate1",
  "detailed_scoring",
  "gate2",
  "business_case",
  "gate3",
  "go_to_market",
  "closed",
];
