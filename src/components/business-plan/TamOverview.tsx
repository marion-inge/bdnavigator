import { useI18n } from "@/lib/i18n";
import { DetailedScoring, GeographicalRegion, MarketYearValue } from "@/lib/types";
import { TamOverviewData, createDefaultTamOverview } from "@/lib/businessPlanTypes";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, TrendingUp, Globe, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

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
  const n = sorted.length - 1;
  return `${((Math.pow(last / first, 1 / n) - 1) * 100).toFixed(1)}%`;
}

export function TamOverview({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const analysis = scoring.marketAttractiveness.analysis;
  const tamOverview: TamOverviewData = (scoring as any).tamOverview || createDefaultTamOverview();
  const tamProj = analysis.tamProjections || [];

  const [editing, setEditing] = useState(false);
  const [localProj, setLocalProj] = useState<MarketYearValue[]>(tamProj.length ? tamProj : [1,2,3,4,5].map(y => ({ year: y, value: 0 })));
  const [localOverview, setLocalOverview] = useState<TamOverviewData>(tamOverview);
  const [localGrowthRate, setLocalGrowthRate] = useState(analysis.marketGrowthRate || "");
  const [localTamDesc, setLocalTamDesc] = useState(analysis.tamDescription || "");
  const [localRegions, setLocalRegions] = useState<GeographicalRegion[]>(tamOverview.geographicalRegions || []);
  const [dirty, setDirty] = useState(false);
  const readonly = propReadonly || !editing;

  const markDirty = () => setDirty(true);
  const updateOv = (patch: Partial<TamOverviewData>) => { setLocalOverview(prev => ({ ...prev, ...patch })); markDirty(); };

  const formatM = (v: number) =>
    v >= 1000 ? `€${(v / 1000).toFixed(1)}B` : `€${v}M`;

  const handleSave = () => {
    const updated: any = {
      ...scoring,
      marketAttractiveness: {
        ...scoring.marketAttractiveness,
        analysis: {
          ...analysis,
          tamProjections: localProj,
          tamDescription: localTamDesc,
          marketGrowthRate: localGrowthRate,
        },
      },
      tamOverview: { ...localOverview, geographicalRegions: localRegions },
    };
    onUpdate(updated);
    setDirty(false);
  };

  const addRegion = () => { setLocalRegions(prev => [...prev, { region: "", potential: 3, marketSize: "", notes: "" }]); markDirty(); };
  const removeRegion = (i: number) => { setLocalRegions(prev => prev.filter((_, idx) => idx !== i)); markDirty(); };
  const updateRegion = (i: number, patch: Partial<GeographicalRegion>) => {
    setLocalRegions(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r)); markDirty();
  };

  const currentYear = new Date().getFullYear();
  const chartData = localProj.map(p => ({ name: `${currentYear + p.year - 1}`, TAM: p.value }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">TAM – Total Addressable Market</h2>
            <p className="text-sm text-muted-foreground">{bp("The absolute global market potential over 5 years", "Das absolute globale Marktpotenzial über 5 Jahre")}</p>
          </div>
        </div>

        {/* TAM Summary */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {bp("TAM Summary (5 Years)", "TAM-Zusammenfassung (5 Jahre)")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {localProj.map((p, i) => (
                <div key={i}>
                  <Label className="text-xs">{bp("Year", "Jahr")} {p.year} ({currentYear + p.year - 1})</Label>
                  <Input type="number" value={p.value || ""} onChange={e => { setLocalProj(prev => prev.map((pp, idx) => idx === i ? { ...pp, value: Number(e.target.value) } : pp)); markDirty(); }} disabled={readonly} placeholder="M€" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">CAGR: <strong className="text-foreground">{calcCagr(localProj)}</strong></span>
            </div>
            <div>
              <Label>{bp("Growth Rate", "Wachstumsrate")}</Label>
              <Input value={localGrowthRate} onChange={e => { setLocalGrowthRate(e.target.value); markDirty(); }} placeholder={bp("e.g. 15% CAGR through 2030", "z.B. 15% CAGR bis 2030")} disabled={readonly} />
            </div>
            {localProj.some(p => p.value > 0) && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={formatM} />
                  <Tooltip formatter={(v: number) => [formatM(v), "TAM"]} />
                  <Bar dataKey="TAM" fill="hsl(210, 80%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div>
              <Label>{bp("TAM Scope Exclusions", "TAM-Einschränkungen")}</Label>
              <Textarea value={localOverview.scopeExclusions} onChange={e => updateOv({ scopeExclusions: e.target.value })} placeholder={bp("Which industries, regions or segments are excluded from this TAM?", "Welche Branchen, Regionen oder Segmente sind vom TAM ausgeschlossen?")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Full Global Potential", "Volles globales Potenzial")}</Label>
              <Textarea value={localOverview.fullGlobalPotential} onChange={e => updateOv({ fullGlobalPotential: e.target.value })} placeholder={bp("What would be the absolute global cross-industry TAM without restrictions?", "Was wäre das absolute globale Cross-Industry-TAM ohne Einschränkungen?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Scope & Definition */}
        <Card>
          <CardHeader><CardTitle>{bp("TAM Scope & Definition", "TAM-Abgrenzung & Definition")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("TAM Definition", "TAM-Definition")}</Label>
              <Textarea value={localTamDesc} onChange={e => { setLocalTamDesc(e.target.value); markDirty(); }} placeholder={bp("What is included in the TAM? Industries, use cases, product/service definition...", "Was ist im TAM enthalten? Branchen, Use Cases, Produkt-/Service-Definition...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Geographic Coverage", "Geografische Abdeckung")}</Label>
              <Textarea value={localOverview.geographicCoverage} onChange={e => updateOv({ geographicCoverage: e.target.value })} placeholder={bp("Global vs. specific regions...", "Global vs. bestimmte Regionen...")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Market Assumptions", "Marktannahmen")}</Label>
              <Textarea value={localOverview.assumptions} onChange={e => updateOv({ assumptions: e.target.value })} placeholder={bp("Assumptions on technology, regulation, customer behavior...", "Annahmen zu Technologie, Regulierung, Kundenverhalten...")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* TAM Development */}
        <Card>
          <CardHeader><CardTitle>{bp("TAM Development (5 Years)", "TAM-Entwicklung (5 Jahre)")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Market Development", "Marktentwicklung")}</Label>
              <Textarea value={localOverview.marketDevelopment} onChange={e => updateOv({ marketDevelopment: e.target.value })} placeholder={bp("Is the market consolidating, shrinking, or growing? Why?", "Konsolidiert, schrumpft oder wächst der Markt? Warum?")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Drivers & Trends", "Treiber & Trends")}</Label>
              <Textarea value={localOverview.drivers} onChange={e => updateOv({ drivers: e.target.value })} placeholder={bp("Technology, regulation, customer behavior, competitive density...", "Technologie, Regulierung, Kundenverhalten, Wettbewerbsdichte...")} disabled={readonly} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Geographic Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{bp("Geographic Breakdown", "Geografische Aufschlüsselung")}</CardTitle>
              {!readonly && <Button size="sm" variant="outline" onClick={addRegion}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Region", "Region hinzufügen")}</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Radar chart for 3+ regions */}
            {localRegions.length >= 3 && localRegions.some(r => r.region) && (
              <div className="rounded-lg border border-border bg-background/50 p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={localRegions.filter(r => r.region).map(r => ({ region: r.region, potential: r.potential }))}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Radar name={bp("Regional Potential", "Regionales Potenzial")} dataKey="potential" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar chart for 1-2 regions */}
            {localRegions.length > 0 && localRegions.length < 3 && localRegions.some(r => r.region) && (
              <div className="rounded-lg border border-border bg-background/50 p-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={localRegions.filter(r => r.region)} margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="potential" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {localRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{bp("No regions defined. Add regions to break down TAM by geography.", "Keine Regionen definiert. Fügen Sie Regionen hinzu, um den TAM geografisch aufzuschlüsseln.")}</p>
            ) : (
              <div className="space-y-3">
                {localRegions.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value={r.region} onChange={e => updateRegion(i, { region: e.target.value })} placeholder={bp("Region name", "Regionsname")} disabled={readonly} className="flex-1" />
                      <Input value={r.marketSize} onChange={e => updateRegion(i, { marketSize: e.target.value })} placeholder={bp("Market Size", "Marktgröße")} disabled={readonly} className="w-32" />
                      <div className="flex items-center gap-1">
                        <Label className="text-xs whitespace-nowrap">{bp("Potential", "Potenzial")}:</Label>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            disabled={readonly}
                            onClick={() => updateRegion(i, { potential: val })}
                            className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                              r.potential === val
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      {!readonly && <Button size="icon" variant="ghost" onClick={() => removeRegion(i)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                    <Textarea value={r.notes} onChange={e => updateRegion(i, { notes: e.target.value })} placeholder={bp("Drivers, barriers, regulatory notes...", "Treiber, Barrieren, regulatorische Hinweise...")} disabled={readonly} rows={2} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> {bp("Derivation & Sources", "Herleitung & Quellen")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("How did we arrive at this TAM?", "Wie sind wir zu diesem TAM gekommen?")}</Label>
              <Textarea value={localOverview.derivationMethod} onChange={e => updateOv({ derivationMethod: e.target.value })} placeholder={bp("Methodology: top-down, bottom-up, hybrid...", "Methodik: Top-Down, Bottom-Up, Hybrid...")} disabled={readonly} rows={2} />
            </div>
            <div>
              <Label>{bp("Sources", "Quellen")}</Label>
              <Textarea value={localOverview.sources} onChange={e => updateOv({ sources: e.target.value })} placeholder={bp("Market reports, internal revenue data, studies...", "Marktstudien, interne Umsatzdaten, Studien...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Source Assessment", "Quellenbewertung")}</Label>
              <Textarea value={localOverview.sourceAssessment} onChange={e => updateOv({ sourceAssessment: e.target.value })} placeholder={bp("Reliability, timeliness, bias, sample size...", "Verlässlichkeit, Aktualität, Bias, Stichprobe...")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Supporting Models Note */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 {bp(
                "Use the supporting model tabs (Market Research, PESTEL, Value Chain, Porter's, SWOT) to substantiate this TAM with deeper analysis.",
                "Nutzen Sie die unterstützenden Modell-Tabs (Marktforschung, PESTEL, Wertschöpfungskette, Porter's, SWOT), um diesen TAM mit tieferer Analyse zu untermauern.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </EditableSection>
  );
}