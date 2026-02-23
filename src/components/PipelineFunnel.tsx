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
  const totalHeight = 320;
  const segmentCount = data.length;
  const segmentH = totalHeight / segmentCount;
  const svgWidth = 500;
  const minWidth = 80;
  const maxWidth = svgWidth - 40;
  const centerX = svgWidth / 2;

  // Calculate widths proportional to count, with a minimum
  const widths = data.map((d) => {
    const ratio = d.count / maxCount;
    return minWidth + (maxWidth - minWidth) * ratio;
  });

  // Build funnel: each segment is a trapezoid from current width to next width
  const segments = data.map((item, idx) => {
    const topW = widths[idx];
    const bottomW = idx < segmentCount - 1 ? widths[idx + 1] : widths[idx] * 0.7;
    const y = idx * segmentH;

    const topLeft = centerX - topW / 2;
    const topRight = centerX + topW / 2;
    const bottomLeft = centerX - bottomW / 2;
    const bottomRight = centerX + bottomW / 2;

    const points = `${topLeft},${y} ${topRight},${y} ${bottomRight},${y + segmentH} ${bottomLeft},${y + segmentH}`;

    const isActive = !activeStage || activeStage === "all" || item.stage === activeStage;
    const isHovered = hoveredIdx === idx;

    return { item, idx, points, y, topW, isActive, isHovered, centerY: y + segmentH / 2 };
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("pipelineFunnel")}</h3>
      <svg
        viewBox={`0 0 ${svgWidth} ${totalHeight}`}
        className="w-full"
        style={{ maxHeight: 340 }}
      >
        {segments.map(({ item, idx, points, y, isActive, isHovered, centerY }) => (
          <g
            key={item.stage}
            onClick={() => onStageClick?.(item.stage)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: "pointer" }}
          >
            <polygon
              points={points}
              fill={STAGE_COLORS[idx]}
              opacity={isActive ? (isHovered ? 1 : 0.85) : 0.25}
              stroke={isHovered ? "hsl(0,0%,100%)" : "none"}
              strokeWidth={isHovered ? 1.5 : 0}
              style={{ transition: "opacity 0.2s" }}
            />
            {/* Count */}
            <text
              x={centerX}
              y={centerY - 2}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize="16"
              fontWeight="700"
              fill="hsl(0,0%,100%)"
              style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            >
              {item.count}
            </text>
            {/* Label */}
            <text
              x={centerX}
              y={centerY + 14}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize="10"
              fill="hsl(0,0%,100%)"
              opacity={0.85}
              style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            >
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
