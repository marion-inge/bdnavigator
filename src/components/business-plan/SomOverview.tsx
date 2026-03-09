import { useI18n } from "@/lib/i18n";
import { DetailedScoring, GeographicalRegion, MarketYearValue } from "@/lib/types";
import { SomOverviewData, createDefaultSomOverview } from "@/lib/businessPlanTypes";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, TrendingUp, ShoppingCart, Eye, Rocket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

function calcCagr(values: MarketYearValue[]): string {
  const sorted = [...values].sort((a, b) => a.year - b.year);
  if (sorted.length < 2) return "–";
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  if (first <= 0 || last <= 0) return "–";
  return `${((Math.pow(last / first, 1 / (sorted.length - 1)) - 1) * 100).toFixed(1)}%`;
}

export function SomOverview({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const somOverview: SomOverviewData = (scoring as any).somOverview || createDefaultSomOverview();
  const samProj = scoring.marketAttractiveness?.analysis?.samProjections || [];

  const [editing, setEditing] = useState(false);
  const [localOv, setLocalOv] = useState<SomOverviewData>(somOverview);
  const [localProj, setLocalProj] = useState<MarketYearValue[]>(
    somOverview.projections?.length ? somOverview.projections : [1,2,3,4,5].map(y => ({ year: y, value: 0 }))
  );
  const [localRegions, setLocalRegions] = useState<GeographicalRegion[]>(somOverview.geographicalRegions || []);
  const [dirty, setDirty] = useState(false);
  const readonly = propReadonly || !editing;

  const markDirty = () => setDirty(true);
  const updateOv = (patch: Partial<SomOverviewData>) => { setLocalOv(prev => ({ ...prev, ...patch })); markDirty(); };

  const handleSave = () => {
    const updated: any = {
      ...scoring,
      somOverview: { ...localOv, projections: localProj, geographicalRegions: localRegions },
    };
    onUpdate(updated);
    setDirty(false);
  };

  const addRegion = () => { setLocalRegions(prev => [...prev, { region: "", potential: 3, marketSize: "", notes: "" }]); markDirty(); };
  const removeRegion = (i: number) => { setLocalRegions(prev => prev.filter((_, idx) => idx !== i)); markDirty(); };
  const updateRegion = (i: number, patch: Partial<GeographicalRegion>) => { setLocalRegions(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r)); markDirty(); };

  // Market share calculation
  const somY1 = localProj.find(p => p.year === 1)?.value || 0;
  const samY1 = samProj.find(p => p.year === 1)?.value || 0;
  const shareVsSam = samY1 > 0 ? ((somY1 / samY1) * 100).toFixed(1) : "–";

  const chartData = localProj.map(p => ({ name: `${bp("Y", "J")}${p.year}`, SOM: p.value }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">SOM – Serviceable Obtainable Market</h2>
            <p className="text-sm text-muted-foreground">{bp("What we can realistically win in 1–5 years", "Was wir in 1–5 Jahren realistisch gewinnen können")}</p>
          </div>
        </div>

        {/* SOM Summary */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {bp("SOM Summary (5 Years)", "SOM-Zusammenfassung (5 Jahre)")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {localProj.map((p, i) => (
                <div key={i}>
                  <Label className="text-xs">{bp("Year", "Jahr")} {p.year}</Label>
                  <Input type="number" value={p.value || ""} onChange={e => { setLocalProj(prev => prev.map((pp, idx) => idx === i ? { ...pp, value: Number(e.target.value) } : pp)); markDirty(); }} disabled={readonly} placeholder="€" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">CAGR: <strong className="text-foreground">{calcCagr(localProj)}</strong></span>
              <span className="text-muted-foreground">{bp("Market Share vs SAM", "Marktanteil vs SAM")}: <strong className="text-foreground">{shareVsSam}%</strong></span>
            </div>
            {localProj.some(p => p.value > 0) && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="SOM" fill="hsl(40, 85%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{bp("Market Share vs SAM", "Marktanteil vs SAM")}</Label>
                <Textarea value={localOv.marketShareVsSam} onChange={e => updateOv({ marketShareVsSam: e.target.value })} placeholder={bp("SOM as % of SAM, rationale...", "SOM als % des SAM, Begründung...")} disabled={readonly} rows={2} />
              </div>
              <div>
                <Label>{bp("Growth Rate", "Wachstumsrate")}</Label>
                <Textarea value={localOv.growthRate} onChange={e => updateOv({ growthRate: e.target.value })} placeholder={bp("Expected SOM growth rate...", "Erwartete SOM-Wachstumsrate...")} disabled={readonly} rows={2} />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {bp("Visibility Rate (optional)", "Sichtbarkeitsrate (optional)")}</Label>
              <Textarea value={localOv.visibilityRate} onChange={e => updateOv({ visibilityRate: e.target.value })} placeholder={bp("What share of SAM actively knows our offering? Marketing & sales reach...", "Welcher Anteil des SAM kennt unser Angebot aktiv? Marketing- und Vertriebsreichweite...")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Market Assumption Parameters (feed into Business Case) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">📊 {bp("Market Assumptions for Business Case", "Marktannahmen für Business Case")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground mb-3">
              {bp(
                "These parameters are used in the Business Case (Investment Calculation) to model revenue. They are imported automatically via the Data Bridge.",
                "Diese Parameter werden im Business Case (Investitionsrechnung) zur Umsatzmodellierung verwendet. Sie werden automatisch über die Data Bridge importiert."
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">{bp("Portfolio Coverage (%)", "Portfolioabdeckung (%)")}</Label>
                <Input type="number" value={localOv.portfolioCoveragePct || ""} onChange={e => updateOv({ portfolioCoveragePct: Number(e.target.value) })} disabled={readonly} placeholder="40" />
              </div>
              <div>
                <Label className="text-xs">{bp("Visibility (%)", "Sichtbarkeit (%)")}</Label>
                <Input type="number" value={localOv.visibilityPct || ""} onChange={e => updateOv({ visibilityPct: Number(e.target.value) })} disabled={readonly} placeholder="50" />
              </div>
              <div>
                <Label className="text-xs">{bp("Visibility Growth (%/yr)", "Sichtbarkeitswachstum (%/J.)")}</Label>
                <Input type="number" value={localOv.visibilityGrowthPct || ""} onChange={e => updateOv({ visibilityGrowthPct: Number(e.target.value) })} disabled={readonly} placeholder="5" />
              </div>
              <div>
                <Label className="text-xs">{bp("Hitrate (%)", "Hitrate (%)")}</Label>
                <Input type="number" value={localOv.hitratePct || ""} onChange={e => updateOv({ hitratePct: Number(e.target.value) })} disabled={readonly} placeholder="30" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales & Traction */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {bp("Sales & Traction", "Vertrieb & Traktion")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Sales Capacity", "Vertriebskapazität")}</Label>
              <Textarea value={localOv.salesCapacity} onChange={e => updateOv({ salesCapacity: e.target.value })} placeholder={bp("Current sales capacity, pipeline size, team...", "Aktuelle Vertriebskapazität, Pipeline-Größe, Team...")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Pipeline & Won Deals", "Pipeline & gewonnene Deals")}</Label>
              <Textarea value={localOv.pipeline} onChange={e => updateOv({ pipeline: e.target.value })} placeholder={bp("Current pipeline, won deals, references...", "Aktuelle Pipeline, gewonnene Deals, Referenzen...")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("License to Operate / Right to Exist", "License to Operate / Existenzberechtigung")}</Label>
              <Textarea value={localOv.licenseToOperate} onChange={e => updateOv({ licenseToOperate: e.target.value })} placeholder={bp("Do we have enough market share for a sustainable position?", "Haben wir genug Marktanteil für eine nachhaltige Position?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Scenarios */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4" /> {bp("Scenarios & Growth Levers", "Szenarien & Wachstumshebel")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("More Sales Capacity", "Mehr Vertriebskapazität")}</Label>
              <Textarea value={localOv.salesCapacityScenario} onChange={e => updateOv({ salesCapacityScenario: e.target.value })} placeholder={bp("What additional market share with more sales capacity?", "Welcher zusätzliche Marktanteil mit mehr Vertriebskapazität?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Higher Marketing Budget", "Höheres Marketingbudget")}</Label>
              <Textarea value={localOv.marketingBudgetScenario} onChange={e => updateOv({ marketingBudgetScenario: e.target.value })} placeholder={bp("Impact of increased marketing investment?", "Auswirkung erhöhter Marketing-Investitionen?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Stronger Competitive Positioning", "Stärkeres Wettbewerbs-Positioning")}</Label>
              <Textarea value={localOv.positioningScenario} onChange={e => updateOv({ positioningScenario: e.target.value })} placeholder={bp("How could better positioning increase SOM?", "Wie könnte besseres Positioning den SOM steigern?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Geographic Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{bp("SOM Geographic Breakdown", "SOM-Geografische Aufschlüsselung")}</CardTitle>
              {!readonly && <Button size="sm" variant="outline" onClick={addRegion}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Region", "Region")}</Button>}
            </div>
          </CardHeader>
          <CardContent>
            {localRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{bp("No regions. Add regions to break down SOM by geography.", "Keine Regionen. Fügen Sie Regionen hinzu.")}</p>
            ) : (
              <div className="space-y-3">
                {localRegions.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value={r.region} onChange={e => updateRegion(i, { region: e.target.value })} placeholder={bp("Region", "Region")} disabled={readonly} className="flex-1" />
                      <Input value={r.marketSize} onChange={e => updateRegion(i, { marketSize: e.target.value })} placeholder={bp("SOM Size", "SOM-Größe")} disabled={readonly} className="w-32" />
                      {!readonly && <Button size="icon" variant="ghost" onClick={() => removeRegion(i)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                    <Textarea value={r.notes} onChange={e => updateRegion(i, { notes: e.target.value })} placeholder={bp("Current & planned market share, visibility, local competition...", "Aktueller & geplanter Marktanteil, Sichtbarkeit, lokale Konkurrenz...")} disabled={readonly} rows={2} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 {bp(
                "Use the supporting model tabs (Competitor Analysis, VPC, Customer Benefit, Three Circles, Positioning, Pricing, Pilot Customer) to substantiate the SOM.",
                "Nutzen Sie die unterstützenden Modell-Tabs (Wettbewerb, VPC, Kundennutzen, Drei-Kreise, Positionierung, Pricing, Pilotkunde), um den SOM zu untermauern.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </EditableSection>
  );
}
