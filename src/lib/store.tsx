import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Opportunity, createDefaultScoring, createDefaultDetailedScoring, createDefaultBusinessCase, GateRecord, Stage, Scoring, DetailedScoring, BusinessCase, STAGE_ORDER } from "./types";
import { MOCK_OPPORTUNITIES } from "./mockData";

interface StoreContextType {
  opportunities: Opportunity[];
  addOpportunity: (opp: Omit<Opportunity, "id" | "scoring" | "gates" | "createdAt" | "stage">) => Opportunity;
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

const STORAGE_KEY = "bd-pipeline-opportunities";

function loadOpportunities(): Opportunity[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: Opportunity[] = JSON.parse(data);
      // Migrate: merge strategicAnalyses from mock data if missing in stored data
      const mockMap = new Map(MOCK_OPPORTUNITIES.map((m) => [m.id, m]));
      const migrated = parsed.map((o) => {
        const mock = mockMap.get(o.id);
        if (!mock?.strategicAnalyses) return o;
        if (!o.strategicAnalyses) {
          return { ...o, strategicAnalyses: mock.strategicAnalyses };
        }
        // Always sync threeHorizons and ansoff from mock if mock has values
        const sa = { ...o.strategicAnalyses };
        let updated = false;
        if (mock.strategicAnalyses.threeHorizons?.horizon) {
          sa.threeHorizons = mock.strategicAnalyses.threeHorizons;
          updated = true;
        }
        if (mock.strategicAnalyses.ansoff?.position && !sa.ansoff?.position) {
          sa.ansoff = mock.strategicAnalyses.ansoff;
          updated = true;
        }
        return updated ? { ...o, strategicAnalyses: sa } : o;
      });
      saveOpportunities(migrated);
      return migrated;
    }
    saveOpportunities(MOCK_OPPORTUNITIES);
    return [...MOCK_OPPORTUNITIES];
  } catch {
    return [];
  }
}

function saveOpportunities(opps: Opportunity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opps));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(loadOpportunities);

  const persist = useCallback((opps: Opportunity[]) => {
    setOpportunities(opps);
    saveOpportunities(opps);
  }, []);

  const addOpportunity = useCallback(
    (opp: Omit<Opportunity, "id" | "scoring" | "gates" | "createdAt" | "stage">) => {
      const newOpp: Opportunity = {
        ...opp,
        id: crypto.randomUUID(),
        stage: "idea",
        scoring: createDefaultScoring(),
        gates: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [...opportunities, newOpp];
      persist(updated);
      return newOpp;
    },
    [opportunities, persist]
  );

  const updateOpportunity = useCallback(
    (id: string, updates: Partial<Opportunity>) => {
      persist(opportunities.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    },
    [opportunities, persist]
  );

  const deleteOpportunity = useCallback(
    (id: string) => {
      persist(opportunities.filter((o) => o.id !== id));
    },
    [opportunities, persist]
  );

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.id === id),
    [opportunities]
  );

  const updateScoring = useCallback(
    (id: string, scoring: Scoring) => {
      persist(opportunities.map((o) => (o.id === id ? { ...o, scoring } : o)));
    },
    [opportunities, persist]
  );

  const updateDetailedScoring = useCallback(
    (id: string, detailedScoring: DetailedScoring) => {
      persist(opportunities.map((o) => (o.id === id ? { ...o, detailedScoring } : o)));
    },
    [opportunities, persist]
  );

  const updateBusinessCase = useCallback(
    (id: string, businessCase: BusinessCase) => {
      persist(opportunities.map((o) => (o.id === id ? { ...o, businessCase } : o)));
    },
    [opportunities, persist]
  );

  const addGateDecision = useCallback(
    (id: string, gate: GateRecord) => {
      persist(
        opportunities.map((o) => {
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
          // Initialize defaults when advancing
          const updates: Partial<Opportunity> = { gates, stage };
          if (stage === "detailed_scoring" && !o.detailedScoring) {
            updates.detailedScoring = createDefaultDetailedScoring();
          }
          if (stage === "business_case" && !o.businessCase) {
            updates.businessCase = createDefaultBusinessCase();
          }
          return { ...o, ...updates };
        })
      );
    },
    [opportunities, persist]
  );

  const updateGateDecision = useCallback(
    (oppId: string, gateId: string, updates: Partial<GateRecord>) => {
      persist(
        opportunities.map((o) => {
          if (o.id !== oppId) return o;
          const gates = o.gates.map((g) => (g.id === gateId ? { ...g, ...updates } : g));
          return { ...o, gates };
        })
      );
    },
    [opportunities, persist]
  );

  const deleteGateDecision = useCallback(
    (oppId: string, gateId: string) => {
      persist(
        opportunities.map((o) => {
          if (o.id !== oppId) return o;
          const gates = o.gates.filter((g) => g.id !== gateId);
          return { ...o, gates };
        })
      );
    },
    [opportunities, persist]
  );

  const GATE_STAGE_INDEX: Record<string, number> = {
    gate1: STAGE_ORDER.indexOf("gate1"),
    gate2: STAGE_ORDER.indexOf("gate2"),
  };

  const revertStage = useCallback(
    (id: string) => {
      persist(
        opportunities.map((o) => {
          if (o.id !== id) return o;
          const idx = STAGE_ORDER.indexOf(o.stage);
          if (idx <= 0) return o;
          const prevStage = STAGE_ORDER[idx - 1];
          const prevIdx = idx - 1;
          // Remove gate decisions that are at or beyond the new stage
          const gates = o.gates.filter((g) => {
            const gateIdx = GATE_STAGE_INDEX[g.gate];
            return gateIdx !== undefined && gateIdx < prevIdx;
          });
          return { ...o, stage: prevStage, gates };
        })
      );
    },
    [opportunities, persist]
  );

  return (
    <StoreContext.Provider
      value={{ opportunities, addOpportunity, updateOpportunity, deleteOpportunity, getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage }}
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
