import { Opportunity, Scoring, GateRecord, Stage, BusinessPlanData, BusinessCase, createDefaultStrategicAnalyses, StrategicAnalyses, InvestmentCaseData } from "./types";

// Mock data uses old flat strategicAnalyses format; migrateStrategicAnalyses() in store handles conversion at runtime
const sa = (data: Record<string, any>): StrategicAnalyses => data as unknown as StrategicAnalyses;

function scoring(ma: number, sf: number, fe: number, cv: number, ri: number, comments: Record<string, string>): Scoring {
  return {
    marketAttractiveness: { id: "marketAttractiveness", score: ma, comment: comments.marketAttractiveness ?? "" },
    strategicFit: { id: "strategicFit", score: sf, comment: comments.strategicFit ?? "" },
    feasibility: { id: "feasibility", score: fe, comment: comments.feasibility ?? "" },
    commercialViability: { id: "commercialViability", score: cv, comment: comments.commercialViability ?? "" },
    risk: { id: "risk", score: ri, comment: comments.risk ?? "" },
  };
}

export const MOCK_OPPORTUNITIES: (Omit<Opportunity, 'strategicAnalyses' | 'businessPlan'> & { strategicAnalyses?: any; detailedScoring?: any; businessPlan?: any })[] = [

  // ═══════════════════════════════════════════════════════════════════════════
];
