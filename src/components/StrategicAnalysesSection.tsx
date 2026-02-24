import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, PortersFiveForces, PorterForce, IndustryValueChain, ValueChainStage, createDefaultStrategicAnalyses, createDefaultValueChain, CustomerSegmentEntry, CompetitorAnalysisEntry, CustomerInterviewEntry, BusinessModelCanvas, LeanCanvas, ValuePropositionCanvas, CustomerBenefitAnalysis, ThreeCircleModel, PositioningStatement } from "@/lib/types";
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
  defaultTab?: string;
}

export function StrategicAnalysesSection({ strategicAnalyses, onSave, readonly, defaultTab }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<StrategicAnalyses>(strategicAnalyses || createDefaultStrategicAnalyses());

  const update = (updated: StrategicAnalyses) => {
    setData(updated);
    onSave(updated);
  };

  return (
    <Tabs defaultValue={defaultTab || "ansoff"} key={defaultTab} className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="ansoff" className="text-xs sm:text-sm">{t("saAnsoff")}</TabsTrigger>
        <TabsTrigger value="bcg" className="text-xs sm:text-sm">{t("saBcg")}</TabsTrigger>
        <TabsTrigger value="mckinsey" className="text-xs sm:text-sm">{t("saMckinsey")}</TabsTrigger>
        <TabsTrigger value="swot" className="text-xs sm:text-sm">{t("saSwot")}</TabsTrigger>
        <TabsTrigger value="pestel" className="text-xs sm:text-sm">{t("saPestel")}</TabsTrigger>
        <TabsTrigger value="porter" className="text-xs sm:text-sm">{t("saPorter")}</TabsTrigger>
        <TabsTrigger value="valueChain" className="text-xs sm:text-sm">{t("saValueChain")}</TabsTrigger>
        <TabsTrigger value="custSeg" className="text-xs sm:text-sm">{t("saCustSeg")}</TabsTrigger>
        <TabsTrigger value="compAnalysis" className="text-xs sm:text-sm">{t("saCompAnalysis")}</TabsTrigger>
        <TabsTrigger value="custInt" className="text-xs sm:text-sm">{t("saCustInt")}</TabsTrigger>
        <TabsTrigger value="bizModel" className="text-xs sm:text-sm">{t("saBizModel")}</TabsTrigger>
        <TabsTrigger value="leanCanvas" className="text-xs sm:text-sm">{t("saLeanCanvas")}</TabsTrigger>
        <TabsTrigger value="vpc" className="text-xs sm:text-sm">{t("saVpc")}</TabsTrigger>
        <TabsTrigger value="cba" className="text-xs sm:text-sm">{t("saCba")}</TabsTrigger>
        <TabsTrigger value="tcm" className="text-xs sm:text-sm">{t("saTcm")}</TabsTrigger>
        <TabsTrigger value="positioning" className="text-xs sm:text-sm">{t("saPos")}</TabsTrigger>
        <TabsTrigger value="threeHorizons" className="text-xs sm:text-sm">{t("saThreeHorizons" as any)}</TabsTrigger>
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
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckLow")} {t("saRelativeMarketShare")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckHigh")} {t("saRelativeMarketShare")}</div>
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saMckHigh")} {t("saMarketGrowth")}</div>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "question_mark" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "question_mark" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ❓ {t("saBcgQuestionMark")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "star" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "star" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ⭐ {t("saBcgStar")}
              </button>
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saMckLow")} {t("saMarketGrowth")}</div>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "dog" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "dog" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐕 {t("saBcgDog")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, bcg: { ...data.bcg, position: "cash_cow" } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${data.bcg.position === "cash_cow" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐄 {t("saBcgCashCow")}
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
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckLow")} {t("saCompetitiveStrength")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckMedium")} {t("saCompetitiveStrength")}</div>
              <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saMckHigh")} {t("saCompetitiveStrength")}</div>
              {(["high", "medium", "low"] as const).map((ia) => (
                <>
                  <div key={`label-${ia}`} className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">
                    {t(ia === "high" ? "saMckHigh" : ia === "medium" ? "saMckMedium" : "saMckLow")} {t("saIndustryAttractiveness")}
                  </div>
                  {(["low", "medium", "high"] as const).map((cs) => {
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

      {/* Customer Segmentation */}
      <TabsContent value="custSeg">
        <Card>
          <CardHeader><CardTitle>{t("saCustSeg")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const seg = data.customerSegmentation || { entries: [], description: "", rationale: "" };
              const updateSeg = (updated: typeof seg) => update({ ...data, customerSegmentation: updated });
              const addEntry = () => {
                updateSeg({ ...seg, entries: [...seg.entries, { id: crypto.randomUUID(), name: "", size: "", needs: "", willingnessToPay: "", priority: "medium" }] });
              };
              const removeEntry = (id: string) => updateSeg({ ...seg, entries: seg.entries.filter(e => e.id !== id) });
              const updateEntry = (id: string, updates: Partial<CustomerSegmentEntry>) => {
                updateSeg({ ...seg, entries: seg.entries.map(e => e.id === id ? { ...e, ...updates } : e) });
              };
              return (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{t("saCustSegEntries")}</Label>
                    {!readonly && <Button variant="outline" size="sm" onClick={addEntry} className="gap-1"><Plus className="h-3.5 w-3.5" /> {t("saCustSegAdd")}</Button>}
                  </div>
                  {seg.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("saCustSegNoEntries")}</p>
                  ) : (
                    seg.entries.map(entry => (
                      <div key={entry.id} className="rounded-lg border border-border p-4 bg-card space-y-3">
                        <div className="flex items-center gap-3">
                          <Input value={entry.name} onChange={e => updateEntry(entry.id, { name: e.target.value })} placeholder={t("saCustSegName")} disabled={readonly} className="flex-1 font-medium" />
                          <Select value={entry.priority} onValueChange={v => updateEntry(entry.id, { priority: v as "high" | "medium" | "low" })} disabled={readonly}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">🔴 {t("sfPriorityHigh")}</SelectItem>
                              <SelectItem value="medium">🟡 {t("sfPriorityMedium")}</SelectItem>
                              <SelectItem value="low">🟢 {t("sfPriorityLow")}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div><Label className="text-xs">{t("saCustSegSize")}</Label><Input value={entry.size} onChange={e => updateEntry(entry.id, { size: e.target.value })} placeholder={t("saCustSegSizePlaceholder")} disabled={readonly} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCustSegNeeds")}</Label><Textarea value={entry.needs} onChange={e => updateEntry(entry.id, { needs: e.target.value })} placeholder={t("saCustSegNeedsPlaceholder")} disabled={readonly} rows={2} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCustSegWtp")}</Label><Textarea value={entry.willingnessToPay} onChange={e => updateEntry(entry.id, { willingnessToPay: e.target.value })} placeholder={t("saCustSegWtpPlaceholder")} disabled={readonly} rows={2} className="mt-1" /></div>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={seg.description} onChange={e => updateSeg({ ...seg, description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={seg.rationale} onChange={e => updateSeg({ ...seg, rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Competitor Analysis */}
      <TabsContent value="compAnalysis">
        <Card>
          <CardHeader><CardTitle>{t("saCompAnalysis")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const comp = data.competitorAnalysis || { entries: [], description: "", rationale: "" };
              const updateComp = (updated: typeof comp) => update({ ...data, competitorAnalysis: updated });
              const addEntry = () => {
                updateComp({ ...comp, entries: [...comp.entries, { id: crypto.randomUUID(), name: "", strengths: "", weaknesses: "", marketShare: "", strategy: "", threatLevel: 3 }] });
              };
              const removeEntry = (id: string) => updateComp({ ...comp, entries: comp.entries.filter(e => e.id !== id) });
              const updateEntry = (id: string, updates: Partial<CompetitorAnalysisEntry>) => {
                updateComp({ ...comp, entries: comp.entries.map(e => e.id === id ? { ...e, ...updates } : e) });
              };
              return (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{t("saCompEntries")}</Label>
                    {!readonly && <Button variant="outline" size="sm" onClick={addEntry} className="gap-1"><Plus className="h-3.5 w-3.5" /> {t("saCompAdd")}</Button>}
                  </div>
                  {comp.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("saCompNoEntries")}</p>
                  ) : (
                    comp.entries.map(entry => (
                      <div key={entry.id} className="rounded-lg border border-border p-4 bg-card space-y-3">
                        <div className="flex items-center gap-3">
                          <Input value={entry.name} onChange={e => updateEntry(entry.id, { name: e.target.value })} placeholder={t("saCompName")} disabled={readonly} className="flex-1 font-medium" />
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{t("saCompThreat")}:</span>
                            <Slider min={1} max={5} step={1} value={[entry.threatLevel]} onValueChange={([v]) => updateEntry(entry.id, { threatLevel: v })} disabled={readonly} className="w-24" />
                            <span className={`text-xs font-bold ${entry.threatLevel <= 2 ? "text-green-600" : entry.threatLevel <= 3 ? "text-yellow-600" : "text-red-600"}`}>{entry.threatLevel}/5</span>
                          </div>
                          {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><Label className="text-xs">{t("saCompStrengths")}</Label><Textarea value={entry.strengths} onChange={e => updateEntry(entry.id, { strengths: e.target.value })} placeholder={t("saCompStrengthsPlaceholder")} disabled={readonly} rows={2} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCompWeaknesses")}</Label><Textarea value={entry.weaknesses} onChange={e => updateEntry(entry.id, { weaknesses: e.target.value })} placeholder={t("saCompWeaknessesPlaceholder")} disabled={readonly} rows={2} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCompMarketShare")}</Label><Input value={entry.marketShare} onChange={e => updateEntry(entry.id, { marketShare: e.target.value })} placeholder={t("saCompMarketSharePlaceholder")} disabled={readonly} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCompStrategy")}</Label><Textarea value={entry.strategy} onChange={e => updateEntry(entry.id, { strategy: e.target.value })} placeholder={t("saCompStrategyPlaceholder")} disabled={readonly} rows={2} className="mt-1" /></div>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={comp.description} onChange={e => updateComp({ ...comp, description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={comp.rationale} onChange={e => updateComp({ ...comp, rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Customer Interviewing */}
      <TabsContent value="custInt">
        <Card>
          <CardHeader><CardTitle>{t("saCustInt")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const ci = data.customerInterviewing || { entries: [], description: "", rationale: "" };
              const updateCi = (updated: typeof ci) => update({ ...data, customerInterviewing: updated });
              const addEntry = () => {
                updateCi({ ...ci, entries: [...ci.entries, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), customerName: "", role: "", keyInsights: "", painPoints: "", quotes: "" }] });
              };
              const removeEntry = (id: string) => updateCi({ ...ci, entries: ci.entries.filter(e => e.id !== id) });
              const updateEntry = (id: string, updates: Partial<CustomerInterviewEntry>) => {
                updateCi({ ...ci, entries: ci.entries.map(e => e.id === id ? { ...e, ...updates } : e) });
              };
              return (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{t("saCustIntEntries")} ({ci.entries.length})</Label>
                    {!readonly && <Button variant="outline" size="sm" onClick={addEntry} className="gap-1"><Plus className="h-3.5 w-3.5" /> {t("saCustIntAdd")}</Button>}
                  </div>
                  {ci.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("saCustIntNoEntries")}</p>
                  ) : (
                    ci.entries.map(entry => (
                      <div key={entry.id} className="rounded-lg border border-border p-4 bg-card space-y-3">
                        <div className="flex items-center gap-3">
                          <Input type="date" value={entry.date} onChange={e => updateEntry(entry.id, { date: e.target.value })} disabled={readonly} className="w-40" />
                          <Input value={entry.customerName} onChange={e => updateEntry(entry.id, { customerName: e.target.value })} placeholder={t("saCustIntCustomer")} disabled={readonly} className="flex-1 font-medium" />
                          <Input value={entry.role} onChange={e => updateEntry(entry.id, { role: e.target.value })} placeholder={t("saCustIntRolePlaceholder")} disabled={readonly} className="w-48" />
                          {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div><Label className="text-xs">{t("saCustIntInsights")}</Label><Textarea value={entry.keyInsights} onChange={e => updateEntry(entry.id, { keyInsights: e.target.value })} placeholder={t("saCustIntInsightsPlaceholder")} disabled={readonly} rows={3} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCustIntPainPoints")}</Label><Textarea value={entry.painPoints} onChange={e => updateEntry(entry.id, { painPoints: e.target.value })} placeholder={t("saCustIntPainPointsPlaceholder")} disabled={readonly} rows={3} className="mt-1" /></div>
                          <div><Label className="text-xs">{t("saCustIntQuotes")}</Label><Textarea value={entry.quotes} onChange={e => updateEntry(entry.id, { quotes: e.target.value })} placeholder={t("saCustIntQuotesPlaceholder")} disabled={readonly} rows={3} className="mt-1" /></div>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={ci.description} onChange={e => updateCi({ ...ci, description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={ci.rationale} onChange={e => updateCi({ ...ci, rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Business Modelling (Canvas) */}
      <TabsContent value="bizModel">
        <Card>
          <CardHeader><CardTitle>{t("saBizModel")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const bm: BusinessModelCanvas = data.businessModelling || {
                valueProposition: "", customerSegments: "", channels: "", customerRelationships: "",
                revenueStreams: "", keyResources: "", keyActivities: "", keyPartners: "", costStructure: "",
                description: "", rationale: "",
              };
              const updateBm = (updates: Partial<BusinessModelCanvas>) => update({ ...data, businessModelling: { ...bm, ...updates } });

              const canvasItems: { key: keyof BusinessModelCanvas; label: string; placeholder: string; color: string }[] = [
                { key: "valueProposition", label: "saBizValueProp", placeholder: "saBizValuePropPlaceholder", color: "bg-primary/10 border-primary/30" },
                { key: "customerSegments", label: "saBizCustSeg", placeholder: "saBizCustSegPlaceholder", color: "bg-blue-500/10 border-blue-500/30" },
                { key: "channels", label: "saBizChannels", placeholder: "saBizChannelsPlaceholder", color: "bg-green-500/10 border-green-500/30" },
                { key: "customerRelationships", label: "saBizCustRel", placeholder: "saBizCustRelPlaceholder", color: "bg-yellow-500/10 border-yellow-500/30" },
                { key: "revenueStreams", label: "saBizRevenue", placeholder: "saBizRevenuePlaceholder", color: "bg-emerald-500/10 border-emerald-500/30" },
                { key: "keyResources", label: "saBizKeyRes", placeholder: "saBizKeyResPlaceholder", color: "bg-violet-500/10 border-violet-500/30" },
                { key: "keyActivities", label: "saBizKeyAct", placeholder: "saBizKeyActPlaceholder", color: "bg-orange-500/10 border-orange-500/30" },
                { key: "keyPartners", label: "saBizKeyPart", placeholder: "saBizKeyPartPlaceholder", color: "bg-pink-500/10 border-pink-500/30" },
                { key: "costStructure", label: "saBizCostStr", placeholder: "saBizCostStrPlaceholder", color: "bg-red-500/10 border-red-500/30" },
              ];

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {canvasItems.map(({ key, label, placeholder, color }) => (
                      <div key={key} className={`rounded-lg border p-4 ${color}`}>
                        <Label className="text-sm font-semibold">{t(label as any)}</Label>
                        <Textarea
                          className="mt-2 bg-background"
                          value={bm[key]}
                          onChange={e => updateBm({ [key]: e.target.value })}
                          placeholder={t(placeholder as any)}
                          disabled={readonly}
                          rows={4}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={bm.description} onChange={e => updateBm({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={bm.rationale} onChange={e => updateBm({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Lean Canvas */}
      <TabsContent value="leanCanvas">
        <Card>
          <CardHeader><CardTitle>{t("saLeanCanvas")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const lc: LeanCanvas = data.leanCanvas || {
                problem: "", solution: "", uniqueValueProposition: "", unfairAdvantage: "",
                customerSegments: "", keyMetrics: "", channels: "", costStructure: "", revenueStreams: "",
                description: "", rationale: "",
              };
              const updateLc = (updates: Partial<LeanCanvas>) => update({ ...data, leanCanvas: { ...lc, ...updates } });

              const canvasItems: { key: keyof LeanCanvas; label: string; placeholder: string; color: string }[] = [
                { key: "problem", label: "saLcProblem", placeholder: "saLcProblemPlaceholder", color: "bg-red-500/10 border-red-500/30" },
                { key: "solution", label: "saLcSolution", placeholder: "saLcSolutionPlaceholder", color: "bg-green-500/10 border-green-500/30" },
                { key: "uniqueValueProposition", label: "saLcUvp", placeholder: "saLcUvpPlaceholder", color: "bg-primary/10 border-primary/30" },
                { key: "unfairAdvantage", label: "saLcUnfairAdv", placeholder: "saLcUnfairAdvPlaceholder", color: "bg-violet-500/10 border-violet-500/30" },
                { key: "customerSegments", label: "saLcCustSeg", placeholder: "saLcCustSegPlaceholder", color: "bg-blue-500/10 border-blue-500/30" },
                { key: "keyMetrics", label: "saLcKeyMetrics", placeholder: "saLcKeyMetricsPlaceholder", color: "bg-yellow-500/10 border-yellow-500/30" },
                { key: "channels", label: "saLcChannels", placeholder: "saLcChannelsPlaceholder", color: "bg-orange-500/10 border-orange-500/30" },
                { key: "costStructure", label: "saLcCostStr", placeholder: "saLcCostStrPlaceholder", color: "bg-pink-500/10 border-pink-500/30" },
                { key: "revenueStreams", label: "saLcRevenue", placeholder: "saLcRevenuePlaceholder", color: "bg-emerald-500/10 border-emerald-500/30" },
              ];

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {canvasItems.map(({ key, label, placeholder, color }) => (
                      <div key={key} className={`rounded-lg border p-4 ${color}`}>
                        <Label className="text-sm font-semibold">{t(label as any)}</Label>
                        <Textarea
                          className="mt-2 bg-background"
                          value={lc[key]}
                          onChange={e => updateLc({ [key]: e.target.value })}
                          placeholder={t(placeholder as any)}
                          disabled={readonly}
                          rows={4}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={lc.description} onChange={e => updateLc({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={lc.rationale} onChange={e => updateLc({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Value Proposition Canvas */}
      <TabsContent value="vpc">
        <Card>
          <CardHeader><CardTitle>{t("saVpc")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const vpc: ValuePropositionCanvas = data.valuePropositionCanvas || {
                customerJobs: "", customerPains: "", customerGains: "",
                productsServices: "", painRelievers: "", gainCreators: "",
                description: "", rationale: "",
              };
              const updateVpc = (updates: Partial<ValuePropositionCanvas>) => update({ ...data, valuePropositionCanvas: { ...vpc, ...updates } });

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer side */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">👤 Customer Profile</h4>
                      {([
                        { key: "customerJobs" as const, label: "saVpcCustJobs", placeholder: "saVpcCustJobsPlaceholder", color: "bg-blue-500/10 border-blue-500/30" },
                        { key: "customerPains" as const, label: "saVpcCustPains", placeholder: "saVpcCustPainsPlaceholder", color: "bg-red-500/10 border-red-500/30" },
                        { key: "customerGains" as const, label: "saVpcCustGains", placeholder: "saVpcCustGainsPlaceholder", color: "bg-green-500/10 border-green-500/30" },
                      ]).map(({ key, label, placeholder, color }) => (
                        <div key={key} className={`rounded-lg border p-4 ${color}`}>
                          <Label className="text-sm font-semibold">{t(label as any)}</Label>
                          <Textarea className="mt-2 bg-background" value={vpc[key]} onChange={e => updateVpc({ [key]: e.target.value })} placeholder={t(placeholder as any)} disabled={readonly} rows={4} />
                        </div>
                      ))}
                    </div>
                    {/* Value Map side */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">📦 Value Map</h4>
                      {([
                        { key: "productsServices" as const, label: "saVpcProducts", placeholder: "saVpcProductsPlaceholder", color: "bg-violet-500/10 border-violet-500/30" },
                        { key: "painRelievers" as const, label: "saVpcPainRelievers", placeholder: "saVpcPainRelieversPlaceholder", color: "bg-orange-500/10 border-orange-500/30" },
                        { key: "gainCreators" as const, label: "saVpcGainCreators", placeholder: "saVpcGainCreatorsPlaceholder", color: "bg-emerald-500/10 border-emerald-500/30" },
                      ]).map(({ key, label, placeholder, color }) => (
                        <div key={key} className={`rounded-lg border p-4 ${color}`}>
                          <Label className="text-sm font-semibold">{t(label as any)}</Label>
                          <Textarea className="mt-2 bg-background" value={vpc[key]} onChange={e => updateVpc({ [key]: e.target.value })} placeholder={t(placeholder as any)} disabled={readonly} rows={4} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={vpc.description} onChange={e => updateVpc({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={vpc.rationale} onChange={e => updateVpc({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Customer Benefit Analysis */}
      <TabsContent value="cba">
        <Card>
          <CardHeader><CardTitle>{t("saCba")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const cba: CustomerBenefitAnalysis = data.customerBenefitAnalysis || {
                functionalBenefits: "", emotionalBenefits: "", socialBenefits: "", selfExpressiveBenefits: "",
                description: "", rationale: "",
              };
              const updateCba = (updates: Partial<CustomerBenefitAnalysis>) => update({ ...data, customerBenefitAnalysis: { ...cba, ...updates } });

              const items: { key: keyof CustomerBenefitAnalysis; label: string; placeholder: string; color: string; icon: string }[] = [
                { key: "functionalBenefits", label: "saCbaFunctional", placeholder: "saCbaFunctionalPlaceholder", color: "bg-blue-500/10 border-blue-500/30", icon: "⚙️" },
                { key: "emotionalBenefits", label: "saCbaEmotional", placeholder: "saCbaEmotionalPlaceholder", color: "bg-pink-500/10 border-pink-500/30", icon: "❤️" },
                { key: "socialBenefits", label: "saCbaSocial", placeholder: "saCbaSocialPlaceholder", color: "bg-yellow-500/10 border-yellow-500/30", icon: "👥" },
                { key: "selfExpressiveBenefits", label: "saCbaSelfExpressive", placeholder: "saCbaSelfExpressivePlaceholder", color: "bg-violet-500/10 border-violet-500/30", icon: "✨" },
              ];

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(({ key, label, placeholder, color, icon }) => (
                      <div key={key} className={`rounded-lg border p-4 ${color}`}>
                        <Label className="text-sm font-semibold">{icon} {t(label as any)}</Label>
                        <Textarea className="mt-2 bg-background" value={cba[key]} onChange={e => updateCba({ [key]: e.target.value })} placeholder={t(placeholder as any)} disabled={readonly} rows={4} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={cba.description} onChange={e => updateCba({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={cba.rationale} onChange={e => updateCba({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Three Circle Model */}
      <TabsContent value="tcm">
        <Card>
          <CardHeader><CardTitle>{t("saTcm")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const tcm: ThreeCircleModel = data.threeCircleModel || {
                ourValue: "", competitorValue: "", customerNeeds: "",
                ourUnique: "", theirUnique: "", commonValue: "", unmetNeeds: "",
                description: "", rationale: "",
              };
              const updateTcm = (updates: Partial<ThreeCircleModel>) => update({ ...data, threeCircleModel: { ...tcm, ...updates } });

              return (
                <>
                  {/* Three circles description */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border p-4 bg-blue-500/10 border-blue-500/30">
                      <Label className="text-sm font-semibold">🔵 {t("saTcmOurValue" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.ourValue} onChange={e => updateTcm({ ourValue: e.target.value })} placeholder={t("saTcmOurValuePlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                    <div className="rounded-lg border p-4 bg-red-500/10 border-red-500/30">
                      <Label className="text-sm font-semibold">🔴 {t("saTcmCompValue" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.competitorValue} onChange={e => updateTcm({ competitorValue: e.target.value })} placeholder={t("saTcmCompValuePlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                    <div className="rounded-lg border p-4 bg-green-500/10 border-green-500/30">
                      <Label className="text-sm font-semibold">🟢 {t("saTcmCustNeeds" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.customerNeeds} onChange={e => updateTcm({ customerNeeds: e.target.value })} placeholder={t("saTcmCustNeedsPlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                  </div>
                  {/* Intersections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border p-4 bg-primary/10 border-primary/30">
                      <Label className="text-sm font-semibold">🎯 {t("saTcmOurUnique" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.ourUnique} onChange={e => updateTcm({ ourUnique: e.target.value })} placeholder={t("saTcmOurUniquePlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                    <div className="rounded-lg border p-4 bg-orange-500/10 border-orange-500/30">
                      <Label className="text-sm font-semibold">⚠️ {t("saTcmTheirUnique" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.theirUnique} onChange={e => updateTcm({ theirUnique: e.target.value })} placeholder={t("saTcmTheirUniquePlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                    <div className="rounded-lg border p-4 bg-yellow-500/10 border-yellow-500/30">
                      <Label className="text-sm font-semibold">🤝 {t("saTcmCommon" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.commonValue} onChange={e => updateTcm({ commonValue: e.target.value })} placeholder={t("saTcmCommonPlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                    <div className="rounded-lg border p-4 bg-violet-500/10 border-violet-500/30">
                      <Label className="text-sm font-semibold">💡 {t("saTcmUnmet" as any)}</Label>
                      <Textarea className="mt-2 bg-background" value={tcm.unmetNeeds} onChange={e => updateTcm({ unmetNeeds: e.target.value })} placeholder={t("saTcmUnmetPlaceholder" as any)} disabled={readonly} rows={3} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={tcm.description} onChange={e => updateTcm({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={tcm.rationale} onChange={e => updateTcm({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Positioning Statement */}
      <TabsContent value="positioning">
        <Card>
          <CardHeader><CardTitle>{t("saPos")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const pos: PositioningStatement = data.positioningStatement || {
                targetAudience: "", category: "", keyBenefit: "", reasonToBelieve: "",
                competitiveAlternative: "", differentiator: "", statement: "",
                description: "", rationale: "",
              };
              const updatePos = (updates: Partial<PositioningStatement>) => update({ ...data, positioningStatement: { ...pos, ...updates } });

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>{t("saPosTarget" as any)}</Label>
                      <Textarea className="mt-1" value={pos.targetAudience} onChange={e => updatePos({ targetAudience: e.target.value })} placeholder={t("saPosTargetPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                    <div>
                      <Label>{t("saPosCategory" as any)}</Label>
                      <Textarea className="mt-1" value={pos.category} onChange={e => updatePos({ category: e.target.value })} placeholder={t("saPosCategoryPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                    <div>
                      <Label>{t("saPosKeyBenefit" as any)}</Label>
                      <Textarea className="mt-1" value={pos.keyBenefit} onChange={e => updatePos({ keyBenefit: e.target.value })} placeholder={t("saPosKeyBenefitPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                    <div>
                      <Label>{t("saPosRtb" as any)}</Label>
                      <Textarea className="mt-1" value={pos.reasonToBelieve} onChange={e => updatePos({ reasonToBelieve: e.target.value })} placeholder={t("saPosRtbPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                    <div>
                      <Label>{t("saPosCompAlt" as any)}</Label>
                      <Textarea className="mt-1" value={pos.competitiveAlternative} onChange={e => updatePos({ competitiveAlternative: e.target.value })} placeholder={t("saPosCompAltPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                    <div>
                      <Label>{t("saPosDiff" as any)}</Label>
                      <Textarea className="mt-1" value={pos.differentiator} onChange={e => updatePos({ differentiator: e.target.value })} placeholder={t("saPosDiffPlaceholder" as any)} disabled={readonly} rows={2} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <Label className="text-sm font-semibold">{t("saPosStatement" as any)}</Label>
                    <Textarea className="mt-2 bg-background" value={pos.statement} onChange={e => updatePos({ statement: e.target.value })} placeholder={t("saPosStatementPlaceholder" as any)} disabled={readonly} rows={4} />
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={pos.description} onChange={e => updatePos({ description: e.target.value })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={pos.rationale} onChange={e => updatePos({ rationale: e.target.value })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>
      {/* Three Horizons of Growth */}
      <TabsContent value="threeHorizons">
        <Card>
          <CardHeader><CardTitle>{t("saThreeHorizons" as any)}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const th = data.threeHorizons || { horizon: "", description: "", rationale: "" };
              const horizons = [
                { value: "horizon1", label: t("saHorizon1" as any), desc: t("saHorizon1Desc" as any), color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40" },
                { value: "horizon2", label: t("saHorizon2" as any), desc: t("saHorizon2Desc" as any), color: "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40" },
                { value: "horizon3", label: t("saHorizon3" as any), desc: t("saHorizon3Desc" as any), color: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40" },
              ];
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    {horizons.map((h) => (
                      <button
                        key={h.value}
                        type="button"
                        disabled={readonly}
                        onClick={() => update({ ...data, threeHorizons: { ...th, horizon: h.value } })}
                        className={`p-4 rounded-md border text-left transition-colors ${th.horizon === h.value ? "ring-2 ring-primary bg-primary/20 text-foreground border-primary" : `${h.color} text-muted-foreground`}`}
                      >
                        <div className="text-sm font-semibold mb-1">{h.label}</div>
                        <div className="text-xs">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={th.description} onChange={e => update({ ...data, threeHorizons: { ...th, description: e.target.value } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={th.rationale} onChange={e => update({ ...data, threeHorizons: { ...th, rationale: e.target.value } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
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
