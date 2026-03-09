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
      { en: "Pipeline Funnel Visualization", de: "Pipeline-Trichter-Visualisierung", detail: "Interactive funnel chart showing opportunity distribution across stages", detailDe: "Interaktives Trichterdiagramm zur Verteilung der Opportunities über Phasen" },
      { en: "KPI Dashboard Cards", de: "KPI-Dashboard-Karten", detail: "Total opportunities, top scorer at a glance", detailDe: "Gesamtzahl Opportunities, Top-Scorer auf einen Blick" },
      { en: "Ansoff Matrix Dashboard", de: "Ansoff-Matrix-Dashboard", detail: "Strategic categorization of opportunities by market/product newness", detailDe: "Strategische Einordnung nach Markt-/Produktneuheit" },
      { en: "Three Horizons View", de: "Drei-Horizonte-Ansicht", detail: "Portfolio view across innovation horizons", detailDe: "Portfolio-Ansicht über Innovationshorizonte" },
      { en: "Process Overview Diagram", de: "Prozessübersicht-Diagramm", detail: "Visual 7-stage gate process with status indicators", detailDe: "Visueller 7-Phasen-Gate-Prozess mit Statusanzeigen" },
    ],
  },
  {
    titleEn: "Opportunity Management",
    titleDe: "Opportunity-Management",
    icon: <Lightbulb className="h-5 w-5" />,
    features: [
      { en: "Create New Opportunities", de: "Neue Opportunities anlegen", detail: "Dialog with fields for title, description, industry, geography, technology, owner", detailDe: "Dialog mit Feldern für Titel, Beschreibung, Branche, Geografie, Technologie, Owner" },
      { en: "Opportunity Detail View", de: "Opportunity-Detailansicht", detail: "Comprehensive view with tabs for all phases", detailDe: "Umfassende Ansicht mit Tabs für alle Phasen" },
      { en: "Stage Timeline", de: "Phasen-Timeline", detail: "Visual progress tracker through the stage-gate process", detailDe: "Visueller Fortschritts-Tracker durch den Stage-Gate-Prozess" },
      { en: "Editable Sections", de: "Bearbeitbare Sektionen", detail: "Inline editing for all opportunity fields", detailDe: "Inline-Bearbeitung aller Opportunity-Felder" },
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
      { en: "Pilot Customer Identification", de: "Pilotkunden-Identifikation" },
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
      { en: "Dashboard AI Recommendations", de: "Dashboard-KI-Empfehlungen", detail: "IDA's recommendations visible directly in the opportunity table", detailDe: "IDAs Empfehlungen direkt in der Opportunity-Tabelle sichtbar" },
    ],
  },
  {
    titleEn: "Stage-Gate Process",
    titleDe: "Stage-Gate-Prozess",
    icon: <Shield className="h-5 w-5" />,
    features: [
      { en: "3 Decision Gates (G1, G2, G3)", de: "3 Entscheidungs-Gates (G1, G2, G3)", detail: "Go/No-Go/Pivot decisions with justification and date tracking", detailDe: "Go/No-Go/Pivot-Entscheidungen mit Begründung und Datumsverfolgung" },
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
      { en: "PDF Export", de: "PDF-Export", detail: "Questionnaire and opportunity data export", detailDe: "Fragebogen- und Opportunity-Datenexport" },
      { en: "File Attachments", de: "Dateianhänge", detail: "Upload, download, comment on files per opportunity", detailDe: "Dateien pro Opportunity hochladen, herunterladen, kommentieren" },
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
