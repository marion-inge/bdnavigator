import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Opportunity } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnsoffMatrixDashboard } from "@/components/AnsoffMatrixDashboard";
import { ThreeHorizonsDashboard } from "@/components/ThreeHorizonsDashboard";

interface Props {
  opportunities: Opportunity[];
}

const CELL_COLORS = [
  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
];

function positionOf(o: Opportunity, framework: "bcg" | "mckinsey"): string {
  const sa = (o as any).strategicAnalyses;
  return sa?.ideaScoring?.[framework]?.position || "";
}

function Cell({
  label,
  items,
  colorClass,
  onItemClick,
}: {
  label: string;
  items: Opportunity[];
  colorClass: string;
  onItemClick: (id: string) => void;
}) {
  return (
    <div className={`rounded-md border p-2 sm:p-3 min-h-[80px] ${colorClass}`}>
      <div className="text-[10px] sm:text-xs font-semibold text-card-foreground mb-1.5">{label}</div>
      {items.length === 0 ? (
        <span className="text-[10px] text-muted-foreground italic">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((o) => (
            <button
              key={o.id}
              onClick={() => onItemClick(o.id)}
              title={o.title}
              className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded bg-background/80 border border-border text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors truncate max-w-[120px]"
            >
              {o.title.length > 20 ? o.title.slice(0, 18) + "…" : o.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UnpositionedNote({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="text-[11px] text-muted-foreground mt-2">
      {count} idea{count === 1 ? "" : "s"} not yet positioned in this framework.
    </p>
  );
}

function BcgPortfolio({ opportunities }: Props) {
  const navigate = useNavigate();
  const go = (id: string) => navigate(`/opportunity/${id}`);

  const groups = useMemo(() => {
    const g: Record<string, Opportunity[]> = { question_mark: [], star: [], dog: [], cash_cow: [] };
    let none = 0;
    for (const o of opportunities) {
      const p = positionOf(o, "bcg");
      if (g[p]) g[p].push(o);
      else none += 1;
    }
    return { g, none };
  }, [opportunities]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">BCG Matrix – Portfolio</h3>
      <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1.5">
        <div />
        <div className="text-[10px] sm:text-xs text-center text-muted-foreground py-1">Low relative market share</div>
        <div className="text-[10px] sm:text-xs text-center text-muted-foreground py-1">High relative market share</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center pr-1 [writing-mode:vertical-lr] rotate-180">High market growth</div>
        <Cell label="❓ Question Mark" items={groups.g.question_mark} colorClass={CELL_COLORS[2]} onItemClick={go} />
        <Cell label="⭐ Star" items={groups.g.star} colorClass={CELL_COLORS[1]} onItemClick={go} />
        <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center pr-1 [writing-mode:vertical-lr] rotate-180">Low market growth</div>
        <Cell label="🐕 Dog" items={groups.g.dog} colorClass={CELL_COLORS[3]} onItemClick={go} />
        <Cell label="🐄 Cash Cow" items={groups.g.cash_cow} colorClass={CELL_COLORS[0]} onItemClick={go} />
      </div>
      <UnpositionedNote count={groups.none} />
    </div>
  );
}

const LEVELS = ["high", "medium", "low"] as const;
const LEVEL_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

function McKinseyPortfolio({ opportunities }: Props) {
  const navigate = useNavigate();
  const go = (id: string) => navigate(`/opportunity/${id}`);

  const { grid, none } = useMemo(() => {
    const grid: Record<string, Opportunity[]> = {};
    for (const ia of LEVELS) for (const cs of LEVELS) grid[`${ia}_${cs}`] = [];
    let none = 0;
    for (const o of opportunities) {
      const p = positionOf(o, "mckinsey");
      if (grid[p]) grid[p].push(o);
      else none += 1;
    }
    return { grid, none };
  }, [opportunities]);

  const colorFor = (ia: string, cs: string) => {
    const score = (ia === "high" ? 2 : ia === "medium" ? 1 : 0) + (cs === "high" ? 2 : cs === "medium" ? 1 : 0);
    if (score >= 3) return CELL_COLORS[1];
    if (score >= 2) return CELL_COLORS[2];
    return CELL_COLORS[3];
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">McKinsey 9-Box – Portfolio</h3>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-1.5">
        <div />
        {LEVELS.map((cs) => (
          <div key={`h-${cs}`} className="text-[10px] sm:text-xs text-center text-muted-foreground py-1">
            {LEVEL_LABEL[cs]} competitive strength
          </div>
        ))}
        {LEVELS.map((ia) => (
          <div key={`row-${ia}`} className="contents">
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center pr-1 [writing-mode:vertical-lr] rotate-180">
              {LEVEL_LABEL[ia]} industry attractiveness
            </div>
            {LEVELS.map((cs) => (
              <Cell
                key={`${ia}_${cs}`}
                label={`${LEVEL_LABEL[ia]} / ${LEVEL_LABEL[cs]}`}
                items={grid[`${ia}_${cs}`]}
                colorClass={colorFor(ia, cs)}
                onItemClick={go}
              />
            ))}
          </div>
        ))}
      </div>
      <UnpositionedNote count={none} />
    </div>
  );
}

export function StrategicFrameworksTabs({ opportunities }: Props) {
  const { t } = useI18n();
  if (opportunities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-card-foreground">Strategic Frameworks</h2>
      <Tabs defaultValue="ansoff" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ansoff" className="text-xs sm:text-sm">Ansoff</TabsTrigger>
          <TabsTrigger value="mckinsey" className="text-xs sm:text-sm">McKinsey</TabsTrigger>
          <TabsTrigger value="bcg" className="text-xs sm:text-sm">BCG</TabsTrigger>
          <TabsTrigger value="horizons" className="text-xs sm:text-sm">{t("saThreeHorizons" as any)}</TabsTrigger>
        </TabsList>
        <TabsContent value="ansoff" className="mt-3">
          <AnsoffMatrixDashboard opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="mckinsey" className="mt-3">
          <McKinseyPortfolio opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="bcg" className="mt-3">
          <BcgPortfolio opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="horizons" className="mt-3">
          <ThreeHorizonsDashboard opportunities={opportunities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
