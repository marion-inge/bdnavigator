import { useI18n } from "@/lib/i18n";
import { CheckCircle2, ArrowRight } from "lucide-react";

const STAGES = [
  { key: "idea", icon: "💡", gateAfter: false },
  { key: "rough_scoring", icon: "📊", gateAfter: true },
  { key: "detailed_scoring", icon: "🔍", gateAfter: true },
  { key: "business_case", icon: "💼", gateAfter: true },
  { key: "go_to_market", icon: "🚀", gateAfter: false },
] as const;

const GATE_LABELS = ["Gate 1", "Gate 2", "Gate 3"];

export function ProcessOverview() {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">{t("homeProcessTitle")}</h3>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("homeProcessSub")}</span>
      </div>

      {/* Horizontal Process Flow */}
      <div className="flex items-center justify-between gap-0 overflow-x-auto pb-2">
        {STAGES.map((stage, idx) => {
          const gateIdx = STAGES.slice(0, idx).filter((s) => s.gateAfter).length;
          return (
            <div key={stage.key} className="flex items-center flex-shrink-0">
              {/* Stage Node */}
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                  {stage.icon}
                </div>
                <span className="text-[10px] font-semibold text-card-foreground text-center leading-tight">
                  {t(`stage_${stage.key}` as any)}
                </span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight max-w-[90px]">
                  {t(`homeStep_${stage.key}` as any)}
                </span>
              </div>

              {/* Gate or Arrow */}
              {idx < STAGES.length - 1 && (
                <div className="flex flex-col items-center mx-1 flex-shrink-0">
                  {stage.gateAfter ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--warning))]/15 border border-[hsl(var(--warning))]/30 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-[hsl(var(--warning))]">G{gateIdx + 1}</span>
                      </div>
                      <span className="text-[8px] text-muted-foreground mt-0.5">Approval</span>
                      
                    </>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/10" />
          <span className="text-[10px] text-muted-foreground">{t("homeWorkStage")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[hsl(var(--warning))]/15 border border-[hsl(var(--warning))]/30" />
          <span className="text-[10px] text-muted-foreground">{t("homeGateDecision")}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--success))]" />
          <span className="text-[10px] text-muted-foreground">{t("homeGoNoGo")}</span>
        </div>
      </div>
    </div>
  );
}
