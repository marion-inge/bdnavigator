import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Target, ClipboardCheck, FileText, BarChart3, Bot, Globe, Shield, Upload, Lightbulb, TrendingUp, Layers, BookOpen, Search } from "lucide-react";
import noviLogo from "@/assets/novi-logo-v4.png";

interface FeatureGroup {
  titleEn: string;
  titleDe: string;
  icon: React.ReactNode;
  features: { en: string; de: string; detail?: string; detailDe?: string }[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    titleEn: "Dashboard & Navigation",
    titleDe: "Dashboard & Navigation",
    icon: <LayoutDashboard className="h-5 w-5" />,
    features: [
      { en: "Pipeline Funnel Visualization", de: "Pipeline-Trichter-Visualisierung", detail: "Interactive funnel chart showing idea distribution across stages", detailDe: "Interaktives Trichterdiagramm zur Verteilung der Ideen über Phasen" },
      { en: "KPI Dashboard Cards", de: "KPI-Dashboard-Karten", detail: "Total ideas, top scorer at a glance", detailDe: "Gesamtzahl Ideen, Top-Scorer auf einen Blick" },
      { en: "Market Potential Chart (TAM/SAM/SOM)", de: "Marktpotenzial-Diagramm (TAM/SAM/SOM)", detail: "Aggregated 5-year TAM, SAM, SOM bar chart across the entire portfolio", detailDe: "Aggregiertes 5-Jahres-TAM/SAM/SOM-Balkendiagramm über das gesamte Portfolio" },
      { en: "Distribution Charts (Industry, Geography, Technology)", de: "Verteilungsdiagramme (Branche, Geografie, Technologie)", detail: "Pie and bar charts showing portfolio composition", detailDe: "Kreis- und Balkendiagramme zur Portfolio-Zusammensetzung" },
      { en: "Ansoff Matrix Dashboard", de: "Ansoff-Matrix-Dashboard", detail: "Strategic categorization of ideas by market/product newness", detailDe: "Strategische Einordnung nach Markt-/Produktneuheit" },
      { en: "Three Horizons View", de: "Drei-Horizonte-Ansicht", detail: "Portfolio view across innovation horizons", detailDe: "Portfolio-Ansicht über Innovationshorizonte" },
      { en: "Process Overview Diagram", de: "Prozessübersicht-Diagramm", detail: "Visual 7-phase stage-gate process (G1–G5) with status indicators", detailDe: "Visueller 7-Phasen-Stage-Gate-Prozess (G1–G5) mit Statusanzeigen" },
      { en: "Portfolio Executive Summary (IDA)", de: "Portfolio-Executive-Summary (IDA)", detail: "AI-generated summary across all ideas, regenerated on every dashboard visit", detailDe: "KI-generierte Zusammenfassung über alle Ideen, bei jedem Dashboard-Besuch neu erzeugt" },
      { en: "Strategic Frameworks Tab", de: "Strategische-Frameworks-Tab", detail: "Ansoff, McKinsey/GE, BCG and Three Horizons in one secondary dashboard tab", detailDe: "Ansoff, McKinsey/GE, BCG und Drei Horizonte in einem sekundären Dashboard-Tab" },
      { en: "Score × Market Potential Scatter", de: "Score-×-Marktpotenzial-Scatter", detail: "Scatter plot positioning every idea by score and SOM potential", detailDe: "Streudiagramm, das jede Idee nach Score und SOM-Potenzial positioniert" },
      { en: "Idea Table with Financial Metrics", de: "Ideen-Tabelle mit Finanzkennzahlen", detail: "Columns for Stage, Industry, Owner, Scoring, Scan Pack progress, TAM, SAM, SOM, Growth Rate, Payback", detailDe: "Spalten für Phase, Branche, Owner, Scoring, Scan-Pack-Fortschritt, TAM, SAM, SOM, Wachstumsrate, Amortisationszeit" },

    ],
  },
  {
    titleEn: "Idea Management",
    titleDe: "Ideen-Management",
    icon: <Lightbulb className="h-5 w-5" />,
    features: [
      { en: "Create New Ideas", de: "Neue Ideen anlegen", detail: "Dialog with fields for title, description, industry, geography, technology, owner", detailDe: "Dialog mit Feldern für Titel, Beschreibung, Branche, Geografie, Technologie, Owner" },
      { en: "Idea Detail View", de: "Ideen-Detailansicht", detail: "Comprehensive view with tabs for all phases", detailDe: "Umfassende Ansicht mit Tabs für alle Phasen" },
      { en: "Stage Timeline", de: "Phasen-Timeline", detail: "Visual progress tracker through the stage-gate process", detailDe: "Visueller Fortschritts-Tracker durch den Stage-Gate-Prozess" },
      { en: "Editable Sections", de: "Bearbeitbare Sektionen", detail: "Inline editing for all idea fields", detailDe: "Inline-Bearbeitung aller Ideen-Felder" },
      { en: "Phase-based Sidebar Navigation", de: "Phasenbasierte Sidebar-Navigation", detail: "Sidebar grouped into the 7 phases with gate entries in between", detailDe: "Sidebar gruppiert in die 7 Phasen mit Gate-Einträgen dazwischen" },
      { en: "Delete Confirmation Everywhere", de: "Löschbestätigung überall", detail: "Every delete action asks for confirmation before removing data", detailDe: "Jede Löschaktion fragt vor dem Entfernen von Daten nach Bestätigung" },
    ],
  },
  {
    titleEn: "Market Intelligence & Scan Packs",
    titleDe: "Market Intelligence & Scan Packs",
    icon: <Search className="h-5 w-5" />,
    features: [
      { en: "Hypothesis Builder", de: "Hypothesen-Builder", detail: "Structured problem/solution/customer hypothesis with IDA-assisted drafting", detailDe: "Strukturierte Problem-/Lösungs-/Kundenhypothese mit IDA-Unterstützung" },
      { en: "Scan Pack with 6 Scans", de: "Scan Pack mit 6 Scans", detail: "Industry, Customer, Buying Center, Competitor, Market Potential and supporting scans with status tracking", detailDe: "Industrie-, Kunden-, Buying-Center-, Wettbewerbs-, Marktpotenzial- und unterstützende Scans mit Statusverfolgung" },
      { en: "Scan Dependency Logic", de: "Scan-Abhängigkeitslogik", detail: "Warns when a scan is started before its prerequisite scans are complete", detailDe: "Warnt, wenn ein Scan vor Abschluss seiner Vorgänger-Scans gestartet wird" },
      { en: "Scan Outcome Parsing", de: "Scan-Ergebnis-Parsing", detail: "Excel/CSV uploads are parsed into structured industry, customer, competitor and market potential outcomes", detailDe: "Excel-/CSV-Uploads werden in strukturierte Industrie-, Kunden-, Wettbewerbs- und Marktpotenzial-Ergebnisse geparst" },
      { en: "MCP Server Integration", de: "MCP-Server-Integration", detail: "External AI agents can read intake data and post scan results back into NOVI", detailDe: "Externe KI-Agenten können Intake-Daten lesen und Scan-Ergebnisse zurückschreiben" },
    ],
  },

  {
    titleEn: "Idea Scoring (22 Criteria)",
    titleDe: "Ideen-Scoring (22 Kriterien)",
    icon: <Target className="h-5 w-5" />,
    features: [
      { en: "Guided Scoring Wizard", de: "Geführter Scoring-Wizard", detail: "Step-by-step questionnaire with 22 weighted criteria across 5 categories", detailDe: "Schritt-für-Schritt-Fragebogen mit 22 gewichteten Kriterien in 5 Kategorien" },
      { en: "Mandatory Comments & Sources", de: "Pflicht-Kommentare & Quellen", detail: "Qualitative justification required for every score", detailDe: "Qualitative Begründung für jeden Score erforderlich" },
      { en: "Spider Diagram Visualization", de: "Spinnennetz-Diagramm", detail: "Visual category overview with averages", detailDe: "Visuelle Kategorieübersicht mit Durchschnittswerten" },
      { en: "Weighted Score Calculation", de: "Gewichtete Score-Berechnung", detail: "Configurable weights per category", detailDe: "Konfigurierbare Gewichte pro Kategorie" },
    ],
  },
  {
    titleEn: "Business Plan & Detailed Scoring",
    titleDe: "Business Plan & Detailbewertung",
    icon: <FileText className="h-5 w-5" />,
    features: [
      { en: "Market Attractiveness Analysis", de: "Marktattraktivitäts-Analyse", detail: "TAM/SAM/SOM with embedded calculation models", detailDe: "TAM/SAM/SOM mit eingebetteten Berechnungsmodellen" },
      { en: "Strategic Fit Assessment", de: "Strategische-Fit-Bewertung" },
      { en: "Technical Feasibility Review", de: "Technische Machbarkeitsprüfung" },
      { en: "Commercial Viability Scoring", de: "Kommerzielle Tragfähigkeitsbewertung" },
      { en: "Risk Assessment", de: "Risikobewertung" },
      { en: "Competitor & Customer Landscape", de: "Wettbewerbs- & Kundenlandschaft" },
      { en: "Portfolio Fit & Organisational Readiness", de: "Portfolio-Fit & Organisatorische Bereitschaft" },
      { en: "Combined TAM/SAM/SOM Overview", de: "TAM/SAM/SOM-Gesamtübersicht", detail: "Always-visible header comparison of all three market levels", detailDe: "Immer sichtbarer Kopfvergleich aller drei Marktebenen" },
      { en: "IDA Estimations for TAM, SAM, SOM", de: "IDA-Schätzungen für TAM, SAM, SOM", detail: "Three-scenario estimates (conservative/base/optimistic) with assumptions", detailDe: "Drei-Szenarien-Schätzungen (konservativ/basis/optimistisch) mit Annahmen" },
      { en: "Customers Found (under SOM)", de: "Gefundene Kunden (unter SOM)", detail: "Concrete customer list derived from the customer scan", detailDe: "Konkrete Kundenliste aus dem Customer Scan" },
    ],
  },
  {
    titleEn: "Market Verification (Phase 4)",
    titleDe: "Marktverifizierung (Phase 4)",
    icon: <ClipboardCheck className="h-5 w-5" />,
    features: [
      { en: "Dedicated Market Verification Page", de: "Eigene Marktverifizierungs-Seite", detail: "Separate section with four tabs, independent from the TAM/SAM/SOM analysis", detailDe: "Eigener Bereich mit vier Tabs, unabhängig von der TAM/SAM/SOM-Analyse" },
      { en: "Customer Interviews", de: "Kundeninterviews", detail: "Interview log with insights, quotes and recommendations", detailDe: "Interview-Protokoll mit Erkenntnissen, Zitaten und Empfehlungen" },
      { en: "Affiliate Interviews", de: "Affiliate-Interviews", detail: "Internal affiliate perspective on the opportunity", detailDe: "Interne Affiliate-Perspektive auf die Opportunity" },
      { en: "BU Interviews", de: "BU-Interviews", detail: "Business unit stakeholder validation", detailDe: "Validierung durch Business-Unit-Stakeholder" },
      { en: "Pilot & Leads", de: "Pilot & Leads", detail: "Target pilot customers and lead pipeline for verification", detailDe: "Ziel-Pilotkunden und Lead-Pipeline zur Verifizierung" },
    ],
  },
  {
    titleEn: "Business Case & Investment",
    titleDe: "Business Case & Investment",
    icon: <TrendingUp className="h-5 w-5" />,
    features: [
      { en: "Investment Case Builder", de: "Investment-Case-Builder", detail: "Financial projections and ROI calculations", detailDe: "Finanzprognosen und ROI-Berechnungen" },
      { en: "Business Case Section", de: "Business-Case-Sektion", detail: "Comprehensive case documentation", detailDe: "Umfassende Case-Dokumentation" },
      { en: "Payback Period Tracking", de: "Amortisationszeit-Tracking" },
    ],
  },
  {
    titleEn: "Go-to-Market & Implementation",
    titleDe: "Go-to-Market & Umsetzung",
    icon: <Layers className="h-5 w-5" />,
    features: [
      { en: "GTM Plan Builder", de: "GTM-Plan-Builder", detail: "Lead generation and pilot customer GTM sections", detailDe: "Leadgenerierung und Pilotkunden-GTM-Sektionen" },
      { en: "Implementation & Review Tracking", de: "Umsetzungs- & Review-Tracking", detail: "Action items checklist, progress notes, lessons learned", detailDe: "Aktionspunkte-Checkliste, Fortschrittsnotizen, Lessons Learned" },
      { en: "Strategic Analyses", de: "Strategische Analysen" },
    ],
  },
  {
    titleEn: "AI Agents",
    titleDe: "KI-Agenten",
    icon: <Bot className="h-5 w-5" />,
    features: [
      { en: "IDA – AI Assessment Agent", de: "IDA – KI-Bewertungsagent", detail: "Automatic strengths/weaknesses analysis with overall rating and next steps", detailDe: "Automatische Stärken-/Schwächenanalyse mit Gesamtbewertung und nächsten Schritten" },
      { en: "Mark – Research Agent", de: "Mark – Recherche-Agent", detail: "Interactive chat agent for market research and analysis", detailDe: "Interaktiver Chat-Agent für Marktrecherche und Analyse" },
      { en: "Business Case AI Assessment", de: "Business-Case-KI-Bewertung" },
      { en: "Dashboard AI Recommendations", de: "Dashboard-KI-Empfehlungen", detail: "IDA's recommendations visible directly in the idea table", detailDe: "IDAs Empfehlungen direkt in der Idee-Tabelle sichtbar" },
    ],
  },
  {
    titleEn: "Stage-Gate Process",
    titleDe: "Stage-Gate-Prozess",
    icon: <Shield className="h-5 w-5" />,
    features: [
      { en: "5 Decision Gates (G1–G5)", de: "5 Entscheidungs-Gates (G1–G5)", detail: "G1 after Idea Scoring, G2 after Market Intelligence, G3 after TAM SAM SOM, G4 after Market Verification, G5 after Business Case", detailDe: "G1 nach Ideen-Scoring, G2 nach Market Intelligence, G3 nach TAM SAM SOM, G4 nach Marktverifizierung, G5 nach Business Case" },
      { en: "7 Phases", de: "7 Phasen", detail: "Idea & Scoring, Market Intelligence, TAM SAM SOM, Market Verification, Business Case, Implementation & GTM, Implementation & Review", detailDe: "Idee & Scoring, Market Intelligence, TAM SAM SOM, Marktverifizierung, Business Case, Umsetzung & GTM, Umsetzung & Review" },
      { en: "Gate Reversion Support", de: "Gate-Rücknahme-Unterstützung" },
      { en: "Stage Badges & Timeline", de: "Phasen-Badges & Timeline" },
    ],
  },
  {
    titleEn: "Search, Filter & Export",
    titleDe: "Suche, Filter & Export",
    icon: <Search className="h-5 w-5" />,
    features: [
      { en: "Full-Text Search", de: "Volltextsuche" },
      { en: "Multi-Filter (Stage, Industry, Geography, Technology, Owner)", de: "Multi-Filter (Phase, Branche, Geografie, Technologie, Owner)" },
      { en: "PDF Export", de: "PDF-Export", detail: "Questionnaire and idea data export", detailDe: "Fragebogen- und Ideen-Datenexport" },
      { en: "File Attachments", de: "Dateianhänge", detail: "Upload, download, comment on files per idea", detailDe: "Dateien pro Idee hochladen, herunterladen, kommentieren" },
    ],
  },
  {
    titleEn: "Internationalization & UX",
    titleDe: "Internationalisierung & UX",
    icon: <Globe className="h-5 w-5" />,
    features: [
      { en: "Bilingual Support (EN/DE)", de: "Zweisprachig (EN/DE)", detail: "Full translation of all labels, tooltips, and content", detailDe: "Vollständige Übersetzung aller Labels, Tooltips und Inhalte" },
      { en: "Responsive Design (Mobile & Desktop)", de: "Responsive Design (Mobil & Desktop)" },
      { en: "Dark/Light Theme Ready", de: "Dark/Light-Theme-fähig" },
      { en: "Skeleton Loading States", de: "Skeleton-Ladezustände" },
      { en: "Error Boundary", de: "Fehlerbehandlung" },
    ],
  },
  {
    titleEn: "Documentation",
    titleDe: "Dokumentation",
    icon: <BookOpen className="h-5 w-5" />,
    features: [
      { en: "Tool Guide (9-Step Lifecycle)", de: "Tool-Guide (9-Schritte-Lebenszyklus)", detail: "Complete documentation of the stage-gate process, scoring formula, AI agents, and FAQ", detailDe: "Komplette Dokumentation des Stage-Gate-Prozesses, Scoring-Formel, KI-Agenten und FAQ" },
    ],
  },
];

export default function FeatureOverview() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const isDE = language === "de";

  const totalFeatures = FEATURE_GROUPS.reduce((sum, g) => sum + g.features.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={noviLogo} alt="NOVI" className="h-12 shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-card-foreground">
                {isDE ? "Feature-Übersicht" : "Feature Overview"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isDE
                  ? `${FEATURE_GROUPS.length} Kategorien · ${totalFeatures} Features`
                  : `${FEATURE_GROUPS.length} Categories · ${totalFeatures} Features`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: isDE ? "Kategorien" : "Categories", value: FEATURE_GROUPS.length },
            { label: isDE ? "Features" : "Features", value: totalFeatures },
            { label: isDE ? "KI-Agenten" : "AI Agents", value: 2 },
            { label: isDE ? "Sprachen" : "Languages", value: 2 },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Feature groups */}
        {FEATURE_GROUPS.map((group, gi) => (
          <div key={gi} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b border-border">
              <div className="text-primary">{group.icon}</div>
              <h2 className="text-sm font-bold text-card-foreground">
                {isDE ? group.titleDe : group.titleEn}
              </h2>
              <span className="ml-auto text-xs text-muted-foreground font-medium">
                {group.features.length} {isDE ? "Features" : "features"}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {group.features.map((f, fi) => (
                <li key={fi} className="px-5 py-3 flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-card-foreground">
                      {isDE ? f.de : f.en}
                    </span>
                    {(isDE ? f.detailDe : f.detail) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isDE ? f.detailDe : f.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}
