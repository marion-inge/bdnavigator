import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Opportunity, createDefaultScoring, createDefaultDetailedScoring, createDefaultBusinessCase, GateRecord, Stage, Scoring, DetailedScoring, BusinessCase } from "./types";
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
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = "bd-pipeline-opportunities";

function loadOpportunities(): Opportunity[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
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
          } else if (gate.gate === "gate3") {
            if (gate.decision === "go") stage = "go_to_market";
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

  return (
    <StoreContext.Provider
      value={{ opportunities, addOpportunity, updateOpportunity, deleteOpportunity, getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision }}
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
