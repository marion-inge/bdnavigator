import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Opportunity, calculateTotalScore } from "@/lib/types";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import {
  calculateYearData, calculateNPV, calculatePaybackPeriod, calculateAverageROCE,
} from "@/lib/investmentCalculations";

interface Props {
  opportunities: Opportunity[];
}

interface Point {
  id: string;
  title: string;
  score: number;
  potential: number;
  npv: number | null;
  payback: number | null;
  roce: number | null;
  bubble: number;
}

function formatM(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}B€`;
  return `${val.toFixed(0)}M€`;
}

function money(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k€`;
  return `${v.toFixed(0)}€`;
}

/** Peak 5-year SOM (fallback SAM) as the market potential proxy. */
function marketPotential(o: Opportunity): number {
  const bp = o.businessPlan as any;
  if (!bp) return 0;
  const som = bp?.somOverview?.projections as { value: number }[] | undefined;
  if (som?.length) return Math.max(...som.map((p) => p.value || 0));
  const sam = bp?.marketAttractiveness?.analysis?.samProjections as { value: number }[] | undefined;
  if (sam?.length) return Math.max(...sam.map((p) => p.value || 0));
  return 0;
}

function financials(o: Opportunity) {
  const ic = o.investmentCase as any;
  if (ic?.parameters && Array.isArray(ic.yearData) && ic.yearData.length > 0) {
    const calcs = calculateYearData(ic.parameters, ic.yearData);
    const npv = calculateNPV(calcs, ic.parameters.wacc);
    const payback = calculatePaybackPeriod(calcs);
    const roce = calculateAverageROCE(calcs);
    if (npv || payback !== null || roce) return { npv, payback, roce };
  }
  const bc = o.businessCase;
  if (bc && (bc.npv || bc.paybackPeriod)) {
    return {
      npv: bc.npv || 0,
      payback: bc.paybackPeriod ? bc.paybackPeriod / 12 : null,
      roce: null as number | null,
    };
  }
  return { npv: null as number | null, payback: null as number | null, roce: null as number | null };
}

export function ScoreMarketPotentialScatter({ opportunities }: Props) {
  const navigate = useNavigate();

  const points = useMemo<Point[]>(() => {
    return opportunities
      .map((o) => {
        const f = financials(o);
        return {
          id: o.id,
          title: o.title,
          score: Number(calculateTotalScore(o.scoring).toFixed(2)),
          potential: marketPotential(o),
          npv: f.npv,
          payback: f.payback,
          roce: f.roce,
          bubble: f.npv && f.npv > 0 ? f.npv : 0,
        };
      })
      .filter((p) => p.potential > 0 || p.score > 0);
  }, [opportunities]);

  if (points.length === 0) return null;

  const maxScore = Math.max(...points.map((p) => p.score), 10);
  const midScore = maxScore / 2;
  const maxPot = Math.max(...points.map((p) => p.potential));
  const midPot = maxPot / 2;

  const colorFor = (p: Point) => {
    const attractive = p.score >= midScore && p.potential >= midPot;
    if (attractive) return "hsl(145, 55%, 40%)";
    if (p.score >= midScore || p.potential >= midPot) return "hsl(200, 60%, 45%)";
    return "hsl(220, 10%, 60%)";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between mb-3 gap-2">
        <h3 className="text-sm font-semibold text-card-foreground">Score × Market Potential</h3>
        <span className="text-[11px] text-muted-foreground">Bubble size = NPV · hover for payback &amp; ROCE</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="score"
            name="Idea Score"
            domain={[0, maxScore]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            label={{ value: "Idea Score", position: "insideBottom", offset: -12, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="number"
            dataKey="potential"
            name="Market Potential"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: number) => formatM(v)}
          />
          <ZAxis type="number" dataKey="bubble" range={[60, 500]} />
          <ReferenceLine x={midScore} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <ReferenceLine y={midPot} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="rounded-md border border-border bg-card p-2.5 text-xs shadow-md max-w-[260px]">
                  <div className="font-semibold text-card-foreground mb-1">{p.title}</div>
                  <div className="text-muted-foreground">Score: <span className="text-card-foreground">{p.score.toFixed(1)}</span></div>
                  <div className="text-muted-foreground">Market potential: <span className="text-card-foreground">{formatM(p.potential)}</span></div>
                  <div className="text-muted-foreground">NPV: <span className="text-card-foreground">{p.npv !== null ? money(p.npv) : "—"}</span></div>
                  <div className="text-muted-foreground">Payback: <span className="text-card-foreground">{p.payback !== null ? `${p.payback.toFixed(1)} yrs` : "—"}</span></div>
                  <div className="text-muted-foreground">Avg. ROCE: <span className="text-card-foreground">{p.roce !== null ? `${p.roce.toFixed(1)}%` : "—"}</span></div>
                </div>
              );
            }}
          />
          <Scatter
            data={points}
            onClick={(d: any) => d?.id && navigate(`/opportunity/${d.id}`)}
            cursor="pointer"
          >
            {points.map((p) => (
              <Cell key={p.id} fill={colorFor(p)} fillOpacity={0.75} stroke={colorFor(p)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
