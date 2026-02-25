import { useI18n } from "@/lib/i18n";
import { Stage } from "@/lib/types";

const stageColors: Record<Stage, string> = {
  idea: "bg-stage-idea",
  rough_scoring: "bg-stage-rough-scoring",
  gate1: "bg-stage-gate1",
  detailed_scoring: "bg-stage-detailed-scoring",
  gate2: "bg-stage-gate2",
  business_case: "bg-stage-business-case",
  implement_review: "bg-stage-implement-review",
  closed: "bg-stage-closed",
};

export function StageBadge({ stage }: { stage: Stage }) {
  const { t } = useI18n();
  const label = t(`stage_${stage}` as any);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-primary-foreground ${stageColors[stage]}`}
    >
      {label}
    </span>
  );
}
