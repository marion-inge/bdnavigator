import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Opportunity, createDefaultScoring, createDefaultBusinessPlan, createDefaultBusinessCase, createDefaultInvestmentCase, GateRecord, Stage, Scoring, BusinessPlanData, BusinessCase, InvestmentCaseData, STAGE_ORDER, migrateStrategicAnalyses } from "./types";
import { MOCK_OPPORTUNITIES } from "./mockData";
import { supabase } from "@/integrations/supabase/client";

interface StoreContextType {
  opportunities: Opportunity[];
  loading: boolean;
  addOpportunity: (opp: Omit<Opportunity, "id" | "scoring" | "gates" | "createdAt" | "stage">) => Promise<Opportunity>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  getOpportunity: (id: string) => Opportunity | undefined;
  updateScoring: (id: string, scoring: Scoring) => void;
  updateBusinessPlan: (id: string, businessPlan: BusinessPlanData) => void;
  updateInvestmentCase: (id: string, investmentCase: InvestmentCaseData) => void;
  updateBusinessCase: (id: string, businessCase: BusinessCase) => void;
  addGateDecision: (id: string, gate: GateRecord) => void;
  updateGateDecision: (oppId: string, gateId: string, updates: Partial<GateRecord>) => void;
  deleteGateDecision: (oppId: string, gateId: string) => void;
  revertStage: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Keys that belong to detailed scoring (not market modeling)
const DETAILED_SCORING_KEYS = [
  "strategicFit", "feasibility", "commercialViability", "risk",
  "competitorLandscape", "organisationalReadiness", "pilotCustomer", "portfolioFit",
] as const;

function oppToRow(o: Opportunity) {
  // Split: extract detailed scoring keys from businessPlan → scoring.detailed
  const scoring: any = { ...o.scoring };
  let businessPlan: any = o.businessPlan ? { ...o.businessPlan } : null;

  if (businessPlan) {
    const detailed: Record<string, any> = {};
    for (const key of DETAILED_SCORING_KEYS) {
      if (businessPlan[key] !== undefined) {
        detailed[key] = businessPlan[key];
      }
    }
    // Remove detailed keys from business_plan for DB storage
    if (Object.keys(detailed).length > 0) {
      scoring.detailed = detailed;
      const cleaned: any = {};
      for (const [k, v] of Object.entries(businessPlan)) {
        if (!(DETAILED_SCORING_KEYS as readonly string[]).includes(k)) {
          cleaned[k] = v;
        }
      }
      businessPlan = cleaned;
    }
  }

  return {
    id: o.id,
    title: o.title,
    description: o.description,
    solution_description: o.solutionDescription ?? "",
    industry: o.industry,
    geography: o.geography,
    technology: o.technology,
    owner: o.owner,
    idea_bringer: o.ideaBringer ?? "",
    stage: o.stage,
    scoring: scoring as any,
    business_plan: businessPlan,
    investment_case: o.investmentCase ?? null,
    business_case: o.businessCase ?? null,
    strategic_analyses: o.strategicAnalyses ?? null,
    go_to_market_plan: o.goToMarketPlan ?? null,
    implement_review: o.implementReview ?? null,
    rough_scoring_answers: o.roughScoringAnswers ?? null,
    rough_scoring_comments: o.roughScoringComments ?? null,
    rough_scoring_sources: o.roughScoringSources ?? null,
    gates: o.gates as any,
    created_at: o.createdAt,
  };
}

function rowToOpp(r: any): Opportunity {
  // Merge: take detailed scoring from scoring.detailed → businessPlan
  const rawScoring = r.scoring as any;
  const detailed = rawScoring?.detailed || {};
  
  // Clean scoring: remove 'detailed' key for the Scoring type
  const cleanScoring: any = { ...rawScoring };
  delete cleanScoring.detailed;

  // Merge detailed scoring keys back into businessPlan for in-memory use
  const rawBp = r.business_plan;
  const businessPlan = rawBp ? { ...rawBp, ...detailed } : (Object.keys(detailed).length > 0 ? detailed : undefined);

  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    solutionDescription: r.solution_description ?? "",
    industry: r.industry ?? "",
    geography: r.geography ?? "",
    technology: r.technology ?? "",
    owner: r.owner ?? "",
    ideaBringer: r.idea_bringer ?? "",
    stage: r.stage as Stage,
    scoring: cleanScoring as Scoring,
    businessPlan: businessPlan ?? undefined,
    investmentCase: r.investment_case ?? undefined,
    businessCase: r.business_case ?? undefined,
    strategicAnalyses: r.strategic_analyses ? migrateStrategicAnalyses(r.strategic_analyses) : undefined,
    goToMarketPlan: r.go_to_market_plan ?? undefined,
    implementReview: r.implement_review ?? undefined,
    roughScoringAnswers: r.rough_scoring_answers ?? undefined,
    roughScoringComments: r.rough_scoring_comments ?? undefined,
    roughScoringSources: r.rough_scoring_sources ?? undefined,
    gates: (r.gates as GateRecord[]) ?? [],
    createdAt: r.created_at,
  };
}

async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await (supabase as any)
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch opportunities:", error);
    return [];
  }
  return (data ?? []).map(rowToOpp);
}

async function upsertOpportunity(opp: Opportunity) {
  const { error } = await (supabase as any)
    .from("opportunities")
    .upsert(oppToRow(opp), { onConflict: "id" });

  if (error) console.error("Failed to upsert opportunity:", error);
}

async function deleteOpportunityFromDb(id: string) {
  const { error } = await (supabase as any)
    .from("opportunities")
    .delete()
    .eq("id", id);

  if (error) console.error("Failed to delete opportunity:", error);
}

/** Check if an investment case has real data (non-zero investment/R&D) vs just defaults */
function hasSubstantiveInvestmentCase(ic?: InvestmentCaseData): boolean {
  if (!ic?.yearData) return false;
  return ic.yearData.some(y => 
    y.investmentExternal > 0 || y.investmentInternal > 0 || 
    y.rdExternal > 0 || y.rdInternal > 0
  );
}

/** Deep-merge business plan: DB data wins, but fill in missing overview sections from mock */
function mergeBusinessPlan(dbBp: any, mockBp: any): any {
  if (!dbBp) return mockBp;
  if (!mockBp) return dbBp;
  return {
    ...mockBp,
    ...dbBp,
    tamOverview: dbBp.tamOverview || mockBp.tamOverview,
    samOverview: dbBp.samOverview || mockBp.samOverview,
    somOverview: dbBp.somOverview || mockBp.somOverview,
    combinedInterpretation: dbBp.combinedInterpretation || mockBp.combinedInterpretation,
    marketAttractiveness: {
      ...(mockBp.marketAttractiveness || {}),
      ...(dbBp.marketAttractiveness || {}),
      analysis: {
        ...(mockBp.marketAttractiveness?.analysis || {}),
        ...(dbBp.marketAttractiveness?.analysis || {}),
        tamProjections: dbBp.marketAttractiveness?.analysis?.tamProjections?.length ? dbBp.marketAttractiveness.analysis.tamProjections : (mockBp.marketAttractiveness?.analysis?.tamProjections || []),
        samProjections: dbBp.marketAttractiveness?.analysis?.samProjections?.length ? dbBp.marketAttractiveness.analysis.samProjections : (mockBp.marketAttractiveness?.analysis?.samProjections || []),
        geographicalRegions: dbBp.marketAttractiveness?.analysis?.geographicalRegions?.length ? dbBp.marketAttractiveness.analysis.geographicalRegions : (mockBp.marketAttractiveness?.analysis?.geographicalRegions || []),
        customerSegments: dbBp.marketAttractiveness?.analysis?.customerSegments?.length ? dbBp.marketAttractiveness.analysis.customerSegments : (mockBp.marketAttractiveness?.analysis?.customerSegments || []),
        competitorEntries: dbBp.marketAttractiveness?.analysis?.competitorEntries?.length ? dbBp.marketAttractiveness.analysis.competitorEntries : (mockBp.marketAttractiveness?.analysis?.competitorEntries || []),
      },
    },
  };
}

/** Deep-merge strategic analyses: DB wins per-field, but fill missing sub-objects from mock */
function mergeStrategicAnalyses(dbSa: any, mockSa: any): any {
  if (!dbSa) return mockSa;
  if (!mockSa) return dbSa;
  const mergeGroup = (dbGroup: any, mockGroup: any) => {
    if (!dbGroup) return mockGroup;
    if (!mockGroup) return dbGroup;
    const result = { ...mockGroup };
    for (const key of Object.keys(dbGroup)) {
      if (dbGroup[key] != null) result[key] = dbGroup[key];
    }
    // Fill in keys from mock that DB doesn't have
    for (const key of Object.keys(mockGroup)) {
      if (result[key] == null) result[key] = mockGroup[key];
    }
    return result;
  };
  return {
    ideaScoring: mergeGroup(dbSa.ideaScoring, mockSa.ideaScoring),
    tam: mergeGroup(dbSa.tam, mockSa.tam),
    sam: mergeGroup(dbSa.sam, mockSa.sam),
    som: mergeGroup(dbSa.som, mockSa.som),
  };
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mocks = (MOCK_OPPORTUNITIES as any[]).map((m: any) => ({
      ...m,
      businessPlan: m.businessPlan ?? m.detailedScoring ?? undefined,
      strategicAnalyses: m.strategicAnalyses ? migrateStrategicAnalyses(m.strategicAnalyses) : undefined,
    })) as Opportunity[];

    fetchOpportunities().then(async (dbOpps) => {
      if (dbOpps.length > 0) {
        // Merge mock data into DB records to fill any missing fields
        const mockMap = new Map(mocks.map((m) => [m.id, m]));
        const merged = dbOpps.map((dbOpp) => {
          const mock = mockMap.get(dbOpp.id);
          if (!mock) return dbOpp;
          const updated: Opportunity = {
            ...mock,
            ...dbOpp,
            // Prefer mock data for fields that are empty/undefined in DB
            solutionDescription: dbOpp.solutionDescription || mock.solutionDescription,
            ideaBringer: dbOpp.ideaBringer || mock.ideaBringer,
            businessPlan: mergeBusinessPlan(dbOpp.businessPlan, mock.businessPlan),
            investmentCase: hasSubstantiveInvestmentCase(dbOpp.investmentCase) ? dbOpp.investmentCase : (mock.investmentCase || dbOpp.investmentCase),
            businessCase: dbOpp.businessCase || mock.businessCase,
            implementReview: dbOpp.implementReview || mock.implementReview,
            roughScoringComments: dbOpp.roughScoringComments || mock.roughScoringComments,
            roughScoringSources: dbOpp.roughScoringSources || mock.roughScoringSources,
            strategicAnalyses: mergeStrategicAnalyses(dbOpp.strategicAnalyses, mock.strategicAnalyses),
            goToMarketPlan: dbOpp.goToMarketPlan || mock.goToMarketPlan,
          };
          return updated;
        });
        // Add any mock opportunities not yet in DB
        const dbIds = new Set(dbOpps.map((o) => o.id));
        const newMocks = mocks.filter((m) => !dbIds.has(m.id));
        const all = [...merged, ...newMocks];
        setOpportunities(all);
        // Upsert all to persist merged data
        for (const opp of all) {
          await upsertOpportunity(opp);
        }
      } else {
        setOpportunities(mocks);
        for (const opp of mocks) {
          await upsertOpportunity(opp);
        }
        console.log("Seeded", mocks.length, "mock opportunities into DB");
      }
      setLoading(false);
    });
  }, []);

  const updateLocal = useCallback((updater: (prev: Opportunity[]) => Opportunity[]) => {
    setOpportunities((prev) => updater(prev));
  }, []);

  const addOpportunity = useCallback(
    async (opp: Omit<Opportunity, "id" | "scoring" | "gates" | "createdAt" | "stage">) => {
      const newOpp: Opportunity = {
        ...opp,
        id: crypto.randomUUID(),
        stage: "idea",
        scoring: createDefaultScoring(),
        gates: [],
        createdAt: new Date().toISOString(),
      };
      updateLocal((prev) => [...prev, newOpp]);
      await upsertOpportunity(newOpp);
      return newOpp;
    },
    [updateLocal]
  );

  const updateOpportunity = useCallback(
    (id: string, updates: Partial<Opportunity>) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, ...updates } : o));
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const deleteOpportunity = useCallback(
    (id: string) => {
      updateLocal((prev) => prev.filter((o) => o.id !== id));
      deleteOpportunityFromDb(id);
    },
    [updateLocal]
  );

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.id === id),
    [opportunities]
  );

  const updateScoring = useCallback(
    (id: string, scoring: Scoring) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, scoring } : o));
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const updateBusinessPlan = useCallback(
    (id: string, businessPlan: BusinessPlanData) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, businessPlan } : o));
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const updateInvestmentCase = useCallback(
    (id: string, investmentCase: InvestmentCaseData) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, investmentCase } : o));
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const updateBusinessCase = useCallback(
    (id: string, businessCase: BusinessCase) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, businessCase } : o));
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const addGateDecision = useCallback(
    (id: string, gate: GateRecord) => {
      updateLocal((prev) => {
        const next = prev.map((o) => {
          if (o.id !== id) return o;
          const gates = [...o.gates, gate];
          let stage: Stage = o.stage;
          if (gate.gate === "gate1") {
            if (gate.decision === "go") stage = "business_plan";
            else if (gate.decision === "no-go") stage = "closed";
          } else if (gate.gate === "gate2") {
            if (gate.decision === "go") stage = "investment_case";
            else if (gate.decision === "no-go") stage = "closed";
          } else if (gate.gate === "gate3") {
            if (gate.decision === "go") stage = "business_case";
            else if (gate.decision === "no-go") stage = "closed";
          }
          const updates: Partial<Opportunity> = { gates, stage };
          if (stage === "business_plan" && !o.businessPlan) {
            updates.businessPlan = createDefaultBusinessPlan();
          }
          if (stage === "investment_case" && !o.investmentCase) {
            updates.investmentCase = createDefaultInvestmentCase();
          }
          if (stage === "business_case" && !o.businessCase) {
            updates.businessCase = createDefaultBusinessCase();
          }
          return { ...o, ...updates };
        });
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const updateGateDecision = useCallback(
    (oppId: string, gateId: string, updates: Partial<GateRecord>) => {
      updateLocal((prev) => {
        const next = prev.map((o) => {
          if (o.id !== oppId) return o;
          const gates = o.gates.map((g) => (g.id === gateId ? { ...g, ...updates } : g));
          return { ...o, gates };
        });
        const updated = next.find((o) => o.id === oppId);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const deleteGateDecision = useCallback(
    (oppId: string, gateId: string) => {
      updateLocal((prev) => {
        const next = prev.map((o) => {
          if (o.id !== oppId) return o;
          const gates = o.gates.filter((g) => g.id !== gateId);
          return { ...o, gates };
        });
        const updated = next.find((o) => o.id === oppId);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  const GATE_STAGE_INDEX: Record<string, number> = {
    gate1: STAGE_ORDER.indexOf("gate1"),
    gate2: STAGE_ORDER.indexOf("gate2"),
    gate3: STAGE_ORDER.indexOf("gate3"),
  };

  const revertStage = useCallback(
    (id: string) => {
      updateLocal((prev) => {
        const next = prev.map((o) => {
          if (o.id !== id) return o;
          const idx = STAGE_ORDER.indexOf(o.stage);
          if (idx <= 0) return o;
          const prevStage = STAGE_ORDER[idx - 1];
          const prevIdx = idx - 1;
          const gates = o.gates.filter((g) => {
            const gateIdx = GATE_STAGE_INDEX[g.gate];
            return gateIdx !== undefined && gateIdx < prevIdx;
          });
          return { ...o, stage: prevStage, gates };
        });
        const updated = next.find((o) => o.id === id);
        if (updated) upsertOpportunity(updated);
        return next;
      });
    },
    [updateLocal]
  );

  return (
    <StoreContext.Provider
      value={{ opportunities, loading, addOpportunity, updateOpportunity, deleteOpportunity, getOpportunity, updateScoring, updateBusinessPlan, updateInvestmentCase, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
