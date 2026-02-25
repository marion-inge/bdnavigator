import { useMemo } from "react";
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
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";

interface Props {
  opportunities: Opportunity[];
}

const HORIZON_COLORS = [
  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
];

const HORIZON_KEYS = ["horizon1", "horizon2", "horizon3"] as const;

function DraggableItem({ opportunity, onClick }: { opportunity: Opportunity; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: opportunity.id,
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

function DroppableZone({
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

export function ThreeHorizonsDashboard({ opportunities }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { updateOpportunity } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    h[0].push(...unassigned);
    return h;
  }, [opportunities]);

  const labels = [
    t("saHorizon1" as any),
    t("saHorizon2" as any),
    t("saHorizon3" as any),
  ];

  const activeOpp = activeId ? opportunities.find((o) => o.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const oppId = active.id as string;
    const targetHorizon = over.id as string;
    if (!HORIZON_KEYS.includes(targetHorizon as any)) return;

    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    const currentHorizon = opp.strategicAnalyses?.threeHorizons?.horizon || "horizon1";
    if (currentHorizon === targetHorizon) return;

    const sa = opp.strategicAnalyses || createDefaultStrategicAnalyses();
    updateOpportunity(oppId, {
      strategicAnalyses: {
        ...sa,
        threeHorizons: {
          ...sa.threeHorizons!,
          horizon: targetHorizon,
        },
      },
    });
  }

  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("saThreeHorizons" as any)}</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-2">
          {horizons.map((items, idx) => (
            <DroppableZone
              key={idx}
              id={HORIZON_KEYS[idx]}
              label={labels[idx]}
              items={items}
              colorClass={HORIZON_COLORS[idx]}
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
