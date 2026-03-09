import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  strategicAnalyses?: StrategicAnalyses;
  onSave: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
  defaultTab?: string;
}

export function StrategicAnalysesSection({ strategicAnalyses, onSave, readonly: propReadonly, defaultTab }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<StrategicAnalyses>(strategicAnalyses || createDefaultStrategicAnalyses());
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const update = (updated: StrategicAnalyses) => {
    setData(updated);
    onSave(updated);
  };

  const is = data.ideaScoring;

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
    <Tabs defaultValue={defaultTab || "ansoff"} key={defaultTab} className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="ansoff" className="text-xs sm:text-sm">{t("saAnsoff")}</TabsTrigger>
        <TabsTrigger value="bcg" className="text-xs sm:text-sm">{t("saBcg")}</TabsTrigger>
        <TabsTrigger value="mckinsey" className="text-xs sm:text-sm">{t("saMckinsey")}</TabsTrigger>
        <TabsTrigger value="threeHorizons" className="text-xs sm:text-sm">{t("saThreeHorizons" as any)}</TabsTrigger>
      </TabsList>

      {/* Ansoff Matrix */}
      <TabsContent value="ansoff">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("saAnsoff")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1 max-w-lg">
                <div />
                <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saExistingProduct")}</div>
                <div className="text-center text-xs font-medium text-muted-foreground py-2">{t("saNewProduct")}</div>
                <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saExistingMarket")}</div>
                <button type="button" disabled={readonly}
                  onClick={() => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, position: "market_penetration" } } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.ansoff.position === "market_penetration" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                  {t("saAnsoffMarketPenetration")}
                </button>
                <button type="button" disabled={readonly}
                  onClick={() => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, position: "product_development" } } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.ansoff.position === "product_development" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                  {t("saAnsoffProductDevelopment")}
                </button>
                <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saNewMarket")}</div>
                <button type="button" disabled={readonly}
                  onClick={() => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, position: "market_development" } } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.ansoff.position === "market_development" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                  {t("saAnsoffMarketDevelopment")}
                </button>
                <button type="button" disabled={readonly}
                  onClick={() => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, position: "diversification" } } })}
                  className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.ansoff.position === "diversification" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                  {t("saAnsoffDiversification")}
                </button>
              </div>
              <div className="space-y-3">
                <div><Label>{t("saDescription")}</Label><Textarea value={is.ansoff.description} onChange={(e) => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, description: e.target.value } } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                <div><Label>{t("saRationale")}</Label><Textarea value={is.ansoff.rationale} onChange={(e) => update({ ...data, ideaScoring: { ...is, ansoff: { ...is.ansoff, rationale: e.target.value } } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
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
              <button type="button" disabled={readonly} onClick={() => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, position: "question_mark" } } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.bcg.position === "question_mark" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ❓ {t("saBcgQuestionMark")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, position: "star" } } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.bcg.position === "star" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                ⭐ {t("saBcgStar")}
              </button>
              <div className="text-xs font-medium text-muted-foreground flex items-center pr-2 [writing-mode:vertical-lr] rotate-180">{t("saMckLow")} {t("saMarketGrowth")}</div>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, position: "dog" } } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.bcg.position === "dog" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐕 {t("saBcgDog")}
              </button>
              <button type="button" disabled={readonly} onClick={() => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, position: "cash_cow" } } })}
                className={`p-4 rounded-md border text-sm font-medium transition-colors ${is.bcg.position === "cash_cow" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}`}>
                🐄 {t("saBcgCashCow")}
              </button>
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={is.bcg.description} onChange={(e) => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, description: e.target.value } } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={is.bcg.rationale} onChange={(e) => update({ ...data, ideaScoring: { ...is, bcg: { ...is.bcg, rationale: e.target.value } } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* McKinsey Matrix */}
      <TabsContent value="mckinsey">
        <Card>
          <CardHeader><CardTitle>{t("saMckinsey")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
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
                      high_high: "bg-green-500/20 hover:bg-green-500/30", high_medium: "bg-green-500/20 hover:bg-green-500/30", medium_high: "bg-green-500/20 hover:bg-green-500/30",
                      high_low: "bg-yellow-500/20 hover:bg-yellow-500/30", medium_medium: "bg-yellow-500/20 hover:bg-yellow-500/30", low_high: "bg-yellow-500/20 hover:bg-yellow-500/30",
                      medium_low: "bg-red-500/20 hover:bg-red-500/30", low_medium: "bg-red-500/20 hover:bg-red-500/30", low_low: "bg-red-500/20 hover:bg-red-500/30",
                    };
                    const labels: Record<string, string> = {
                      high_high: "Invest/Grow", high_medium: "Invest/Grow", medium_high: "Invest/Grow",
                      high_low: "Selectivity", medium_medium: "Selectivity", low_high: "Selectivity",
                      medium_low: "Harvest/Divest", low_medium: "Harvest/Divest", low_low: "Harvest/Divest",
                    };
                    return (
                      <button key={pos} type="button" disabled={readonly}
                        onClick={() => update({ ...data, ideaScoring: { ...is, mckinsey: { ...is.mckinsey, position: pos } } })}
                        className={`p-3 rounded-md border text-xs font-medium transition-colors ${is.mckinsey.position === pos ? "ring-2 ring-primary bg-primary/20 text-foreground border-primary" : `${colorMap[pos]} text-muted-foreground border-border`}`}>
                        {labels[pos]}
                      </button>
                    );
                  })}
                </>
              ))}
            </div>
            <div className="space-y-3">
              <div><Label>{t("saDescription")}</Label><Textarea value={is.mckinsey.description} onChange={(e) => update({ ...data, ideaScoring: { ...is, mckinsey: { ...is.mckinsey, description: e.target.value } } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
              <div><Label>{t("saRationale")}</Label><Textarea value={is.mckinsey.rationale} onChange={(e) => update({ ...data, ideaScoring: { ...is, mckinsey: { ...is.mckinsey, rationale: e.target.value } } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Three Horizons of Growth */}
      <TabsContent value="threeHorizons">
        <Card>
          <CardHeader><CardTitle>{t("saThreeHorizons" as any)}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const th = is.threeHorizons;
              const horizons = [
                { value: "horizon1", label: t("saHorizon1" as any), desc: t("saHorizon1Desc" as any), color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40" },
                { value: "horizon2", label: t("saHorizon2" as any), desc: t("saHorizon2Desc" as any), color: "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40" },
                { value: "horizon3", label: t("saHorizon3" as any), desc: t("saHorizon3Desc" as any), color: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40" },
              ];
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                    {horizons.map((h) => (
                      <button key={h.value} type="button" disabled={readonly}
                        onClick={() => update({ ...data, ideaScoring: { ...is, threeHorizons: { ...th, horizon: h.value } } })}
                        className={`p-4 rounded-md border text-left transition-colors ${th.horizon === h.value ? "ring-2 ring-primary bg-primary/20 text-foreground border-primary" : `${h.color} text-muted-foreground`}`}>
                        <div className="text-sm font-semibold mb-1">{h.label}</div>
                        <div className="text-xs">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div><Label>{t("saDescription")}</Label><Textarea value={th.description} onChange={e => update({ ...data, ideaScoring: { ...is, threeHorizons: { ...th, description: e.target.value } } })} placeholder={t("saDescPlaceholder")} disabled={readonly} /></div>
                    <div><Label>{t("saRationale")}</Label><Textarea value={th.rationale} onChange={e => update({ ...data, ideaScoring: { ...is, threeHorizons: { ...th, rationale: e.target.value } } })} placeholder={t("saRationalePlaceholder")} disabled={readonly} /></div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    </EditableSection>
  );
}
