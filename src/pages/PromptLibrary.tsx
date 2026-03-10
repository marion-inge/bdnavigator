import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import idaAvatar from "@/assets/ida-robot.png";
import markAvatar from "@/assets/mark-robot.png";

interface Prompt {
  id: string;
  agent: "ida" | "mark";
  category: string;
  titleEn: string;
  titleDe: string;
  promptEn: string;
  promptDe: string;
}

const PROMPTS: Prompt[] = [
  // IDA Prompts
  {
    id: "ida-1", agent: "ida", category: "Analysis",
    titleEn: "Strengths & Weaknesses Analysis",
    titleDe: "Stärken- & Schwächenanalyse",
    promptEn: "Analyze the strengths and weaknesses of this opportunity based on all available data. Highlight the top 3 strengths and top 3 weaknesses with specific evidence.",
    promptDe: "Analysiere die Stärken und Schwächen dieser Opportunity basierend auf allen verfügbaren Daten. Hebe die Top 3 Stärken und Top 3 Schwächen mit konkreten Belegen hervor.",
  },
  {
    id: "ida-2", agent: "ida", category: "Analysis",
    titleEn: "Data Gap Analysis",
    titleDe: "Datenlücken-Analyse",
    promptEn: "Identify all missing or incomplete data fields in this section. Prioritize them by importance and suggest what information should be filled in first.",
    promptDe: "Identifiziere alle fehlenden oder unvollständigen Datenfelder in diesem Bereich. Priorisiere sie nach Wichtigkeit und schlage vor, welche Informationen zuerst ausgefüllt werden sollten.",
  },
  {
    id: "ida-3", agent: "ida", category: "Analysis",
    titleEn: "Consistency Check",
    titleDe: "Konsistenzprüfung",
    promptEn: "Check for inconsistencies across all data fields. Are the scoring values, market projections, and qualitative descriptions aligned? Flag any contradictions.",
    promptDe: "Prüfe alle Datenfelder auf Inkonsistenzen. Sind Scoring-Werte, Marktprojektionen und qualitative Beschreibungen aufeinander abgestimmt? Markiere Widersprüche.",
  },
  {
    id: "ida-4", agent: "ida", category: "Scoring",
    titleEn: "Scoring Justification",
    titleDe: "Scoring-Begründung",
    promptEn: "Review the current scoring values. Are they justified by the qualitative data? Suggest adjustments where the scores seem too high or too low.",
    promptDe: "Überprüfe die aktuellen Scoring-Werte. Sind sie durch die qualitativen Daten gerechtfertigt? Schlage Anpassungen vor, wo die Scores zu hoch oder zu niedrig erscheinen.",
  },
  {
    id: "ida-5", agent: "ida", category: "Scoring",
    titleEn: "Risk Assessment Summary",
    titleDe: "Risikobewertung Zusammenfassung",
    promptEn: "Summarize all risk factors from the available data. Categorize them into technical, market, organizational, and financial risks. Rate each as low/medium/high.",
    promptDe: "Fasse alle Risikofaktoren aus den verfügbaren Daten zusammen. Kategorisiere sie in technische, Markt-, organisatorische und finanzielle Risiken. Bewerte jedes als niedrig/mittel/hoch.",
  },
  {
    id: "ida-6", agent: "ida", category: "Business Plan",
    titleEn: "TAM-SAM-SOM Plausibility Check",
    titleDe: "TAM-SAM-SOM Plausibilitätsprüfung",
    promptEn: "Evaluate the TAM, SAM, and SOM projections. Are the ratios between them realistic? Is the growth rate (CAGR) plausible for this industry?",
    promptDe: "Bewerte die TAM-, SAM- und SOM-Projektionen. Sind die Verhältnisse zueinander realistisch? Ist die Wachstumsrate (CAGR) für diese Branche plausibel?",
  },
  {
    id: "ida-7", agent: "ida", category: "Business Plan",
    titleEn: "Executive Summary Draft",
    titleDe: "Executive Summary Entwurf",
    promptEn: "Based on all available data, draft a concise executive summary (max 200 words) for this opportunity that could be presented to a steering committee.",
    promptDe: "Erstelle basierend auf allen verfügbaren Daten eine prägnante Executive Summary (max. 200 Wörter) für diese Opportunity, die einem Steuerungskomitee präsentiert werden könnte.",
  },
  {
    id: "ida-8", agent: "ida", category: "Business Case",
    titleEn: "Investment Readiness Check",
    titleDe: "Investitionsbereitschafts-Check",
    promptEn: "Assess whether this opportunity is ready for investment based on the available data. What key questions remain unanswered? What would a decision-maker need to see?",
    promptDe: "Bewerte, ob diese Opportunity basierend auf den verfügbaren Daten investitionsbereit ist. Welche Schlüsselfragen bleiben unbeantwortet? Was würde ein Entscheidungsträger sehen wollen?",
  },
  // Mark Prompts
  {
    id: "mark-1", agent: "mark", category: "Market Research",
    titleEn: "Competitive Landscape Overview",
    titleDe: "Wettbewerbslandschaft Überblick",
    promptEn: "Based on the data, what does the competitive landscape look like? Identify direct and indirect competitors, and suggest areas where we should do deeper research.",
    promptDe: "Wie sieht die Wettbewerbslandschaft basierend auf den Daten aus? Identifiziere direkte und indirekte Wettbewerber und schlage Bereiche für tiefere Recherche vor.",
  },
  {
    id: "mark-2", agent: "mark", category: "Market Research",
    titleEn: "Industry Trends & Drivers",
    titleDe: "Branchentrends & Treiber",
    promptEn: "What are the key industry trends and market drivers relevant to this opportunity? How should we position ourselves to capitalize on these trends?",
    promptDe: "Was sind die wichtigsten Branchentrends und Markttreiber für diese Opportunity? Wie sollten wir uns positionieren, um von diesen Trends zu profitieren?",
  },
  {
    id: "mark-3", agent: "mark", category: "Market Research",
    titleEn: "Customer Pain Points Analysis",
    titleDe: "Kunden-Schmerzpunkte Analyse",
    promptEn: "What customer pain points does this solution address? Are there additional pain points we should consider? Suggest research methods to validate our assumptions.",
    promptDe: "Welche Kunden-Schmerzpunkte adressiert diese Lösung? Gibt es weitere Schmerzpunkte, die wir berücksichtigen sollten? Schlage Forschungsmethoden zur Validierung vor.",
  },
  {
    id: "mark-4", agent: "mark", category: "Strategy",
    titleEn: "Go-to-Market Strategy Suggestions",
    titleDe: "Go-to-Market Strategie Vorschläge",
    promptEn: "Based on the current data, what go-to-market strategy would you recommend? Consider channels, pricing, partnerships, and launch sequence.",
    promptDe: "Welche Go-to-Market-Strategie würdest du basierend auf den aktuellen Daten empfehlen? Berücksichtige Kanäle, Preisgestaltung, Partnerschaften und Launch-Sequenz.",
  },
  {
    id: "mark-5", agent: "mark", category: "Strategy",
    titleEn: "Differentiation Strategy",
    titleDe: "Differenzierungsstrategie",
    promptEn: "How can we differentiate from existing solutions? What unique value proposition should we emphasize? Suggest positioning frameworks.",
    promptDe: "Wie können wir uns von bestehenden Lösungen differenzieren? Welches einzigartige Wertversprechen sollten wir betonen? Schlage Positionierungs-Frameworks vor.",
  },
  {
    id: "mark-6", agent: "mark", category: "Strategy",
    titleEn: "Pricing Strategy Research",
    titleDe: "Preisstrategie-Recherche",
    promptEn: "What pricing models are common in this market? Suggest a pricing strategy based on the competitive landscape and our value proposition.",
    promptDe: "Welche Preismodelle sind in diesem Markt üblich? Schlage eine Preisstrategie basierend auf der Wettbewerbslandschaft und unserem Wertversprechen vor.",
  },
  {
    id: "mark-7", agent: "mark", category: "Validation",
    titleEn: "Market Assumption Validation",
    titleDe: "Marktannahmen-Validierung",
    promptEn: "Review the market assumptions in this section. Which ones are well-supported and which need validation? Suggest specific research activities.",
    promptDe: "Überprüfe die Marktannahmen in diesem Bereich. Welche sind gut belegt und welche müssen validiert werden? Schlage konkrete Forschungsaktivitäten vor.",
  },
  {
    id: "mark-8", agent: "mark", category: "Validation",
    titleEn: "Pilot Customer Strategy",
    titleDe: "Pilotkunden-Strategie",
    promptEn: "What type of pilot customer would be ideal for validating this solution? Define the ideal profile and suggest an outreach approach.",
    promptDe: "Welcher Pilotkundentyp wäre ideal zur Validierung dieser Lösung? Definiere das ideale Profil und schlage einen Ansprache-Ansatz vor.",
  },
];

const CATEGORIES_IDA = ["Analysis", "Scoring", "Business Plan", "Business Case"];
const CATEGORIES_MARK = ["Market Research", "Strategy", "Validation"];

export default function PromptLibrary() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState<"all" | "ida" | "mark">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = PROMPTS.filter(p => {
    if (agentFilter !== "all" && p.agent !== agentFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const title = language === "de" ? p.titleDe : p.titleEn;
      const prompt = language === "de" ? p.promptDe : p.promptEn;
      return title.toLowerCase().includes(s) || prompt.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
    }
    return true;
  });

  const handleCopy = (p: Prompt) => {
    const text = language === "de" ? p.promptDe : p.promptEn;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    toast.success(bp("Copied to clipboard!", "In Zwischenablage kopiert!"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = agentFilter === "mark" ? CATEGORIES_MARK : agentFilter === "ida" ? CATEGORIES_IDA : [...CATEGORIES_IDA, ...CATEGORIES_MARK];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">
            {bp("Prompt Library", "Prompt-Bibliothek")}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {bp(
            "Pre-built prompts for the IDA and Mark AI agents. Copy a prompt and paste it into the agent chat on any opportunity.",
            "Vorgefertigte Prompts für die KI-Agenten IDA und Mark. Kopiere einen Prompt und füge ihn im Agenten-Chat bei einer beliebigen Opportunity ein."
          )}
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={bp("Search prompts...", "Prompts suchen...")}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5">
            <Button
              variant={agentFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setAgentFilter("all")}
            >
              {bp("All", "Alle")}
            </Button>
            <Button
              variant={agentFilter === "ida" ? "default" : "outline"}
              size="sm"
              onClick={() => setAgentFilter("ida")}
              className={agentFilter === "ida" ? "bg-agent-ida hover:bg-agent-ida/90" : ""}
            >
              <img src={idaAvatar} alt="IDA" className="h-4 w-4 rounded-full mr-1.5" />
              IDA
            </Button>
            <Button
              variant={agentFilter === "mark" ? "default" : "outline"}
              size="sm"
              onClick={() => setAgentFilter("mark")}
              className={agentFilter === "mark" ? "bg-agent-mark hover:bg-agent-mark/90" : ""}
            >
              <img src={markAvatar} alt="Mark" className="h-4 w-4 rounded-full mr-1.5" />
              Mark
            </Button>
          </div>
        </div>

        {/* Prompts by Category */}
        {categories.filter((c, i, arr) => arr.indexOf(c) === i).map(category => {
          const categoryPrompts = filtered.filter(p => p.category === category);
          if (categoryPrompts.length === 0) return null;
          return (
            <div key={category} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryPrompts.map(p => (
                  <Card key={p.id} className="group hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.agent === "ida" ? idaAvatar : markAvatar}
                          alt={p.agent === "ida" ? "IDA" : "Mark"}
                          className="h-5 w-5 rounded-full"
                        />
                        <CardTitle className="text-sm flex-1">
                          {language === "de" ? p.titleDe : p.titleEn}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {p.agent === "ida" ? "IDA" : "Mark"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                        {language === "de" ? p.promptDe : p.promptEn}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => handleCopy(p)}
                      >
                        {copiedId === p.id ? (
                          <><Check className="h-3.5 w-3.5" /> {bp("Copied!", "Kopiert!")}</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" /> {bp("Copy Prompt", "Prompt kopieren")}</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {bp("No prompts found.", "Keine Prompts gefunden.")}
          </div>
        )}
      </main>
    </div>
  );
}
