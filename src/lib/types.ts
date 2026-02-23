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

export interface MarketYearValue {
  year: number;
  value: number; // in M€
}

export interface DetailedMarketAnalysis {
  // Marktpotential
  tam: string; // kept for legacy / description
  tamDescription: string;
  tamProjections: MarketYearValue[]; // 5-year TAM
  sam: string; // kept for legacy / description
  samDescription: string;
  samProjections: MarketYearValue[]; // 5-year SAM
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

export interface PorterForce {
  intensity: number; // 1-5
  description: string;
}

export interface PortersFiveForces {
  competitiveRivalry: PorterForce;
  threatOfNewEntrants: PorterForce;
  threatOfSubstitutes: PorterForce;
  bargainingPowerBuyers: PorterForce;
  bargainingPowerSuppliers: PorterForce;
  description: string;
  rationale: string;
}

export interface ValueChainActivity {
  relevance: number; // 1-5
  description: string;
}

export interface IndustryValueChain {
  primaryActivities: {
    inboundLogistics: ValueChainActivity;
    operations: ValueChainActivity;
    outboundLogistics: ValueChainActivity;
    marketingSales: ValueChainActivity;
    service: ValueChainActivity;
  };
  supportActivities: {
    firmInfrastructure: ValueChainActivity;
    hrManagement: ValueChainActivity;
    technologyDevelopment: ValueChainActivity;
    procurement: ValueChainActivity;
  };
  description: string;
  rationale: string;
}

export interface StrategicAnalyses {
  ansoff: { position: string; description: string; rationale: string };
  bcg: { position: string; description: string; rationale: string };
  mckinsey: { position: string; description: string; rationale: string };
  swot: {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
    description: string;
    rationale: string;
  };
  pestel: {
    political: string;
    economic: string;
    social: string;
    technological: string;
    environmental: string;
    legal: string;
    description: string;
    rationale: string;
  };
  porter: PortersFiveForces;
  valueChain?: IndustryValueChain;
}

function createDefaultPorter(): PortersFiveForces {
  const force = (): PorterForce => ({ intensity: 3, description: "" });
  return {
    competitiveRivalry: force(),
    threatOfNewEntrants: force(),
    threatOfSubstitutes: force(),
    bargainingPowerBuyers: force(),
    bargainingPowerSuppliers: force(),
    description: "",
    rationale: "",
  };
}

function createDefaultValueChain(): IndustryValueChain {
  const activity = (): ValueChainActivity => ({ relevance: 3, description: "" });
  return {
    primaryActivities: {
      inboundLogistics: activity(),
      operations: activity(),
      outboundLogistics: activity(),
      marketingSales: activity(),
      service: activity(),
    },
    supportActivities: {
      firmInfrastructure: activity(),
      hrManagement: activity(),
      technologyDevelopment: activity(),
      procurement: activity(),
    },
    description: "",
    rationale: "",
  };
}

export function createDefaultStrategicAnalyses(): StrategicAnalyses {
  return {
    ansoff: { position: "", description: "", rationale: "" },
    bcg: { position: "", description: "", rationale: "" },
    mckinsey: { position: "", description: "", rationale: "" },
    swot: { strengths: "", weaknesses: "", opportunities: "", threats: "", description: "", rationale: "" },
    pestel: { political: "", economic: "", social: "", technological: "", environmental: "", legal: "", description: "", rationale: "" },
    porter: createDefaultPorter(),
    valueChain: createDefaultValueChain(),
  };
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
  strategicAnalyses?: StrategicAnalyses;
  roughScoringAnswers?: Record<string, number>;
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
      analysis: {
        tam: "", tamDescription: "",
        tamProjections: [1,2,3,4,5].map((y) => ({ year: y, value: 0 })),
        sam: "", samDescription: "",
        samProjections: [1,2,3,4,5].map((y) => ({ year: y, value: 0 })),
        marketGrowthRate: "", targetCustomers: "", customerRelationship: "",
        customerSegments: [], competitors: "", competitivePosition: "",
        competitorEntries: [], geographicalRegions: [],
      },
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
