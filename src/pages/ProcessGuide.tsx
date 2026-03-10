import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, LayoutDashboard, BarChart2, Globe, Target, TrendingUp, Briefcase, RefreshCw, GitMerge, LineChart, Paperclip, DollarSign, ArrowRightLeft, Rocket, HelpCircle } from "lucide-react";
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
              "The BD Navigator is a structured tool for evaluating, developing, and tracking new business ideas from initial concept through to market implementation. It guides teams through a Stage-Gate process with integrated scoring, market sizing (TAM/SAM/SOM in M€), financial modeling, and AI-powered insights.",
              "Der BD Navigator ist ein strukturiertes Tool zur Bewertung, Entwicklung und Nachverfolgung neuer Geschäftsideen – vom ersten Konzept bis zur Markteinführung. Er führt Teams durch einen Stage-Gate-Prozess mit integriertem Scoring, Marktgrößenbestimmung (TAM/SAM/SOM in M€), Finanzmodellierung und KI-gestützten Einblicken."
            )}
          </p>
        </section>

        {/* Stage Gate Process */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Stage-Gate Process", "Stage-Gate-Prozess")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bp(
              "Each idea progresses through 9 stages with 3 gate decisions. Gate reviews ensure only the most promising ideas advance. The process is flexible — stages can be revisited as new information emerges.",
              "Jede Idee durchläuft 9 Phasen mit 3 Gate-Entscheidungen. Gate-Reviews stellen sicher, dass nur die vielversprechendsten Ideen weiterkommen. Der Prozess ist flexibel — Phasen können bei neuen Erkenntnissen erneut besucht werden."
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
              title={bp("Business Plan — TAM Overview", "Business Plan — TAM-Übersicht")}
              description={bp(
                "Total Addressable Market analysis (all values in M€). 5-year projections with CAGR, geographic breakdown with potential ratings and radar chart, scope definition, market assumptions, market development drivers & trends, and derivation methodology with source assessment. Supporting models: Market Research, PESTEL, Value Chain, Porter's Five Forces, SWOT.",
                "Gesamtmarktanalyse (Total Addressable Market, alle Werte in M€). 5-Jahres-Projektionen mit CAGR, geografische Aufschlüsselung mit Potenzialbewertungen und Radar-Chart, Scope-Definition, Marktannahmen, Marktentwicklungstreiber & Trends und Herleitungsmethodik mit Quellenbewertung. Unterstützende Modelle: Marktforschung, PESTEL, Wertschöpfungskette, Porter's Five Forces, SWOT."
              )}
            />

            <FeatureCard
              icon={<Target className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — SAM Overview", "Business Plan — SAM-Übersicht")}
              description={bp(
                "Serviceable Available Market (in M€). Defines why SAM is smaller than TAM, included/excluded industries, geographic focus & exclusions, target groups, price evolution, resource scenarios, and required investments. Geographic breakdown with regional potential. Supporting analyses: Customer Landscape, Strategic Fit, Portfolio Fit, Feasibility, Org Readiness, Risk, Segmentation, Interviews, BMC, Lean Canvas.",
                "Bedienbarer Markt (Serviceable Available Market, in M€). Definiert warum der SAM kleiner als der TAM ist, ein-/ausgeschlossene Branchen, geografischer Fokus & Ausschlüsse, Zielgruppen, Preisentwicklung, Ressourcenszenarien und benötigte Investitionen. Geografische Aufschlüsselung mit regionalem Potenzial. Unterstützende Analysen: Kundenlandschaft, Strategischer Fit, Portfolio Fit, Machbarkeit, Org. Readiness, Risiko, Segmentierung, Interviews, BMC, Lean Canvas."
              )}
            />

            <FeatureCard
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — SOM Overview", "Business Plan — SOM-Übersicht")}
              description={bp(
                "Serviceable Obtainable Market (in M€). 5-year revenue projections with market share vs SAM calculation, growth rate, visibility rate, sales capacity, pipeline, and license to operate. Includes Market Assumptions for Business Case (Portfolio Coverage %, Visibility %, Visibility Growth %, Hitrate %) which feed into the Investment Calculation via the Data Bridge. Supporting analyses: Competitors, Pilot & Leads, VPC, Customer Benefit, Three Circles, Positioning, Positioning Landscape.",
                "Erreichbarer Markt (Serviceable Obtainable Market, in M€). 5-Jahres-Umsatzprojektionen mit Marktanteilsberechnung vs SAM, Wachstumsrate, Sichtbarkeitsrate, Vertriebskapazität, Pipeline und License to Operate. Enthält Marktannahmen für den Business Case (Portfolioabdeckung %, Sichtbarkeit %, Sichtbarkeitswachstum %, Hitrate %), die über die Datenbrücke in die Investitionsrechnung einfließen. Unterstützende Analysen: Wettbewerber, Pilot & Leads, VPC, Kundennutzen, Drei-Kreise-Modell, Positionierung, Positionierungslandschaft."
              )}
            />

            <FeatureCard
              icon={<ArrowRightLeft className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — Combined Overview", "Business Plan — Gesamtübersicht")}
              description={bp(
                "Unified view of TAM, SAM, and SOM development over 5 years (all in M€). Includes area chart comparison, data table with CAGR, auto-calculated insights (conversion rates, growth ratios), geographic comparison across all three levels, and an interpretation section for strategic conclusions.",
                "Einheitliche Darstellung der TAM-, SAM- und SOM-Entwicklung über 5 Jahre (alle in M€). Enthält Flächendiagramm-Vergleich, Datentabelle mit CAGR, automatisch berechnete Insights (Konversionsraten, Wachstumsverhältnisse), geografischen Vergleich über alle drei Ebenen und einen Interpretationsabschnitt für strategische Schlussfolgerungen."
              )}
            />

            <FeatureCard
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              title={bp("Business Case (Investment Calculation)", "Business Case (Investitionsrechnung)")}
              description={bp(
                "Financial modeling with an 11-year horizon (e.g. 2025–2035). Three tabs: Parameters (unit price, costs, team size, market assumptions from SOM via Data Bridge), Year Data (investment, R&D, revenue, costs per year), and Results (NPV, IRR, payback period, cumulative cash flow chart). The Data Bridge imports SOM projections and market assumptions automatically from the Business Plan.",
                "Finanzmodellierung mit 11-Jahres-Horizont (z.B. 2025–2035). Drei Tabs: Parameter (Stückpreis, Kosten, Teamgröße, Marktannahmen aus SOM via Datenbrücke), Jahresdaten (Investition, F&E, Umsatz, Kosten pro Jahr) und Ergebnisse (NPV, IRR, Amortisationszeit, kumulatives Cashflow-Diagramm). Die Datenbrücke importiert SOM-Projektionen und Marktannahmen automatisch aus dem Business Plan."
              )}
            />

            <FeatureCard
              icon={<Rocket className="h-5 w-5 text-primary" />}
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
              title={bp("Stage Gates (G1, G2, G3)", "Stage Gates (G1, G2, G3)")}
              description={bp(
                "Three gate decisions control progression: G1 (after Idea Scoring → Business Plan), G2 (after Business Plan → Business Case), G3 (after Business Case → Implementation). Each gate documents Go/No-Go/Hold with rationale, date, and conditions. Gates can be edited or reverted.",
                "Drei Gate-Entscheidungen steuern den Fortschritt: G1 (nach Ideen-Scoring → Business Plan), G2 (nach Business Plan → Business Case), G3 (nach Business Case → Umsetzung). Jedes Gate dokumentiert Go/No-Go/Hold mit Begründung, Datum und Bedingungen. Gates können bearbeitet oder rückgängig gemacht werden."
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

        {/* Data Bridge */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Data Bridge", "Datenbrücke")}</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                {bp(
                  "The Data Bridge connects the Business Plan (market modeling) with the Business Case (investment calculation). It automatically transfers:",
                  "Die Datenbrücke verbindet den Business Plan (Marktmodellierung) mit dem Business Case (Investitionsrechnung). Sie überträgt automatisch:"
                )}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{bp("SOM revenue projections (M€) → Year Data revenue fields", "SOM-Umsatzprojektionen (M€) → Jahresdaten-Umsatzfelder")}</li>
                <li>{bp("Portfolio Coverage (%) → Market parameter", "Portfolioabdeckung (%) → Marktparameter")}</li>
                <li>{bp("Visibility (%) → Market parameter", "Sichtbarkeit (%) → Marktparameter")}</li>
                <li>{bp("Visibility Growth (%/yr) → Market parameter", "Sichtbarkeitswachstum (%/J.) → Marktparameter")}</li>
                <li>{bp("Hitrate (%) → Market parameter", "Hitrate (%) → Marktparameter")}</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                {bp(
                  "Market Assumptions are defined in the SOM Overview (Business Plan) and displayed as read-only references in the Business Case. This ensures a single source of truth for market parameters.",
                  "Marktannahmen werden in der SOM-Übersicht (Business Plan) definiert und als Nur-Lese-Referenz im Business Case angezeigt. Dies gewährleistet eine einzige Datenquelle für Marktparameter."
                )}
              </p>
            </CardContent>
          </Card>
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

        {/* Market Sizing Convention */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Market Sizing Convention", "Marktgrößen-Konvention")}</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                {bp(
                  "All market values (TAM, SAM, SOM) are stored and displayed in M€ (millions of euros). This applies to:",
                  "Alle Marktwerte (TAM, SAM, SOM) werden in M€ (Millionen Euro) gespeichert und angezeigt. Dies gilt für:"
                )}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{bp("5-year projections in TAM, SAM, and SOM overviews", "5-Jahres-Projektionen in TAM-, SAM- und SOM-Übersichten")}</li>
                <li>{bp("Combined Overview chart and data table", "Gesamtübersicht-Diagramm und Datentabelle")}</li>
                <li>{bp("Chart tooltips and Y-axis labels", "Chart-Tooltips und Y-Achsen-Beschriftungen")}</li>
                <li>{bp("Geographic regional market sizes", "Geografische regionale Marktgrößen")}</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                {bp(
                  "The Investment Calculation (Business Case) uses an extended 11-year horizon (e.g. 2025–2035) to capture the full financial lifecycle including R&D, ramp-up, and terminal value.",
                  "Die Investitionsrechnung (Business Case) verwendet einen erweiterten 11-Jahres-Horizont (z.B. 2025–2035), um den gesamten Finanzlebenszyklus einschließlich F&E, Hochlauf und Endwert abzubilden."
                )}
              </p>
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
                "Visual funnel showing how many ideas are in each stage of the process. Click a stage to filter the table below.",
                "Visueller Trichter, der zeigt, wie viele Ideen sich in jeder Prozessphase befinden. Klicken Sie auf eine Phase, um die Tabelle zu filtern."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">📈</span>}
              title={bp("Market Potential Chart", "Marktpotenzial-Diagramm")}
              description={bp(
                "Summarizing bar chart showing the aggregated TAM, SAM, and SOM across the entire portfolio over 5 years (in M€/B€).",
                "Zusammenfassendes Balkendiagramm, das das aggregierte TAM, SAM und SOM über das gesamte Portfolio über 5 Jahre anzeigt (in M€/B€)."
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
              icon={<span className="text-lg">🗂️</span>}
              title={bp("KPI Cards & Distribution Charts", "KPI-Karten & Verteilungsdiagramme")}
              description={bp(
                "Quick-glance KPI cards (total ideas, top scorer) plus pie/bar charts showing idea distribution by industry, geography, and technology.",
                "KPI-Karten auf einen Blick (Gesamtzahl Ideen, Top-Scorer) plus Kreis-/Balkendiagramme zur Verteilung nach Branche, Geografie und Technologie."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">📋</span>}
              title={bp("Opportunity Table", "Opportunity-Tabelle")}
              description={bp(
                "Central table with key columns: Stage, Industry, Owner, Rough Scoring, TAM, SAM, SOM, Growth Rate, Payback Period, and IDA AI Assessment summary.",
                "Zentrale Tabelle mit wichtigen Spalten: Phase, Branche, Owner, Rough Scoring, TAM, SAM, SOM, Wachstumsrate, Amortisationszeit und IDA-KI-Assessment-Zusammenfassung."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">🧭</span>}
              title={bp("Strategic Dashboards", "Strategische Dashboards")}
              description={bp(
                "Portfolio-level views with Ansoff Matrix, Three Horizons Model, and strategic analyses across all ideas.",
                "Portfolio-Ansichten mit Ansoff-Matrix, Drei-Horizonte-Modell und strategischen Analysen über alle Ideen."
              )}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            {bp("Frequently Asked Questions", "Häufig gestellte Fragen")}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="revert-gate">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("What happens when I revert a gate decision?", "Was passiert, wenn ich eine Gate-Entscheidung rückgängig mache?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "When you revert to a previous stage, all gate records at or beyond the target stage are automatically deleted to maintain data integrity. For example, reverting from Business Case back to Business Plan will remove the G2 gate decision. Your data in each section (scoring, business plan, etc.) is preserved — only the gate decisions are affected.",
                        "Wenn Sie zu einer früheren Phase zurückkehren, werden alle Gate-Einträge ab der Zielphase automatisch gelöscht, um die Datenintegrität zu gewährleisten. Beispiel: Ein Rückschritt vom Business Case zum Business Plan entfernt die G2-Gate-Entscheidung. Ihre Daten in den einzelnen Bereichen (Scoring, Business Plan etc.) bleiben erhalten — nur die Gate-Entscheidungen sind betroffen."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="skip-stages">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("Can I skip stages?", "Kann ich Stages überspringen?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "No, stages must be completed in order. Each gate decision (G1, G2, G3) is only available when the opportunity is at the corresponding gate stage. However, you can fill in data for later sections at any time — the stage only controls which gate decisions are available.",
                        "Nein, die Phasen müssen in der Reihenfolge durchlaufen werden. Jede Gate-Entscheidung (G1, G2, G3) ist nur verfügbar, wenn sich die Opportunity in der entsprechenden Gate-Phase befindet. Sie können jedoch jederzeit Daten für spätere Bereiche eintragen — die Phase steuert nur, welche Gate-Entscheidungen verfügbar sind."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="edit-gate">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("Can I edit a gate decision after it was made?", "Kann ich eine Gate-Entscheidung nachträglich bearbeiten?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "Yes, past gate decisions can be edited (change decision, decider, or comment) or deleted entirely. Hover over a gate record to see the edit and delete buttons. Deleting a gate record does not automatically change the current stage.",
                        "Ja, vergangene Gate-Entscheidungen können bearbeitet (Entscheidung, Entscheider oder Kommentar ändern) oder komplett gelöscht werden. Fahren Sie mit der Maus über einen Gate-Eintrag, um die Bearbeitungs- und Lösch-Buttons zu sehen. Das Löschen eines Gate-Eintrags ändert nicht automatisch die aktuelle Phase."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-bridge">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("How does data flow from Business Plan to Business Case?", "Wie fließen Daten vom Business Plan zum Business Case?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "The Data Bridge automatically transfers SOM revenue projections and market assumptions (Portfolio Coverage, Visibility, Visibility Growth, Hitrate) from the Business Plan into the Business Case. These values appear as read-only references in the Business Case to ensure consistency. To change them, update the SOM section in the Business Plan.",
                        "Die Datenbrücke überträgt automatisch SOM-Umsatzprojektionen und Marktannahmen (Portfolioabdeckung, Sichtbarkeit, Sichtbarkeitswachstum, Hitrate) vom Business Plan in den Business Case. Diese Werte erscheinen als Nur-Lese-Referenzen im Business Case, um Konsistenz zu gewährleisten. Um sie zu ändern, aktualisieren Sie den SOM-Bereich im Business Plan."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scoring-formula">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("How is the Idea Score calculated?", "Wie wird der Ideen-Score berechnet?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "The score is a weighted average of 5 categories: Market Attractiveness (×3), Strategic Fit (×1), Feasibility (×2), Commercial Viability (×2), and Risk (×1, inverted). Risk is subtracted from 6 so higher risk lowers the score. The formula is: (MA×3 + SF×1 + FE×2 + CV×2 + (6−RI)×1) / 9.",
                        "Der Score ist ein gewichteter Durchschnitt aus 5 Kategorien: Marktattraktivität (×3), Strategischer Fit (×1), Machbarkeit (×2), Kommerzielle Tragfähigkeit (×2) und Risiko (×1, invertiert). Risiko wird von 6 subtrahiert, sodass höheres Risiko den Score senkt. Die Formel lautet: (MA×3 + SF×1 + FE×2 + CV×2 + (6−RI)×1) / 9."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="market-units">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("What units are used for market values?", "Welche Einheiten werden für Marktwerte verwendet?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "All market values (TAM, SAM, SOM) are in M€ (millions of euros). Values above 1,000 M€ are displayed as B€ (billions) in charts. The Business Case uses the same unit system for its 11-year financial projections.",
                        "Alle Marktwerte (TAM, SAM, SOM) sind in M€ (Millionen Euro). Werte über 1.000 M€ werden in Charts als B€ (Milliarden) angezeigt. Der Business Case verwendet dasselbe Einheitensystem für seine 11-Jahres-Finanzprojektionen."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai-agents">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("What is the difference between IDA and Mark?", "Was ist der Unterschied zwischen IDA und Mark?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "IDA (Internal Data Analyst) works exclusively with the data you've entered in the tool — she finds connections, identifies gaps, and gives recommendations based on your inputs. Mark (Market Researcher) focuses on external market context — he suggests improvements based on industry best practices, trends, and benchmarks.",
                        "IDA (Interne Datenanalystin) arbeitet ausschließlich mit den Daten, die Sie im Tool eingegeben haben — sie findet Verbindungen, identifiziert Lücken und gibt Empfehlungen basierend auf Ihren Eingaben. Mark (Marktforscher) konzentriert sich auf externen Marktkontext — er schlägt Verbesserungen basierend auf Branchenstandards, Trends und Benchmarks vor."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="no-go">
                  <AccordionTrigger className="text-sm font-medium">
                    {bp("What happens if a gate decision is 'No-Go'?", "Was passiert bei einer 'No-Go'-Gate-Entscheidung?")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {bp(
                        "A No-Go decision is recorded but does not automatically archive or delete the opportunity. The idea remains accessible and can be revisited. The decision serves as documentation that the idea was evaluated and rejected at that gate, with the rationale preserved for future reference.",
                        "Eine No-Go-Entscheidung wird dokumentiert, archiviert oder löscht die Opportunity aber nicht automatisch. Die Idee bleibt zugänglich und kann erneut besucht werden. Die Entscheidung dient als Dokumentation, dass die Idee an diesem Gate bewertet und abgelehnt wurde, wobei die Begründung für zukünftige Referenz erhalten bleibt."
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
}

/* Stage flow visual — 7-stage process with 3 gates */
function StageFlowDiagram({ bp }: { bp: (en: string, de: string) => string }) {
  const stages = [
    { label: bp("Idea Entry", "Ideeneingabe"), color: "bg-stage-idea" },
    { label: bp("Idea Scoring", "Ideen-Scoring"), color: "bg-stage-rough-scoring" },
    { label: "G1", color: "bg-stage-gate1" },
    { label: bp("Business Plan", "Business Plan"), color: "bg-stage-detailed-scoring" },
    { label: "G2", color: "bg-stage-gate2" },
    { label: bp("Business Case", "Business Case"), color: "bg-stage-business-case" },
    { label: "G3", color: "bg-stage-gate3" },
    { label: bp("Implementation & GTM", "Umsetzung & GTM"), color: "bg-stage-gtm" },
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
