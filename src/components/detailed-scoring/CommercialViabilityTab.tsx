import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart, Line
} from "recharts";
import { DollarSign, TrendingUp, Target, BarChart3 } from "lucide-react";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

export function CommercialViabilityTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t } = useI18n();
  const defaultProjections = [
    { year: 1, revenue: 0, costs: 0 },
    { year: 2, revenue: 0, costs: 0 },
    { year: 3, revenue: 0, costs: 0 },
    { year: 4, revenue: 0, costs: 0 },
    { year: 5, revenue: 0, costs: 0 },
  ];
  const [local, setLocal] = useState({
    ...scoring.commercialViability,
    pricingModel: scoring.commercialViability.pricingModel ?? "",
    unitPrice: scoring.commercialViability.unitPrice ?? 0,
    grossMargin: scoring.commercialViability.grossMargin ?? 0,
    projections: scoring.commercialViability.projections ?? defaultProjections,
    breakEvenUnits: scoring.commercialViability.breakEvenUnits ?? 0,
  });
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const updateField = <K extends keyof typeof local>(field: K, value: typeof local[K]) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateProjection = (index: number, field: "revenue" | "costs", value: number) => {
    setLocal((prev) => {
      const projections = [...prev.projections];
      projections[index] = { ...projections[index], [field]: value };
      return { ...prev, projections };
    });
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, commercialViability: local });
    setDirty(false);
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

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  // Calculate cumulative profit for break-even chart
  const cumulativeData = local.projections.map((p, i) => {
    const cumulativeProfit = local.projections
      .slice(0, i + 1)
      .reduce((sum, proj) => sum + (proj.revenue - proj.costs), 0);
    return {
      year: `${t("cvYear")} ${p.year}`,
      revenue: p.revenue,
      costs: p.costs,
      profit: p.revenue - p.costs,
      cumulativeProfit,
      margin: p.revenue > 0 ? Math.round(((p.revenue - p.costs) / p.revenue) * 100) : 0,
    };
  });

  // Find break-even year
  const breakEvenYear = cumulativeData.findIndex((d) => d.cumulativeProfit >= 0) + 1;
  const hasProjectionData = local.projections.some((p) => p.revenue > 0 || p.costs > 0);

  // KPI summary
  const totalRevenue5Y = local.projections.reduce((s, p) => s + p.revenue, 0);
  const totalCosts5Y = local.projections.reduce((s, p) => s + p.costs, 0);
  const totalProfit5Y = totalRevenue5Y - totalCosts5Y;
  const avgMargin5Y = totalRevenue5Y > 0 ? Math.round((totalProfit5Y / totalRevenue5Y) * 100) : 0;

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("commercialViability")}</h3>
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

      {/* KPI Cards */}
      {hasProjectionData && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("cvTotalRevenue5Y")}</p>
            <p className="text-xl font-bold text-card-foreground mt-1">{formatCurrency(totalRevenue5Y)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("cvTotalProfit5Y")}</p>
            <p className={`text-xl font-bold mt-1 ${totalProfit5Y >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(totalProfit5Y)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("cvAvgMargin")}</p>
            <p className="text-xl font-bold text-card-foreground mt-1">{avgMargin5Y}%</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("cvBreakEvenYear")}</p>
            <p className="text-xl font-bold text-card-foreground mt-1">
              {breakEvenYear > 0 ? `${t("cvYear")} ${breakEvenYear}` : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Pricing Model & Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            {t("cvPricingModel")}
          </h4>
          <Input
            value={local.pricingModel}
            onChange={(e) => updateField("pricingModel", e.target.value)}
            disabled={readonly}
            placeholder="e.g. SaaS, Hardware + Service, RaaS"
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t("cvUnitPrice")}
          </h4>
          <Input
            type="number"
            value={local.unitPrice || ""}
            onChange={(e) => updateField("unitPrice", Number(e.target.value))}
            disabled={readonly}
            placeholder="€"
          />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t("cvGrossMargin")}
          </h4>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={local.grossMargin || ""}
              onChange={(e) => updateField("grossMargin", Number(e.target.value))}
              disabled={readonly}
              placeholder="%"
            />
            <span className="text-muted-foreground font-medium">%</span>
          </div>
        </div>
      </div>

      {/* Revenue Projection Chart */}
      {hasProjectionData && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("cvRevenueProjection")}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={cumulativeData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Bar dataKey="revenue" name={t("cvRevenue")} fill="hsl(var(--primary))" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" name={t("cvCosts")} fill="hsl(var(--destructive))" fillOpacity={0.5} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name={t("cvProfit")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Break-Even / Cumulative Profit Chart */}
      {hasProjectionData && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t("cvBreakEvenAnalysis")}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cumulativeData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), t("cvCumulativeProfit")]}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "Break-Even", position: "right", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cumulativeProfit" stroke="hsl(var(--primary))" fill="url(#cumulativeGradient)" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue Projection Input Table */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="font-semibold text-card-foreground mb-4">{t("cvProjectionData")}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("cvYear")}</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("cvRevenue")} (€)</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("cvCosts")} (€)</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("cvProfit")} (€)</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("cvMargin")}</th>
              </tr>
            </thead>
            <tbody>
              {local.projections.map((p, i) => {
                const profit = p.revenue - p.costs;
                const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 100) : 0;
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-card-foreground">{t("cvYear")} {p.year}</td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        value={p.revenue || ""}
                        onChange={(e) => updateProjection(i, "revenue", Number(e.target.value))}
                        disabled={readonly}
                        className="h-8 w-32"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        value={p.costs || ""}
                        onChange={(e) => updateProjection(i, "costs", Number(e.target.value))}
                        disabled={readonly}
                        className="h-8 w-32"
                      />
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatCurrency(profit)}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${margin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {margin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Break-Even Units */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h4 className="font-semibold text-card-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          {t("cvBreakEvenUnits")}
        </h4>
        <Input
          type="number"
          value={local.breakEvenUnits || ""}
          onChange={(e) => updateField("breakEvenUnits", Number(e.target.value))}
          disabled={readonly}
          className="max-w-xs"
          placeholder={t("cvBreakEvenUnitsPlaceholder")}
        />
      </div>

      {/* Detailed Analysis */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h4 className="font-semibold text-card-foreground">{t("detailedAnalysis")}</h4>
        <Textarea
          value={local.details}
          onChange={(e) => updateField("details", e.target.value)}
          disabled={readonly}
          rows={5}
          className="text-sm resize-none"
          placeholder={t("detailedAnalysisPlaceholder")}
        />
      </div>

    </div>
    </EditableSection>
  );
}
