import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, PortersFiveForces, PorterForce, IndustryValueChain, ValueChainStage, createDefaultStrategicAnalyses, createDefaultValueChain } from "@/lib/types";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";

interface Props {
  strategicAnalyses?: StrategicAnalyses;
  onSave: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
}

export function StrategicAnalysesSection({ strategicAnalyses, onSave, readonly }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<StrategicAnalyses>(strategicAnalyses || createDefaultStrategicAnalyses());

  const update = (updated: StrategicAnalyses) => {
    setData(updated);
    onSave(updated);
  };

  return (
    <Tabs defaultValue="ansoff" className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="ansoff" className="text-xs sm:text-sm">{t("saAnsoff")}</TabsTrigger>
        <TabsTrigger value="bcg" className="text-xs sm:text-sm">{t("saBcg")}</TabsTrigger>
        <TabsTrigger value="mckinsey" className="text-xs sm:text-sm">{t("saMckinsey")}</TabsTrigger>
        <TabsTrigger value="swot" className="text-xs sm:text-sm">{t("saSwot")}</TabsTrigger>
        <TabsTrigger value="pestel" className="text-xs sm:text-sm">{t("saPestel")}</TabsTrigger>
        <TabsTrigger value="porter" className="text-xs sm:text-sm">{t("saPorter")}</TabsTrigger>
        <TabsTrigger value="valueChain" className="text-xs sm:text-sm">{t("saValueChain")}</TabsTrigger>
      </TabsList>

      {/* Ansoff Matrix */}
      <TabsContent value="ansoff">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("saAnsoff")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Matrix */}
              <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1 max-w-lg">
                <div />
                <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saExistingProduct")}</div>
                <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saNewProduct")}</div>
                <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saExistingMarket")}</div>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => update({ ...data, ansoff: { ...data.ansoff, position: "market_penetration" } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.ansoff.position === "market_penetration" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {t("saAnsoffMarketPenetration")}
                </button>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => update({ ...data, ansoff: { ...data.ansoff, position: "product_development" } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.ansoff.position === "product_development" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {t("saAnsoffProductDevelopment")}
                </button>
                <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saNewMarket")}</div>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => update({ ...data, ansoff: { ...data.ansoff, position: "market_development" } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.ansoff.position === "market_development" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {t("saAnsoffMarketDevelopment")}
                </button>
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => update({ ...data, ansoff: { ...data.ansoff, position: "diversification" } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.ansoff.position === "diversification" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}
                >
                  {t("saAnsoffDiversification")}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>{t("saDescription")}</Label>
                  <Textarea value={data.ansoff.description} onChange={(e) => update({ ...data, ansoff: { ...data.ansoff, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} />
                </div>
                <div>
                  <Label>{t("saRationale")}</Label>
                  <Textarea value={data.ansoff.rationale} onChange={(e) => update({ ...data, ansoff: { ...data.ansoff, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* BCG Matrix */}
      <TabsContent value="bcg">
        <Card>
          <CardHeader><CardTitle>{t("saBcg")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1 max-w-lg">
              <div />
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckHigh")} {t("saRelativeMarketShare")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckLow")} {t("saRelativeMarketShare")}</div>
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saMckHigh")} {t("saMarketGrowth")}</div>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "star" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "star" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ⭐ {t("saBcgStar")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "question_mark" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "question_mark" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ❓ {t("saBcgQuestionMark")}
              </button>
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saMckLow")} {t("saMarketGrowth")}</div>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "cash_cow" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "cash_cow" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐄 {t("saBcgCashCow")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "dog" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "dog" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐕 {t("saBcgDog")}
              </button>
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={data.bcg.description} onChange={(e) => update({ ...data, bcg: { ...data.bcg, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={data.bcg.rationale} onChange={(e) => update({ ...data, bcg: { ...data.bcg, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* McKinsey Matrix */}
      <TabsContent value="mckinsey">
        <Card>
          <CardHeader><CardTitle>{t("saMckinsey")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* 3x3 Grid */}
            <div className="grid grid-cols-[auto_1fr_1fr_1fr] grid-rows-[auto_1fr_1fr_1fr] gap-1 max-w-2xl">
              <div />
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckHigh")} {t("saCompetitiveStrength")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckMedium")} {t("saCompetitiveStrength")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckLow")} {t("saCompetitiveStrength")}</div>
              {(["high", "medium", "low"] as const).map((ia) => (
                <>
                  <div key={`label-${ia}`} className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">
                    {t(ia === "high" ? "saMckHigh" : ia === "medium" ? "saMckMedium" : "saMckLow")} {t("saIndustryAttractiveness")}
                  </div>
                  {(["high", "medium", "low"] as const).map((cs) => {
                    const pos = `${ia}_${cs}`;
                    const colorMap: Record<string, string> = {
                      high_high: "bg-green-500/20 hover:bg-green-500/30",
                      high_medium: "bg-green-500/20 hover:bg-green-500/30",
                      medium_high: "bg-green-500/20 hover:bg-green-500/30",
                      high_low: "bg-yellow-500/20 hover:bg-yellow-500/30",
                      medium_medium: "bg-yellow-500/20 hover:bg-yellow-500/30",
                      low_high: "bg-yellow-500/20 hover:bg-yellow-500/30",
                      medium_low: "bg-red-500/20 hover:bg-red-500/30",
                      low_medium: "bg-red-500/20 hover:bg-red-500/30",
                      low_low: "bg-red-500/20 hover:bg-red-500/30",
                    };
                    const labels: Record<string, string> = {
                      high_high: "Invest/Grow", high_medium: "Invest/Grow", medium_high: "Invest/Grow",
                      high_low: "Selectivity", medium_medium: "Selectivity", low_high: "Selectivity",
                      medium_low: "Harvest/Divest", low_medium: "Harvest/Divest", low_low: "Harvest/Divest",
                    };
                    return (
                      <button key={pos} type="button" disabled={readonly}
                        onClick={() => update({ ...data, mckinsey: { ...data.mckinsey, position: pos } })}
                        className={`p-3 rounded-md border text-xs font-medium transition-colors ${data.mckinsey.position === pos ? "ring-2 ring-primary bg-primary/20 text-foreground border-primary" : `${colorMap[pos]} text-muted-foreground border-border`}`}>
                        {labels[pos]}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={data.mckinsey.description} onChange={(e) => update({ ...data, mckinsey: { ...data.mckinsey, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={data.mckinsey.rationale} onChange={(e) => update({ ...data, mckinsey: { ...data.mckinsey, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SWOT */}
      <TabsContent value="swot">
        <Card>
          <CardHeader><CardTitle>{t("saSwot")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: "strengths" as const, label: "saStrengths", color: "bg-green-500/10 border-green-500/30" },
                { key: "weaknesses" as const, label: "saWeaknesses", color: "bg-red-500/10 border-red-500/30" },
                { key: "opportunities" as const, label: "saOpportunities", color: "bg-blue-500/10 border-blue-500/30" },
                { key: "threats" as const, label: "saThreats", color: "bg-yellow-500/10 border-yellow-500/30" },
              ] as const).map(({ key, label, color }) => (
                <div key={key} className={`rounded-lg border p-4 ${color}`}>
                  <Label className="text-sm font-semibold">{t(label)}</Label>
                  <Textarea
                    className="mt-2 bg-background"
                    value={data.swot[key]}
                    onChange={(e) => update({ ...data, swot: { ...data.swot, [key]: e.target.value } })}
                    placeholder={`${t(label)}...`}
                    disabled={readonly}
                    rows={4}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={data.swot.description} onChange={(e) => update({ ...data, swot: { ...data.swot, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={data.swot.rationale} onChange={(e) => update({ ...data, swot: { ...data.swot, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* PESTEL */}
      <TabsContent value="pestel">
        <Card>
          <CardHeader><CardTitle>{t("saPestel")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                { key: "political" as const, label: "saPolitical", icon: "🏛️" },
                { key: "economic" as const, label: "saEconomic", icon: "💰" },
                { key: "social" as const, label: "saSocial", icon: "👥" },
                { key: "technological" as const, label: "saTechnological", icon: "⚙️" },
                { key: "environmental" as const, label: "saEnvironmental", icon: "🌍" },
                { key: "legal" as const, label: "saLegal", icon: "⚖️" },
              ] as const).map(({ key, label, icon }) => (
                <div key={key} className="rounded-lg border border-border p-4 bg-card">
                  <Label className="text-sm font-semibold">{icon} {t(label)}</Label>
                  <Textarea
                    className="mt-2"
                    value={data.pestel[key]}
                    onChange={(e) => update({ ...data, pestel: { ...data.pestel, [key]: e.target.value } })}
                    placeholder={`${t(label)}...`}
                    disabled={readonly}
                    rows={3}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={data.pestel.description} onChange={(e) => update({ ...data, pestel: { ...data.pestel, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={data.pestel.rationale} onChange={(e) => update({ ...data, pestel: { ...data.pestel, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Porter's Five Forces */}
      <TabsContent value="porter">
        <Card>
          <CardHeader><CardTitle>{t("saPorter")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Radar Chart */}
            {(() => {
              const porter = data.porter || { competitiveRivalry: { intensity: 3, description: "" }, threatOfNewEntrants: { intensity: 3, description: "" }, threatOfSubstitutes: { intensity: 3, description: "" }, bargainingPowerBuyers: { intensity: 3, description: "" }, bargainingPowerSuppliers: { intensity: 3, description: "" }, description: "", rationale: "" };
              const radarData = [
                { force: t("saCompetitiveRivalry"), value: porter.competitiveRivalry.intensity },
                { force: t("saThreatNewEntrants"), value: porter.threatOfNewEntrants.intensity },
                { force: t("saBargainingBuyers"), value: porter.bargainingPowerBuyers.intensity },
                { force: t("saThreatSubstitutes"), value: porter.threatOfSubstitutes.intensity },
                { force: t("saBargainingSuppliers"), value: porter.bargainingPowerSuppliers.intensity },
              ];
              return (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="force" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Radar name={t("saIntensity")} dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            <div className="space-y-5">
              {([
                { key: "competitiveRivalry" as const, label: "saCompetitiveRivalry", icon: "⚔️" },
                { key: "threatOfNewEntrants" as const, label: "saThreatNewEntrants", icon: "🚪" },
                { key: "threatOfSubstitutes" as const, label: "saThreatSubstitutes", icon: "🔄" },
                { key: "bargainingPowerBuyers" as const, label: "saBargainingBuyers", icon: "🛒" },
                { key: "bargainingPowerSuppliers" as const, label: "saBargainingSuppliers", icon: "🏭" },
              ] as const).map(({ key, label, icon }) => {
                const porter = data.porter || { competitiveRivalry: { intensity: 3, description: "" }, threatOfNewEntrants: { intensity: 3, description: "" }, threatOfSubstitutes: { intensity: 3, description: "" }, bargainingPowerBuyers: { intensity: 3, description: "" }, bargainingPowerSuppliers: { intensity: 3, description: "" }, description: "", rationale: "" };
                const force = porter[key];
                const intensityColor = force.intensity <= 2 ? "text-green-600" : force.intensity <= 3 ? "text-yellow-600" : "text-red-600";
                return (
                  <div key={key} className="rounded-lg border border-border p-4 bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">{icon} {t(label)}</Label>
                      <span className={`text-sm font-bold ${intensityColor}`}>{force.intensity}/5</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t("saIntensity")}:</span>
                      <Slider
                        min={1} max={5} step={1}
                        value={[force.intensity]}
                        onValueChange={([v]) => {
                          const updatedPorter = { ...porter, [key]: { ...force, intensity: v } };
                          update({ ...data, porter: updatedPorter });
                        }}
                        disabled={readonly}
                        className="flex-1"
                      />
                    </div>
                    <Textarea
                      value={force.description}
                      onChange={(e) => {
                        const updatedPorter = { ...porter, [key]: { ...force, description: e.target.value } };
                        update({ ...data, porter: updatedPorter });
                      }}
                      placeholder={`${t(label)}...`}
                      disabled={readonly}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={(data.porter || { description: "" }).description} onChange={(e) => update({ ...data, porter: { ...(data.porter || { competitiveRivalry: { intensity: 3, description: "" }, threatOfNewEntrants: { intensity: 3, description: "" }, threatOfSubstitutes: { intensity: 3, description: "" }, bargainingPowerBuyers: { intensity: 3, description: "" }, bargainingPowerSuppliers: { intensity: 3, description: "" }, description: "", rationale: "" }), description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={(data.porter || { rationale: "" }).rationale} onChange={(e) => update({ ...data, porter: { ...(data.porter || { competitiveRivalry: { intensity: 3, description: "" }, threatOfNewEntrants: { intensity: 3, description: "" }, threatOfSubstitutes: { intensity: 3, description: "" }, bargainingPowerBuyers: { intensity: 3, description: "" }, bargainingPowerSuppliers: { intensity: 3, description: "" }, description: "", rationale: "" }), rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Industry Value Chain */}
      <TabsContent value="valueChain">
        <Card>
          <CardHeader><CardTitle>{t("saValueChain")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const vc: IndustryValueChain = data.valueChain || createDefaultValueChain();
              const updateVc = (updated: IndustryValueChain) => update({ ...data, valueChain: updated });

              const updateStage = (id: string, updates: Partial<ValueChainStage>) => {
                updateVc({ ...vc, stages: vc.stages.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
              };

              const addStage = () => {
                updateVc({ ...vc, stages: [...vc.stages, { id: crypto.randomUUID(), name: "", isOurPosition: false, marginAttractiveness: 3, differentiators: "", dynamics: "" }] });
              };

              const removeStage = (id: string) => {
                updateVc({ ...vc, stages: vc.stages.filter((s) => s.id !== id) });
              };

              const togglePosition = (id: string) => {
                updateVc({ ...vc, stages: vc.stages.map((s) => (s.id === id ? { ...s, isOurPosition: !s.isOurPosition } : s)) });
              };

              const marginColor = (v: number) => v <= 2 ? "bg-red-500/20 text-red-700 dark:text-red-400" : v <= 3 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : "bg-green-500/20 text-green-700 dark:text-green-400";

              return (
                <>
                  {/* Visual Chain */}
                  {vc.stages.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="flex items-stretch gap-0 min-w-max py-2">
                        {vc.stages.map((stage, i) => (
                          <div key={stage.id} className="flex items-stretch">
                            <div
                              className={`relative flex flex-col items-center justify-between rounded-lg border-2 p-4 min-w-[160px] max-w-[200px] transition-all ${
                                stage.isOurPosition
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg"
                                  : "border-border bg-card"
                              }`}
                            >
                              {stage.isOurPosition && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {t("saVcOurPosition")}
                                </div>
                              )}
                              <div className="text-center text-sm font-semibold mt-1 mb-2 line-clamp-2">{stage.name || "..."}</div>
                              <div className={`text-xs font-bold px-2 py-1 rounded-full ${marginColor(stage.marginAttractiveness)}`}>
                                {t("saVcMarginAttractiveness")}: {stage.marginAttractiveness}/5
                              </div>
                            </div>
                            {i < vc.stages.length - 1 && (
                              <div className="flex items-center px-1 text-muted-foreground text-xl font-bold">→</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("saVcNoStages")}</p>
                  )}

                  {/* Stage Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">{t("saVcStages")}</Label>
                      {!readonly && (
                        <Button variant="outline" size="sm" onClick={addStage} className="gap-1">
                          <Plus className="h-3.5 w-3.5" /> {t("saVcAddStage")}
                        </Button>
                      )}
                    </div>

                    {vc.stages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`rounded-lg border-2 p-4 space-y-3 transition-all ${
                          stage.isOurPosition ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Input
                            value={stage.name}
                            onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                            placeholder={t("saVcStageName")}
                            disabled={readonly}
                            className="flex-1 font-medium"
                          />
                          <Button
                            variant={stage.isOurPosition ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePosition(stage.id)}
                            disabled={readonly}
                            className="gap-1 whitespace-nowrap"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            {t("saVcOurPosition")}
                          </Button>
                          {!readonly && (
                            <Button variant="ghost" size="icon" onClick={() => removeStage(stage.id)} className="text-destructive hover:text-destructive shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{t("saVcMarginAttractiveness")}:</span>
                          <Slider min={1} max={5} step={1} value={[stage.marginAttractiveness]}
                            onValueChange={([v]) => updateStage(stage.id, { marginAttractiveness: v })}
                            disabled={readonly} className="flex-1" />
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marginColor(stage.marginAttractiveness)}`}>{stage.marginAttractiveness}/5</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t("saVcDifferentiators")}</Label>
                            <Textarea value={stage.differentiators}
                              onChange={(e) => updateStage(stage.id, { differentiators: e.target.value })}
                              placeholder={t("saVcDiffPlaceholder")} disabled={readonly} rows={3} className="mt-1 text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">{t("saVcDynamics")}</Label>
                            <Textarea value={stage.dynamics}
                              onChange={(e) => updateStage(stage.id, { dynamics: e.target.value })}
                              placeholder={t("saVcDynPlaceholder")} disabled={readonly} rows={3} className="mt-1 text-xs" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={vc.description} onChange={(e) => updateVc({ ...vc, description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={vc.rationale} onChange={(e) => updateVc({ ...vc, rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
