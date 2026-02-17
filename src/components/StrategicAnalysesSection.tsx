import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    </Tabs>
  );
}
