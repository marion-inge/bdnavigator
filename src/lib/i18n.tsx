import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "de";

const translations = {
  en: {
    appTitle: "BD Pipeline",
    opportunities: "Opportunities",
    newOpportunity: "New Opportunity",
    title: "Title",
    description: "Description",
    market: "Market",
    owner: "Owner",
    stage: "Stage",
    score: "Score",
    scoring: "Scoring",
    overview: "Overview",
    stageGates: "Stage Gates",
    create: "Create",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    back: "Back",
    search: "Search opportunities...",
    noOpportunities: "No opportunities yet. Create your first one!",
    // Stages
    stage_idea: "Idea",
    stage_scoring: "Scoring",
    stage_gate1: "Gate 1",
    stage_business_case: "Business Case",
    stage_gate2: "Gate 2",
    stage_go_to_market: "Go-To-Market",
    stage_closed: "Closed",
    // Scoring criteria
    marketAttractiveness: "Market Attractiveness",
    strategicFit: "Strategic Fit",
    feasibility: "Feasibility",
    commercialViability: "Commercial Viability",
    risk: "Risk",
    weight: "Weight",
    comment: "Comment",
    totalScore: "Total Score",
    riskNote: "(lower is better)",
    // Gate decisions
    gateDecision: "Gate Decision",
    decision: "Decision",
    go: "Go",
    hold: "Hold",
    noGo: "No-Go",
    decider: "Decider",
    decisionDate: "Decision Date",
    decisionComment: "Decision Comment",
    submitDecision: "Submit Decision",
    noDecisions: "No gate decisions yet.",
    moveToScoring: "Move to Scoring",
    // Filters
    allStages: "All Stages",
    allMarkets: "All Markets",
    createdAt: "Created",
  },
  de: {
    appTitle: "BD Pipeline",
    opportunities: "Opportunities",
    newOpportunity: "Neues Opportunity",
    title: "Titel",
    description: "Beschreibung",
    market: "Markt",
    owner: "Verantwortlicher",
    stage: "Phase",
    score: "Score",
    scoring: "Bewertung",
    overview: "Übersicht",
    stageGates: "Stage Gates",
    create: "Erstellen",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    back: "Zurück",
    search: "Opportunities durchsuchen...",
    noOpportunities: "Noch keine Opportunities. Erstellen Sie Ihr erstes!",
    stage_idea: "Idee",
    stage_scoring: "Bewertung",
    stage_gate1: "Gate 1",
    stage_business_case: "Business Case",
    stage_gate2: "Gate 2",
    stage_go_to_market: "Go-To-Market",
    stage_closed: "Geschlossen",
    marketAttractiveness: "Marktattraktivität",
    strategicFit: "Strategischer Fit",
    feasibility: "Machbarkeit",
    commercialViability: "Kommerzielle Tragfähigkeit",
    risk: "Risiko",
    weight: "Gewicht",
    comment: "Kommentar",
    totalScore: "Gesamtbewertung",
    riskNote: "(niedriger ist besser)",
    gateDecision: "Gate-Entscheidung",
    decision: "Entscheidung",
    go: "Go",
    hold: "Hold",
    noGo: "No-Go",
    decider: "Entscheider",
    decisionDate: "Entscheidungsdatum",
    decisionComment: "Entscheidungskommentar",
    submitDecision: "Entscheidung einreichen",
    noDecisions: "Noch keine Gate-Entscheidungen.",
    moveToScoring: "Zur Bewertung",
    allStages: "Alle Phasen",
    allMarkets: "Alle Märkte",
    createdAt: "Erstellt",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("bd-pipeline-lang");
    return (saved === "de" ? "de" : "en") as Language;
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("bd-pipeline-lang", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] || key,
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
