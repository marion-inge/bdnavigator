import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Brain, BarChart3, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
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
    systemPromptSummaryEn: "IDA acts as a senior business innovation analyst. She evaluates the full 22-criteria scoring, reads all user comments per criterion, and combines them with opportunity metadata (industry, geography, technology, solution description) to produce a structured assessment.",
    systemPromptSummaryDe: "IDA agiert als Senior Business Innovation Analystin. Sie wertet das vollständige 22-Kriterien-Scoring aus, liest alle Nutzerkommentare pro Kriterium und kombiniert diese mit den Opportunity-Metadaten (Branche, Geografie, Technologie, Lösungsbeschreibung) zu einer strukturierten Bewertung.",
    inputDataEn: [
      "22 criterion scores (1–5) with confidence levels",
      "User comments per criterion",
      "Opportunity metadata: title, description, solution, industry, geography, technology",
      "Category scores (weighted averages)",
    ],
    inputDataDe: [
      "22 Kriterien-Scores (1–5) mit Konfidenzniveaus",
      "Nutzerkommentare pro Kriterium",
      "Opportunity-Metadaten: Titel, Beschreibung, Lösung, Branche, Geografie, Technologie",
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
    systemPromptSummaryDe: "IDA agiert als Senior Finanzanalystin und Business-Case-Bewerting. Sie analysiert KPIs (ROCE, NPV, Payback, EBIT), prüft die jährlichen Finanzprojektionen und bewertet Annahmen auf Realismus. Sie prüft, ob ROCE die WACC-Hürde übersteigt, ob Margen effizient skalieren und ob das Working Capital gut gemanagt wird.",
    inputDataEn: [
      "KPIs: Total ROCE, NPV, Payback Period, Total EBIT, Total Sales",
      "Parameters: WACC, project duration, depreciation years, market size, growth rate",
      "Year-by-year breakdown: Sales, EBIT, ROCE, Cash Flow, Capital Employed, Working Capital",
      "Total Investment & R&D spend",
      "Opportunity context: title, description, industry, technology",
    ],
    inputDataDe: [
      "KPIs: Gesamt-ROCE, NPV, Amortisationsdauer, Gesamt-EBIT, Gesamtumsatz",
      "Parameter: WACC, Projektdauer, Abschreibungsjahre, Marktgröße, Wachstumsrate",
      "Jahresaufschlüsselung: Umsatz, EBIT, ROCE, Cashflow, Capital Employed, Working Capital",
      "Gesamtinvestition & F&E-Ausgaben",
      "Opportunity-Kontext: Titel, Beschreibung, Branche, Technologie",
    ],
    outputEn: "Financial assessment: Executive Summary (3–4 sentences with KPIs), Strengths (3–5 with numbers), Weaknesses (2–4 with numbers), Next Steps (3–5), Pitfalls (2–3), Overall Rating",
    outputDe: "Finanzbewertung: Executive Summary (3–4 Sätze mit KPIs), Stärken (3–5 mit Zahlen), Schwächen (2–4 mit Zahlen), Nächste Schritte (3–5), Fallstricke (2–3), Gesamtbewertung",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "sam-estimation",
    agent: "ida",
    triggerEn: "In Business Plan → SAM → Overview → Click 'Estimate SAM'",
    triggerDe: "Im Business Plan → SAM → Overview → Klick auf 'SAM schätzen'",
    contextEn: "Business Plan – SAM",
    contextDe: "Business Plan – SAM",
    systemPromptSummaryEn: "IDA estimates the SAM by filtering the TAM through three lenses: geographic accessibility, service segment fit, and regulatory readiness. She creates three scenarios (Conservative, Base, Optimistic) with 5-year projections, each with different assumptions about market access and execution speed. SAM must always be smaller than TAM (typically 10–40%).",
    systemPromptSummaryDe: "IDA schätzt den SAM, indem sie den TAM durch drei Linsen filtert: geografische Erreichbarkeit, Servicesegment-Fit und regulatorische Bereitschaft. Sie erstellt drei Szenarien (Konservativ, Basis, Optimistisch) mit 5-Jahres-Projektionen, jeweils mit unterschiedlichen Annahmen zu Marktzugang und Umsetzungsgeschwindigkeit. SAM muss immer kleiner als TAM sein (typisch 10–40%).",
    inputDataEn: [
      "TAM projections (5 years, M€) and TAM Overview (scope, regions, drivers)",
      "Scoring data: Strategic Fit, Portfolio Fit, Feasibility, Org Readiness, Risk, Customer Landscape",
      "Customer Interviews, Affiliate Interviews, BU Interviews",
      "Business Model Canvas, Lean Canvas",
      "Customer Segmentation, Competitor Analysis",
      "Opportunity metadata: industry, geography, technology, solution",
    ],
    inputDataDe: [
      "TAM-Projektionen (5 Jahre, M€) und TAM-Übersicht (Scope, Regionen, Treiber)",
      "Scoring-Daten: Strategic Fit, Portfolio Fit, Machbarkeit, Org. Readiness, Risiko, Customer Landscape",
      "Kundeninterviews, Affiliate-Interviews, BU-Interviews",
      "Business Model Canvas, Lean Canvas",
      "Kundensegmentierung, Wettbewerbsanalyse",
      "Opportunity-Metadaten: Branche, Geografie, Technologie, Lösung",
    ],
    outputEn: "3 SAM scenarios (Conservative/Base/Optimistic) each with: 5-year projections (M€), CAGR, Assumptions (2–3), Rationale. Plus: Methodology description and Key Scenario Differentiators.",
    outputDe: "3 SAM-Szenarien (Konservativ/Basis/Optimistisch) jeweils mit: 5-Jahres-Projektionen (M€), CAGR, Annahmen (2–3), Begründung. Plus: Methodikbeschreibung und wesentliche Szenario-Unterschiede.",
    icon: <TrendingUp className="h-5 w-5" />,
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
