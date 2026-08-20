import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Opportunity, calculateTotalScore } from "@/lib/types";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Lightbulb, BarChart3 } from "lucide-react";

interface DashboardOverviewProps {
  opportunities: Opportunity[];
}

const CHART_COLORS = [
  "hsl(215, 50%, 30%)",
  "hsl(200, 60%, 45%)",
  "hsl(170, 50%, 40%)",
  "hsl(38, 90%, 50%)",
  "hsl(260, 45%, 55%)",
  "hsl(320, 45%, 50%)",
  "hsl(145, 55%, 40%)",
  "hsl(0, 65%, 50%)",
];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(0, 0%, 100%)",
  border: "1px solid hsl(220, 15%, 88%)",
  borderRadius: "8px",
  fontSize: "12px",
};

export function DashboardOverview({ opportunities }: DashboardOverviewProps) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    const total = opportunities.length;
    const active = opportunities.filter((o) => o.stage !== "closed").length;
    const topScorer = total > 0 ? opportunities.reduce((best, o) =>
      calculateTotalScore(o.scoring) > calculateTotalScore(best.scoring) ? o : best
    ) : null;
    return { total, active, topScorer };
  }, [opportunities]);

  const splitTags = (raw: string | undefined | null): string[] => {
    if (!raw) return ["Other"];
    // strip parenthetical qualifiers like "Global (DACH first)" → "Global"
    const cleaned = raw.replace(/\([^)]*\)/g, " ");
    const parts = cleaned
      .split(/[,/&;]|\bund\b|\band\b/gi)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return parts.length > 0 ? parts : ["Other"];
  };

  const countTags = (getter: (o: Opportunity) => string | undefined) => {
    const counts: Record<string, number> = {};
    opportunities.forEach((o) => {
      const seen = new Set<string>();
      splitTags(getter(o)).forEach((tag) => {
        // normalize casing for grouping
        const key = tag.replace(/\s+/g, " ").trim();
        const norm = key.charAt(0).toUpperCase() + key.slice(1);
        if (seen.has(norm.toLowerCase())) return;
        seen.add(norm.toLowerCase());
        counts[norm] = (counts[norm] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const industryData = useMemo(() => countTags((o) => o.industry), [opportunities]);
  const techData = useMemo(() => countTags((o) => o.technology), [opportunities]);

  if (opportunities.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          icon={<Lightbulb className="h-4 w-4" />}
          label={t("dashTotal")}
          value={stats.total}
          sub={`${stats.active} ${t("dashActive")}`}
          color="bg-primary"
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
        {/* Industry Pie */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashByIndustry")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={industryData} cx="50%" cy="50%" outerRadius={55} innerRadius={28} dataKey="value" paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
                {industryData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Geography Bar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashByGeography")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={geoData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {geoData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Technology Bar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("dashByTechnology")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={techData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {techData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[(idx + 3) % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
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
