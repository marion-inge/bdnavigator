import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, LayoutDashboard, BarChart2, Globe, Target, TrendingUp, Briefcase, RefreshCw, GitMerge, LineChart, Paperclip, DollarSign, ArrowRightLeft, Rocket, Search } from "lucide-react";
import idaRobot from "@/assets/ida-robot.png";
import markRobot from "@/assets/mark-robot.png";
import { NoviValueFlow } from "@/components/NoviValueFlow";

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
              "Each idea progresses through 7 phases with 5 gate decisions. Gate reviews ensure only the most promising ideas advance. The process is flexible — stages can be revisited as new information emerges.",
              "Jede Idee durchläuft 7 Phasen mit 5 Gate-Entscheidungen. Gate-Reviews stellen sicher, dass nur die vielversprechendsten Ideen weiterkommen. Der Prozess ist flexibel — Phasen können bei neuen Erkenntnissen erneut besucht werden."
            )}
          </p>
          <NoviValueFlow bp={bp} />
        </section>

        {/* Tool Sections */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("Tool Sections", "Tool-Bereiche")}</h2>
          <div className="grid gap-4 md:grid-cols-2">

            <FeatureCard
              icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
              title={bp("Overview", "Übersicht")}
              description={bp(
                "The portfolio table separates General Information, Idea Scoring, Scan Pack, TAM/SAM/SOM and Business Case into color-coded column groups. It shows the idea bringer and an IDA status summary for each idea. Scroll sideways to reach all columns on smaller screens.",
                "Die Portfolio-Tabelle trennt Allgemeine Informationen, Ideen-Scoring, Scan Pack, TAM/SAM/SOM und Business Case in farblich markierte Spaltengruppen. Sie zeigt den Ideengeber und eine IDA-Statuszusammenfassung je Idee. Auf kleineren Bildschirmen erreichen Sie alle Spalten durch seitliches Scrollen."
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
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              title={bp("Hypothesis", "Hypothese")}
              description={bp(
                "Phase 2 starts with a structured hypothesis: problem, target customer, solution, value proposition and the assumptions that must hold true. IDA can draft a first version from the idea data, which you then sharpen. The hypothesis defines what the scans have to prove or disprove.",
                "Phase 2 beginnt mit einer strukturierten Hypothese: Problem, Zielkunde, Lösung, Nutzenversprechen und die Annahmen, die zutreffen müssen. IDA kann aus den Ideendaten einen ersten Entwurf erstellen, den Sie anschließend schärfen. Die Hypothese definiert, was die Scans belegen oder widerlegen müssen."
              )}
            />

            <FeatureCard
              icon={<Search className="h-5 w-5 text-primary" />}
              title={bp("Scan Pack & Scan Outcomes", "Scan Pack & Scan-Ergebnisse")}
              description={bp(
                "The Scan Pack bundles the AI-assisted market research: Industry, Customer, Buying Center, Competitor and Market Potential scans. Scans build on each other — the Industry Scan feeds the Customer Scan, the Customer Scan feeds the Buying Center Scan, and Industry, Customer and Competitor scans are prerequisites for the Market Potential Scan. The tool warns when a scan is started too early. Uploaded result files are parsed into structured Scan Outcome pages that feed TAM/SAM/SOM.",
                "Das Scan Pack bündelt die KI-gestützte Marktrecherche: Industrie-, Kunden-, Buying-Center-, Wettbewerbs- und Marktpotenzial-Scan. Die Scans bauen aufeinander auf — der Industrie-Scan speist den Kunden-Scan, der Kunden-Scan das Buying Center, und Industrie-, Kunden- und Wettbewerbs-Scan sind Voraussetzung für den Marktpotenzial-Scan. Das Tool warnt, wenn ein Scan zu früh gestartet wird. Hochgeladene Ergebnisdateien werden in strukturierte Scan-Ergebnisseiten geparst, die in TAM/SAM/SOM einfließen."
              )}
            />

            <FeatureCard
              icon={<Globe className="h-5 w-5 text-primary" />}
              title={bp("Business Plan — TAM Overview", "Business Plan — TAM-Übersicht")}
              description={bp(
                "TAM has its own overview with 5-year projections, CAGR, geography, scope, assumptions, drivers and methodology. Market Research, PESTEL, Value Chain, Porter's Five Forces and SWOT open as separate subpages. 'Fill TAM with IDA' derives reviewable field proposals from selected attachments and Scan Pack results.",
                "TAM besitzt eine eigene Übersicht mit 5-Jahres-Projektionen, CAGR, Geografie, Scope, Annahmen, Treibern und Methodik. Marktforschung, PESTEL, Wertschöpfungskette, Porter's Five Forces und SWOT öffnen als eigene Unterseiten. „TAM mit IDA ausfüllen“ leitet prüfbare Feldvorschläge aus ausgewählten Anhängen und Scan-Pack-Ergebnissen ab."
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
              title={bp("TAM/SAM/SOM — Separate Overviews", "TAM/SAM/SOM — Separate Übersichten")}
              description={bp(
                "Clicking TAM, SAM or SOM opens that market level's own overview. Selecting Market Research, PESTEL, Value Chain, Porter's or SWOT opens only the chosen subpage rather than a long combined page.",
                "Ein Klick auf TAM, SAM oder SOM öffnet die jeweilige eigene Übersicht. Die Auswahl von Marktforschung, PESTEL, Wertschöpfungskette, Porter's oder SWOT öffnet ausschließlich die gewählte Unterseite statt einer langen Gesamtseite."
              )}
            />

            <FeatureCard
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              title={bp("Market Verification (Phase 4)", "Marktverifizierung (Phase 4)")}
              description={bp(
                "A separate section with Customer, Affiliate and BU Interviews plus Pilot & Leads. IDA compares this evidence with the current SAM/SOM model, explains recommended adjustments as current versus proposed values, and lets you apply selected changes before deciding G4.",
                "Ein eigener Bereich mit Kunden-, Affiliate- und BU-Interviews sowie Pilot & Leads. IDA vergleicht diese Evidenz mit dem aktuellen SAM-/SOM-Modell, erläutert empfohlene Anpassungen als aktuelle und vorgeschlagene Werte und lässt ausgewählte Änderungen vor der G4-Entscheidung übernehmen."
              )}
            />


            <FeatureCard
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              title={bp("Business Case (Investment Calculation)", "Business Case (Investitionsrechnung)")}
              description={bp(
                "Financial modeling with an 11-year horizon. Three tabs cover parameters, yearly investment/R&D/revenue/cost data, and results including NPV, ROCE, payback and cumulative cash flow. Use 'Import from TAM SAM SOM' to transfer the latest market assumptions deliberately.",
                "Finanzmodellierung mit 11-Jahres-Horizont. Drei Tabs enthalten Parameter, jährliche Investitions-/F&E-/Umsatz-/Kostendaten sowie Ergebnisse mit NPV, ROCE, Amortisation und kumuliertem Cashflow. Mit „Aus TAM SAM SOM übernehmen“ übertragen Sie bewusst die neuesten Marktannahmen."
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
              title={bp("Stage Gates (G1–G5)", "Stage Gates (G1–G5)")}
              description={bp(
                "Five gate decisions control progression: G1 (after Idea Scoring), G2 (after Market Intelligence), G3 (after TAM SAM SOM), G4 (after Market Verification), G5 (after Business Case). Each gate documents Go/No-Go/Hold with rationale, date, and conditions. Gates can be edited or reverted.",
                "Fünf Gate-Entscheidungen steuern den Fortschritt: G1 (nach Ideen-Scoring), G2 (nach Market Intelligence), G3 (nach TAM SAM SOM), G4 (nach Marktverifizierung), G5 (nach Business Case). Jedes Gate dokumentiert Go/No-Go/Hold mit Begründung, Datum und Bedingungen. Gates können bearbeitet oder rückgängig gemacht werden."
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

            <FeatureCard
              icon={<Paperclip className="h-5 w-5 text-primary" />}
              title={bp("Download / Report Export", "Download / Report-Export")}
              description={bp(
                "There is one single download for an idea. It produces a complete PDF report containing the idea data, scoring, business plan with TAM, SAM, SOM and all supporting models (PESTEL, Porter, SWOT, Portfolio Fit, Org Readiness, Three Circles and more), all charts, market verification data, and the full business case.",
                "Es gibt genau einen Download pro Idee. Er erzeugt einen vollständigen PDF-Report mit Ideendaten, Scoring, Business Plan inkl. TAM, SAM, SOM und allen unterstützenden Modellen (PESTEL, Porter, SWOT, Portfolio Fit, Org Readiness, Drei-Kreise-Modell u.a.), allen Charts, Marktverifizierungsdaten und dem gesamten Business Case."
              )}
            />

            <FeatureCard
              icon={<RefreshCw className="h-5 w-5 text-primary" />}
              title={bp("Delete Confirmation", "Löschbestätigung")}
              description={bp(
                "Every delete action in the tool asks for confirmation first, so entries, interviews, gate records and attachments cannot be removed accidentally.",
                "Jede Löschaktion im Tool fragt zuerst nach einer Bestätigung, damit Einträge, Interviews, Gate-Protokolle und Anhänge nicht versehentlich entfernt werden."
              )}
            />
          </div>
        </section>


        {/* AI Agents */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{bp("AI Agents", "KI-Agenten")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bp(
              "IDA supports analysis, evidence transfer and decision preparation throughout the workflow. Mark research capabilities are documented separately as planned functionality.",
              "IDA unterstützt Analyse, Evidenzübernahme und Entscheidungsvorbereitung im gesamten Ablauf. Mark-Recherchefunktionen sind separat als geplante Funktionalität dokumentiert."
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
                    "IDA assesses scoring and financials, creates status summaries for one or all ideas, reads selected attachments and Scan Pack outcomes to fill TAM/SAM/SOM, and recommends market-model adjustments after verification. Every proposed field remains reviewable before it is applied.",
                    "IDA bewertet Scoring und Finanzdaten, erstellt Statuszusammenfassungen für einzelne oder alle Ideen, liest ausgewählte Anhänge und Scan-Pack-Ergebnisse zur Befüllung von TAM/SAM/SOM und empfiehlt nach der Verifizierung Anpassungen am Marktmodell. Jeder Feldvorschlag bleibt vor der Übernahme prüfbar."
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
                    "Mark is the planned external research agent. His future prompts are documented in the Prompt Library, but Mark is not currently an active control in TAM/SAM/SOM.",
                    "Mark ist der geplante Agent für externe Recherche. Seine künftigen Prompts sind in der Prompt-Bibliothek dokumentiert; in TAM/SAM/SOM ist Mark derzeit kein aktives Bedienelement."
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
                  "The Business Case action 'Import from TAM SAM SOM' connects the market model with the investment calculation. It transfers:",
                  "Die Business-Case-Aktion „Aus TAM SAM SOM übernehmen“ verbindet das Marktmodell mit der Investitionsrechnung. Sie überträgt:"
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
                  "Run the import again after verification changes the market model. The explicit action avoids silent overwrites and keeps TAM/SAM/SOM as the source of truth.",
                  "Führen Sie die Übernahme erneut aus, wenn die Verifizierung das Marktmodell verändert. Die explizite Aktion vermeidet stilles Überschreiben und belässt TAM/SAM/SOM als führende Datenquelle."
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
                <li>{bp("Separate TAM, SAM and SOM overview charts and tables", "Separate TAM-, SAM- und SOM-Übersichtsdiagramme und -tabellen")}</li>
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
              title={bp("Idea Table", "Ideen-Tabelle")}
              description={bp(
                "Horizontally scrollable table with color-coded groups for general information, scoring, Scan Pack progress, TAM/SAM/SOM and Business Case. It includes the idea bringer, investment, NPV, ROI and payback plus an IDA status summary with Go, Hold or Stop.",
                "Seitlich scrollbare Tabelle mit farblich getrennten Bereichen für allgemeine Informationen, Scoring, Scan-Pack-Fortschritt, TAM/SAM/SOM und Business Case. Sie enthält Ideengeber, Investition, NPV, ROI und Amortisation sowie eine IDA-Statuszusammenfassung mit Go, Hold oder Stop."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">🧭</span>}
              title={bp("Strategic Frameworks Tab", "Strategische-Frameworks-Tab")}
              description={bp(
                "A secondary dashboard tab collecting the portfolio frameworks: Ansoff Matrix, McKinsey/GE Matrix, BCG Matrix and Three Horizons — plus a Score × Market Potential scatter plot.",
                "Ein sekundärer Dashboard-Tab mit den Portfolio-Frameworks: Ansoff-Matrix, McKinsey/GE-Matrix, BCG-Matrix und Drei Horizonte — plus ein Score-×-Marktpotenzial-Streudiagramm."
              )}
            />
            <FeatureCard
              icon={<span className="text-lg">🤖</span>}
              title={bp("Portfolio Executive Summary", "Portfolio-Executive-Summary")}
              description={bp(
                "IDA analyses all ideas in the portfolio and writes an executive summary directly on the dashboard. It is regenerated every time the page is opened, so it always reflects the current data.",
                "IDA analysiert alle Ideen im Portfolio und schreibt eine Executive Summary direkt auf das Dashboard. Sie wird bei jedem Öffnen der Seite neu erzeugt und spiegelt damit immer den aktuellen Datenstand."
              )}
            />
          </div>
        </section>


      </main>
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
