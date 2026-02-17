export type Stage =
  | "idea"
  | "scoring"
  | "gate1"
  | "business_case"
  | "gate2"
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

export interface GateRecord {
  id: string;
  gate: "gate1" | "gate2";
  decision: GateDecision;
  comment: string;
  decider: string;
  date: string; // ISO date
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  market: string;
  owner: string;
  stage: Stage;
  scoring: Scoring;
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
    const score = key === "risk" ? 6 - scoring[key].score : scoring[key].score; // risk: lower is better → invert
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

export const STAGE_ORDER: Stage[] = [
  "idea",
  "scoring",
  "gate1",
  "business_case",
  "gate2",
  "go_to_market",
  "closed",
];
