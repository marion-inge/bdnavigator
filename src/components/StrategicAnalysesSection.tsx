import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, PortersFiveForces, PorterForce, IndustryValueChain, ValueChainActivity, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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
              const defaultActivity = (): ValueChainActivity => ({ relevance: 3, description: "" });
              const vc: IndustryValueChain = data.valueChain || {
                primaryActivities: {
                  inboundLogistics: defaultActivity(), operations: defaultActivity(),
                  outboundLogistics: defaultActivity(), marketingSales: defaultActivity(), service: defaultActivity(),
                },
                supportActivities: {
                  firmInfrastructure: defaultActivity(), hrManagement: defaultActivity(),
                  technologyDevelopment: defaultActivity(), procurement: defaultActivity(),
                },
                description: "", rationale: "",
              };

              const updateVc = (updated: IndustryValueChain) => update({ ...data, valueChain: updated });

              const primaryItems: { key: keyof IndustryValueChain["primaryActivities"]; label: string; icon: string }[] = [
                { key: "inboundLogistics", label: "saVcInboundLogistics", icon: "📦" },
                { key: "operations", label: "saVcOperations", icon: "🏭" },
                { key: "outboundLogistics", label: "saVcOutboundLogistics", icon: "🚚" },
                { key: "marketingSales", label: "saVcMarketingSales", icon: "📢" },
                { key: "service", label: "saVcService", icon: "🛠️" },
              ];

              const supportItems: { key: keyof IndustryValueChain["supportActivities"]; label: string; icon: string }[] = [
                { key: "firmInfrastructure", label: "saVcFirmInfrastructure", icon: "🏢" },
                { key: "hrManagement", label: "saVcHrManagement", icon: "👥" },
                { key: "technologyDevelopment", label: "saVcTechnologyDev", icon: "💡" },
                { key: "procurement", label: "saVcProcurement", icon: "🛒" },
              ];

              return (
                <>
                  {/* Visual Value Chain Arrow */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">{t("saVcPrimary")}</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {primaryItems.map(({ key, label, icon }, i) => {
                        const activity = vc.primaryActivities[key];
                        const relColor = activity.relevance <= 2 ? "border-muted" : activity.relevance <= 3 ? "border-yellow-500/50" : "border-green-500/50";
                        return (
                          <div key={key} className="flex-1 flex items-stretch">
                            <div className={`flex-1 rounded-lg border-2 ${relColor} p-3 bg-card space-y-2`}>
                              <div className="text-center text-sm font-medium">{icon} {t(label as any)}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{t("saVcRelevance")}:</span>
                                <Slider min={1} max={5} step={1} value={[activity.relevance]}
                                  onValueChange={([v]) => updateVc({ ...vc, primaryActivities: { ...vc.primaryActivities, [key]: { ...activity, relevance: v } } })}
                                  disabled={readonly} className="flex-1" />
                                <span className="text-xs font-bold w-5 text-right">{activity.relevance}</span>
                              </div>
                              <Textarea value={activity.description}
                                onChange={(e) => updateVc({ ...vc, primaryActivities: { ...vc.primaryActivities, [key]: { ...activity, description: e.target.value } } })}
                                placeholder={`${t(label as any)}...`} disabled={readonly} rows={2} className="text-xs" />
                            </div>
                            {i < primaryItems.length - 1 && (
                              <div className="hidden sm:flex items-center px-1 text-muted-foreground text-lg">→</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">{t("saVcSupport")}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {supportItems.map(({ key, label, icon }) => {
                        const activity = vc.supportActivities[key];
                        const relColor = activity.relevance <= 2 ? "border-muted" : activity.relevance <= 3 ? "border-yellow-500/50" : "border-green-500/50";
                        return (
                          <div key={key} className={`rounded-lg border-2 ${relColor} p-3 bg-card space-y-2`}>
                            <div className="text-sm font-medium">{icon} {t(label as any)}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{t("saVcRelevance")}:</span>
                              <Slider min={1} max={5} step={1} value={[activity.relevance]}
                                onValueChange={([v]) => updateVc({ ...vc, supportActivities: { ...vc.supportActivities, [key]: { ...activity, relevance: v } } })}
                                disabled={readonly} className="flex-1" />
                              <span className="text-xs font-bold w-5 text-right">{activity.relevance}</span>
                            </div>
                            <Textarea value={activity.description}
                              onChange={(e) => updateVc({ ...vc, supportActivities: { ...vc.supportActivities, [key]: { ...activity, description: e.target.value } } })}
                              placeholder={`${t(label as any)}...`} disabled={readonly} rows={2} className="text-xs" />
                          </div>
                        );
                      })}
                    </div>
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
