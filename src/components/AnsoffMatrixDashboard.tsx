import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Opportunity, createDefaultStrategicAnalyses } from "@/lib/types";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

interface Props {
  opportunities: Opportunity[];
}

const POSITION_MAP: Record<string, { col: number; row: number }> = {
  market_penetration: { col: 0, row: 1 },
  product_development: { col: 1, row: 1 },
  "product-development": { col: 1, row: 1 },
  market_development: { col: 0, row: 0 },
  "market-development": { col: 0, row: 0 },
  diversification: { col: 1, row: 0 },
};

const QUADRANT_COLORS = [
  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
];

// Index to Ansoff position key mapping
const IDX_TO_POSITION = [
  "market-development",   // idx 0: row 0, col 0
  "diversification",       // idx 1: row 0, col 1
  "market_penetration",    // idx 2: row 1, col 0
  "product-development",   // idx 3: row 1, col 1
];

function DraggableItem({ opportunity, onClick }: { opportunity: Opportunity; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `ansoff-${opportunity.id}`,
    data: { oppId: opportunity.id },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded bg-background/80 border border-border text-card-foreground hover:bg-primary hover:text-primary-foreground transition-colors truncate max-w-[120px] cursor-grab active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}
      title={opportunity.title}
    >
      {opportunity.title.length > 20 ? opportunity.title.slice(0, 18) + "…" : opportunity.title}
    </button>
  );
}

function DroppableQuadrant({
  id,
  label,
  items,
  colorClass,
  onItemClick,
}: {
  id: string;
  label: string;
  items: Opportunity[];
  colorClass: string;
  onItemClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-2 sm:p-3 min-h-[80px] transition-all ${colorClass} ${isOver ? "ring-2 ring-primary ring-offset-1" : ""}`}
    >
      <div className="text-[10px] sm:text-xs font-semibold text-card-foreground mb-1.5">{label}</div>
      {items.length === 0 ? (
        <span className="text-[10px] text-muted-foreground italic">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((o) => (
            <DraggableItem key={o.id} opportunity={o} onClick={() => onItemClick(o.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AnsoffMatrixDashboard({ opportunities }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { updateOpportunity } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    t("saAnsoffMarketDevelopment"),
    t("saAnsoffDiversification"),
    t("saAnsoffMarketPenetration"),
    t("saAnsoffProductDevelopment"),
  ];

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    const oppId = (event.active.data.current as any)?.oppId || (event.active.id as string).replace("ansoff-", "");
    setActiveId(oppId);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const oppId = (active.data.current as any)?.oppId || (active.id as string).replace("ansoff-", "");
    const targetQuadrant = over.id as string;
    if (!targetQuadrant.startsWith("ansoff-q-")) return;

    const targetIdx = parseInt(targetQuadrant.replace("ansoff-q-", ""), 10);
    const targetPosition = IDX_TO_POSITION[targetIdx];
    if (!targetPosition) return;

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    const currentPos = opp.strategicAnalyses?.ansoff?.position || "market_penetration";
    const currentMapped = POSITION_MAP[currentPos] ?? POSITION_MAP["market_penetration"];
    const currentIdx = currentMapped.row * 2 + currentMapped.col;
    if (currentIdx === targetIdx) return;

    const sa = opp.strategicAnalyses || createDefaultStrategicAnalyses();
    updateOpportunity(oppId, {
      strategicAnalyses: {
        ...sa,
        ansoff: {
          ...sa.ansoff,
          position: targetPosition,
        },
      },
    });
  }

  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("saAnsoff")}</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1">
          {/* Header row */}
          <div />
          <div className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1">
            {t("saExistingProduct")}
          </div>
          <div className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1">
            {t("saNewProduct")}
          </div>

          {/* Row 1: New Market */}
          <div className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center pr-1.5 [writing-mode:vertical-lr] rotate-180">
            {t("saNewMarket")}
          </div>
          {[0, 1].map((idx) => (
            <DroppableQuadrant
              key={idx}
              id={`ansoff-q-${idx}`}
              label={labels[idx]}
              items={quadrants[idx]}
              colorClass={QUADRANT_COLORS[idx]}
              onItemClick={(id) => navigate(`/opportunity/${id}`)}
            />
          ))}

          {/* Row 2: Existing Market */}
          <div className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center pr-1.5 [writing-mode:vertical-lr] rotate-180">
            {t("saExistingMarket")}
          </div>
          {[2, 3].map((idx) => (
            <DroppableQuadrant
              key={idx}
              id={`ansoff-q-${idx}`}
              label={labels[idx]}
              items={quadrants[idx]}
              colorClass={QUADRANT_COLORS[idx]}
              onItemClick={(id) => navigate(`/opportunity/${id}`)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeOpp ? (
            <span className="text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground border border-primary shadow-lg">
              {activeOpp.title.length > 20 ? activeOpp.title.slice(0, 18) + "…" : activeOpp.title}
            </span>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
