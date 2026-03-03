import { Scoring } from "./types";

export interface ScoringQuestion {
  id: string;
  category: keyof Scoring;
  question: { en: string; de: string };
  commentHint?: { en: string; de: string };
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
      en: "How large is the total addressable market (TAM) right now?",
      de: "Wie groß ist der gesamte adressierbare Markt (TAM) aktuell?",
    },
    commentHint: {
      en: "Please specify the TAM definition: geography, customer segments, industries, use cases, etc.",
      de: "Bitte TAM-Definition angeben: Geografie, Kundensegmente, Branchen, Anwendungsfälle etc.",
    },
    descriptions: {
      1: { en: "Very small (<€1M), niche market", de: "Sehr klein (<1 Mio. €), Nischenmarkt" },
      2: { en: "Small (€1–10M), limited market", de: "Klein (1–10 Mio. €), begrenzter Markt" },
      3: { en: "Medium (€10–50M), solid market size", de: "Mittel (10–50 Mio. €), solide Marktgröße" },
      4: { en: "Large (€50–200M), significant market", de: "Groß (50–200 Mio. €), signifikanter Markt" },
      5: { en: "Very large (>€200M), massive market", de: "Sehr groß (>200 Mio. €), sehr großer Markt" },
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
      en: "How high are the structural market entry barriers?",
      de: "Wie hoch sind die strukturellen Markteintrittsbarrieren?",
    },
    commentHint: {
      en: "Consider regulations, certifications, standards, licensing requirements, switching costs, etc.",
      de: "Berücksichtige Regulierung, Zertifizierungen, Standards, Lizenzanforderungen, Wechselkosten etc.",
    },
    descriptions: {
      1: { en: "Extreme barriers; heavy regulation, certifications, long approval cycles", de: "Extreme Barrieren; starke Regulierung, Zertifizierungen, lange Genehmigungszyklen" },
      2: { en: "Significant barriers; industry standards or certifications required", de: "Erhebliche Barrieren; Branchenstandards oder Zertifizierungen erforderlich" },
      3: { en: "Moderate barriers; some regulatory or compliance requirements", de: "Moderate Barrieren; einige regulatorische oder Compliance-Anforderungen" },
      4: { en: "Low barriers; minimal regulatory hurdles", de: "Niedrige Barrieren; minimale regulatorische Hürden" },
      5: { en: "Very low barriers; open market with easy entry", de: "Sehr niedrige Barrieren; offener Markt mit einfachem Eintritt" },
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
      en: "Can we leverage our existing know-how and domain expertise?",
      de: "Können wir unser bestehendes Know-how und unsere Domänenexpertise nutzen?",
    },
    commentHint: {
      en: "Focus on knowledge, expertise, and IP – not on headcount or budget (covered under Feasibility).",
      de: "Fokus auf Wissen, Expertise und IP – nicht auf Personal oder Budget (siehe Feasibility).",
    },
    descriptions: {
      1: { en: "Entirely new domain knowledge required; no relevant expertise", de: "Völlig neues Domänenwissen erforderlich; keine relevante Expertise" },
      2: { en: "Significant knowledge gaps; major learning curve ahead", de: "Erhebliche Wissenslücken; steile Lernkurve voraus" },
      3: { en: "Some relevant expertise exists; moderate upskilling needed", de: "Einige relevante Expertise vorhanden; moderate Weiterbildung nötig" },
      4: { en: "Strong know-how match; minor knowledge gaps", de: "Starke Know-how-Passung; geringe Wissenslücken" },
      5: { en: "Fully leverages our core expertise, IP, and domain knowledge", de: "Nutzt unsere Kernexpertise, IP und Domänenwissen voll aus" },
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
      en: "What is the current technology readiness level (TRL) of our solution?",
      de: "Wie ist der aktuelle technologische Reifegrad (TRL) unserer Lösung?",
    },
    commentHint: {
      en: "Focus on the maturity of YOUR solution – not external technology trends.",
      de: "Fokus auf den Reifegrad EURER Lösung – nicht auf externe Technologietrends.",
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
      en: "Do we have the operative capacity (headcount, equipment, budget)?",
      de: "Haben wir die operative Kapazität (Personal, Ausstattung, Budget)?",
    },
    commentHint: {
      en: "Focus on available capacity and budget – not on know-how or expertise (covered under Strategic Fit).",
      de: "Fokus auf verfügbare Kapazitäten und Budget – nicht auf Know-how oder Expertise (siehe Strategic Fit).",
    },
    descriptions: {
      1: { en: "No capacity available; would need to build everything", de: "Keine Kapazität verfügbar; alles müsste aufgebaut werden" },
      2: { en: "Major gaps; significant hiring and infrastructure investment needed", de: "Große Lücken; erhebliche Einstellungen und Infrastruktur-Investitionen nötig" },
      3: { en: "Some capacity available; targeted hiring needed", de: "Einige Kapazitäten vorhanden; gezielte Einstellungen nötig" },
      4: { en: "Most capacity in place; minor additions needed", de: "Meiste Kapazitäten vorhanden; geringe Ergänzungen nötig" },
      5: { en: "All capacity available; can start immediately", de: "Alle Kapazitäten verfügbar; sofortiger Start möglich" },
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
  {
    id: "fe_pilot_validation",
    category: "feasibility",
    question: {
      en: "How quickly can we validate the idea with a real customer?",
      de: "Wie schnell können wir die Idee mit einem realen Kunden validieren?",
    },
    commentHint: {
      en: "Think about access to potential pilot customers, existing relationships, or beta programs – not about full market launch.",
      de: "Denke an Zugang zu potenziellen Pilotkunden, bestehende Beziehungen oder Beta-Programme – nicht an den vollen Marktstart.",
    },
    descriptions: {
      1: { en: "No customer access; target segment unknown or unreachable", de: "Kein Kundenzugang; Zielsegment unbekannt oder unerreichbar" },
      2: { en: "Potential customers identified but no relationship; long sales cycle expected", de: "Potenzielle Kunden identifiziert aber keine Beziehung; langer Vertriebszyklus erwartet" },
      3: { en: "Some existing customer relationships in the target segment; pilot possible with effort", de: "Einige bestehende Kundenbeziehungen im Zielsegment; Pilot mit Aufwand möglich" },
      4: { en: "Strong customer relationships; interested parties already signaled willingness", de: "Starke Kundenbeziehungen; Interessenten haben bereits Bereitschaft signalisiert" },
      5: { en: "Pilot customer ready; concrete interest or agreement already in place", de: "Pilotkunde bereit; konkretes Interesse oder Vereinbarung bereits vorhanden" },
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
      en: "How attractive is the expected margin profile compared to our core business?",
      de: "Wie attraktiv ist das erwartete Margenprofil im Vergleich zu unserem Kerngeschäft?",
    },
    commentHint: {
      en: "Think qualitatively: Is this a premium offering or a commodity? How does pricing power compare to what we know?",
      de: "Qualitativ denken: Ist es ein Premium-Angebot oder Massenware? Wie steht es um die Preissetzungsmacht im Vergleich zu Bekanntem?",
    },
    descriptions: {
      1: { en: "Likely unprofitable; no clear path to positive margins", de: "Voraussichtlich unprofitabel; kein klarer Weg zu positiven Margen" },
      2: { en: "Significantly below our core business margins; commodity-like pricing", de: "Deutlich unter Kerngeschäft-Margen; Commodity-ähnliche Preisgestaltung" },
      3: { en: "Roughly comparable to our core business margins", de: "Etwa vergleichbar mit unseren Kerngeschäft-Margen" },
      4: { en: "Above our core business; good differentiation allows premium pricing", de: "Über Kerngeschäft; gute Differenzierung erlaubt Premium-Pricing" },
      5: { en: "Significantly above core business; strong pricing power and unique value", de: "Deutlich über Kerngeschäft; starke Preissetzungsmacht und einzigartiger Wert" },
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
      en: "What is the expected payback period?",
      de: "Wie lang ist die erwartete Amortisationsdauer?",
    },
    commentHint: {
      en: "Think in relative terms: How quickly can this idea generate revenue relative to similar initiatives? Don't estimate exact amounts yet.",
      de: "Relativ denken: Wie schnell kann diese Idee im Vergleich zu ähnlichen Initiativen Einnahmen generieren? Keine exakten Beträge nötig.",
    },
    descriptions: {
      1: { en: "No foreseeable payback; unclear if this can ever break even", de: "Kein absehbarer Payback; unklar ob Break-even je erreichbar" },
      2: { en: "Long-term investment; significantly slower payback than typical projects", de: "Langfrist-Investition; deutlich langsamer als typische Projekte" },
      3: { en: "Comparable payback horizon to our typical new initiatives", de: "Vergleichbarer Payback-Horizont wie unsere typischen neuen Initiativen" },
      4: { en: "Faster payback than average; leverages existing assets or revenue streams", de: "Schnellerer Payback als üblich; nutzt bestehende Assets oder Einnahmequellen" },
      5: { en: "Very fast payback; minimal upfront effort before revenue generation", de: "Sehr schneller Payback; minimaler Vorlauf bis zur Umsatzgenerierung" },
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
      en: "How high is the risk of technology disruption or obsolescence?",
      de: "Wie hoch ist das Risiko technologischer Disruption oder Obsoleszenz?",
    },
    commentHint: {
      en: "Focus on EXTERNAL technology shifts – not the maturity of your own solution (covered under Feasibility/TRL).",
      de: "Fokus auf EXTERNE Technologieveränderungen – nicht auf den Reifegrad eurer eigenen Lösung (siehe Feasibility/TRL).",
    },
    descriptions: {
      1: { en: "Stable technology landscape; no disruption expected", de: "Stabile Technologielandschaft; keine Disruption erwartet" },
      2: { en: "Low disruption risk; technology evolving slowly", de: "Niedriges Disruptionsrisiko; Technologie entwickelt sich langsam" },
      3: { en: "Moderate risk; alternative technologies emerging", de: "Moderates Risiko; alternative Technologien entstehen" },
      4: { en: "High risk; fast-moving tech landscape; obsolescence possible within 3 years", de: "Hohes Risiko; schnelllebige Technologielandschaft; Obsoleszenz innerhalb von 3 Jahren möglich" },
      5: { en: "Very high risk; disruptive alternatives imminent; technology may be leapfrogged", de: "Sehr hohes Risiko; disruptive Alternativen stehen bevor; Technologie könnte übersprungen werden" },
    },
  },
  {
    id: "ri_execution_risk",
    category: "risk",
    question: {
      en: "How high is the organizational complexity and change management risk?",
      de: "Wie hoch ist die organisatorische Komplexität und das Change-Management-Risiko?",
    },
    commentHint: {
      en: "Focus on organizational hurdles (silos, resistance, stakeholder alignment) – not on resource availability (covered under Feasibility).",
      de: "Fokus auf organisatorische Hürden (Silos, Widerstände, Stakeholder-Alignment) – nicht auf Ressourcenverfügbarkeit (siehe Feasibility).",
    },
    descriptions: {
      1: { en: "Simple setup; single team; no organizational change needed", de: "Einfaches Setup; ein Team; kein organisatorischer Wandel nötig" },
      2: { en: "Low complexity; minor cross-team coordination", de: "Geringe Komplexität; geringe teamübergreifende Abstimmung" },
      3: { en: "Moderate complexity; multiple departments involved; some resistance expected", de: "Moderate Komplexität; mehrere Abteilungen involviert; gewisser Widerstand erwartet" },
      4: { en: "High complexity; significant stakeholder alignment and change management needed", de: "Hohe Komplexität; erhebliches Stakeholder-Alignment und Change Management nötig" },
      5: { en: "Extreme complexity; company-wide transformation; strong internal resistance expected", de: "Extreme Komplexität; unternehmensweiter Wandel; starker interner Widerstand erwartet" },
    },
  },
  {
    id: "ri_financial_risk",
    category: "risk",
    question: {
      en: "How high is the financial commitment and reversibility risk?",
      de: "Wie hoch ist das finanzielle Commitment und das Reversibilitätsrisiko?",
    },
    commentHint: {
      en: "Think qualitatively: Can we exit cheaply if it fails, or are we locked in? Compare to typical project commitments.",
      de: "Qualitativ denken: Können wir bei Scheitern günstig aussteigen, oder sind wir gebunden? Vergleich zu typischen Projektcommitments.",
    },
    descriptions: {
      1: { en: "Minimal commitment; easily reversible; can pivot or stop with little loss", de: "Minimales Commitment; leicht reversibel; Pivot oder Stopp mit wenig Verlust" },
      2: { en: "Low commitment; below our typical project investment; mostly recoverable", de: "Geringes Commitment; unter typischem Projektinvestment; größtenteils rückgewinnbar" },
      3: { en: "Moderate commitment; comparable to our standard project investments", de: "Moderates Commitment; vergleichbar mit unseren Standard-Projektinvestitionen" },
      4: { en: "High commitment; above-average investment; significant sunk costs if abandoned", de: "Hohes Commitment; überdurchschnittliches Investment; erhebliche Sunk Costs bei Abbruch" },
      5: { en: "Very high commitment; major strategic bet; near-total loss if abandoned", de: "Sehr hohes Commitment; große strategische Wette; nahezu Totalverlust bei Abbruch" },
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
