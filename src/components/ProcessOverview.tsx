import { useI18n } from "@/lib/i18n";

const STAGES = [
  { key: "idea", icon: "💡", gateAfter: false, color: "bg-[hsl(var(--stage-idea))]" },
  { key: "rough_scoring", icon: "📊", gateAfter: true, color: "bg-[hsl(var(--stage-rough-scoring))]" },
  { key: "detailed_scoring", icon: "🔍", gateAfter: true, color: "bg-[hsl(var(--stage-detailed-scoring))]" },
  { key: "business_case", icon: "💼", gateAfter: true, color: "bg-[hsl(var(--stage-business-case))]" },
  { key: "go_to_market", icon: "🚀", gateAfter: false, color: "bg-[hsl(var(--stage-gtm))]" },
  { key: "implement_review", icon: "🔄", gateAfter: false, color: "bg-[hsl(var(--stage-implement-review))]" },
] as const;

export function ProcessOverview() {
  const { t } = useI18n();

  let gateCounter = 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-card-foreground">{t("homeProcessTitle")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("homeProcessSub")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
            <span className="text-[11px] text-muted-foreground">{t("homeWorkStage")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[hsl(var(--warning))]/20 border border-[hsl(var(--warning))]/40" />
            <span className="text-[11px] text-muted-foreground">{t("homeGateDecision")}</span>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="flex items-stretch gap-0">
        {STAGES.map((stage, idx) => {
          const isLastStage = idx === STAGES.length - 1;
          const showGate = stage.gateAfter;
          if (showGate) gateCounter++;
          const currentGate = gateCounter;

          return (
            <div key={stage.key} className="flex items-stretch flex-1 min-w-0">
              {/* Stage Block */}
              <div className="flex-1 min-w-0 flex flex-col rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                {/* Color bar top */}
                <div className={`h-1 w-full ${stage.color} opacity-70`} />
                <div className="flex flex-col items-center text-center px-2 py-3 flex-1 gap-1.5">
                  <div className="text-xl leading-none">{stage.icon}</div>
                  <span className="text-[11px] font-semibold text-card-foreground leading-tight">
                    {t(`stage_${stage.key}` as any)}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                    {t(`homeStep_${stage.key}` as any)}
                  </span>
                </div>
              </div>

              {/* Gate connector */}
              {showGate && (
                <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
                  {/* Arrow left */}
                  <div className="flex items-center gap-0">
                    <div className="w-3 h-[2px] bg-[hsl(var(--warning))]/50" />
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-10 rounded-md bg-[hsl(var(--warning))]/15 border border-[hsl(var(--warning))]/40 flex flex-col items-center justify-center gap-0.5 shadow-sm">
                        <span className="text-[9px] font-bold text-[hsl(var(--warning))] uppercase tracking-wide">G{currentGate}</span>
                        <span className="text-[8px] text-[hsl(var(--warning))]/80 font-medium">Gate</span>
                      </div>
                    </div>
                    <div className="w-3 h-[2px] bg-[hsl(var(--warning))]/50" />
                  </div>
                </div>
              )}

              {/* Plain arrow for last stage (no gate) */}
              {!showGate && !isLastStage && (
                <div className="flex items-center px-1 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/40">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
