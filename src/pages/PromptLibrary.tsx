import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Brain, BarChart3, TrendingUp, ChevronDown, ChevronUp, Search, Shield, Globe } from "lucide-react";
import idaAvatar from "@/assets/ida-robot.png";
import markAvatar from "@/assets/mark-robot.png";

interface PromptEntry {
  id: string;
  agent: "ida" | "mark" | "system";
  triggerEn: string;
  triggerDe: string;
  contextEn: string;
  contextDe: string;
  systemPromptSummaryEn: string;
  systemPromptSummaryDe: string;
  inputDataEn: string[];
  inputDataDe: string[];
  outputEn: string;
  outputDe: string;
  icon: React.ReactNode;
}

const ENTRIES: PromptEntry[] = [
  {
    id: "idea-scoring-assessment",
    agent: "ida",
    triggerEn: "After completing the Idea Scoring Questionnaire → Click 'AI Assessment'",
    triggerDe: "Nach Abschluss des Idea Scoring Fragebogens → Klick auf 'KI-Bewertung'",
    contextEn: "Idea Scoring",
    contextDe: "Idea Scoring",
    systemPromptSummaryEn: "IDA acts as a senior business innovation analyst. She evaluates the full 22-criteria scoring, reads all user comments per criterion, and combines them with idea metadata (industry, geography, technology, solution description) to produce a structured assessment.",
    systemPromptSummaryDe: "IDA agiert als Senior Business Innovation Analystin. Sie wertet das vollständige 22-Kriterien-Scoring aus, liest alle Nutzerkommentare pro Kriterium und kombiniert diese mit den Ideen-Metadaten (Branche, Geografie, Technologie, Lösungsbeschreibung) zu einer strukturierten Bewertung.",
    inputDataEn: [
      "22 criterion scores (1–5) with confidence levels",
      "User comments per criterion",
      "Idea metadata: title, description, solution, industry, geography, technology",
      "Category scores (weighted averages)",
    ],
    inputDataDe: [
      "22 Kriterien-Scores (1–5) mit Konfidenzniveaus",
      "Nutzerkommentare pro Kriterium",
      "Ideen-Metadaten: Titel, Beschreibung, Lösung, Branche, Geografie, Technologie",
      "Kategorie-Scores (gewichtete Durchschnitte)",
    ],
    outputEn: "Structured assessment: Summary (2–3 sentences), Strengths (2–4), Weaknesses (2–4), Next Steps (3–5), Pitfalls (2–3), Overall Rating (very_promising / promising / moderate / challenging / critical)",
    outputDe: "Strukturierte Bewertung: Zusammenfassung (2–3 Sätze), Stärken (2–4), Schwächen (2–4), Nächste Schritte (3–5), Fallstricke (2–3), Gesamtbewertung (sehr vielversprechend / vielversprechend / moderat / herausfordernd / kritisch)",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: "business-case-assessment",
    agent: "ida",
    triggerEn: "In Business Case section → Click 'AI Assessment'",
    triggerDe: "Im Business Case Bereich → Klick auf 'KI-Bewertung'",
    contextEn: "Business Case",
    contextDe: "Business Case",
    systemPromptSummaryEn: "IDA acts as a senior financial analyst and business case evaluator. She analyzes KPIs (ROCE, NPV, Payback, EBIT), reviews year-by-year financial projections, and evaluates assumptions for realism. She checks if ROCE exceeds the WACC hurdle rate, whether margins scale efficiently, and whether working capital is managed well.",
    systemPromptSummaryDe: "IDA agiert als Senior Finanzanalystin und Business-Case-Bewerterin. Sie analysiert KPIs (ROCE, NPV, Payback, EBIT), prüft die jährlichen Finanzprojektionen und bewertet Annahmen auf Realismus. Sie prüft, ob ROCE die WACC-Hürde übersteigt, ob Margen effizient skalieren und ob das Working Capital gut gemanagt wird.",
    inputDataEn: [
      "KPIs: Total ROCE, NPV, Payback Period, Total EBIT, Total Sales",
      "Parameters: WACC, project duration, depreciation years, market size, growth rate",
      "Year-by-year breakdown: Sales, EBIT, ROCE, Cash Flow, Capital Employed, Working Capital",
      "Total Investment & R&D spend",
      "Idea context: title, description, industry, technology",
    ],
    inputDataDe: [
      "KPIs: Gesamt-ROCE, NPV, Amortisationsdauer, Gesamt-EBIT, Gesamtumsatz",
      "Parameter: WACC, Projektdauer, Abschreibungsjahre, Marktgröße, Wachstumsrate",
      "Jahresaufschlüsselung: Umsatz, EBIT, ROCE, Cashflow, Capital Employed, Working Capital",
      "Gesamtinvestition & F&E-Ausgaben",
      "Ideenkontext: Titel, Beschreibung, Branche, Technologie",
    ],
    outputEn: "Financial assessment: Executive Summary (3–4 sentences with KPIs), Strengths (3–5 with numbers), Weaknesses (2–4 with numbers), Next Steps (3–5), Pitfalls (2–3), Overall Rating",
    outputDe: "Finanzbewertung: Executive Summary (3–4 Sätze mit KPIs), Stärken (3–5 mit Zahlen), Schwächen (2–4 mit Zahlen), Nächste Schritte (3–5), Fallstricke (2–3), Gesamtbewertung",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "idea-status-summary",
    agent: "ida",
    triggerEn: "In the idea table → Click 'Run IDA' for one idea or 'Run all'",
    triggerDe: "In der Ideen-Tabelle → „IDA ausführen“ für eine Idee oder „Alle ausführen“",
    contextEn: "Idea Status Summary",
    contextDe: "Ideen-Statuszusammenfassung",
    systemPromptSummaryEn: "IDA reviews the idea's current stage, gates, score, Scan Pack progress, market model, verification evidence, business case and GTM readiness. She summarizes status, open mandatory steps and the next recommendation, then applies explicit Go/Hold/Stop rules.",
    systemPromptSummaryDe: "IDA prüft aktuelle Phase, Gates, Score, Scan-Pack-Fortschritt, Marktmodell, Verifizierungsevidenz, Business Case und GTM-Reife. Sie fasst Status, offene Pflichtschritte und nächste Empfehlung zusammen und wendet anschließend explizite Go/Hold/Stop-Regeln an.",
    inputDataEn: [
      "Current phase and all recorded gate decisions",
      "Idea Score and completed Scan Pack items",
      "TAM, SAM, SOM projections and interview/pilot counts",
      "Investment, NPV, ROI and GTM readiness",
    ],
    inputDataDe: [
      "Aktuelle Phase und alle dokumentierten Gate-Entscheidungen",
      "Ideen-Score und abgeschlossene Scan-Pack-Elemente",
      "TAM-, SAM-, SOM-Projektionen sowie Interview-/Pilotanzahl",
      "Investition, NPV, ROI und GTM-Reife",
    ],
    outputEn: "Status, open steps, recommendation and verdict. Go: score ≥3.5, phase ≥80% complete and no stop gate. Hold: score 2.5–3.5, more than two mandatory steps open, or empty TAM/SAM/SOM. Stop: score <2.5, rejected gate, or negative NPV/ROI.",
    outputDe: "Status, offene Schritte, Empfehlung und Urteil. Go: Score ≥3,5, Phase ≥80 % abgeschlossen und kein Stop-Gate. Hold: Score 2,5–3,5, mehr als zwei offene Pflichtschritte oder leeres TAM/SAM/SOM. Stop: Score <2,5, abgelehntes Gate oder negativer NPV/ROI.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "verification-calibration",
    agent: "ida",
    triggerEn: "In Market Verification → Click 'Ask IDA for adjustments'",
    triggerDe: "In der Marktverifizierung → „IDA Anpassungen empfehlen lassen“",
    contextEn: "Verification Impact on TAM SAM SOM",
    contextDe: "Auswirkung der Verifizierung auf TAM SAM SOM",
    systemPromptSummaryEn: "IDA compares interview, pilot and lead evidence with the current SAM/SOM assumptions. She only recommends evidence-supported changes from an allowed field list and explains each change before the user selects what to apply.",
    systemPromptSummaryDe: "IDA vergleicht Interview-, Pilot- und Lead-Evidenz mit den aktuellen SAM-/SOM-Annahmen. Sie empfiehlt ausschließlich evidenzgestützte Änderungen aus einer zugelassenen Feldliste und erklärt jede Änderung, bevor der Nutzer die Übernahme auswählt.",
    inputDataEn: [
      "Customer, Affiliate and BU interviews",
      "Pilot customers and lead pipeline",
      "Current SAM and SOM assumptions",
      "SOM 5-year projections, hit rate, visibility and portfolio coverage",
    ],
    inputDataDe: [
      "Kunden-, Affiliate- und BU-Interviews",
      "Pilotkunden und Lead-Pipeline",
      "Aktuelle SAM- und SOM-Annahmen",
      "SOM-5-Jahres-Projektionen, Hitrate, Sichtbarkeit und Portfolioabdeckung",
    ],
    outputEn: "Summary plus selectable recommendations with field name, current value, editable proposed value and evidence-based rationale. Only selected changes are written back.",
    outputDe: "Zusammenfassung plus auswählbare Empfehlungen mit Feldname, aktuellem Wert, bearbeitbarem Zielwert und evidenzbasierter Begründung. Nur ausgewählte Änderungen werden zurückgeschrieben.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "framework-fill",
    agent: "ida",
    triggerEn: "In a strategic framework → Select attachments → Fill with IDA",
    triggerDe: "In einem strategischen Framework → Anhänge auswählen → Mit IDA ausfüllen",
    contextEn: "Strategic Framework Filling",
    contextDe: "Befüllung strategischer Frameworks",
    systemPromptSummaryEn: "IDA extracts evidence from selected idea attachments and maps it into the requested strategic framework without inventing unsupported claims.",
    systemPromptSummaryDe: "IDA extrahiert Evidenz aus ausgewählten Ideen-Anhängen und ordnet sie dem angeforderten strategischen Framework zu, ohne unbelegte Aussagen zu erfinden.",
    inputDataEn: [
      "Selected idea attachments",
      "Idea metadata and existing framework content",
      "Requested framework structure",
    ],
    inputDataDe: [
      "Ausgewählte Ideen-Anhänge",
      "Ideen-Metadaten und vorhandener Framework-Inhalt",
      "Struktur des angeforderten Frameworks",
    ],
    outputEn: "A structured proposal matching the selected framework, ready for review before saving.",
    outputDe: "Ein strukturierter Vorschlag passend zum ausgewählten Framework, bereit zur Prüfung vor dem Speichern.",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "hypothesis-draft",
    agent: "ida",
    triggerEn: "In Phase 2 → Hypothesis → Click 'Develop hypothesis with IDA'",
    triggerDe: "In Phase 2 → Hypothese → Klick auf 'Hypothese mit IDA entwickeln'",
    contextEn: "Hypothesis",
    contextDe: "Hypothese",
    systemPromptSummaryEn: "IDA drafts a testable business hypothesis from the idea data: the problem, the target customer, the proposed solution, the value proposition and the critical assumptions that must hold true. The draft is written so that the following scans can confirm or refute each assumption.",
    systemPromptSummaryDe: "IDA entwirft aus den Ideendaten eine prüfbare Geschäftshypothese: Problem, Zielkunde, vorgeschlagene Lösung, Nutzenversprechen und die kritischen Annahmen, die zutreffen müssen. Der Entwurf ist so formuliert, dass die folgenden Scans jede Annahme bestätigen oder widerlegen können.",
    inputDataEn: [
      "Idea metadata: title, problem, solution, industry, geography, technology",
      "Existing hypothesis fields (if already partially filled)",
      "Idea scoring comments (if available)",
    ],
    inputDataDe: [
      "Ideen-Metadaten: Titel, Problem, Lösung, Branche, Geografie, Technologie",
      "Bestehende Hypothesenfelder (falls bereits teilweise ausgefüllt)",
      "Scoring-Kommentare (falls verfügbar)",
    ],
    outputEn: "Draft hypothesis: problem statement, target customer, solution, value proposition, critical assumptions, and how each assumption can be validated.",
    outputDe: "Hypothesen-Entwurf: Problemstellung, Zielkunde, Lösung, Nutzenversprechen, kritische Annahmen und wie jede Annahme validiert werden kann.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: "ida-idea-extraction",
    agent: "ida",
    triggerEn: "In Overview → Upload a document → Click 'Extract idea with IDA'",
    triggerDe: "In der Übersicht → Dokument hochladen → Klick auf 'Idee mit IDA extrahieren'",
    contextEn: "Idea Extraction from Documents",
    contextDe: "Ideen-Extraktion aus Dokumenten",
    systemPromptSummaryEn: "IDA reads an uploaded document (concept paper, presentation, report) and extracts the structured idea fields from it, so an idea can be created without retyping. She only extracts what the document actually states and leaves unknown fields empty.",
    systemPromptSummaryDe: "IDA liest ein hochgeladenes Dokument (Konzeptpapier, Präsentation, Bericht) und extrahiert daraus die strukturierten Ideenfelder, sodass eine Idee ohne Abtippen angelegt werden kann. Sie extrahiert nur, was das Dokument tatsächlich aussagt, und lässt unbekannte Felder leer.",
    inputDataEn: [
      "Uploaded document content (PDF, Office, text)",
      "Existing idea fields to enrich (if any)",
    ],
    inputDataDe: [
      "Inhalt des hochgeladenen Dokuments (PDF, Office, Text)",
      "Bestehende Ideenfelder zum Anreichern (falls vorhanden)",
    ],
    outputEn: "Structured idea proposal: title, problem description, solution idea, industry, geography, technology, plus a note on what could not be derived from the document.",
    outputDe: "Strukturierter Ideenvorschlag: Titel, Problembeschreibung, Lösungsidee, Branche, Geografie, Technologie, plus Hinweis darauf, was aus dem Dokument nicht ableitbar war.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: "ida-business-plan-fill",
    agent: "ida",
    triggerEn: "In TAM / SAM / SOM → Click 'Fill with IDA' on a section or field group",
    triggerDe: "In TAM / SAM / SOM → Klick auf 'Mit IDA füllen' bei einem Abschnitt oder einer Feldgruppe",
    contextEn: "Business Plan Field Filling",
    contextDe: "Business-Plan-Feldbefüllung",
    systemPromptSummaryEn: "IDA reads selected attachments and Scan Pack outcomes, first builds a source-aware evidence digest, then proposes TAM, SAM or SOM values field by field. Long text PDFs are extracted page by page and processed in sections; unsupported fields are marked rather than invented.",
    systemPromptSummaryDe: "IDA liest ausgewählte Anhänge und Scan-Pack-Ergebnisse, erstellt zunächst eine quellenbezogene Evidenz-Zusammenfassung und schlägt anschließend TAM-, SAM- oder SOM-Werte feldweise vor. Lange Text-PDFs werden seitenweise ausgelesen und abschnittsweise verarbeitet; unbelegte Felder werden gekennzeichnet statt erfunden.",
    inputDataEn: [
      "Idea metadata and hypothesis",
      "Scan outcomes: industry, customer, competitor, market potential",
      "Existing TAM / SAM / SOM content and strategic models",
      "Selected attachments, including extracted PDF text and page count",
      "The requested TAM, SAM or SOM field group",
    ],
    inputDataDe: [
      "Ideen-Metadaten und Hypothese",
      "Scan-Ergebnisse: Industrie, Kunden, Wettbewerber, Marktpotenzial",
      "Bestehende TAM-/SAM-/SOM-Inhalte und strategische Modelle",
      "Ausgewählte Anhänge einschließlich extrahiertem PDF-Text und Seitenzahl",
      "Die angeforderte TAM-, SAM- oder SOM-Feldgruppe",
    ],
    outputEn: "Proposed text for each requested field, ready to review and edit. Fields with insufficient data are marked instead of invented.",
    outputDe: "Textvorschlag für jedes angeforderte Feld, bereit zur Prüfung und Bearbeitung. Felder mit unzureichender Datenlage werden gekennzeichnet statt erfunden.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "portfolio-executive-summary",
    agent: "ida",
    triggerEn: "Automatically on every visit to the Dashboard",
    triggerDe: "Automatisch bei jedem Besuch des Dashboards",
    contextEn: "Portfolio Executive Summary",
    contextDe: "Portfolio-Executive-Summary",
    systemPromptSummaryEn: "IDA reviews the entire idea portfolio and writes a management-level executive summary: where the pipeline stands, which ideas carry the most potential, where the risks and bottlenecks are, and what the portfolio should focus on next. The summary is regenerated on every page load, never cached.",
    systemPromptSummaryDe: "IDA prüft das gesamte Ideenportfolio und schreibt eine Executive Summary auf Management-Ebene: Wo die Pipeline steht, welche Ideen das größte Potenzial haben, wo Risiken und Engpässe liegen und worauf sich das Portfolio als Nächstes konzentrieren sollte. Die Zusammenfassung wird bei jedem Seitenaufruf neu erzeugt und nie zwischengespeichert.",
    inputDataEn: [
       "All ideas with stage, idea bringer, industry, geography and technology",
      "Scores and score distribution",
      "TAM / SAM / SOM values and business case KPIs where available",
      "Scan pack progress and gate decisions",
    ],
    inputDataDe: [
       "Alle Ideen mit Phase, Ideengeber, Branche, Geografie und Technologie",
      "Scores und Score-Verteilung",
      "TAM-/SAM-/SOM-Werte und Business-Case-KPIs, soweit vorhanden",
      "Scan-Pack-Fortschritt und Gate-Entscheidungen",
    ],
    outputEn: "Executive summary of the portfolio: current state, top opportunities, risks and gaps, and recommended focus areas.",
    outputDe: "Executive Summary des Portfolios: aktueller Stand, Top-Opportunities, Risiken und Lücken sowie empfohlene Schwerpunkte.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const PLANNED_ENTRIES: PromptEntry[] = [
  {
    id: "mark-pestel-research",
    agent: "mark",
    triggerEn: "In Business Plan → TAM → PESTEL → Click 'Research with Mark'",
    triggerDe: "Im Business Plan → TAM → PESTEL → Klick auf 'Mit Mark recherchieren'",
    contextEn: "PESTEL Web Research",
    contextDe: "PESTEL Web-Recherche",
    systemPromptSummaryEn: "Mark acts as a market researcher. He uses web search (Perplexity) to find current political, economic, social, technological, environmental, and legal trends relevant to the idea's industry and geography. He structures findings into the six PESTEL dimensions with source citations.",
    systemPromptSummaryDe: "Mark agiert als Marktforscher. Er nutzt Web-Suche (Perplexity), um aktuelle politische, ökonomische, soziale, technologische, ökologische und rechtliche Trends relevant für die Branche und Geografie der Idee zu finden. Er strukturiert die Ergebnisse in die sechs PESTEL-Dimensionen mit Quellenangaben.",
    inputDataEn: [
      "Idea metadata: industry, geography, technology, solution description",
      "Existing PESTEL entries (if any) to avoid duplication",
    ],
    inputDataDe: [
      "Ideen-Metadaten: Branche, Geografie, Technologie, Lösungsbeschreibung",
      "Bestehende PESTEL-Einträge (falls vorhanden) zur Vermeidung von Duplikaten",
    ],
    outputEn: "Structured PESTEL analysis with 2–4 findings per dimension, each with source URL. Summary rationale describing the macro-environment.",
    outputDe: "Strukturierte PESTEL-Analyse mit 2–4 Erkenntnissen pro Dimension, jeweils mit Quell-URL. Zusammenfassende Begründung zur Makroumgebung.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: "mark-porter-research",
    agent: "mark",
    triggerEn: "In Business Plan → TAM → Porter's Five Forces → Click 'Research with Mark'",
    triggerDe: "Im Business Plan → TAM → Porter's Five Forces → Klick auf 'Mit Mark recherchieren'",
    contextEn: "Porter's Five Forces Research",
    contextDe: "Wettbewerbskräfte-Recherche",
    systemPromptSummaryEn: "Mark researches competitive dynamics for the target industry using web search. He investigates competitor landscape, market entry barriers, substitute threats, and supplier/buyer power. He provides intensity ratings (1–5) backed by real data and sources.",
    systemPromptSummaryDe: "Mark recherchiert Wettbewerbsdynamiken für die Zielbranche mittels Web-Suche. Er untersucht Wettbewerbslandschaft, Markteintrittsbarrieren, Substitutionsbedrohungen und Lieferanten-/Käufermacht. Er liefert Intensitätsbewertungen (1–5) gestützt auf reale Daten und Quellen.",
    inputDataEn: [
      "Idea metadata: industry, geography, technology",
      "Existing Porter entries and intensity ratings (if any)",
    ],
    inputDataDe: [
      "Ideen-Metadaten: Branche, Geografie, Technologie",
      "Bestehende Porter-Einträge und Intensitätsbewertungen (falls vorhanden)",
    ],
    outputEn: "Five Forces analysis with intensity rating (1–5), description, and 1–3 source citations per force. Overall competitive environment assessment.",
    outputDe: "Five-Forces-Analyse mit Intensitätsbewertung (1–5), Beschreibung und 1–3 Quellenangaben pro Kraft. Gesamtbewertung des Wettbewerbsumfelds.",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: "mark-tam-research",
    agent: "mark",
    triggerEn: "In Business Plan → TAM → Overview → Click 'Research with Mark'",
    triggerDe: "Im Business Plan → TAM → Overview → Klick auf 'Mit Mark recherchieren'",
    contextEn: "TAM Market Research",
    contextDe: "TAM Marktrecherche",
    systemPromptSummaryEn: "Mark searches for market size data, growth rates (CAGR), and industry reports from public sources. He provides a factual foundation of market figures that IDA can then use for her TAM estimation. He prioritizes recent reports (< 2 years old) and cites all sources.",
    systemPromptSummaryDe: "Mark sucht nach Marktgrößendaten, Wachstumsraten (CAGR) und Branchenberichten aus öffentlichen Quellen. Er liefert eine Faktengrundlage mit Marktzahlen, die IDA dann für ihre TAM-Schätzung nutzen kann. Er priorisiert aktuelle Berichte (< 2 Jahre alt) und zitiert alle Quellen.",
    inputDataEn: [
      "Idea metadata: industry, geography, technology, solution description",
      "TAM description and scope (if defined)",
      "Existing market research data (if any)",
    ],
    inputDataDe: [
      "Ideen-Metadaten: Branche, Geografie, Technologie, Lösungsbeschreibung",
      "TAM-Beschreibung und Scope (falls definiert)",
      "Bestehende Marktforschungsdaten (falls vorhanden)",
    ],
    outputEn: "Market size estimates from 2–5 sources with publication date, publisher, and URL. Growth rate (CAGR) range. Key market drivers and constraints. Data quality assessment.",
    outputDe: "Marktgrößen-Schätzungen aus 2–5 Quellen mit Veröffentlichungsdatum, Herausgeber und URL. Wachstumsrate (CAGR)-Spanne. Zentrale Markttreiber und -einschränkungen. Datenqualitätsbewertung.",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: "mark-competitor-research",
    agent: "mark",
    triggerEn: "In Idea Scoring → Competitor Landscape → Click 'Research with Mark'",
    triggerDe: "Im Idea Scoring → Competitor Landscape → Klick auf 'Mit Mark recherchieren'",
    contextEn: "Competitor Web Research",
    contextDe: "Wettbewerber Web-Recherche",
    systemPromptSummaryEn: "Mark researches competitor profiles including market shares, pricing strategies, product portfolios, and key differentiators from public web sources, press releases, and industry databases. He creates structured competitor entries ready for import into the Competitor Landscape.",
    systemPromptSummaryDe: "Mark recherchiert Wettbewerber-Profile einschließlich Marktanteile, Preisstrategien, Produktportfolios und wesentliche Differenzierungsmerkmale aus öffentlichen Webquellen, Pressemitteilungen und Branchendatenbanken. Er erstellt strukturierte Wettbewerber-Einträge zum Import in die Competitor Landscape.",
    inputDataEn: [
      "Idea metadata: industry, geography, technology, solution description",
      "Existing competitor entries (if any) to enrich or avoid duplication",
      "Competitor names mentioned in scoring comments (if any)",
    ],
    inputDataDe: [
      "Ideen-Metadaten: Branche, Geografie, Technologie, Lösungsbeschreibung",
      "Bestehende Wettbewerber-Einträge (falls vorhanden) zum Anreichern oder zur Duplikat-Vermeidung",
      "In Scoring-Kommentaren erwähnte Wettbewerbernamen (falls vorhanden)",
    ],
    outputEn: "3–6 competitor profiles with: name, estimated market share, threat level (1–5), dimension ratings (price, tech features, reach, brand awareness, history, USPs), and source citations.",
    outputDe: "3–6 Wettbewerber-Profile mit: Name, geschätzter Marktanteil, Bedrohungslevel (1–5), Dimensionsbewertungen (Preis, Tech-Features, Reichweite, Markenbekanntheit, Historie, USPs) und Quellenangaben.",
    icon: <Shield className="h-5 w-5" />,
  },
];

export default function PromptLibrary() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const agentLabel = (agent: string) => {
    if (agent === "ida") return "IDA";
    if (agent === "mark") return "Mark";
    return "System";
  };

  const agentColor = (agent: string) => {
    if (agent === "ida") return "bg-agent-ida text-white";
    if (agent === "mark") return "bg-agent-mark text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">
            {bp("Prompt Library", "Prompt-Bibliothek")}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Intro */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-foreground font-medium">
              {bp(
                "This page documents the system prompts that IDA and Mark use behind the scenes in each context. It provides full transparency into what data the AI agents receive, how they process it, and what output they generate.",
                "Diese Seite dokumentiert die System-Prompts, die IDA und Mark im Hintergrund in jedem Kontext verwenden. Sie bietet volle Transparenz darüber, welche Daten die KI-Agenten erhalten, wie sie diese verarbeiten und welchen Output sie erzeugen."
              )}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <img src={idaAvatar} alt="IDA" className="h-4 w-4 rounded-full" />
                IDA = {bp("Internal Data Analyst", "Interne Datenanalystin")}
              </span>
              <span className="flex items-center gap-1.5">
                <img src={markAvatar} alt="Mark" className="h-4 w-4 rounded-full" />
                Mark = {bp("Market Researcher", "Marktforscher")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Automated Analyses */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {bp("Automated AI Analyses", "Automatisierte KI-Analysen")}
          </h2>
          <div className="space-y-3">
            {ENTRIES.map(entry => (
              <PromptCard key={entry.id} entry={entry} expanded={expandedId === entry.id} onToggle={() => toggle(entry.id)} bp={bp} agentLabel={agentLabel} agentColor={agentColor} language={language} />
            ))}
          </div>
        </div>

        {/* Planned: Mark Web Search */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            {bp("Planned – Mark Web Search", "Geplant – Mark Web-Recherche")}
            <Badge variant="outline" className="text-[10px] border-agent-mark/40 text-agent-mark">Coming Soon</Badge>
          </h2>
          <div className="space-y-3">
            {PLANNED_ENTRIES.map(entry => (
              <PromptCard key={entry.id} entry={entry} expanded={expandedId === entry.id} onToggle={() => toggle(entry.id)} bp={bp} agentLabel={agentLabel} agentColor={agentColor} language={language} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PromptCard({ entry, expanded, onToggle, bp, agentLabel, agentColor, language }: {
  entry: PromptEntry;
  expanded: boolean;
  onToggle: () => void;
  bp: (en: string, de: string) => string;
  agentLabel: (a: string) => string;
  agentColor: (a: string) => string;
  language: string;
}) {
  const lang = language === "de" ? "de" : "en";

  return (
    <Card className="overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
      >
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {entry.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {lang === "de" ? entry.contextDe : entry.contextEn}
            </span>
            <Badge className={`text-[10px] ${agentColor(entry.agent)}`}>
              {agentLabel(entry.agent)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {lang === "de" ? entry.triggerDe : entry.triggerEn}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* System Prompt Summary */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              {bp("System Prompt", "System-Prompt")}
            </h4>
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
              {lang === "de" ? entry.systemPromptSummaryDe : entry.systemPromptSummaryEn}
            </div>
          </div>

          {/* Input Data */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              {bp("Input Data (what IDA/Mark receives)", "Eingabedaten (was IDA/Mark erhält)")}
            </h4>
            <ul className="space-y-1">
              {(lang === "de" ? entry.inputDataDe : entry.inputDataEn).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Output */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              {bp("Output Format", "Ausgabeformat")}
            </h4>
            <p className="text-xs text-muted-foreground">
              {lang === "de" ? entry.outputDe : entry.outputEn}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
