import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring, AlignmentDimension, CapabilityGap } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crosshair, Plus, Trash2, Target, TrendingUp } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip,
} from "recharts";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const DEFAULT_DIMENSIONS: AlignmentDimension[] = [
  { key: "coreCompetency", label: "sfDimCore", current: 3, required: 4 },
  { key: "strategyAlign", label: "sfDimStrategy", current: 3, required: 4 },
  { key: "portfolioSynergy", label: "sfDimPortfolio", current: 3, required: 4 },
  { key: "customerBase", label: "sfDimCustomer", current: 3, required: 4 },
  { key: "technologyFit", label: "sfDimTech", current: 3, required: 4 },
  { key: "channelFit", label: "sfDimChannel", current: 3, required: 4 },
];

export function StrategicFitTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState({
    ...scoring.strategicFit,
    alignmentDimensions: scoring.strategicFit.alignmentDimensions?.length
      ? scoring.strategicFit.alignmentDimensions
      : DEFAULT_DIMENSIONS,
    capabilityGaps: scoring.strategicFit.capabilityGaps ?? [],
  });
  const [dirty, setDirty] = useState(false);

  const updateField = <K extends keyof typeof local>(field: K, value: typeof local[K]) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, strategicFit: local });
    setDirty(false);
  };

  const updateDimension = (index: number, updates: Partial<AlignmentDimension>) => {
    const dims = [...local.alignmentDimensions];
    dims[index] = { ...dims[index], ...updates };
    updateField("alignmentDimensions", dims);
  };

  const addGap = () => {
    const gap: CapabilityGap = {
      id: `cg-${Date.now()}`,
      capability: "",
      currentLevel: 2,
      requiredLevel: 4,
      action: "",
      priority: "medium",
    };
    updateField("capabilityGaps", [...local.capabilityGaps, gap]);
  };

  const updateGap = (index: number, updates: Partial<CapabilityGap>) => {
    const gaps = [...local.capabilityGaps];
    gaps[index] = { ...gaps[index], ...updates };
    updateField("capabilityGaps", gaps);
  };

  const removeGap = (index: number) => {
    updateField("capabilityGaps", local.capabilityGaps.filter((_, i) => i !== index));
  };

  const getScoreColor = (s: number) => {
    if (s >= 4) return "bg-green-500";
    if (s >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 4) return t("scoreHigh");
    if (s >= 3) return t("scoreMedium");
    return t("scoreLow");
  };

  // Calculate average alignment score
  const avgAlignment = local.alignmentDimensions.length > 0
    ? Math.round((local.alignmentDimensions.reduce((s, d) => s + d.current, 0) / local.alignmentDimensions.length) * 10) / 10
    : 0;
  const avgRequired = local.alignmentDimensions.length > 0
    ? Math.round((local.alignmentDimensions.reduce((s, d) => s + d.required, 0) / local.alignmentDimensions.length) * 10) / 10
    : 0;
  const alignmentGap = Math.round((avgRequired - avgAlignment) * 10) / 10;

  // Radar chart data
  const radarData = local.alignmentDimensions.map((d) => ({
    dimension: t(d.label as TranslationKey),
    [t("sfCurrent")]: d.current,
    [t("sfRequired")]: d.required,
  }));

  // Gap severity
  const getGapSeverity = (gap: number) => {
    if (gap <= 0) return { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", label: t("sfNoGap") };
    if (gap <= 1) return { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", label: t("sfSmallGap") };
    return { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", label: t("sfLargeGap") };
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    if (p === "medium") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("strategicFit")}</h3>
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

      {/* KPI Summary */}
      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <Target className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("sfAvgAlignment")}</p>
          <p className={`text-2xl font-bold mt-1 ${avgAlignment >= 4 ? "text-green-600 dark:text-green-400" : avgAlignment >= 3 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
            {avgAlignment}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("sfAvgRequired")}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{avgRequired}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <Crosshair className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("sfOverallGap")}</p>
          <p className={`text-2xl font-bold mt-1 ${alignmentGap <= 0 ? "text-green-600 dark:text-green-400" : alignmentGap <= 1 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
            {alignmentGap > 0 ? `−${alignmentGap}` : "✓"}
          </p>
        </div>
      </div>

      {/* Alignment Radar Chart */}
      <div className="rounded-lg border-2 border-border bg-card p-6">
        <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          {t("sfAlignmentRadar")}
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickCount={6}
            />
            <Radar
              name={t("sfRequired")}
              dataKey={t("sfRequired")}
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Radar
              name={t("sfCurrent")}
              dataKey={t("sfCurrent")}
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Alignment Dimensions Editor */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-4">
        <h4 className="font-semibold text-card-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          {t("sfDimensions")}
        </h4>

        <div className="space-y-3">
          {local.alignmentDimensions.map((dim, i) => {
            const gap = dim.required - dim.current;
            const severity = getGapSeverity(gap);
            return (
              <div key={dim.key} className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-card-foreground">
                    {t(dim.label as TranslationKey)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${severity.bg} ${severity.color}`}>
                    {gap > 0 ? `Gap: −${gap}` : severity.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("sfCurrent")}</label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          disabled={readonly}
                          onClick={() => updateDimension(i, { current: v })}
                          className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                            dim.current === v
                              ? "bg-primary text-primary-foreground scale-105"
                              : "bg-secondary text-secondary-foreground hover:bg-accent"
                          } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("sfRequired")}</label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          disabled={readonly}
                          onClick={() => updateDimension(i, { required: v })}
                          className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                            dim.required === v
                              ? "bg-destructive text-destructive-foreground scale-105"
                              : "bg-secondary text-secondary-foreground hover:bg-accent"
                          } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Visual gap bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                      style={{ width: `${(dim.current / 5) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-destructive"
                      style={{ width: `${(dim.required / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{dim.current}/{dim.required}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capability Gap Analysis */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("sfCapGaps")}
          </h4>
          {!readonly && (
            <Button variant="outline" size="sm" onClick={addGap}>
              <Plus className="h-4 w-4 mr-1" />
              {t("sfAddGap")}
            </Button>
          )}
        </div>

        {local.capabilityGaps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("sfNoGaps")}</p>
        ) : (
          <div className="space-y-4">
            {local.capabilityGaps.map((gap, i) => {
              const gapSize = gap.requiredLevel - gap.currentLevel;
              const severity = getGapSeverity(gapSize);
              return (
                <div key={gap.id} className={`rounded-lg border-2 ${gapSize >= 2 ? "border-red-200 dark:border-red-800" : gapSize >= 1 ? "border-yellow-200 dark:border-yellow-800" : "border-green-200 dark:border-green-800"} bg-card/50 p-4 space-y-3`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <Input
                        value={gap.capability}
                        onChange={(e) => updateGap(i, { capability: e.target.value })}
                        disabled={readonly}
                        placeholder={t("sfGapName")}
                        className="h-8 text-sm font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={gap.priority}
                        onValueChange={(v) => updateGap(i, { priority: v as CapabilityGap["priority"] })}
                        disabled={readonly}
                      >
                        <SelectTrigger className={`h-8 w-28 text-xs border ${priorityColor(gap.priority)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t("sfPriorityHigh")}</SelectItem>
                          <SelectItem value="medium">{t("sfPriorityMedium")}</SelectItem>
                          <SelectItem value="low">{t("sfPriorityLow")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${severity.bg} ${severity.color}`}>
                        {gapSize > 0 ? `−${gapSize}` : "✓"}
                      </span>
                      {!readonly && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeGap(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t("sfCurrent")}: {gap.currentLevel}</label>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            disabled={readonly}
                            onClick={() => updateGap(i, { currentLevel: v })}
                            className={`flex-1 h-7 rounded text-xs font-bold transition-all ${
                              gap.currentLevel === v
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-accent"
                            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t("sfRequired")}: {gap.requiredLevel}</label>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            disabled={readonly}
                            onClick={() => updateGap(i, { requiredLevel: v })}
                            className={`flex-1 h-7 rounded text-xs font-bold transition-all ${
                              gap.requiredLevel === v
                                ? "bg-destructive text-destructive-foreground"
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
                    value={gap.action}
                    onChange={(e) => updateGap(i, { action: e.target.value })}
                    disabled={readonly}
                    rows={2}
                    className="text-xs resize-none"
                    placeholder={t("sfActionPlaceholder")}
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
          <Crosshair className="h-4 w-4 text-primary" />
          {t("assessmentGuidance")}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(["guidance_sf_1", "guidance_sf_2", "guidance_sf_3"] as TranslationKey[]).map((key) => (
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
