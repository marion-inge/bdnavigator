import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Opportunity, calculateTotalScore, STAGE_ORDER } from "@/lib/types";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, Lightbulb, Target, BarChart3, AlertTriangle } from "lucide-react";

interface DashboardOverviewProps {
  opportunities: Opportunity[];
}

const INDUSTRY_COLORS = [
  "hsl(215, 50%, 30%)",
  "hsl(200, 60%, 45%)",
  "hsl(170, 50%, 40%)",
  "hsl(38, 90%, 50%)",
  "hsl(260, 45%, 55%)",
  "hsl(320, 45%, 50%)",
  "hsl(145, 55%, 40%)",
  "hsl(0, 65%, 50%)",
];

const SCORE_COLORS = {
  high: "hsl(145, 55%, 40%)",
  medium: "hsl(38, 90%, 50%)",
  low: "hsl(0, 65%, 50%)",
};

export function DashboardOverview({ opportunities }: DashboardOverviewProps) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    const total = opportunities.length;
    const active = opportunities.filter((o) => o.stage !== "closed").length;
    const scores = opportunities.map((o) => calculateTotalScore(o.scoring));
    const avgScore = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0;
    const topScorer = total > 0 ? opportunities.reduce((best, o) => 
      calculateTotalScore(o.scoring) > calculateTotalScore(best.scoring) ? o : best
    ) : null;
    const gtmCount = opportunities.filter((o) => o.stage === "go_to_market").length;
    return { total, active, avgScore, topScorer, gtmCount };
  }, [opportunities]);

  // Industry breakdown for pie chart
  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach((o) => {
      const key = o.industry || "Other";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [opportunities]);

  // Score distribution for bar chart
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: "1.0–2.0", min: 1, max: 2, count: 0 },
      { range: "2.0–3.0", min: 2, max: 3, count: 0 },
      { range: "3.0–3.5", min: 3, max: 3.5, count: 0 },
      { range: "3.5–4.0", min: 3.5, max: 4, count: 0 },
      { range: "4.0–4.5", min: 4, max: 4.5, count: 0 },
      { range: "4.5–5.0", min: 4.5, max: 5.01, count: 0 },
    ];
    opportunities.forEach((o) => {
      const score = calculateTotalScore(o.scoring);
      const bucket = buckets.find((b) => score >= b.min && score < b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [opportunities]);

  // Average scoring by criterion (radar)
  const radarData = useMemo(() => {
    if (opportunities.length === 0) return [];
    const keys = ["marketAttractiveness", "strategicFit", "feasibility", "commercialViability", "risk"] as const;
    return keys.map((key) => {
      const avg = opportunities.reduce((sum, o) => sum + o.scoring[key].score, 0) / opportunities.length;
      return {
        criterion: t(key),
        value: Math.round(avg * 10) / 10,
        fullMark: 5,
      };
    });
  }, [opportunities, t]);

  // Geography breakdown
  const geoData = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach((o) => {
      const key = o.geography || "Other";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [opportunities]);

  if (opportunities.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          icon={<Lightbulb className="h-4 w-4" />}
          label={t("dashTotal")}
          value={stats.total}
          sub={`${stats.active} ${t("dashActive")}`}
          color="bg-primary"
        />
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label={t("dashAvgScore")}
          value={stats.avgScore.toFixed(1)}
          sub={`/ 5.0`}
          color="bg-accent"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label={t("dashGtm")}
          value={stats.gtmCount}
          sub={t("dashInMarket")}
          color="bg-[hsl(var(--success))]"
        />
        <KpiCard
          icon={<BarChart3 className="h-4 w-4" />}
          label={t("dashTopScorer")}
          value={stats.topScorer ? calculateTotalScore(stats.topScorer.scoring).toFixed(1) : "—"}
          sub={stats.topScorer?.title ? stats.topScorer.title.slice(0, 25) + (stats.topScorer.title.length > 25 ? "…" : "") : ""}
          color="bg-primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Distribution */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashScoreDist")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {scoreDistribution.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.min >= 4 ? SCORE_COLORS.high :
                      entry.min >= 3 ? SCORE_COLORS.medium :
                      SCORE_COLORS.low
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Scoring Radar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashAvgRadar")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} outerRadius={60}>
              <PolarGrid stroke="hsl(220, 15%, 88%)" />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="hsl(200, 60%, 45%)"
                fill="hsl(200, 60%, 45%)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Industry & Geography Breakdown */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashByIndustry")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={industryData}
                cx="50%"
                cy="50%"
                outerRadius={55}
                innerRadius={30}
                dataKey="value"
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 9 }}
              >
                {industryData.map((_, idx) => (
                  <Cell key={idx} fill={INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-7 h-7 rounded-md ${color} text-primary-foreground`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-card-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
