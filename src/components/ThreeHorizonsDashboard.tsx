import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Opportunity } from "@/lib/types";

interface Props {
  opportunities: Opportunity[];
}

const HORIZON_COLORS = [
  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
];

export function ThreeHorizonsDashboard({ opportunities }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const horizons = useMemo(() => {
    const h: [Opportunity[], Opportunity[], Opportunity[]] = [[], [], []];
    const unassigned: Opportunity[] = [];
    opportunities.forEach((o) => {
      const horizon = o.strategicAnalyses?.threeHorizons?.horizon;
      if (horizon === "horizon1") h[0].push(o);
      else if (horizon === "horizon2") h[1].push(o);
      else if (horizon === "horizon3") h[2].push(o);
      else unassigned.push(o);
    });
    // Put unassigned in horizon1 by default
    h[0].push(...unassigned);
    return h;
  }, [opportunities]);

  const labels = [
    t("saHorizon1" as any),
    t("saHorizon2" as any),
    t("saHorizon3" as any),
  ];

  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("saThreeHorizons" as any)}</h3>
      <div className="grid grid-cols-3 gap-2">
        {horizons.map((items, idx) => (
          <div key={idx} className={`rounded-md border p-2 sm:p-3 min-h-[80px] ${HORIZON_COLORS[idx]}`}>
            <div className="text-[10px] sm:text-xs font-semibold text-card-foreground mb-1.5">{labels[idx]}</div>
            {items.length === 0 ? (
              <span className="text-[10px] text-muted-foreground italic">—</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {items.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => navigate(`/opportunity/${o.id}`)}
                    className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded bg-background/80 border border-border text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors truncate max-w-[120px]"
                    title={o.title}
                  >
                    {o.title.length > 20 ? o.title.slice(0, 18) + "…" : o.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
