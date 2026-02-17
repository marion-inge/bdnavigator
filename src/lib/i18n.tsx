import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "de";

const translations = {
  en: {
    appTitle: "BD Pipeline",
    opportunities: "Opportunities",
    newOpportunity: "New Opportunity",
    title: "Title",
    description: "Description",
    industry: "Industry",
    geography: "Geography",
    technology: "Technology",
    owner: "Owner",
    stage: "Stage",
    score: "Score",
    scoring: "Scoring",
    roughScoring: "Rough Scoring",
    detailedScoring: "Detailed Scoring",
    businessCase: "Business Case",
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
    stage_rough_scoring: "Rough Scoring",
    stage_gate1: "Gate 1",
    stage_detailed_scoring: "Detail Scoring",
    stage_gate2: "Gate 2",
    stage_business_case: "Business Case",
    stage_gate3: "Gate 3",
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
    // Scoring tooltips
    tooltip_marketAttractiveness: "How large and growing is the target market? Consider market size, growth rate, and competitive intensity.",
    tooltip_strategicFit: "How well does this opportunity align with our core competencies, strategy, and long-term goals?",
    tooltip_feasibility: "Can we realistically deliver this? Consider technical complexity, required resources, and timeline.",
    tooltip_commercialViability: "Is there a viable business model? Consider pricing potential, margins, and customer willingness to pay.",
    tooltip_risk: "What is the overall risk level? Consider market, technical, regulatory, and execution risks. Lower score = lower risk = better.",
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
    moveToRoughScoring: "Move to Rough Scoring",
    moveToDetailedScoring: "Move to Detail Scoring",
    moveToBusinessCase: "Move to Business Case",
    // Filters
    allStages: "All Stages",
    allIndustries: "All Industries",
    allGeographies: "All Geographies",
    allTechnologies: "All Technologies",
    allOwners: "All Owners",
    clearFilters: "Clear filters",
    createdAt: "Created",
    pipelineFunnel: "Pipeline Funnel",
    // Detailed scoring
    tam: "TAM (Total Addressable Market)",
    sam: "SAM (Serviceable Addressable Market)",
    targetCustomers: "Target Customers",
    customerRelationship: "Customer Relationship / Standing",
    competitors: "Competitors",
    competitivePosition: "Competitive Position",
    detailedAnalysis: "Detailed Analysis",
    details: "Details",
    // Business case
    investmentCost: "Investment Cost (€)",
    expectedRevenue: "Expected Annual Revenue (€)",
    roi: "ROI (%)",
    breakEvenMonths: "Break-Even (months)",
    paybackPeriod: "Payback Period (months)",
    npv: "Net Present Value (€)",
    businessCaseNotes: "Notes & Assumptions",
    financialOverview: "Financial Overview",
  },
  de: {
    appTitle: "BD Pipeline",
    opportunities: "Opportunities",
    newOpportunity: "Neues Opportunity",
    title: "Titel",
    description: "Beschreibung",
    industry: "Branche",
    geography: "Geografie",
    technology: "Technologie",
    owner: "Verantwortlicher",
    stage: "Phase",
    score: "Score",
    scoring: "Bewertung",
    roughScoring: "Grobes Scoring",
    detailedScoring: "Detail-Scoring",
    businessCase: "Business Case",
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
    stage_rough_scoring: "Grobes Scoring",
    stage_gate1: "Gate 1",
    stage_detailed_scoring: "Detail-Scoring",
    stage_gate2: "Gate 2",
    stage_business_case: "Business Case",
    stage_gate3: "Gate 3",
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
    tooltip_marketAttractiveness: "Wie groß und wachstumsstark ist der Zielmarkt? Berücksichtigen Sie Marktgröße, Wachstumsrate und Wettbewerbsintensität.",
    tooltip_strategicFit: "Wie gut passt diese Opportunity zu unseren Kernkompetenzen, unserer Strategie und unseren langfristigen Zielen?",
    tooltip_feasibility: "Können wir das realistisch umsetzen? Berücksichtigen Sie technische Komplexität, benötigte Ressourcen und Zeitrahmen.",
    tooltip_commercialViability: "Gibt es ein tragfähiges Geschäftsmodell? Berücksichtigen Sie Preispotenzial, Margen und Zahlungsbereitschaft der Kunden.",
    tooltip_risk: "Wie hoch ist das Gesamtrisiko? Berücksichtigen Sie Markt-, Technik-, Regulierungs- und Umsetzungsrisiken. Niedrigerer Score = geringeres Risiko = besser.",
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
    moveToRoughScoring: "Zum groben Scoring",
    moveToDetailedScoring: "Zum Detail-Scoring",
    moveToBusinessCase: "Zum Business Case",
    allStages: "Alle Phasen",
    allIndustries: "Alle Branchen",
    allGeographies: "Alle Geografien",
    allTechnologies: "Alle Technologien",
    allOwners: "Alle Verantwortlichen",
    clearFilters: "Filter zurücksetzen",
    createdAt: "Erstellt",
    pipelineFunnel: "Pipeline-Funnel",
    // Detailed scoring
    tam: "TAM (Gesamter adressierbarer Markt)",
    sam: "SAM (Erreichbarer Markt)",
    targetCustomers: "Zielkunden",
    customerRelationship: "Kundenbeziehung / Stellung",
    competitors: "Wettbewerber",
    competitivePosition: "Wettbewerbsposition",
    detailedAnalysis: "Detailanalyse",
    details: "Details",
    // Business case
    investmentCost: "Investitionskosten (€)",
    expectedRevenue: "Erwarteter Jahresumsatz (€)",
    roi: "ROI (%)",
    breakEvenMonths: "Break-Even (Monate)",
    paybackPeriod: "Amortisationszeit (Monate)",
    npv: "Kapitalwert / NPV (€)",
    businessCaseNotes: "Anmerkungen & Annahmen",
    financialOverview: "Finanzübersicht",
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
