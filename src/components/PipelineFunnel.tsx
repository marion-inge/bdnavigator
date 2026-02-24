import { useI18n } from "@/lib/i18n";
import { useState } from "react";

interface FunnelItem {
  stage: string;
  label: string;
  count: number;
}

interface PipelineFunnelProps {
  data: FunnelItem[];
  activeStage?: string;
  onStageClick?: (stage: string) => void;
}

const STAGE_COLORS = [
  "hsl(215, 50%, 30%)",
  "hsl(200, 60%, 45%)",
  "hsl(38, 90%, 50%)",
  "hsl(260, 45%, 55%)",
  "hsl(280, 40%, 50%)",
  "hsl(170, 50%, 40%)",
  "hsl(320, 45%, 50%)",
  "hsl(145, 55%, 40%)",
  "hsl(30, 70%, 50%)",
];

export function PipelineFunnel({ data, activeStage, onStageClick }: PipelineFunnelProps) {
  const { t } = useI18n();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.every((d) => d.count === 0)) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("pipelineFunnel")}</h3>
      <div className="flex flex-col items-center gap-1" style={{ maxWidth: 600, margin: "0 auto" }}>
        {data.map((item, idx) => {
          const widthPercent = 30 + (70 * item.count) / maxCount;
          const isActive = !activeStage || activeStage === "all" || item.stage === activeStage;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.stage}
              onClick={() => onStageClick?.(item.stage)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative flex items-center justify-center py-1.5 sm:py-2 rounded-sm cursor-pointer transition-all duration-200"
              style={{
                width: `${widthPercent}%`,
                backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length],
                opacity: isActive ? (isHovered ? 1 : 0.85) : 0.25,
                outline: isHovered ? "2px solid white" : "none",
                minHeight: 36,
              }}
            >
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-sm">
                {item.count}
              </span>
              <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs text-white/85 drop-shadow-sm truncate max-w-[80px] sm:max-w-none">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
