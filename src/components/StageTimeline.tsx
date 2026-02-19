import { useI18n } from "@/lib/i18n";
import { Stage, STAGE_ORDER } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

const STAGE_PROGRESS: Record<string, number> = {
  idea: 0, rough_scoring: 1, gate1: 2, detailed_scoring: 3,
  gate2: 4, business_case: 5, gate3: 6, go_to_market: 7, closed: -1,
};

interface StageTimelineProps {
  currentStage: Stage;
}

export function StageTimeline({ currentStage }: StageTimelineProps) {
  const { t } = useI18n();
  const progressIdx = STAGE_PROGRESS[currentStage] ?? 0;
  const stagesForTimeline = STAGE_ORDER.filter((s) => s !== "closed");

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {stagesForTimeline.map((stage, idx) => {
        const isPast = currentStage !== "closed" && idx < progressIdx;
        const isCurrent = stage === currentStage;
        const isClosed = currentStage === "closed";
        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1 px-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground scale-110"
                  : isPast
                    ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                    : isClosed
                      ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                      : "border-border bg-background text-muted-foreground"
              }`}>
                {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className={`text-[9px] text-center leading-tight max-w-[60px] ${
                isCurrent ? "font-bold text-primary" : isPast ? "text-[hsl(var(--success))]" : "text-muted-foreground"
              }`}>
                {t(`stage_${stage}` as any)}
              </span>
            </div>
            {idx < stagesForTimeline.length - 1 && (
              <div className={`w-6 h-0.5 mt-[-14px] ${isPast ? "bg-[hsl(var(--success))]" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
