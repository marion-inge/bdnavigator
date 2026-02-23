import { useI18n } from "@/lib/i18n";
import { DetailedScoring, GeographicalRegion, MarketYearValue } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";
import { TrendingUp, Globe, Target, Plus, Trash2 } from "lucide-react";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const DEFAULT_PROJECTIONS = [1,2,3,4,5].map((y) => ({ year: y, value: 0 }));

export function MarketAttractivenessTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);

  const update = (field: keyof typeof local.analysis, value: string) => {
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, [field]: value } }));
    setDirty(true);
  };

  const updateScore = (score: number) => {
    setLocal((prev) => ({ ...prev, score }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, marketAttractiveness: local });
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

  // CAGR helper
  const calcCagr = (projections: MarketYearValue[]): number | null => {
    const filtered = projections.filter((p) => p.value > 0);
    if (filtered.length < 2) return null;
    const first = filtered[0].value;
    const last = filtered[filtered.length - 1].value;
    const n = filtered[filtered.length - 1].year - filtered[0].year;
    if (n <= 0 || first <= 0) return null;
    return Math.round(((Math.pow(last / first, 1 / n) - 1) * 100) * 10) / 10;
  };

  const tamProjections: MarketYearValue[] = local.analysis.tamProjections?.length
    ? local.analysis.tamProjections
    : DEFAULT_PROJECTIONS;
  const samProjections: MarketYearValue[] = local.analysis.samProjections?.length
    ? local.analysis.samProjections
    : DEFAULT_PROJECTIONS;

  const tamCagr = calcCagr(tamProjections);
  const samCagr = calcCagr(samProjections);

  const currentYear = new Date().getFullYear();
  const chartData = tamProjections.map((t, i) => ({
    label: `${currentYear + t.year - 1}`,
    TAM: t.value || null,
    SAM: samProjections[i]?.value || null,
  }));

  const hasChartData = chartData.some((d) => (d.TAM ?? 0) > 0 || (d.SAM ?? 0) > 0);

  const updateProjection = (type: "tam" | "sam", idx: number, value: number) => {
    setLocal((prev) => {
      const key = type === "tam" ? "tamProjections" : "samProjections";
      const projs = [...((prev.analysis[key] as MarketYearValue[]) || DEFAULT_PROJECTIONS)];
      projs[idx] = { ...projs[idx], value };
      return { ...prev, analysis: { ...prev.analysis, [key]: projs } };
    });
    setDirty(true);
  };


  // Geographical regions
  const regions = local.analysis.geographicalRegions || [];
  const addRegion = () => {
    const newReg: GeographicalRegion = { region: "", potential: 3, marketSize: "", notes: "" };
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, geographicalRegions: [...(prev.analysis.geographicalRegions || []), newReg] } }));
    setDirty(true);
  };
  const updateRegion = (idx: number, field: keyof GeographicalRegion, value: string | number) => {
    setLocal((prev) => {
      const regs = [...(prev.analysis.geographicalRegions || [])];
      regs[idx] = { ...regs[idx], [field]: value };
      return { ...prev, analysis: { ...prev.analysis, geographicalRegions: regs } };
    });
    setDirty(true);
  };
  const removeRegion = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, geographicalRegions: (prev.analysis.geographicalRegions || []).filter((_, i) => i !== idx) }
    }));
    setDirty(true);
  };


  const ScoreButtons = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          disabled={readonly}
          onClick={() => updateScore(val)}
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
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
    </div>
  );

  const formatM = (v: number) =>
    v >= 1000 ? `€${(v / 1000).toFixed(1)}B` : `€${v}M`;

  return (
    <div className="space-y-8">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("marketAttractiveness")}</h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(local.score)}</p>
            </div>
          </div>
          <ScoreButtons />
        </div>
      </div>

      {/* ─── SECTION 1: Marktpotenzial ─── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <SectionHeader icon={TrendingUp} title={t("maMarketPotential")} />

        {/* CAGR badges */}
        <div className="flex flex-wrap gap-3">
          {tamCagr !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-primary/5 px-4 py-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{t("maTamCagr")}:</span>
              <span className={`text-sm font-bold ${tamCagr >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {tamCagr >= 0 ? "+" : ""}{tamCagr}% p.a.
              </span>
            </div>
          )}
          {samCagr !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-primary/5 px-4 py-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{t("maSamCagr")}:</span>
              <span className={`text-sm font-bold ${samCagr >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {samCagr >= 0 ? "+" : ""}{samCagr}% p.a.
              </span>
            </div>
          )}
        </div>

        {/* 5-year line chart */}
        {hasChartData && (
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">{t("maProjectionsChart")}</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatM}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatM(value), name]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="TAM"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="SAM"
                  stroke="hsl(var(--primary) / 0.5)"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: "hsl(var(--primary) / 0.5)" }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 5-year input rows for TAM & SAM */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* TAM */}
          <div className="space-y-3">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("tam")}
            </h4>
            <p className="text-xs text-muted-foreground">{t("maYearProjections")}</p>
            <div className="space-y-2">
              {tamProjections.map((proj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {t("maYearLabel")} {proj.year} ({currentYear + proj.year - 1})
                  </span>
                  <Input
                    type="number"
                    value={proj.value || ""}
                    onChange={(e) => updateProjection("tam", idx, parseFloat(e.target.value) || 0)}
                    disabled={readonly}
                    placeholder="M€"
                    className="text-sm"
                  />
                  {proj.value > 0 && (
                    <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">{formatM(proj.value)}</span>
                  )}
                </div>
              ))}
            </div>
            <h5 className="text-xs font-medium text-muted-foreground mt-1">{t("maTamDescription")}</h5>
            <Textarea
              value={local.analysis.tamDescription}
              onChange={(e) => update("tamDescription", e.target.value)}
              disabled={readonly}
              rows={3}
              className="text-sm resize-none"
              placeholder={t("maTamDescPlaceholder")}
            />
          </div>

          {/* SAM */}
          <div className="space-y-3">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t("sam")}
            </h4>
            <p className="text-xs text-muted-foreground">{t("maYearProjections")}</p>
            <div className="space-y-2">
              {samProjections.map((proj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {t("maYearLabel")} {proj.year} ({currentYear + proj.year - 1})
                  </span>
                  <Input
                    type="number"
                    value={proj.value || ""}
                    onChange={(e) => updateProjection("sam", idx, parseFloat(e.target.value) || 0)}
                    disabled={readonly}
                    placeholder="M€"
                    className="text-sm"
                  />
                  {proj.value > 0 && (
                    <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">{formatM(proj.value)}</span>
                  )}
                </div>
              ))}
            </div>
            <h5 className="text-xs font-medium text-muted-foreground mt-1">{t("maSamDescription")}</h5>
            <Textarea
              value={local.analysis.samDescription}
              onChange={(e) => update("samDescription", e.target.value)}
              disabled={readonly}
              rows={3}
              className="text-sm resize-none"
              placeholder={t("maSamDescPlaceholder")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("maMarketGrowthRate")}
          </h4>
          <Input value={local.analysis.marketGrowthRate} onChange={(e) => update("marketGrowthRate", e.target.value)} disabled={readonly} placeholder={t("maGrowthRatePlaceholder")} />
        </div>
      </div>


      {/* ─── SECTION 2: Geographical Focus ─── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <SectionHeader icon={Globe} title={t("maGeographicalFocus")} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">{t("maGeographicalFocus")}</h4>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addRegion}>
                <Plus className="h-3 w-3 mr-1" />{t("maAddRegion")}
              </Button>
            )}
          </div>

          {/* Radar chart for geographical potential */}
          {regions.length >= 3 && regions.some(r => r.region) && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={regions.filter(r => r.region).map(r => ({ region: r.region, potential: r.potential }))}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name={t("maRegionPotential")} dataKey="potential" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Fallback bar chart for <3 regions */}
          {regions.length > 0 && regions.length < 3 && regions.some(r => r.region) && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={regions.filter(r => r.region)} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="potential" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {regions.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3">{t("maNoRegions")}</p>
          )}

          {regions.map((reg, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Input value={reg.region} onChange={(e) => updateRegion(idx, "region", e.target.value)} disabled={readonly} placeholder={t("maRegionName")} className="flex-1 min-w-[120px]" />
                <Input value={reg.marketSize} onChange={(e) => updateRegion(idx, "marketSize", e.target.value)} disabled={readonly} placeholder={t("maRegionSizePlaceholder")} className="w-32" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{t("maRegionPotential")}:</span>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      disabled={readonly}
                      onClick={() => updateRegion(idx, "potential", val)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                        reg.potential === val
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {!readonly && (
                  <Button variant="ghost" size="sm" onClick={() => removeRegion(idx)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
              <Input value={reg.notes} onChange={(e) => updateRegion(idx, "notes", e.target.value)} disabled={readonly} placeholder={t("maRegionNotesPlaceholder")} className="text-sm" />
            </div>
          ))}
        </div>
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
