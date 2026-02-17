import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring, RiskItem } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, Trash2, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const CATEGORY_COLORS: Record<RiskItem["category"], string> = {
  market: "bg-blue-500",
  technical: "bg-purple-500",
  regulatory: "bg-orange-500",
  execution: "bg-cyan-500",
  financial: "bg-pink-500",
};

const CATEGORY_BORDER: Record<RiskItem["category"], string> = {
  market: "border-blue-400",
  technical: "border-purple-400",
  regulatory: "border-orange-400",
  execution: "border-cyan-400",
  financial: "border-pink-400",
};

export function RiskTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState({
    ...scoring.risk,
    riskItems: scoring.risk.riskItems ?? [],
  });
  const [dirty, setDirty] = useState(false);

  const updateField = <K extends keyof typeof local>(field: K, value: typeof local[K]) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, risk: local });
    setDirty(false);
  };

  const addRiskItem = () => {
    const item: RiskItem = {
      id: `ri-${Date.now()}`,
      name: "",
      category: "technical",
      probability: 3,
      impact: 3,
      mitigation: "",
    };
    updateField("riskItems", [...local.riskItems, item]);
  };

  const updateRiskItem = (index: number, updates: Partial<RiskItem>) => {
    const items = [...local.riskItems];
    items[index] = { ...items[index], ...updates };
    updateField("riskItems", items);
  };

  const removeRiskItem = (index: number) => {
    updateField("riskItems", local.riskItems.filter((_, i) => i !== index));
  };

  const isRisk = true;
  const getScoreColor = (s: number) => {
    const effective = 6 - s;
    if (effective >= 4) return "bg-green-500";
    if (effective >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    const effective = 6 - s;
    if (effective >= 4) return t("scoreHigh");
    if (effective >= 3) return t("scoreMedium");
    return t("scoreLow");
  };

  // Risk matrix: 5×5 grid, probability (y) × impact (x)
  // Color zones: green (low), yellow (medium), red (high)
  const getCellColor = (prob: number, impact: number) => {
    const riskLevel = prob * impact;
    if (riskLevel >= 15) return "bg-red-500/20 dark:bg-red-500/30 border-red-300 dark:border-red-700";
    if (riskLevel >= 8) return "bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-300 dark:border-yellow-700";
    return "bg-green-500/20 dark:bg-green-500/30 border-green-300 dark:border-green-700";
  };

  const getCellTextColor = (prob: number, impact: number) => {
    const riskLevel = prob * impact;
    if (riskLevel >= 15) return "text-red-700 dark:text-red-300";
    if (riskLevel >= 8) return "text-yellow-700 dark:text-yellow-300";
    return "text-green-700 dark:text-green-300";
  };

  // Find risk items in each cell
  const getItemsInCell = (prob: number, impact: number) =>
    local.riskItems.filter((r) => r.probability === prob && r.impact === impact);

  // Summary stats
  const highRisks = local.riskItems.filter((r) => r.probability * r.impact >= 15).length;
  const medRisks = local.riskItems.filter((r) => r.probability * r.impact >= 8 && r.probability * r.impact < 15).length;
  const lowRisks = local.riskItems.filter((r) => r.probability * r.impact < 8).length;

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">
                {t("risk")}
                <span className="ml-2 text-sm font-normal text-muted-foreground">{t("riskNote")}</span>
              </h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(local.score)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                disabled={readonly}
                onClick={() => updateField("score", val)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  local.score === val
                    ? "bg-primary text-primary-foreground shadow-md scale-110"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                } ${readonly ? "cursor-default" : "cursor-pointer"}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Summary KPIs */}
      {local.riskItems.length > 0 && (
        <div className="grid gap-3 grid-cols-3">
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highRisks}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("riHigh")}</p>
          </div>
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{medRisks}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("riMedium")}</p>
          </div>
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{lowRisks}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("riLow")}</p>
          </div>
        </div>
      )}

      {/* Risk Matrix */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-4">
        <h4 className="font-semibold text-card-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          {t("riMatrix")}
        </h4>

        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Column header: Impact */}
              <div className="flex items-end mb-1 pl-24">
                <div className="flex-1 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("riImpact")} →
                </div>
              </div>
              <div className="flex items-end mb-1 pl-24">
                {[1, 2, 3, 4, 5].map((impact) => (
                  <div key={impact} className="flex-1 text-center text-xs text-muted-foreground font-medium">
                    {impact}
                  </div>
                ))}
              </div>

              {/* Matrix rows: probability 5 (top) to 1 (bottom) */}
              <div className="flex">
                {/* Row label */}
                <div className="w-24 flex flex-col items-center justify-center mr-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider writing-mode-vertical"
                    style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
                    {t("riProbability")} →
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((prob) => (
                    <div key={prob} className="flex gap-1">
                      <div className="w-6 flex items-center justify-center text-xs text-muted-foreground font-medium">
                        {prob}
                      </div>
                      {[1, 2, 3, 4, 5].map((impact) => {
                        const items = getItemsInCell(prob, impact);
                        return (
                          <div
                            key={`${prob}-${impact}`}
                            className={`flex-1 min-h-[48px] rounded-md border ${getCellColor(prob, impact)} flex items-center justify-center flex-wrap gap-1 p-1 transition-all`}
                          >
                            {items.map((item) => (
                              <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 ${CATEGORY_COLORS[item.category]} cursor-pointer flex items-center justify-center`}
                                  >
                                    <span className="text-[8px] font-bold text-white">
                                      {item.name.charAt(0).toUpperCase() || "?"}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="font-semibold">{item.name || "Unnamed"}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {t("riProbability")}: {item.probability} | {t("riImpact")}: {item.impact} | Score: {item.probability * item.impact}
                                  </p>
                                  {item.mitigation && (
                                    <p className="text-xs mt-1">{item.mitigation}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {items.length === 0 && (
                              <span className={`text-[10px] font-medium ${getCellTextColor(prob, impact)} opacity-50`}>
                                {prob * impact}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 justify-center flex-wrap text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500/30 border border-green-400" />
                  <span>{t("riLow")} (1-7)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-400" />
                  <span>{t("riMedium")} (8-14)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500/30 border border-red-400" />
                  <span>{t("riHigh")} (15-25)</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Risk Items List */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {t("riItems")}
          </h4>
          {!readonly && (
            <Button variant="outline" size="sm" onClick={addRiskItem}>
              <Plus className="h-4 w-4 mr-1" />
              {t("riAddItem")}
            </Button>
          )}
        </div>

        {local.riskItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("riNoItems")}</p>
        ) : (
          <div className="space-y-4">
            {local.riskItems.map((item, i) => {
              const riskScore = item.probability * item.impact;
              const riskColor = riskScore >= 15 ? "border-red-300 dark:border-red-700" : riskScore >= 8 ? "border-yellow-300 dark:border-yellow-700" : "border-green-300 dark:border-green-700";
              return (
                <div key={item.id} className={`rounded-lg border-2 ${riskColor} bg-card/50 p-4 space-y-3`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${CATEGORY_COLORS[item.category]}`} />
                      <Input
                        value={item.name}
                        onChange={(e) => updateRiskItem(i, { name: e.target.value })}
                        disabled={readonly}
                        placeholder={t("riItemName")}
                        className="h-8 text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                        riskScore >= 15 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                        riskScore >= 8 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      }`}>
                        {riskScore}
                      </span>
                      {!readonly && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRiskItem(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateRiskItem(i, { category: v as RiskItem["category"] })}
                      disabled={readonly}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">{t("riCatMarket")}</SelectItem>
                        <SelectItem value="technical">{t("riCatTechnical")}</SelectItem>
                        <SelectItem value="regulatory">{t("riCatRegulatory")}</SelectItem>
                        <SelectItem value="execution">{t("riCatExecution")}</SelectItem>
                        <SelectItem value="financial">{t("riCatFinancial")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t("riProbability")}:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            disabled={readonly}
                            onClick={() => updateRiskItem(i, { probability: v })}
                            className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                              item.probability === v
                                ? "bg-primary text-primary-foreground scale-110"
                                : "bg-secondary text-secondary-foreground hover:bg-accent"
                            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t("riImpact")}:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            disabled={readonly}
                            onClick={() => updateRiskItem(i, { impact: v })}
                            className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                              item.impact === v
                                ? "bg-primary text-primary-foreground scale-110"
                                : "bg-secondary text-secondary-foreground hover:bg-accent"
                            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Textarea
                    value={item.mitigation}
                    onChange={(e) => updateRiskItem(i, { mitigation: e.target.value })}
                    disabled={readonly}
                    rows={2}
                    className="text-xs resize-none"
                    placeholder={t("riMitigationPlaceholder")}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          {t("assessmentGuidance")}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(["guidance_ri_1", "guidance_ri_2", "guidance_ri_3"] as TranslationKey[]).map((key) => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      {/* Details Text */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h4 className="font-semibold text-card-foreground">{t("detailedAnalysis")}</h4>
        <Textarea
          value={local.details}
          onChange={(e) => updateField("details", e.target.value)}
          disabled={readonly}
          rows={6}
          className="text-sm resize-none"
          placeholder={t("detailedAnalysisPlaceholder")}
        />
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
