import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Opportunity } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  opportunities: Opportunity[];
}

function formatM(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}B€`;
  return `${val.toFixed(0)}M€`;
}

export function MarketPotentialChart({ opportunities }: Props) {
  const { t, language } = useI18n();

  const chartData = useMemo(() => {
    const years = [1, 2, 3, 4, 5];
    return years.map((yr) => {
      let tam = 0, sam = 0, som = 0;
      for (const opp of opportunities) {
        const bp = opp.businessPlan as any;
        if (!bp) continue;
        const ma = bp?.marketAttractiveness?.analysis;
        if (ma?.tamProjections) {
          const entry = ma.tamProjections.find((p: any) => p.year === yr);
          if (entry) tam += entry.value;
        }
        if (ma?.samProjections) {
          const entry = ma.samProjections.find((p: any) => p.year === yr);
          if (entry) sam += entry.value;
        }
        const somProj = bp?.somOverview?.projections;
        if (somProj) {
          const entry = somProj.find((p: any) => p.year === yr);
          if (entry) som += entry.value;
        }
      }
      return {
        name: `${language === "de" ? "Jahr" : "Year"} ${yr}`,
        TAM: tam,
        SAM: sam,
        SOM: som,
      };
    });
  }, [opportunities, language]);

  const hasData = chartData.some((d) => d.TAM > 0 || d.SAM > 0 || d.SOM > 0);
  if (!hasData) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">
        {language === "de" ? "Marktpotenzial – Portfolio Gesamt (5 Jahre)" : "Market Potential – Total Portfolio (5 Years)"}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatM(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [formatM(value), name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="TAM" fill="hsl(215, 50%, 30%)" radius={[3, 3, 0, 0]} maxBarSize={40} />
          <Bar dataKey="SAM" fill="hsl(200, 60%, 45%)" radius={[3, 3, 0, 0]} maxBarSize={40} />
          <Bar dataKey="SOM" fill="hsl(170, 50%, 40%)" radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
