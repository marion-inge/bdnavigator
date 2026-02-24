import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Opportunity } from "@/lib/types";

interface Props {
  opportunities: Opportunity[];
}

const POSITION_MAP: Record<string, { col: number; row: number }> = {
  market_penetration: { col: 0, row: 0 },
  product_development: { col: 1, row: 0 },
  "product-development": { col: 1, row: 0 },
  market_development: { col: 0, row: 1 },
  "market-development": { col: 0, row: 1 },
  diversification: { col: 1, row: 1 },
};

const QUADRANT_COLORS = [
  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
];

export function AnsoffMatrixDashboard({ opportunities }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();

  const quadrants = useMemo(() => {
    const q: [Opportunity[], Opportunity[], Opportunity[], Opportunity[]] = [[], [], [], []];
    opportunities.forEach((o) => {
      const pos = o.strategicAnalyses?.ansoff?.position || "market_penetration";
      const mapped = POSITION_MAP[pos] ?? POSITION_MAP["market_penetration"];
      const idx = mapped.row * 2 + mapped.col;
      q[idx].push(o);
    });
    return q;
  }, [opportunities]);

  const labels = [
    t("saAnsoffMarketPenetration"),
    t("saAnsoffProductDevelopment"),
    t("saAnsoffMarketDevelopment"),
    t("saAnsoffDiversification"),
  ];

  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("saAnsoff")}</h3>
      {/* Matrix */}
      <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1">
        {/* Header row */}
        <div />
        <div className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1">
          {t("saExistingProduct")}
        </div>
        <div className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1">
          {t("saNewProduct")}
        </div>

        {/* Row 1: Existing Market */}
        <div className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center pr-1.5 [writing-mode:vertical-lr] rotate-180">
          {t("saExistingMarket")}
        </div>
        {[0, 1].map((idx) => (
          <QuadrantCell
            key={idx}
            label={labels[idx]}
            items={quadrants[idx]}
            colorClass={QUADRANT_COLORS[idx]}
            onItemClick={(id) => navigate(`/opportunity/${id}`)}
          />
        ))}

        {/* Row 2: New Market */}
        <div className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center pr-1.5 [writing-mode:vertical-lr] rotate-180">
          {t("saNewMarket")}
        </div>
        {[2, 3].map((idx) => (
          <QuadrantCell
            key={idx}
            label={labels[idx]}
            items={quadrants[idx]}
            colorClass={QUADRANT_COLORS[idx]}
            onItemClick={(id) => navigate(`/opportunity/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function QuadrantCell({
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
              className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded bg-background/80 border border-border text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors truncate max-w-[120px]"
              title={o.title}
            >
              {o.title.length > 20 ? o.title.slice(0, 18) + "…" : o.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
