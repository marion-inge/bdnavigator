import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, LayoutDashboard, BarChart2, Globe, Target, TrendingUp, Briefcase, RefreshCw, GitMerge, LineChart, Paperclip } from "lucide-react";
import idaRobot from "@/assets/ida-robot.png";
import markRobot from "@/assets/mark-robot.png";

export default function ProcessGuide() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-card-foreground">{bp("Tool Guide", "Tool-Leitfaden")}</h1>
            </div>
          </div>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-8 space-y-10">

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">{bp("What is the BD Navigator?", "Was ist der BD Navigator?")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bp(
              "The BD Navigator is a structured tool for evaluating, developing, and tracking new business ideas from initial concept through to market implementation. It guides teams through a Stage Gate process with integrated scoring, market analysis, and AI-powered insights.",
              "Der BD Navigator ist ein strukturiertes Tool zur Bewertung, Entwicklung und Nachverfolgung neuer Geschäftsideen – vom ersten Konzept bis zur Markteinführung. Er führt Teams durch einen Stage-Gate-Prozess mit integriertem Scoring, Marktanalyse und KI-gestützten Einblicken."
            )}
          </p>
        </section>

        {/* Stage Gate Process */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Stage Gate Process", "Stage-Gate-Prozess")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bp(
              "Each idea progresses through defined stages. Gate reviews ensure only the most promising ideas advance. The process is flexible — stages can be revisited as new information emerges.",
              "Jede Idee durchläuft definierte Phasen. Gate-Reviews stellen sicher, dass nur die vielversprechendsten Ideen weiterkommen. Der Prozess ist flexibel — Phasen können bei neuen Erkenntnissen erneut besucht werden."
            )}
          </p>
          <StageFlowDiagram bp={bp} />
        </section>

        {/* Tool Sections */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Tool Sections", "Tool-Bereiche")}</h2>
          <div className="grid gap-4 md:grid-cols-2">

            <FeatureCard
              icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
              title={bp("Overview", "Übersicht")}
              description={bp(
                "The idea overview shows all key metadata at a glance: title, problem description, solution idea, industry, geography, technology, initiator, and BD team owner. It also displays the current stage, scoring results, and AI assessment summary.",
                "Die Ideenübersicht zeigt alle wichtigen Metadaten auf einen Blick: Titel, Problembeschreibung, Lösungsidee, Branche, Geografie, Technologie, Initiator und BD-Team-Owner. Außerdem werden aktuelle Phase, Scoring-Ergebnisse und KI-Assessment-Zusammenfassung angezeigt."
              )}
            />

            <FeatureCard
              icon={<BarChart2 className="h-5 w-5 text-primary" />}
              title={bp("Idea Scoring", "Ideen-Scoring")}
              description={bp(
                "A structured questionnaire with 22 questions across 5 categories (Market Attractiveness, Strategic Fit, Feasibility, Commercial Viability, Risk). Each answer is scored 1–5 and weighted to produce an overall idea score. Sources and comments can be added per question.",
                "Ein strukturierter Fragebogen mit 22 Fragen in 5 Kategorien (Marktattraktivität, Strategischer Fit, Machbarkeit, Kommerzielle Tragfähigkeit, Risiko). Jede Antwort wird 1–5 bewertet und gewichtet, um einen Gesamtscore zu errechnen. Quellen und Kommentare können pro Frage hinzugefügt werden."
              )}
            />

            <FeatureCard
              icon={<Globe className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — TAM", "Business Plan — TAM")}
              description={bp(
                "Total Addressable Market analysis. Includes Market Research, PESTEL analysis, Value Chain analysis, Porter's Five Forces, and SWOT. Quantifies the overall market opportunity with market size estimates by region and year.",
                "Gesamtmarktanalyse (Total Addressable Market). Beinhaltet Marktforschung, PESTEL-Analyse, Wertschöpfungskettenanalyse, Porter's Five Forces und SWOT. Quantifiziert die Gesamtmarktchance mit Marktgrößenschätzungen nach Region und Jahr."
              )}
            />

            <FeatureCard
              icon={<Target className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — SAM", "Business Plan — SAM")}
              description={bp(
                "Serviceable Addressable Market. Includes Customer Landscape, Strategic Fit, Portfolio Fit, Feasibility, Org Readiness, Risk assessment, Customer Segmentation, Interviews (Customer, Affiliate, BU), Business Model Canvas, and Lean Canvas.",
                "Bedienbarer Markt (Serviceable Addressable Market). Beinhaltet Kundenlandschaft, Strategischer Fit, Portfolio Fit, Machbarkeit, Org. Readiness, Risikobewertung, Kundensegmentierung, Interviews (Kunden, Affiliate, BU), Business Model Canvas und Lean Canvas."
              )}
            />

            <FeatureCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — SOM", "Business Plan — SOM")}
              description={bp(
                "Serviceable Obtainable Market. Includes Competitor Landscape (with Spider Chart), Pilot Customers & Leads, Value Proposition Canvas, Customer Benefit Analysis, Three Circles Model, Positioning Strategy, and Positioning Landscape.",
                "Erreichbarer Markt (Serviceable Obtainable Market). Beinhaltet Wettbewerbslandschaft (mit Spider-Chart), Pilotkunden & Leads, Value Proposition Canvas, Kundennutzenanalyse, Drei-Kreise-Modell, Positionierungsstrategie und Positionierungslandschaft."
              )}
            />

            <FeatureCard
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              title={bp("Implementation & GTM Plan", "Umsetzungs- & GTM-Plan")}
              description={bp(
                "Go-to-Market strategy planning with target segments, channels, pricing, key partners, and KPIs. Includes pilot customer management, lead generation tracking, business case financials, and commercial viability assessment.",
                "Go-to-Market-Strategieplanung mit Zielsegmenten, Kanälen, Preisgestaltung, Schlüsselpartnern und KPIs. Beinhaltet Pilotkunden-Management, Lead-Generierungs-Tracking, Business-Case-Finanzen und kommerzielle Tragfähigkeitsbewertung."
              )}
            />

            <FeatureCard
              icon={<RefreshCw className="h-5 w-5 text-primary" />}
              title={bp("Implement & Review", "Umsetzung & Review")}
              description={bp(
                "Track implementation progress with status updates, progress notes, lessons learned, next steps, and a customizable checklist. Monitor the transition from planning to execution.",
                "Verfolgen Sie den Umsetzungsfortschritt mit Statusupdates, Fortschrittsnotizen, Lessons Learned, nächsten Schritten und einer anpassbaren Checkliste. Überwachen Sie den Übergang von Planung zu Umsetzung."
              )}
            />

            <FeatureCard
              icon={<GitMerge className="h-5 w-5 text-primary" />}
              title={bp("Stage Gates", "Stage Gates")}
              description={bp(
                "Gate decisions document Go/No-Go/Hold decisions with rationale, date, and conditions. Gates control progression between stages and can be edited or reverted.",
                "Gate-Entscheidungen dokumentieren Go/No-Go/Hold-Entscheidungen mit Begründung, Datum und Bedingungen. Gates steuern den Fortschritt zwischen Phasen und können bearbeitet oder rückgängig gemacht werden."
              )}
            />

            <FeatureCard
              icon={<LineChart className="h-5 w-5 text-primary" />}
              title={bp("Strategic Analyses", "Strategische Analysen")}
              description={bp(
                "Portfolio-level strategic tools: Ansoff Matrix (growth strategies), BCG Matrix (market share vs. growth), McKinsey/GE Matrix (industry attractiveness vs. competitive strength), and Three Horizons Model (innovation pipeline).",
                "Strategische Portfolio-Tools: Ansoff-Matrix (Wachstumsstrategien), BCG-Matrix (Marktanteil vs. Wachstum), McKinsey/GE-Matrix (Branchenattraktivität vs. Wettbewerbsstärke) und Drei-Horizonte-Modell (Innovationspipeline)."
              )}
            />

            <FeatureCard
              icon={<Paperclip className="h-5 w-5 text-primary" />}
              title={bp("File Attachments", "Dateianhänge")}
              description={bp(
                "Upload and manage documents related to each idea. Add comments to files for context. Supports all common file formats.",
                "Laden Sie Dokumente zu jeder Idee hoch und verwalten Sie diese. Fügen Sie Kommentare zu Dateien für Kontext hinzu. Unterstützt alle gängigen Dateiformate."
              )}
            />
          </div>
        </section>

        {/* AI Agents */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("AI Agents", "KI-Agenten")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bp(
              "Two AI agents are embedded throughout the tool to support your analysis work:",
              "Zwei KI-Agenten sind im gesamten Tool eingebettet, um Ihre Analysearbeit zu unterstützen:"
            )}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-agent-ida/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-3">
                  <img src={idaRobot} alt="IDA" className="h-10 w-10 rounded-full" />
                  <div>
                    <span className="text-agent-ida font-bold">IDA</span>
                    <span className="text-muted-foreground text-sm ml-2">{bp("Internal Data Analyst", "Interne Datenanalystin")}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {bp(
                    "IDA analyzes the data already entered in the tool. She finds connections between sections, identifies strengths and weaknesses, highlights gaps, gives recommendations, and summarizes your progress. She works exclusively with internal data — nothing external.",
                    "IDA analysiert die bereits im Tool eingegebenen Daten. Sie findet Verbindungen zwischen Bereichen, identifiziert Stärken und Schwächen, zeigt Lücken auf, gibt Empfehlungen und fasst Ihren Fortschritt zusammen. Sie arbeitet ausschließlich mit internen Daten — nichts Externes."
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-agent-mark/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-3">
                  <img src={markRobot} alt="Mark" className="h-10 w-10 rounded-full" />
                  <div>
                    <span className="text-agent-mark font-bold">Mark</span>
                    <span className="text-muted-foreground text-sm ml-2">{bp("Market Researcher", "Marktforscher")}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {bp(
                    "Mark is your market research assistant. He suggests improvements based on market best practices, points out relevant industry trends and benchmarks, and recommends external research directions. Web search integration coming soon.",
                    "Mark ist Ihr Marktforschungsassistent. Er schlägt Verbesserungen basierend auf Markt-Best-Practices vor, weist auf relevante Branchentrends und Benchmarks hin und empfiehlt externe Forschungsrichtungen. Web-Suchintegration kommt bald."
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Idea Scoring Formula */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Idea Scoring Formula", "Ideen-Scoring-Formel")}</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {bp(
                  "The Idea Score is calculated as a weighted average across 5 categories. Risk is inverted (subtracted from 6) so that higher risk lowers the score.",
                  "Der Ideen-Score wird als gewichteter Durchschnitt über 5 Kategorien berechnet. Risiko ist invertiert (wird von 6 subtrahiert), sodass höheres Risiko den Score senkt."
                )}
              </p>
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                Total = (MA×3 + SF×1 + FE×2 + CV×2 + (6−RI)×1) / 9
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                {[
                  { abbr: "MA", name: bp("Market Attractiveness", "Marktattraktivität"), w: 3 },
                  { abbr: "SF", name: bp("Strategic Fit", "Strategischer Fit"), w: 1 },
                  { abbr: "FE", name: bp("Feasibility", "Machbarkeit"), w: 2 },
                  { abbr: "CV", name: bp("Commercial Viability", "Kommerzielle Tragfähigkeit"), w: 2 },
                  { abbr: "RI", name: bp("Risk (inverted)", "Risiko (invertiert)"), w: 1 },
                ].map(({ abbr, name, w }) => (
                  <div key={abbr} className="rounded-md border border-border p-2">
                    <span className="font-bold text-primary">{abbr}</span>
                    <span className="text-muted-foreground ml-1">×{w}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dashboard Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Dashboard Features", "Dashboard-Funktionen")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<span className="text-lg">📊</span>}
              title={bp("Pipeline Funnel", "Pipeline-Trichter")}
              description={bp(
                "Visual funnel showing how many ideas are in each stage of the process.",
                "Visueller Trichter, der zeigt, wie viele Ideen sich in jeder Prozessphase befinden."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">🔍</span>}
              title={bp("Filters & Search", "Filter & Suche")}
              description={bp(
                "Filter ideas by stage, industry, geography, technology, and owner. Full-text search across all fields.",
                "Filtern Sie Ideen nach Phase, Branche, Geografie, Technologie und Owner. Volltextsuche über alle Felder."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">📈</span>}
              title={bp("Strategic Dashboards", "Strategische Dashboards")}
              description={bp(
                "Portfolio-level views with Ansoff Matrix, BCG Matrix, McKinsey Matrix, and Three Horizons Model across all ideas.",
                "Portfolio-Ansichten mit Ansoff-Matrix, BCG-Matrix, McKinsey-Matrix und Drei-Horizonte-Modell über alle Ideen."
              )}
            />
          </div>
        </section>

      </main>
    </div>
  );
}

/* Stage flow visual */
function StageFlowDiagram({ bp }: { bp: (en: string, de: string) => string }) {
  const stages = [
    { label: bp("Idea Entry", "Ideeneingabe"), color: "bg-stage-idea" },
    { label: bp("Idea Scoring", "Ideen-Scoring"), color: "bg-stage-rough-scoring" },
    { label: "Gate 1", color: "bg-stage-gate1" },
    { label: bp("Business Plan", "Business Plan"), color: "bg-stage-detailed-scoring" },
    { label: "Gate 2", color: "bg-stage-gate2" },
    { label: bp("GTM Plan", "GTM-Plan"), color: "bg-stage-business-case" },
    { label: bp("Implement & Review", "Umsetzung & Review"), color: "bg-stage-implement-review" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map(({ label, color }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`${color} text-white text-xs font-medium px-3 py-2 rounded-md whitespace-nowrap`}>
            {label}
          </div>
          {i < stages.length - 1 && <span className="text-muted-foreground text-lg">→</span>}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
