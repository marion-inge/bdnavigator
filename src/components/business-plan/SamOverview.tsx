import { useI18n } from "@/lib/i18n";
import { DetailedScoring, GeographicalRegion, MarketYearValue, StrategicAnalyses } from "@/lib/types";
import { SamOverviewData, createDefaultSamOverview } from "@/lib/businessPlanTypes";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, Target, Building2, Users, MapPin, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SamScenario {
  projections: MarketYearValue[];
  cagr: string;
  assumptions: string[];
  rationale: string;
}

interface SamEstimation {
  methodology: string;
  keyDifferentiators: string;
  conservative: SamScenario;
  base: SamScenario;
  optimistic: SamScenario;
}

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
  strategicAnalyses?: StrategicAnalyses;
  opportunityTitle?: string;
  opportunityDescription?: string;
  solutionDescription?: string;
  industry?: string;
  geography?: string;
  technology?: string;
}

function calcCagr(values: MarketYearValue[]): string {
  const sorted = [...values].sort((a, b) => a.year - b.year);
  if (sorted.length < 2) return "–";
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  if (first <= 0 || last <= 0) return "–";
  return `${((Math.pow(last / first, 1 / (sorted.length - 1)) - 1) * 100).toFixed(1)}%`;
}

export function SamOverview({ scoring, onUpdate, readonly: propReadonly, strategicAnalyses, opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const analysis = scoring.marketAttractiveness.analysis;
  const samOverview: SamOverviewData = (scoring as any).samOverview || createDefaultSamOverview();
  const samProj = analysis.samProjections || [];

  const [editing, setEditing] = useState(false);
  const [localProj, setLocalProj] = useState<MarketYearValue[]>(samProj.length ? samProj : [1,2,3,4,5].map(y => ({ year: y, value: 0 })));
  const [localOv, setLocalOv] = useState<SamOverviewData>(samOverview);
  const [localSamDesc, setLocalSamDesc] = useState(analysis.samDescription || "");
  const [localRegions, setLocalRegions] = useState<GeographicalRegion[]>(samOverview.geographicalRegions || []);
  const [dirty, setDirty] = useState(false);
  const [samEstimation, setSamEstimation] = useState<SamEstimation | null>(null);
  const [estimating, setEstimating] = useState(false);
  const readonly = propReadonly || !editing;

  const markDirty = () => setDirty(true);
  const updateOv = (patch: Partial<SamOverviewData>) => { setLocalOv(prev => ({ ...prev, ...patch })); markDirty(); };

  const tamProj = scoring.marketAttractiveness?.analysis?.tamProjections || [];
  const hasTamData = tamProj.some(p => p.value > 0);

  const handleEstimateSam = async () => {
    if (!hasTamData) {
      toast.error(bp("Please enter TAM projections first.", "Bitte zuerst TAM-Projektionen eingeben."));
      return;
    }
    setEstimating(true);
    try {
      const { data, error } = await supabase.functions.invoke("sam-estimation", {
        body: {
          opportunityTitle: opportunityTitle || "",
          opportunityDescription: opportunityDescription || "",
          solutionDescription: solutionDescription || "",
          industry: industry || "",
          geography: geography || "",
          technology: technology || "",
          language,
          tamData: {
            tamProjections: tamProj,
            tamOverview: (scoring as any).tamOverview,
          },
          scoringData: {
            strategicFit: scoring.strategicFit,
            portfolioFit: scoring.portfolioFit,
            feasibility: scoring.feasibility,
            organisationalReadiness: scoring.organisationalReadiness,
            risk: scoring.risk,
            marketAnalysis: scoring.marketAttractiveness?.analysis,
          },
          strategicData: strategicAnalyses ? {
            customerInterviewing: strategicAnalyses.sam?.customerInterviewing,
            internalAffiliateInterviews: strategicAnalyses.sam?.internalAffiliateInterviews,
            internalBUInterviews: strategicAnalyses.sam?.internalBUInterviews,
            businessModelling: strategicAnalyses.sam?.businessModelling,
            leanCanvas: strategicAnalyses.sam?.leanCanvas,
            customerSegmentation: strategicAnalyses.sam?.customerSegmentation,
            competitorAnalysis: strategicAnalyses.som?.competitorAnalysis,
          } : undefined,
        },
      });
      if (error) throw error;
      setSamEstimation(data as SamEstimation);
      toast.success(bp("SAM estimation completed!", "SAM-Schätzung abgeschlossen!"));
    } catch (e: any) {
      console.error("SAM estimation error:", e);
      toast.error(e.message || bp("Failed to estimate SAM", "SAM-Schätzung fehlgeschlagen"));
    } finally {
      setEstimating(false);
    }
  };

  const handleApplyScenario = (scenario: SamScenario) => {
    setLocalProj(scenario.projections);
    markDirty();
    toast.success(bp("SAM projections applied! Click Save to persist.", "SAM-Projektionen übernommen! Klicke Speichern zum Sichern."));
  };

  function formatValue(v: number): string {
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)} B€`;
    if (v > 0) return `${v} M€`;
    return `0 M€`;
  }

  const renderScenarioCard = (label: string, scenario: SamScenario, color: string, icon: string) => (
    <Card className={`border-${color}-500/30`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>{icon}</span> {label}
          <span className={`ml-auto text-xs font-normal text-${color}-600 dark:text-${color}-400`}>
            CAGR: {scenario.cagr}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          {scenario.projections.map(p => (
            <div key={p.year} className="space-y-0.5">
              <div className="text-muted-foreground">{bp("Y", "J")}{p.year}</div>
              <div className={`font-semibold text-${color}-600 dark:text-${color}-400`}>{formatValue(p.value)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium">{bp("Assumptions:", "Annahmen:")}</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {scenario.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground italic">{scenario.rationale}</p>
        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleApplyScenario(scenario)}>
          {bp("Apply as SAM", "Als SAM übernehmen")}
        </Button>
      </CardContent>
    </Card>
  );

  const handleSave = () => {
    const updated: any = {
      ...scoring,
      marketAttractiveness: {
        ...scoring.marketAttractiveness,
        analysis: { ...analysis, samProjections: localProj, samDescription: localSamDesc },
      },
      samOverview: { ...localOv, geographicalRegions: localRegions },
    };
    onUpdate(updated);
    setDirty(false);
  };

  const addRegion = () => { setLocalRegions(prev => [...prev, { region: "", potential: 3, marketSize: "", notes: "" }]); markDirty(); };
  const removeRegion = (i: number) => { setLocalRegions(prev => prev.filter((_, idx) => idx !== i)); markDirty(); };
  const updateRegion = (i: number, patch: Partial<GeographicalRegion>) => { setLocalRegions(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r)); markDirty(); };

  const chartData = localProj.map(p => ({ name: `${bp("Y", "J")}${p.year}`, SAM: p.value }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">SAM – Serviceable Available Market</h2>
            <p className="text-sm text-muted-foreground">{bp("The realistically addressable portion of the TAM", "Der realistisch adressierbare Teil des TAM")}</p>
          </div>
        </div>

        {/* SAM Summary */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4" /> {bp("SAM Summary (5 Years, in M€)", "SAM-Zusammenfassung (5 Jahre, in M€)")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {localProj.map((p, i) => (
                <div key={i}>
                  <Label className="text-xs">{bp("Year", "Jahr")} {p.year}</Label>
                  <Input type="number" value={p.value || ""} onChange={e => { setLocalProj(prev => prev.map((pp, idx) => idx === i ? { ...pp, value: Number(e.target.value) } : pp)); markDirty(); }} disabled={readonly} placeholder="M€" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">CAGR: <strong className="text-foreground">{calcCagr(localProj)}</strong></p>
            {localProj.some(p => p.value > 0) && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v} M€`} />
                  <Tooltip formatter={(v: number) => [`${v} M€`, "SAM"]} />
                  <Bar dataKey="SAM" fill="hsl(160, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div>
              <Label>{bp("Why is SAM smaller than TAM?", "Warum ist der SAM kleiner als der TAM?")}</Label>
              <Textarea value={localOv.samVsTamExplanation} onChange={e => updateOv({ samVsTamExplanation: e.target.value })} placeholder={bp("Resource limitations, geographic presence, target group restrictions, regulatory barriers...", "Ressourcenlimitierungen, geografische Präsenz, Zielgruppen-Einschränkungen, regulatorische Barrieren...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("SAM Definition", "SAM-Definition")}</Label>
              <Textarea value={localSamDesc} onChange={e => { setLocalSamDesc(e.target.value); markDirty(); }} placeholder={bp("How is the SAM derived from the TAM?", "Wie wird der SAM vom TAM abgeleitet?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Industry Focus */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {bp("Industry Focus", "Branchenfokus")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Included Industries", "Eingeschlossene Branchen")}</Label>
              <Textarea value={localOv.includedIndustries} onChange={e => updateOv({ includedIndustries: e.target.value })} placeholder={bp("Which industries are included in the SAM?", "Welche Branchen sind im SAM enthalten?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Excluded Industries", "Ausgeschlossene Branchen")}</Label>
              <Textarea value={localOv.excludedIndustries} onChange={e => updateOv({ excludedIndustries: e.target.value })} placeholder={bp("Which relevant TAM industries are deliberately NOT in the SAM?", "Welche relevanten TAM-Branchen sind bewusst NICHT im SAM?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Geographic Focus */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {bp("Geographical Focus", "Geografischer Fokus")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Focused Markets", "Fokussierte Märkte")}</Label>
              <Textarea value={localOv.geographicFocus} onChange={e => updateOv({ geographicFocus: e.target.value })} placeholder={bp("Which geographic markets can we realistically serve?", "Welche geografischen Märkte können wir realistisch bedienen?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Excluded Regions & Rationale", "Ausgeschlossene Regionen & Begründung")}</Label>
              <Textarea value={localOv.geographicExclusions} onChange={e => updateOv({ geographicExclusions: e.target.value })} placeholder={bp("Why are certain regions excluded?", "Warum werden bestimmte Regionen ausgeschlossen?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Target Group Focus */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> {bp("Target Group Focus", "Zielgruppenfokus")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Addressed Target Groups", "Adressierte Zielgruppen")}</Label>
              <Textarea value={localOv.targetGroups} onChange={e => updateOv({ targetGroups: e.target.value })} placeholder={bp("Customer type, size, use cases...", "Kundentyp, Größe, Use Cases...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Currently Unreachable Groups", "Aktuell nicht erreichbare Gruppen")}</Label>
              <Textarea value={localOv.unreachableGroups} onChange={e => updateOv({ unreachableGroups: e.target.value })} placeholder={bp("Which TAM target groups are not realistically reachable now?", "Welche TAM-Zielgruppen sind aktuell nicht realistisch erreichbar?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* SAM Development */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> {bp("SAM Development (5 Years)", "SAM-Entwicklung (5 Jahre)")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Relevance Outlook", "Relevanz-Ausblick")}</Label>
              <Textarea value={localOv.relevanceOutlook} onChange={e => updateOv({ relevanceOutlook: e.target.value })} placeholder={bp("Does our offering stay relevant? Need for feature adaptations?", "Bleibt unser Angebot relevant? Müssen Features angepasst werden?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Feature Adaptations", "Feature-Anpassungen")}</Label>
              <Textarea value={localOv.featureAdaptations} onChange={e => updateOv({ featureAdaptations: e.target.value })} placeholder={bp("Which features need to be adjusted over time?", "Welche Features müssen über die Zeit angepasst werden?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Price Evolution", "Preisentwicklung")}</Label>
              <Textarea value={localOv.priceEvolution} onChange={e => updateOv({ priceEvolution: e.target.value })} placeholder={bp("How does unit price develop over 5 years?", "Wie entwickelt sich der Preis pro Einheit über 5 Jahre?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Resource Scenarios */}
        <Card>
          <CardHeader><CardTitle>{bp("Resource & Expansion Scenarios", "Ressourcen- & Expansionsszenarien")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Resource Scenarios", "Ressourcenszenarien")}</Label>
              <Textarea value={localOv.resourceScenarios} onChange={e => updateOv({ resourceScenarios: e.target.value })} placeholder={bp("How could additional resources or product adaptations expand the SAM?", "Wie könnten zusätzliche Ressourcen oder Produktanpassungen den SAM erweitern?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Required Investments", "Erforderliche Investitionen")}</Label>
              <Textarea value={localOv.requiredInvestments} onChange={e => updateOv({ requiredInvestments: e.target.value })} placeholder={bp("Which features/investments would be needed?", "Welche Features/Investitionen wären nötig?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Geographic Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{bp("SAM Geographic Breakdown", "SAM-Geografische Aufschlüsselung")}</CardTitle>
              {!readonly && <Button size="sm" variant="outline" onClick={addRegion}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Region", "Region hinzufügen")}</Button>}
            </div>
          </CardHeader>
          <CardContent>
            {localRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{bp("No regions. Add regions to break down SAM by geography.", "Keine Regionen. Fügen Sie Regionen hinzu.")}</p>
            ) : (
              <div className="space-y-3">
                {localRegions.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value={r.region} onChange={e => updateRegion(i, { region: e.target.value })} placeholder={bp("Region", "Region")} disabled={readonly} className="flex-1" />
                      <Input value={r.marketSize} onChange={e => updateRegion(i, { marketSize: e.target.value })} placeholder={bp("SAM Size", "SAM-Größe")} disabled={readonly} className="w-32" />
                      <div className="flex items-center gap-1 w-28">
                        <Label className="text-xs whitespace-nowrap">{bp("Potential", "Potenzial")}:</Label>
                        <Input type="number" min={1} max={5} value={r.potential} onChange={e => updateRegion(i, { potential: Number(e.target.value) })} disabled={readonly} className="w-14" />
                      </div>
                      {!readonly && <Button size="icon" variant="ghost" onClick={() => removeRegion(i)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                    <Textarea value={r.notes} onChange={e => updateRegion(i, { notes: e.target.value })} placeholder={bp("Access barriers, growth, notes...", "Zugangshürden, Wachstum, Anmerkungen...")} disabled={readonly} rows={2} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* IDA SAM Estimation */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {bp("IDA SAM Estimation", "IDA SAM-Schätzung")}
              </CardTitle>
              <Button onClick={handleEstimateSam} disabled={estimating || !hasTamData} size="sm" className="gap-2">
                {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {estimating
                  ? bp("Analyzing...", "Analysiere...")
                  : bp("Estimate SAM", "SAM schätzen")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bp(
                "IDA analyzes TAM, Customer Landscape, Strategic Fit, Feasibility, Interviews, BMC and Lean Canvas to estimate the SAM in 3 scenarios.",
                "IDA analysiert TAM, Customer Landscape, Strategic Fit, Feasibility, Interviews, BMC und Lean Canvas, um den SAM in 3 Szenarien zu schätzen."
              )}
            </p>
          </CardHeader>
          {samEstimation && (
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs font-semibold mb-1">{bp("Methodology", "Methodik")}</p>
                <p className="text-xs text-muted-foreground">{samEstimation.methodology}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {renderScenarioCard(bp("Conservative", "Konservativ"), samEstimation.conservative, "orange", "🔻")}
                {renderScenarioCard(bp("Base Case", "Basisszenario"), samEstimation.base, "blue", "📊")}
                {renderScenarioCard(bp("Optimistic", "Optimistisch"), samEstimation.optimistic, "emerald", "🔺")}
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs font-semibold mb-1">{bp("Key Scenario Differentiators", "Wesentliche Szenario-Unterschiede")}</p>
                <p className="text-xs text-muted-foreground">{samEstimation.keyDifferentiators}</p>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 {bp(
                "Use the supporting model tabs (Customer Segmentation, Interviews, Strategic Fit, Portfolio Fit, Feasibility, Org Readiness, Risk, Business Modelling) to substantiate the SAM.",
                "Nutzen Sie die unterstützenden Modell-Tabs (Segmentierung, Interviews, Strategic Fit, Portfolio Fit, Machbarkeit, Org. Readiness, Risiko, Geschäftsmodellierung), um den SAM zu untermauern.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </EditableSection>
  );
}
