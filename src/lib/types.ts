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

export interface DetailedMarketAnalysis {
  tam: string;
  sam: string;
  targetCustomers: string;
  customerRelationship: string;
  competitors: string;
  competitivePosition: string;
}

export interface DetailedScoring {
  marketAttractiveness: { score: number; analysis: DetailedMarketAnalysis };
  strategicFit: { score: number; details: string };
  feasibility: { score: number; details: string };
  commercialViability: { score: number; details: string };
  risk: { score: number; details: string };
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
      analysis: { tam: "", sam: "", targetCustomers: "", customerRelationship: "", competitors: "", competitivePosition: "" },
    },
    strategicFit: { score: 3, details: "" },
    feasibility: { score: 3, details: "" },
    commercialViability: { score: 3, details: "" },
    risk: { score: 3, details: "" },
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
