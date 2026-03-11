import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft, GraduationCap, TrendingUp, Target, BarChart3,
  Compass, BookOpen, CheckCircle2, Lightbulb, Globe, Users,
  ShieldCheck, Layers, Calculator, Rocket, Settings,
} from "lucide-react";
import noviLogo from "@/assets/novi-logo-v4.png";
import trainingMarketVideo from "@/assets/training-market-modeling.mp4";
import trainingStrategyVideo from "@/assets/training-strategic-frameworks.mp4";
import trainingBusinessVideo from "@/assets/training-business-case.mp4";
import trainingToolVideo from "@/assets/training-tool-usage.mp4";

const moduleVideos: Record<string, string> = {
  market: trainingMarketVideo,
  strategic: trainingStrategyVideo,
  scoring: trainingBusinessVideo,
  tool: trainingToolVideo,
};

interface LessonCard {
  title: string;
  description: string;
  icon: React.ElementType;
  content: Section[];
}

interface Section {
  heading: string;
  body: string;
  example?: string;
  tip?: string;
}

const modulesDE: { id: string; title: string; description: string; icon: React.ElementType; color: string; lessons: LessonCard[] }[] = [
  {
    id: "market",
    title: "Marktmodellierung",
    description: "TAM, SAM & SOM verstehen und anwenden",
    icon: TrendingUp,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lessons: [
      {
        title: "Total Addressable Market (TAM)",
        description: "Die maximale Marktgröße verstehen",
        icon: Globe,
        content: [
          {
            heading: "Was ist der TAM?",
            body: "Der TAM (Total Addressable Market) beschreibt die gesamte Marktnachfrage nach einem Produkt oder einer Dienstleistung – unabhängig davon, ob ein Unternehmen diesen Markt tatsächlich bedienen kann. Er gibt die theoretische Obergrenze des Umsatzpotenzials an.",
            example: "Wenn alle Unternehmen weltweit, die Qualitätsmessungen durchführen, Ihre Lösung kaufen würden, wäre das Ihr TAM. Z.B. 'Der weltweite Markt für industrielle Qualitätsmesstechnik beträgt ca. 12 Mrd. €.'",
            tip: "Der TAM sollte aus verlässlichen Quellen (Marktforschungsberichte, Branchenverbände) abgeleitet werden. Top-Down und Bottom-Up Ansätze ergänzen sich gegenseitig.",
          },
          {
            heading: "Berechnungsmethoden",
            body: "Top-Down: Gesamtmarktdaten aus Studien → Eingrenzung auf relevantes Segment.\nBottom-Up: Anzahl potenzieller Kunden × durchschnittlicher Umsatz pro Kunde.\nValue Theory: Geschätzter Wert, den die Lösung für den Kunden schafft × Anzahl Kunden.",
          },
          {
            heading: "Im Tool",
            body: "Unter 'Business Plan → TAM' dokumentieren Sie Ihre Scope-Definition, geographische Abdeckung, Annahmen und 5-Jahres-Projektionen. Die IDA-KI kann basierend auf Ihren Daten eine eigene Schätzung erstellen.",
          },
        ],
      },
      {
        title: "Serviceable Addressable Market (SAM)",
        description: "Den erreichbaren Markt eingrenzen",
        icon: Target,
        content: [
          {
            heading: "Was ist der SAM?",
            body: "Der SAM (Serviceable Addressable Market) ist der Teil des TAM, den Ihr Unternehmen mit seinem aktuellen Geschäftsmodell, seinen Produkten und seiner geographischen Reichweite tatsächlich adressieren kann.",
            example: "Wenn Sie nur DACH-Märkte bedienen und sich auf die Automobilindustrie konzentrieren, ist Ihr SAM deutlich kleiner als der globale TAM.",
          },
          {
            heading: "SAM-Eingrenzungsfaktoren",
            body: "• Geographische Einschränkungen (z.B. nur DACH)\n• Brancheneinschränkungen (z.B. nur Automotive & Aerospace)\n• Technologische Limitierungen\n• Regulatorische Hürden\n• Vertriebskanal-Reichweite\n• Sprachbarrieren & kulturelle Faktoren",
          },
          {
            heading: "Im Tool",
            body: "Unter 'Business Plan → SAM' definieren Sie ein- und ausgeschlossene Branchen, Zielgruppen und die Vertriebskanal-Analyse. Die Sales Channel Analysis hilft bei der Bewertung der Kanalstrategie.",
          },
        ],
      },
      {
        title: "Serviceable Obtainable Market (SOM)",
        description: "Den realistisch erzielbaren Marktanteil planen",
        icon: BarChart3,
        content: [
          {
            heading: "Was ist der SOM?",
            body: "Der SOM (Serviceable Obtainable Market) ist der realistische Anteil des SAM, den Sie in den nächsten 3-5 Jahren tatsächlich gewinnen können. Er berücksichtigt Ihre Vertriebskapazität, Marketingbudgets, Wettbewerb und operative Einschränkungen.",
            example: "Bei einem SAM von 200 Mio. € könnte Ihr SOM im Jahr 1 bei 2 Mio. € liegen (1% Marktanteil) und bis Jahr 5 auf 10 Mio. € wachsen.",
          },
          {
            heading: "Schlüsselparameter",
            body: "• Portfolio Coverage: Wie viel des SAM deckt Ihr Produktportfolio ab?\n• Visibility Rate: Bei wie vielen potenziellen Kunden sind Sie bekannt?\n• Hit Rate: Wie viele Anfragen werden zu Aufträgen?\n• Vertriebskapazität: Wie viele Kunden kann Ihr Team aktiv betreuen?",
          },
          {
            heading: "TAM → SAM → SOM Zusammenspiel",
            body: "Die drei Marktgrößen bilden einen Trichter: TAM ist die theoretische Obergrenze, SAM der adressierbare Teil, SOM Ihre realistische Planung. Die Verhältnisse (SAM/TAM, SOM/SAM) zeigen, wie fokussiert Ihre Strategie ist.",
            tip: "Ein SOM/SAM-Verhältnis von >30% im Jahr 1 ist in den meisten Märkten unrealistisch. 1-5% ist ein guter Startpunkt.",
          },
        ],
      },
    ],
  },
  {
    id: "strategic",
    title: "Strategische Frameworks",
    description: "PESTEL, Porter's, SWOT, Ansoff und mehr",
    icon: Compass,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    lessons: [
      {
        title: "PESTEL-Analyse",
        description: "Makro-Umfeldanalyse in 6 Dimensionen",
        icon: Globe,
        content: [
          {
            heading: "Was ist PESTEL?",
            body: "PESTEL analysiert das Makro-Umfeld eines Marktes in 6 Dimensionen:\n• Political (Politisch): Regulierung, Handelspolitik, Stabilität\n• Economic (Ökonomisch): Konjunktur, Zinsen, Inflation\n• Social (Sozial): Demographie, Trends, Kultur\n• Technological (Technologisch): Innovation, Digitalisierung, F&E\n• Environmental (Ökologisch): Nachhaltigkeit, Klimawandel\n• Legal (Rechtlich): Gesetze, Normen, Compliance",
            example: "Für eine Qualitätsmesstechnik-Lösung könnte 'Technological' die Industrie 4.0-Trends beinhalten, 'Legal' die zunehmenden Qualitätsnormen (ISO 9001, IATF 16949).",
          },
          {
            heading: "Wann verwenden?",
            body: "PESTEL ist besonders hilfreich bei der TAM-Bewertung, um zu verstehen, welche externen Faktoren die Marktentwicklung treiben oder hemmen. Es hilft auch bei der Risikobewertung neuer Geographien.",
          },
        ],
      },
      {
        title: "Porter's Five Forces",
        description: "Branchenstrukturanalyse",
        icon: ShieldCheck,
        content: [
          {
            heading: "Die 5 Kräfte",
            body: "Porter's Five Forces bewertet die Wettbewerbsintensität einer Branche:\n1. Bedrohung durch neue Wettbewerber\n2. Verhandlungsmacht der Lieferanten\n3. Verhandlungsmacht der Kunden\n4. Bedrohung durch Substitute\n5. Rivalität unter bestehenden Wettbewerbern",
            tip: "Hohe Eintrittsbarrieren + geringe Substitute = attraktiver Markt. Im Tool bewerten Sie jede Kraft auf einer Skala von 1-5.",
          },
        ],
      },
      {
        title: "Ansoff-Matrix",
        description: "Wachstumsstrategien klassifizieren",
        icon: Layers,
        content: [
          {
            heading: "Die 4 Strategiefelder",
            body: "Die Ansoff-Matrix ordnet Wachstumschancen in 4 Quadranten:\n• Marktdurchdringung: Bestehendes Produkt, bestehender Markt (geringstes Risiko)\n• Marktentwicklung: Bestehendes Produkt, neuer Markt\n• Produktentwicklung: Neues Produkt, bestehender Markt\n• Diversifikation: Neues Produkt, neuer Markt (höchstes Risiko)",
            example: "Eine neue Messtechnik-Lösung für die Automobilindustrie (bestehender Markt) wäre 'Produktentwicklung'. Dieselbe Lösung für die Pharmaindustrie wäre 'Diversifikation'.",
          },
          {
            heading: "Im Dashboard",
            body: "Das Ansoff-Dashboard auf der Startseite zeigt alle Ihre Opportunities in der Matrix und hilft, die Portfolio-Balance zu bewerten.",
          },
        ],
      },
      {
        title: "SWOT, BMC & weitere Modelle",
        description: "Übersicht der strategischen Werkzeuge",
        icon: Lightbulb,
        content: [
          {
            heading: "SWOT-Analyse",
            body: "Stärken, Schwächen, Chancen und Risiken einer Opportunity. Intern (S/W) vs. Extern (O/T). Verknüpft mit der TAM-Phase im Tool.",
          },
          {
            heading: "Business Model Canvas (BMC)",
            body: "9 Bausteine eines Geschäftsmodells: Kundensegmente, Wertangebot, Kanäle, Kundenbeziehungen, Einnahmequellen, Schlüsselressourcen, -aktivitäten, -partner und Kostenstruktur. Im Tool unter SAM-Modellen.",
          },
          {
            heading: "Lean Canvas",
            body: "Adaptiertes BMC für Startups/Innovationen mit Fokus auf Problem, Lösung, Kennzahlen und unfairem Vorteil. Ebenfalls unter SAM-Modellen.",
          },
          {
            heading: "Value Proposition Canvas (VPC)",
            body: "Detaillierte Analyse des Wertangebots: Customer Jobs, Pains, Gains vs. Products, Pain Relievers, Gain Creators. Im Tool unter SOM-Modellen.",
          },
        ],
      },
    ],
  },
  {
    id: "scoring",
    title: "Business Case & Scoring",
    description: "Bewertungskriterien und deren Bedeutung",
    icon: Calculator,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    lessons: [
      {
        title: "Idea Scoring (Rough Scoring)",
        description: "Die erste Bewertung einer Idee",
        icon: CheckCircle2,
        content: [
          {
            heading: "Der 22-Kriterien-Fragebogen",
            body: "Das Idea Scoring bewertet neue Ideen anhand von 22 Fragen in 5 Kategorien:\n1. Strategische Passung (Strategic Fit)\n2. Marktpotenzial (Market Potential)\n3. Technische Machbarkeit (Feasibility)\n4. Kommerzielle Tragfähigkeit (Commercial Viability)\n5. Risiko (Risk)\n\nJede Frage wird auf einer Skala bewertet. Die Gewichtung der Kategorien kann angepasst werden.",
            tip: "Ein Score ab 60% wird typischerweise als 'Go' für Gate 1 angesehen. Unter 40% sollte die Idee überarbeitet oder verworfen werden.",
          },
          {
            heading: "IDA Assessment",
            body: "Die KI-Agentin IDA analysiert Ihre Scoring-Ergebnisse und gibt ein Assessment mit Stärken, Schwächen, Risiken und nächsten Schritten. Dies dient als Diskussionsgrundlage für Gate-Meetings.",
          },
        ],
      },
      {
        title: "Detailed Scoring (Business Plan)",
        description: "Vertiefende Bewertung in 8 Dimensionen",
        icon: BarChart3,
        content: [
          {
            heading: "Die 8 Bewertungsdimensionen",
            body: "Nach Gate 1 wird die Bewertung vertieft:\n1. Strategic Fit: Strategische Passung & Capability Gaps\n2. Feasibility: TRL, Umsetzungsplan, Ressourcen\n3. Commercial Viability: Preismodell, Margen, Break-Even\n4. Risk: Markt-, Technologie- und Umsetzungsrisiken\n5. Competitor Landscape: Wettbewerbsanalyse\n6. Organisational Readiness: Organisatorische Bereitschaft\n7. Pilot Customer: Pilotkunden-Bewertung\n8. Portfolio Fit: Passung zum bestehenden Portfolio",
          },
          {
            heading: "Scoring-Übersicht",
            body: "Das Radar-Chart auf dem Scoring-Tab zeigt alle 8 Dimensionen auf einen Blick. So erkennen Sie schnell, wo Stärken und Schwächen liegen.",
          },
        ],
      },
      {
        title: "Investment Case & Business Case",
        description: "Von der Idee zur Investitionsentscheidung",
        icon: Calculator,
        content: [
          {
            heading: "Investment Case",
            body: "Der Investment Case fasst zusammen, warum in diese Opportunity investiert werden soll: erwarteter ROI, benötigte Investitionen, Zeitplan und Risikobewertung. Er wird vor Gate 2 erstellt.",
          },
          {
            heading: "Business Case (Implementation & GTM Plan)",
            body: "Der Business Case detailliert den Umsetzungs- und Go-to-Market-Plan: Entwicklungsschritte, Marketingstrategie, Vertriebskanäle, Pilotkunden und Meilensteine. Er wird vor Gate 3 erstellt.",
          },
          {
            heading: "Stage-Gate-Prozess",
            body: "Jedes Gate ist ein Entscheidungspunkt:\n• Gate 1: Idee → Business Plan (Go/Hold/No-Go basierend auf Idea Scoring)\n• Gate 2: Business Plan → Business Case (basierend auf Marktanalyse & Scoring)\n• Gate 3: Business Case → Implementation (basierend auf Investment Case & GTM)\n\nGate-Meetings werden mit Protokollen dokumentiert.",
          },
        ],
      },
    ],
  },
  {
    id: "tool",
    title: "Tool-Bedienung",
    description: "NOVI effizient nutzen",
    icon: Settings,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    lessons: [
      {
        title: "Dashboard & Navigation",
        description: "Übersicht und Einstieg",
        icon: Compass,
        content: [
          {
            heading: "Das Dashboard",
            body: "Das Dashboard zeigt alle Opportunities mit Filtern (Stage, Branche, Geographie, Technologie, Owner). Die Pipeline-Funnel-Ansicht visualisiert die Verteilung über die Phasen. Das Ansoff-Dashboard und der Three Horizons Chart geben strategische Einblicke.",
          },
          {
            heading: "Opportunity erstellen",
            body: "Klicken Sie auf '+ Neue Idee' im Header. Füllen Sie Titel, Problembeschreibung, Lösungsidee, Branche, Geographie, Technologie und Owner aus. Nach dem Erstellen starten Sie im Status 'Idea'.",
          },
        ],
      },
      {
        title: "Sidebar-Navigation in Opportunities",
        description: "Alle Bereiche einer Opportunity",
        icon: BookOpen,
        content: [
          {
            heading: "Hierarchische Navigation",
            body: "In einer Opportunity navigieren Sie über die linke Sidebar:\n• Overview: Stammdaten und Zusammenfassung\n• Idea Scoring: 22-Fragen-Wizard und strategische Modelle\n• Business Plan: TAM/SAM/SOM mit Overview und Modellen\n• Stage Gates: G1, G2, G3 Meeting-Protokolle\n• Business Case: Investment Case und Implementation Plan",
          },
          {
            heading: "KI-Agenten nutzen",
            body: "IDA (rosa Roboter): Bewertet Ihre Eingaben und erstellt Assessments\nMark (blauer Roboter): Wird zukünftig Web-Recherche für Marktdaten durchführen\n\nKI-Schätzungen finden Sie unter den 'IDA Estimation'-Buttons in TAM, SAM und SOM.",
          },
        ],
      },
      {
        title: "Daten exportieren & teilen",
        description: "PDF-Export und Zusammenarbeit",
        icon: Rocket,
        content: [
          {
            heading: "PDF-Export",
            body: "Auf dem Overview-Tab jeder Opportunity finden Sie den PDF-Export-Button. Dieser erstellt ein umfassendes Dokument mit allen Scoring-Ergebnissen, Marktanalysen und Gate-Entscheidungen.",
          },
          {
            heading: "Dateien anhängen",
            body: "Im Overview-Tab können Sie Dateien an Opportunities anhängen – z.B. Marktforschungsberichte, Kundenpräsentationen oder technische Dokumente.",
          },
          {
            heading: "Sprache umschalten",
            body: "Das Tool unterstützt Deutsch und Englisch. Nutzen Sie den Sprachumschalter im Header, um zwischen den Sprachen zu wechseln.",
          },
        ],
      },
    ],
  },
];

const modulesEN: typeof modulesDE = [
  {
    id: "market",
    title: "Market Modeling",
    description: "Understanding & applying TAM, SAM & SOM",
    icon: TrendingUp,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lessons: [
      {
        title: "Total Addressable Market (TAM)",
        description: "Understanding the maximum market size",
        icon: Globe,
        content: [
          {
            heading: "What is TAM?",
            body: "The TAM (Total Addressable Market) describes the total market demand for a product or service – regardless of whether a company can actually serve that market. It represents the theoretical upper limit of revenue potential.",
            example: "If every company worldwide that performs quality measurements would buy your solution, that would be your TAM. E.g. 'The global market for industrial quality measurement is approx. €12B.'",
            tip: "TAM should be derived from reliable sources (market research reports, industry associations). Top-down and bottom-up approaches complement each other.",
          },
          { heading: "Calculation Methods", body: "Top-Down: Total market data from studies → narrow to relevant segment.\nBottom-Up: Number of potential customers × average revenue per customer.\nValue Theory: Estimated value your solution creates × number of customers." },
          { heading: "In the Tool", body: "Under 'Business Plan → TAM' you document your scope definition, geographic coverage, assumptions and 5-year projections. The IDA AI can create its own estimate based on your data." },
        ],
      },
      {
        title: "Serviceable Addressable Market (SAM)",
        description: "Narrowing down the reachable market",
        icon: Target,
        content: [
          { heading: "What is SAM?", body: "The SAM is the portion of TAM your company can actually address with its current business model, products and geographic reach.", example: "If you only serve DACH markets and focus on automotive, your SAM is significantly smaller than the global TAM." },
          { heading: "SAM Narrowing Factors", body: "• Geographic constraints\n• Industry restrictions\n• Technology limitations\n• Regulatory barriers\n• Sales channel reach\n• Language & cultural factors" },
          { heading: "In the Tool", body: "Under 'Business Plan → SAM' you define included/excluded industries, target groups and the Sales Channel Analysis." },
        ],
      },
      {
        title: "Serviceable Obtainable Market (SOM)",
        description: "Planning realistic market share",
        icon: BarChart3,
        content: [
          { heading: "What is SOM?", body: "SOM is the realistic share of SAM you can actually capture in the next 3-5 years, considering sales capacity, marketing budgets, competition and operational constraints.", example: "With a SAM of €200M, your SOM in Year 1 might be €2M (1% market share), growing to €10M by Year 5." },
          { heading: "Key Parameters", body: "• Portfolio Coverage: How much of SAM does your portfolio cover?\n• Visibility Rate: How many potential customers know you?\n• Hit Rate: How many inquiries become orders?\n• Sales Capacity: How many customers can your team actively manage?" },
          { heading: "TAM → SAM → SOM Funnel", body: "The three market sizes form a funnel. The ratios (SAM/TAM, SOM/SAM) show how focused your strategy is.", tip: "A SOM/SAM ratio >30% in Year 1 is unrealistic in most markets. 1-5% is a good starting point." },
        ],
      },
    ],
  },
  {
    id: "strategic",
    title: "Strategic Frameworks",
    description: "PESTEL, Porter's, SWOT, Ansoff & more",
    icon: Compass,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    lessons: [
      {
        title: "PESTEL Analysis", description: "Macro-environment in 6 dimensions", icon: Globe,
        content: [
          { heading: "What is PESTEL?", body: "PESTEL analyzes the macro-environment in 6 dimensions:\n• Political: Regulation, trade policy, stability\n• Economic: Economy, interest rates, inflation\n• Social: Demographics, trends, culture\n• Technological: Innovation, digitalization, R&D\n• Environmental: Sustainability, climate change\n• Legal: Laws, standards, compliance", example: "For quality measurement tech, 'Technological' could include Industry 4.0 trends, 'Legal' the increasing quality standards (ISO 9001, IATF 16949)." },
          { heading: "When to use?", body: "PESTEL is especially helpful during TAM assessment to understand external factors driving or hindering market development." },
        ],
      },
      {
        title: "Porter's Five Forces", description: "Industry structure analysis", icon: ShieldCheck,
        content: [
          { heading: "The 5 Forces", body: "1. Threat of new entrants\n2. Bargaining power of suppliers\n3. Bargaining power of customers\n4. Threat of substitutes\n5. Rivalry among existing competitors", tip: "High entry barriers + few substitutes = attractive market. In the tool, rate each force on a 1-5 scale." },
        ],
      },
      {
        title: "Ansoff Matrix", description: "Classifying growth strategies", icon: Layers,
        content: [
          { heading: "4 Strategy Fields", body: "• Market Penetration: Existing product, existing market (lowest risk)\n• Market Development: Existing product, new market\n• Product Development: New product, existing market\n• Diversification: New product, new market (highest risk)" },
          { heading: "In the Dashboard", body: "The Ansoff Dashboard on the home page shows all opportunities in the matrix and helps assess portfolio balance." },
        ],
      },
      {
        title: "SWOT, BMC & More", description: "Overview of strategic tools", icon: Lightbulb,
        content: [
          { heading: "SWOT Analysis", body: "Strengths, Weaknesses, Opportunities and Threats. Internal (S/W) vs External (O/T). Linked to the TAM phase." },
          { heading: "Business Model Canvas", body: "9 building blocks: Customer Segments, Value Proposition, Channels, Customer Relationships, Revenue Streams, Key Resources, Activities, Partners and Cost Structure." },
          { heading: "Lean Canvas", body: "Adapted BMC for startups/innovations focusing on Problem, Solution, Metrics and Unfair Advantage." },
          { heading: "Value Proposition Canvas", body: "Detailed value analysis: Customer Jobs, Pains, Gains vs Products, Pain Relievers, Gain Creators." },
        ],
      },
    ],
  },
  {
    id: "scoring",
    title: "Business Case & Scoring",
    description: "Assessment criteria and their meaning",
    icon: Calculator,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    lessons: [
      {
        title: "Idea Scoring (Rough Scoring)", description: "The initial assessment of an idea", icon: CheckCircle2,
        content: [
          { heading: "The 22-Criteria Questionnaire", body: "Idea Scoring evaluates new ideas across 22 questions in 5 categories:\n1. Strategic Fit\n2. Market Potential\n3. Technical Feasibility\n4. Commercial Viability\n5. Risk\n\nEach question is rated on a scale. Category weights can be adjusted.", tip: "A score above 60% is typically considered 'Go' for Gate 1. Below 40%, the idea should be reworked or dropped." },
          { heading: "IDA Assessment", body: "The AI agent IDA analyzes your scoring results and provides an assessment with strengths, weaknesses, risks and next steps." },
        ],
      },
      {
        title: "Detailed Scoring (Business Plan)", description: "In-depth assessment across 8 dimensions", icon: BarChart3,
        content: [
          { heading: "The 8 Dimensions", body: "After Gate 1, the assessment deepens:\n1. Strategic Fit\n2. Feasibility: TRL, implementation plan, resources\n3. Commercial Viability: Pricing, margins, break-even\n4. Risk: Market, technology and execution risks\n5. Competitor Landscape\n6. Organisational Readiness\n7. Pilot Customer assessment\n8. Portfolio Fit" },
          { heading: "Scoring Overview", body: "The radar chart on the Scoring tab shows all 8 dimensions at a glance." },
        ],
      },
      {
        title: "Investment Case & Business Case", description: "From idea to investment decision", icon: Calculator,
        content: [
          { heading: "Investment Case", body: "Summarizes why to invest: expected ROI, required investment, timeline and risk assessment. Created before Gate 2." },
          { heading: "Business Case", body: "Details the implementation and go-to-market plan: development steps, marketing strategy, sales channels, pilot customers and milestones." },
          { heading: "Stage-Gate Process", body: "Each gate is a decision point:\n• Gate 1: Idea → Business Plan\n• Gate 2: Business Plan → Business Case\n• Gate 3: Business Case → Implementation\n\nGate meetings are documented with meeting notes." },
        ],
      },
    ],
  },
  {
    id: "tool",
    title: "Tool Usage",
    description: "Using NOVI effectively",
    icon: Settings,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    lessons: [
      {
        title: "Dashboard & Navigation", description: "Overview and getting started", icon: Compass,
        content: [
          { heading: "The Dashboard", body: "Shows all opportunities with filters. The pipeline funnel visualizes distribution across stages. Ansoff and Three Horizons charts provide strategic insights." },
          { heading: "Creating an Opportunity", body: "Click '+ New Idea' in the header. Fill in title, problem, solution, industry, geography, technology and owner." },
        ],
      },
      {
        title: "Sidebar Navigation", description: "All areas of an opportunity", icon: BookOpen,
        content: [
          { heading: "Hierarchical Navigation", body: "Navigate via the left sidebar:\n• Overview: Master data & summary\n• Idea Scoring: 22-question wizard & strategic models\n• Business Plan: TAM/SAM/SOM with overviews & models\n• Stage Gates: G1, G2, G3 meeting notes\n• Business Case: Investment Case & Implementation Plan" },
          { heading: "Using AI Agents", body: "IDA (pink robot): Evaluates your inputs and creates assessments\nMark (blue robot): Will perform web research for market data in the future\n\nAI estimations are under the 'IDA Estimation' buttons in TAM, SAM and SOM." },
        ],
      },
      {
        title: "Export & Sharing", description: "PDF export and collaboration", icon: Rocket,
        content: [
          { heading: "PDF Export", body: "Find the PDF export button on the Overview tab of each opportunity." },
          { heading: "File Attachments", body: "Attach files (market reports, presentations, technical documents) on the Overview tab." },
          { heading: "Language Switching", body: "The tool supports German and English. Use the language toggle in the header." },
        ],
      },
    ],
  },
];

export default function TrainingAcademy() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const modules = language === "de" ? modulesDE : modulesEN;

  const selectedModule = modules.find((m) => m.id === activeModule);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {language === "de" ? "Training Academy" : "Training Academy"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {language === "de" ? "Wissen für Ihr BD-Team" : "Knowledge for your BD team"}
                </p>
              </div>
            </div>
          </div>
          <img src={noviLogo} alt="NOVI" className="h-14 shrink-0" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-8">
        {!selectedModule ? (
          /* ─── Module Overview ─── */
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {language === "de" ? "Willkommen zur Training Academy" : "Welcome to the Training Academy"}
              </h2>
              <p className="text-muted-foreground">
                {language === "de"
                  ? "Wählen Sie ein Modul, um die Konzepte und Methoden des BD Navigators kennenzulernen."
                  : "Select a module to learn about the concepts and methods of the BD Navigator."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Card
                    key={mod.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
                    onClick={() => setActiveModule(mod.id)}
                  >
                    {moduleVideos[mod.id] && (
                      <div className="overflow-hidden rounded-t-lg">
                        <video
                          src={moduleVideos[mod.id]}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${mod.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {mod.title}
                          </CardTitle>
                          <CardDescription>{mod.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {mod.lessons.length} {language === "de" ? "Lektionen" : "Lessons"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* ─── Module Detail ─── */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {language === "de" ? "Alle Module" : "All Modules"}
              </Button>
              <Badge variant="secondary" className={selectedModule.color}>
                {selectedModule.title}
              </Badge>
            </div>

            <div className="space-y-4">
              {selectedModule.lessons.map((lesson, li) => {
                const LIcon = lesson.icon;
                return (
                  <Card key={li}>
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`lesson-${li}`} className="border-none">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                              <LIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-card-foreground">{lesson.title}</h3>
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-6 pl-12">
                            {lesson.content.map((section, si) => (
                              <div key={si} className="space-y-2">
                                <h4 className="font-semibold text-foreground">{section.heading}</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                  {section.body}
                                </p>
                                {section.example && (
                                  <div className="rounded-lg border border-border bg-muted/50 p-3 mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      {language === "de" ? "💡 Beispiel" : "💡 Example"}
                                    </p>
                                    <p className="text-sm text-foreground">{section.example}</p>
                                  </div>
                                )}
                                {section.tip && (
                                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mt-2">
                                    <p className="text-xs font-medium text-primary mb-1">
                                      {language === "de" ? "💎 Tipp" : "💎 Tip"}
                                    </p>
                                    <p className="text-sm text-foreground">{section.tip}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
