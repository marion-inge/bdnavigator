import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring, PortfolioFitData, PortfolioFitDimension } from "@/lib/types";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Layers, AlertTriangle, ShoppingCart, Share2 } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const DEFAULT_DIMENSIONS: PortfolioFitDimension[] = [
  { key: "productComplement", label: "dsPfProductComplement", score: 3, notes: "" },
  { key: "technologySynergy", label: "dsPfTechSynergy", score: 3, notes: "" },
  { key: "customerOverlap", label: "dsPfCustomerOverlap", score: 3, notes: "" },
  { key: "channelFit", label: "dsPfChannelFit", score: 3, notes: "" },
  { key: "brandFit", label: "dsPfBrandFit", score: 3, notes: "" },
  { key: "resourceSharing", label: "dsPfResourceSharing", score: 3, notes: "" },
];

function createDefaultPortfolioFit(): PortfolioFitData {
  return {
    score: 3,
    dimensions: DEFAULT_DIMENSIONS,
    cannibalizationRisk: "",
    crossSellingPotential: "",
    sharedResources: "",
    notes: "",
  };
}

export function PortfolioFitTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<PortfolioFitData>(
    scoring.portfolioFit ?? createDefaultPortfolioFit()
  );
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const updateField = <K extends keyof PortfolioFitData>(field: K, value: PortfolioFitData[K]) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, portfolioFit: local });
    setDirty(false);
  };

  const updateDimension = (index: number, updates: Partial<PortfolioFitDimension>) => {
    const dims = [...local.dimensions];
    dims[index] = { ...dims[index], ...updates };
    updateField("dimensions", dims);
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

  const avgScore = local.dimensions.length > 0
    ? Math.round((local.dimensions.reduce((s, d) => s + d.score, 0) / local.dimensions.length) * 10) / 10
    : 0;

  const radarData = local.dimensions.map((d) => ({
    dimension: t(d.label as TranslationKey),
    score: d.score,
  }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
      <div className="space-y-6">
        {/* Header with Score */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
              <div>
                <h3 className="text-xl font-bold text-card-foreground">{t("dsPortfolioFit" as TranslationKey)}</h3>
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
            <Layers className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("dsPfAvgFit" as TranslationKey)}</p>
            <p className={`text-2xl font-bold mt-1 ${avgScore >= 4 ? "text-green-600 dark:text-green-400" : avgScore >= 3 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
              {avgScore}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <ShoppingCart className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("dsPfCrossSelling" as TranslationKey)}</p>
            <p className="text-sm font-medium text-card-foreground mt-1 line-clamp-2">
              {local.crossSellingPotential || "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("dsPfCannibalization" as TranslationKey)}</p>
            <p className="text-sm font-medium text-card-foreground mt-1 line-clamp-2">
              {local.cannibalizationRisk || "—"}
            </p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="rounded-lg border-2 border-border bg-card p-6">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            {t("dsPfRadar" as TranslationKey)}
          </h4>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickCount={6} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
                strokeWidth={2}
              />
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

        {/* Dimension Scoring */}
        <div className="rounded-lg border-2 border-border bg-card p-6 space-y-4">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {t("dsPfDimensions" as TranslationKey)}
          </h4>

          <div className="space-y-3">
            {local.dimensions.map((dim, i) => (
              <div key={dim.key} className="rounded-lg border border-border bg-card/50 p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-card-foreground">
                    {t(dim.label as TranslationKey)}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    dim.score >= 4 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                    dim.score >= 3 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}>
                    {dim.score}/5
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      disabled={readonly}
                      onClick={() => updateDimension(i, { score: v })}
                      className={`flex-1 h-8 rounded text-xs font-bold transition-all ${
                        dim.score === v
                          ? "bg-primary text-primary-foreground scale-105"
                          : "bg-secondary text-secondary-foreground hover:bg-accent"
                      } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {/* Visual bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(dim.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <Textarea
                  value={dim.notes}
                  onChange={(e) => updateDimension(i, { notes: e.target.value })}
                  disabled={readonly}
                  placeholder={t("dsPfDimNotesPlaceholder" as TranslationKey)}
                  className="text-sm min-h-[60px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Selling & Cannibalization */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-border bg-card p-6 space-y-3">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              {t("dsPfCrossSellingTitle" as TranslationKey)}
            </h4>
            <Textarea
              value={local.crossSellingPotential}
              onChange={(e) => updateField("crossSellingPotential", e.target.value)}
              disabled={readonly}
              placeholder={t("dsPfCrossSellingPlaceholder" as TranslationKey)}
              className="min-h-[100px]"
            />
          </div>
          <div className="rounded-lg border-2 border-border bg-card p-6 space-y-3">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {t("dsPfCannibalizationTitle" as TranslationKey)}
            </h4>
            <Textarea
              value={local.cannibalizationRisk}
              onChange={(e) => updateField("cannibalizationRisk", e.target.value)}
              disabled={readonly}
              placeholder={t("dsPfCannibalizationPlaceholder" as TranslationKey)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Shared Resources */}
        <div className="rounded-lg border-2 border-border bg-card p-6 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            {t("dsPfSharedResources" as TranslationKey)}
          </h4>
          <Textarea
            value={local.sharedResources}
            onChange={(e) => updateField("sharedResources", e.target.value)}
            disabled={readonly}
            placeholder={t("dsPfSharedResourcesPlaceholder" as TranslationKey)}
            className="min-h-[100px]"
          />
        </div>

        {/* General Notes */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h4 className="font-semibold text-card-foreground">{t("dsPfNotes" as TranslationKey)}</h4>
          <Textarea
            value={local.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            disabled={readonly}
            placeholder={t("dsPfNotesPlaceholder" as TranslationKey)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    </EditableSection>
  );
}