import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Opportunity, createDefaultScoring, createDefaultDetailedScoring, createDefaultBusinessCase, GateRecord, Stage, Scoring, DetailedScoring, BusinessCase, STAGE_ORDER } from "./types";
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
  updateDetailedScoring: (id: string, detailedScoring: DetailedScoring) => void;
  updateBusinessCase: (id: string, businessCase: BusinessCase) => void;
  addGateDecision: (id: string, gate: GateRecord) => void;
  updateGateDecision: (oppId: string, gateId: string, updates: Partial<GateRecord>) => void;
  deleteGateDecision: (oppId: string, gateId: string) => void;
  revertStage: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

// ── DB helpers ──────────────────────────────────────────────────────
// NOTE: DB column names use legacy identifiers that differ from UI labels:
//   rough_scoring_answers / rough_scoring_comments → UI: "Idea Scoring"
//   detailed_scoring → UI: "Business Plan"
//   business_case → UI: "Implementation and GTM Plan"

function oppToRow(o: Opportunity) {
  return {
    id: o.id,
    title: o.title,
    description: o.description,
    industry: o.industry,
    geography: o.geography,
    technology: o.technology,
    owner: o.owner,
    stage: o.stage,
    scoring: o.scoring as any,
    detailed_scoring: o.detailedScoring ?? null,
    business_case: o.businessCase ?? null,
    strategic_analyses: o.strategicAnalyses ?? null,
    go_to_market_plan: o.goToMarketPlan ?? null,
    implement_review: o.implementReview ?? null,
    rough_scoring_answers: o.roughScoringAnswers ?? null,
    rough_scoring_comments: o.roughScoringComments ?? null,
    gates: o.gates as any,
    created_at: o.createdAt,
  };
}

function rowToOpp(r: any): Opportunity {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    industry: r.industry ?? "",
    geography: r.geography ?? "",
    technology: r.technology ?? "",
    owner: r.owner ?? "",
    stage: r.stage as Stage,
    scoring: r.scoring as Scoring,
    detailedScoring: r.detailed_scoring ?? undefined,
    businessCase: r.business_case ?? undefined,
    strategicAnalyses: r.strategic_analyses ?? undefined,
    goToMarketPlan: r.go_to_market_plan ?? undefined,
    implementReview: r.implement_review ?? undefined,
    roughScoringAnswers: r.rough_scoring_answers ?? undefined,
    roughScoringComments: r.rough_scoring_comments ?? undefined,
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

// ── Provider ────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount; seed mock data if empty
  useEffect(() => {
    fetchOpportunities().then(async (dbOpps) => {
      if (dbOpps.length > 0) {
        setOpportunities(dbOpps);
      } else {
        // Seed mock data into DB on first start
        const mocks = [...MOCK_OPPORTUNITIES];
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
    setOpportunities((prev) => {
      const next = updater(prev);
      return next;
    });
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

  const updateDetailedScoring = useCallback(
    (id: string, detailedScoring: DetailedScoring) => {
      updateLocal((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, detailedScoring } : o));
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
            if (gate.decision === "go") stage = "detailed_scoring";
            else if (gate.decision === "no-go") stage = "closed";
          } else if (gate.gate === "gate2") {
            if (gate.decision === "go") stage = "business_case";
            else if (gate.decision === "no-go") stage = "closed";
          }
          const updates: Partial<Opportunity> = { gates, stage };
          if (stage === "detailed_scoring" && !o.detailedScoring) {
            updates.detailedScoring = createDefaultDetailedScoring();
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
      value={{ opportunities, loading, addOpportunity, updateOpportunity, deleteOpportunity, getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage }}
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
