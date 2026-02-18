import { Scoring } from "./types";

export interface ScoringQuestion {
  id: string;
  category: keyof Scoring;
  question: { en: string; de: string };
  descriptions: {
    1: { en: string; de: string };
    2: { en: string; de: string };
    3: { en: string; de: string };
    4: { en: string; de: string };
    5: { en: string; de: string };
  };
}

export const ROUGH_SCORING_QUESTIONS: ScoringQuestion[] = [
  // === Market Attractiveness (5 questions) ===
  {
    id: "ma_market_size",
    category: "marketAttractiveness",
    question: {
      en: "How large is the total addressable market (TAM)?",
      de: "Wie groß ist der gesamte adressierbare Markt (TAM)?",
    },
    descriptions: {
      1: { en: "Very small (<€1M), niche with limited potential", de: "Sehr klein (<1 Mio. €), Nische mit begrenztem Potenzial" },
      2: { en: "Small (€1–10M), limited growth opportunities", de: "Klein (1–10 Mio. €), begrenzte Wachstumschancen" },
      3: { en: "Medium (€10–50M), moderate growth potential", de: "Mittel (10–50 Mio. €), moderates Wachstumspotenzial" },
      4: { en: "Large (€50–200M), strong growth trajectory", de: "Groß (50–200 Mio. €), starke Wachstumsdynamik" },
      5: { en: "Very large (>€200M), rapidly expanding market", de: "Sehr groß (>200 Mio. €), schnell wachsender Markt" },
    },
  },
  {
    id: "ma_growth_rate",
    category: "marketAttractiveness",
    question: {
      en: "What is the expected market growth rate?",
      de: "Wie hoch ist das erwartete Marktwachstum?",
    },
    descriptions: {
      1: { en: "Declining or stagnant market (<0%)", de: "Schrumpfender oder stagnierender Markt (<0%)" },
      2: { en: "Slow growth (0–5% CAGR)", de: "Langsames Wachstum (0–5% CAGR)" },
      3: { en: "Moderate growth (5–10% CAGR)", de: "Moderates Wachstum (5–10% CAGR)" },
      4: { en: "Strong growth (10–20% CAGR)", de: "Starkes Wachstum (10–20% CAGR)" },
      5: { en: "Rapid growth (>20% CAGR), emerging market", de: "Rapides Wachstum (>20% CAGR), aufstrebender Markt" },
    },
  },
  {
    id: "ma_customer_demand",
    category: "marketAttractiveness",
    question: {
      en: "How strong is the current customer demand or pain point?",
      de: "Wie stark ist die aktuelle Kundennachfrage bzw. der Problemdruck?",
    },
    descriptions: {
      1: { en: "No clear demand; solution looking for a problem", de: "Keine klare Nachfrage; Lösung sucht ein Problem" },
      2: { en: "Weak demand; nice-to-have, not must-have", de: "Schwache Nachfrage; Nice-to-have, kein Muss" },
      3: { en: "Moderate demand; customers interested but not urgent", de: "Moderate Nachfrage; Kunden interessiert, aber nicht dringend" },
      4: { en: "Strong demand; customers actively seeking solutions", de: "Starke Nachfrage; Kunden suchen aktiv nach Lösungen" },
      5: { en: "Critical demand; urgent pain point with high willingness to pay", de: "Kritische Nachfrage; dringender Problemdruck mit hoher Zahlungsbereitschaft" },
    },
  },
  {
    id: "ma_competition",
    category: "marketAttractiveness",
    question: {
      en: "How intense is the competitive landscape?",
      de: "Wie intensiv ist die Wettbewerbssituation?",
    },
    descriptions: {
      1: { en: "Dominated by incumbents; extremely hard to enter", de: "Dominiert von Platzhirschen; Markteintritt extrem schwer" },
      2: { en: "Several strong competitors; significant barriers", de: "Mehrere starke Wettbewerber; erhebliche Barrieren" },
      3: { en: "Moderate competition; room for differentiation", de: "Moderater Wettbewerb; Raum für Differenzierung" },
      4: { en: "Few competitors; clear differentiation possible", de: "Wenige Wettbewerber; klare Differenzierung möglich" },
      5: { en: "Minimal competition; first-mover advantage or clear market gap", de: "Minimaler Wettbewerb; First-Mover-Vorteil oder klare Marktlücke" },
    },
  },
  {
    id: "ma_accessibility",
    category: "marketAttractiveness",
    question: {
      en: "How accessible is the target market for us?",
      de: "Wie zugänglich ist der Zielmarkt für uns?",
    },
    descriptions: {
      1: { en: "No market access; no contacts, no channels", de: "Kein Marktzugang; keine Kontakte, keine Kanäle" },
      2: { en: "Limited access; need to build channels from scratch", de: "Begrenzter Zugang; Kanäle müssen von Grund auf aufgebaut werden" },
      3: { en: "Some access through existing partners or networks", de: "Etwas Zugang über bestehende Partner oder Netzwerke" },
      4: { en: "Good access; existing customer relationships in the market", de: "Guter Zugang; bestehende Kundenbeziehungen im Markt" },
      5: { en: "Excellent access; strong presence and reputation in the market", de: "Exzellenter Zugang; starke Präsenz und Reputation im Markt" },
    },
  },

  // === Strategic Fit (4 questions) ===
  {
    id: "sf_strategy_alignment",
    category: "strategicFit",
    question: {
      en: "How well does this align with our corporate strategy and vision?",
      de: "Wie gut passt dies zu unserer Unternehmensstrategie und Vision?",
    },
    descriptions: {
      1: { en: "No alignment; contradicts strategic direction", de: "Keine Passung; widerspricht der strategischen Ausrichtung" },
      2: { en: "Weak alignment; tangential to strategy", de: "Schwache Passung; nur am Rande der Strategie" },
      3: { en: "Moderate alignment; supports some strategic goals", de: "Moderate Passung; unterstützt einige strategische Ziele" },
      4: { en: "Strong alignment; directly supports key strategic priorities", de: "Starke Passung; unterstützt direkt wichtige strategische Prioritäten" },
      5: { en: "Perfect fit; core to our strategic roadmap", de: "Perfekte Passung; Kern unserer strategischen Roadmap" },
    },
  },
  {
    id: "sf_competency_match",
    category: "strategicFit",
    question: {
      en: "Can we leverage our existing core competencies?",
      de: "Können wir unsere bestehenden Kernkompetenzen nutzen?",
    },
    descriptions: {
      1: { en: "Entirely new capabilities required; no overlap", de: "Völlig neue Fähigkeiten erforderlich; keine Überschneidung" },
      2: { en: "Significant capability gaps; major investment needed", de: "Erhebliche Fähigkeitslücken; große Investition nötig" },
      3: { en: "Some capabilities exist; moderate gaps to close", de: "Einige Fähigkeiten vorhanden; moderate Lücken zu schließen" },
      4: { en: "Most capabilities available; minor upskilling needed", de: "Meiste Fähigkeiten verfügbar; geringe Weiterbildung nötig" },
      5: { en: "Fully leverages our core strengths and expertise", de: "Nutzt unsere Kernstärken und Expertise voll aus" },
    },
  },
  {
    id: "sf_portfolio_synergy",
    category: "strategicFit",
    question: {
      en: "Are there synergies with our existing product portfolio?",
      de: "Gibt es Synergien mit unserem bestehenden Produktportfolio?",
    },
    descriptions: {
      1: { en: "No synergies; completely standalone offering", de: "Keine Synergien; völlig eigenständiges Angebot" },
      2: { en: "Minimal synergies; weak cross-selling potential", de: "Minimale Synergien; schwaches Cross-Selling-Potenzial" },
      3: { en: "Some synergies; limited cross-selling opportunities", de: "Einige Synergien; begrenzte Cross-Selling-Möglichkeiten" },
      4: { en: "Strong synergies; enhances existing portfolio", de: "Starke Synergien; stärkt bestehendes Portfolio" },
      5: { en: "Exceptional synergies; natural extension of our portfolio", de: "Außergewöhnliche Synergien; natürliche Erweiterung unseres Portfolios" },
    },
  },
  {
    id: "sf_customer_channel",
    category: "strategicFit",
    question: {
      en: "Can we reach customers through existing channels?",
      de: "Können wir Kunden über bestehende Kanäle erreichen?",
    },
    descriptions: {
      1: { en: "Entirely new channels and customer base needed", de: "Völlig neue Kanäle und Kundenstamm erforderlich" },
      2: { en: "Mostly new channels; limited overlap with existing customers", de: "Überwiegend neue Kanäle; wenig Überschneidung mit Bestandskunden" },
      3: { en: "Partial overlap; some existing channels usable", de: "Teilweise Überschneidung; einige bestehende Kanäle nutzbar" },
      4: { en: "Significant overlap; most channels already in place", de: "Erhebliche Überschneidung; die meisten Kanäle bestehen bereits" },
      5: { en: "Same customers and channels; direct upselling opportunity", de: "Gleiche Kunden und Kanäle; direkte Upselling-Möglichkeit" },
    },
  },

  // === Feasibility (4 questions) ===
  {
    id: "fe_technical_readiness",
    category: "feasibility",
    question: {
      en: "What is the current technology readiness level?",
      de: "Wie ist der aktuelle technologische Reifegrad?",
    },
    descriptions: {
      1: { en: "Basic research phase (TRL 1–2); breakthrough needed", de: "Grundlagenforschung (TRL 1–2); Durchbruch nötig" },
      2: { en: "Early development (TRL 3–4); concept proven but unvalidated", de: "Frühe Entwicklung (TRL 3–4); Konzept bewiesen aber nicht validiert" },
      3: { en: "Prototype available (TRL 5–6); needs further development", de: "Prototyp vorhanden (TRL 5–6); weitere Entwicklung nötig" },
      4: { en: "Demonstration phase (TRL 7–8); near market-ready", de: "Demonstrationsphase (TRL 7–8); nahezu marktreif" },
      5: { en: "Market-ready technology (TRL 9); proven in operation", de: "Marktreife Technologie (TRL 9); im Einsatz bewährt" },
    },
  },
  {
    id: "fe_resources",
    category: "feasibility",
    question: {
      en: "Do we have the necessary resources (people, equipment, budget)?",
      de: "Haben wir die nötigen Ressourcen (Personal, Ausstattung, Budget)?",
    },
    descriptions: {
      1: { en: "No resources available; would need to build everything", de: "Keine Ressourcen verfügbar; alles müsste aufgebaut werden" },
      2: { en: "Major gaps; significant hiring and investment needed", de: "Große Lücken; erhebliche Einstellungen und Investitionen nötig" },
      3: { en: "Some resources available; targeted hiring needed", de: "Einige Ressourcen vorhanden; gezielte Einstellungen nötig" },
      4: { en: "Most resources in place; minor additions needed", de: "Meiste Ressourcen vorhanden; geringe Ergänzungen nötig" },
      5: { en: "All resources available; can start immediately", de: "Alle Ressourcen verfügbar; sofortiger Start möglich" },
    },
  },
  {
    id: "fe_timeline",
    category: "feasibility",
    question: {
      en: "What is the realistic time-to-market?",
      de: "Was ist die realistische Time-to-Market?",
    },
    descriptions: {
      1: { en: "More than 5 years; highly uncertain timeline", de: "Mehr als 5 Jahre; sehr unsicherer Zeitrahmen" },
      2: { en: "3–5 years; significant development phases ahead", de: "3–5 Jahre; erhebliche Entwicklungsphasen voraus" },
      3: { en: "2–3 years; clear development roadmap exists", de: "2–3 Jahre; klare Entwicklungsroadmap vorhanden" },
      4: { en: "1–2 years; most milestones well-defined", de: "1–2 Jahre; die meisten Meilensteine klar definiert" },
      5: { en: "Less than 1 year; near-term launch possible", de: "Weniger als 1 Jahr; kurzfristiger Launch möglich" },
    },
  },
  {
    id: "fe_dependencies",
    category: "feasibility",
    question: {
      en: "How dependent are we on external partners or technologies?",
      de: "Wie abhängig sind wir von externen Partnern oder Technologien?",
    },
    descriptions: {
      1: { en: "Fully dependent on unproven external technologies/partners", de: "Voll abhängig von unerprobten externen Technologien/Partnern" },
      2: { en: "Heavy dependencies; critical partners not yet secured", de: "Starke Abhängigkeiten; kritische Partner noch nicht gesichert" },
      3: { en: "Moderate dependencies; key partners identified", de: "Moderate Abhängigkeiten; Schlüsselpartner identifiziert" },
      4: { en: "Limited dependencies; partnerships already in place", de: "Begrenzte Abhängigkeiten; Partnerschaften bereits bestehen" },
      5: { en: "Fully self-sufficient; no critical external dependencies", de: "Vollständig autark; keine kritischen externen Abhängigkeiten" },
    },
  },

  // === Commercial Viability (4 questions) ===
  {
    id: "cv_revenue_model",
    category: "commercialViability",
    question: {
      en: "How clear and viable is the revenue model?",
      de: "Wie klar und tragfähig ist das Erlösmodell?",
    },
    descriptions: {
      1: { en: "No revenue model defined; unclear how to monetize", de: "Kein Erlösmodell definiert; unklar wie monetarisiert werden soll" },
      2: { en: "Basic concept exists; unproven, many assumptions", de: "Grundkonzept vorhanden; unbewiesen, viele Annahmen" },
      3: { en: "Revenue model defined; some market validation", de: "Erlösmodell definiert; teilweise Marktvalidierung" },
      4: { en: "Strong model with comparable market evidence", de: "Starkes Modell mit vergleichbarer Marktevidenz" },
      5: { en: "Proven model; customer commitments or LOIs exist", de: "Bewährtes Modell; Kundenzusagen oder LOIs vorhanden" },
    },
  },
  {
    id: "cv_margins",
    category: "commercialViability",
    question: {
      en: "What are the expected profit margins?",
      de: "Wie hoch sind die erwarteten Gewinnmargen?",
    },
    descriptions: {
      1: { en: "Negative margins expected; no path to profitability", de: "Negative Margen erwartet; kein Weg zur Profitabilität" },
      2: { en: "Thin margins (<10%); price-sensitive market", de: "Dünne Margen (<10%); preissensitiver Markt" },
      3: { en: "Moderate margins (10–25%); competitive pricing required", de: "Moderate Margen (10–25%); wettbewerbsfähige Preise nötig" },
      4: { en: "Good margins (25–40%); pricing power exists", de: "Gute Margen (25–40%); Preissetzungsmacht vorhanden" },
      5: { en: "Excellent margins (>40%); premium pricing justified", de: "Exzellente Margen (>40%); Premium-Pricing gerechtfertigt" },
    },
  },
  {
    id: "cv_scalability",
    category: "commercialViability",
    question: {
      en: "How scalable is the business model?",
      de: "Wie skalierbar ist das Geschäftsmodell?",
    },
    descriptions: {
      1: { en: "Not scalable; each unit requires proportional effort", de: "Nicht skalierbar; jede Einheit erfordert proportionalen Aufwand" },
      2: { en: "Limited scalability; high variable costs per unit", de: "Begrenzte Skalierbarkeit; hohe variable Kosten pro Einheit" },
      3: { en: "Moderately scalable; some economies of scale", de: "Moderat skalierbar; einige Skaleneffekte" },
      4: { en: "Highly scalable; strong economies of scale", de: "Hoch skalierbar; starke Skaleneffekte" },
      5: { en: "Extremely scalable; near-zero marginal cost (e.g. SaaS)", de: "Extrem skalierbar; nahezu null Grenzkosten (z.B. SaaS)" },
    },
  },
  {
    id: "cv_payback",
    category: "commercialViability",
    question: {
      en: "How quickly can the investment be recovered?",
      de: "Wie schnell kann die Investition zurückgewonnen werden?",
    },
    descriptions: {
      1: { en: "No foreseeable payback; very high investment risk", de: "Kein absehbarer Payback; sehr hohes Investitionsrisiko" },
      2: { en: "Payback in 5+ years; long investment horizon", de: "Payback in 5+ Jahren; langer Investitionshorizont" },
      3: { en: "Payback in 3–5 years; acceptable timeline", de: "Payback in 3–5 Jahren; akzeptabler Zeitrahmen" },
      4: { en: "Payback in 1–3 years; attractive ROI", de: "Payback in 1–3 Jahren; attraktiver ROI" },
      5: { en: "Payback in <1 year; rapid return on investment", de: "Payback in <1 Jahr; schnelle Rendite" },
    },
  },

  // === Risk (4 questions) ===
  // Note: For risk, higher score = higher risk = worse
  {
    id: "ri_market_risk",
    category: "risk",
    question: {
      en: "How high is the market and regulatory risk?",
      de: "Wie hoch ist das Markt- und Regulierungsrisiko?",
    },
    descriptions: {
      1: { en: "Stable market; clear regulations; low uncertainty", de: "Stabiler Markt; klare Regulierung; geringe Unsicherheit" },
      2: { en: "Low risk; minor regulatory concerns; predictable market", de: "Niedriges Risiko; geringe regulatorische Bedenken; vorhersehbarer Markt" },
      3: { en: "Moderate risk; some regulatory uncertainty", de: "Moderates Risiko; gewisse regulatorische Unsicherheit" },
      4: { en: "High risk; significant regulatory hurdles ahead", de: "Hohes Risiko; erhebliche regulatorische Hürden voraus" },
      5: { en: "Very high risk; hostile regulatory environment; market disruption likely", de: "Sehr hohes Risiko; feindliches regulatorisches Umfeld; Marktumbruch wahrscheinlich" },
    },
  },
  {
    id: "ri_technical_risk",
    category: "risk",
    question: {
      en: "How high is the technical development risk?",
      de: "Wie hoch ist das technische Entwicklungsrisiko?",
    },
    descriptions: {
      1: { en: "Proven technology; minimal development risk", de: "Bewährte Technologie; minimales Entwicklungsrisiko" },
      2: { en: "Low risk; well-understood technology stack", de: "Niedriges Risiko; gut verstandener Technologie-Stack" },
      3: { en: "Moderate risk; some unresolved technical challenges", de: "Moderates Risiko; einige ungelöste technische Herausforderungen" },
      4: { en: "High risk; unproven technology; significant R&D needed", de: "Hohes Risiko; unerprobte Technologie; erhebliche F&E nötig" },
      5: { en: "Very high risk; breakthrough innovation required", de: "Sehr hohes Risiko; Durchbruchsinnovation erforderlich" },
    },
  },
  {
    id: "ri_execution_risk",
    category: "risk",
    question: {
      en: "How high is the execution and organizational risk?",
      de: "Wie hoch ist das Umsetzungs- und Organisationsrisiko?",
    },
    descriptions: {
      1: { en: "Low complexity; experienced team; clear path", de: "Geringe Komplexität; erfahrenes Team; klarer Weg" },
      2: { en: "Manageable; minor organizational adjustments needed", de: "Handhabbar; geringe organisatorische Anpassungen nötig" },
      3: { en: "Moderate complexity; cross-functional coordination required", de: "Moderate Komplexität; bereichsübergreifende Koordination nötig" },
      4: { en: "High complexity; major organizational change needed", de: "Hohe Komplexität; große organisatorische Veränderungen nötig" },
      5: { en: "Extreme complexity; transformational change required", de: "Extreme Komplexität; transformativer Wandel erforderlich" },
    },
  },
  {
    id: "ri_financial_risk",
    category: "risk",
    question: {
      en: "How high is the financial risk and capital exposure?",
      de: "Wie hoch ist das finanzielle Risiko und die Kapitalexposition?",
    },
    descriptions: {
      1: { en: "Low investment; easily reversible; limited downside", de: "Geringe Investition; leicht reversibel; begrenztes Verlustpotenzial" },
      2: { en: "Moderate investment; manageable financial exposure", de: "Moderate Investition; handhabbares finanzielles Risiko" },
      3: { en: "Significant investment; medium financial exposure", de: "Erhebliche Investition; mittleres finanzielles Risiko" },
      4: { en: "Large investment; high financial exposure", de: "Große Investition; hohe finanzielle Exposition" },
      5: { en: "Very large investment; existential financial risk", de: "Sehr große Investition; existenzielles Finanzrisiko" },
    },
  },
];

// Group questions by category
export function getQuestionsByCategory(): { category: keyof Scoring; questions: ScoringQuestion[] }[] {
  const categories: (keyof Scoring)[] = [
    "marketAttractiveness",
    "strategicFit",
    "feasibility",
    "commercialViability",
    "risk",
  ];

  return categories.map((cat) => ({
    category: cat,
    questions: ROUGH_SCORING_QUESTIONS.filter((q) => q.category === cat),
  }));
}
