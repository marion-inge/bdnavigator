import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LucideIcon } from "lucide-react";

type CriterionKey = "strategicFit" | "feasibility" | "commercialViability" | "risk";

interface Props {
  criterionKey: CriterionKey;
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
  icon: LucideIcon;
  guidanceKeys: TranslationKey[];
}

export function CriterionTab({ criterionKey, scoring, onUpdate, readonly, icon: Icon, guidanceKeys }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState(scoring[criterionKey]);
  const [dirty, setDirty] = useState(false);
  const isRisk = criterionKey === "risk";

  const updateScore = (score: number) => {
    setLocal((prev) => ({ ...prev, score }));
    setDirty(true);
  };

  const updateDetails = (details: string) => {
    setLocal((prev) => ({ ...prev, details }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, [criterionKey]: local });
    setDirty(false);
  };

  const getScoreColor = (s: number) => {
    const effective = isRisk ? 6 - s : s;
    if (effective >= 4) return "bg-green-500";
    if (effective >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    const effective = isRisk ? 6 - s : s;
    if (effective >= 4) return t("scoreHigh");
    if (effective >= 3) return t("scoreMedium");
    return t("scoreLow");
  };

  const getScoreBg = (s: number) => {
    const effective = isRisk ? 6 - s : s;
    if (effective >= 4) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (effective >= 3) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">
                {t(criterionKey as TranslationKey)}
                {isRisk && <span className="ml-2 text-sm font-normal text-muted-foreground">{t("riskNote")}</span>}
              </h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(local.score)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                disabled={readonly}
                onClick={() => updateScore(val)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  local.score === val
                    ? "bg-primary text-primary-foreground shadow-md scale-110"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                } ${readonly ? "cursor-default" : "cursor-pointer"}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Score Visual */}
      <div className={`rounded-lg border-2 p-5 ${getScoreBg(local.score)}`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= local.score;
                return (
                  <div
                    key={i}
                    className={`h-3 flex-1 rounded-full transition-all ${
                      filled ? getScoreColor(local.score) : "bg-muted"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t(`tooltip_${criterionKey}` as TranslationKey)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-card-foreground">{local.score}</p>
            <p className="text-xs text-muted-foreground">/ 5</p>
          </div>
        </div>
      </div>

      {/* Guidance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {t("assessmentGuidance")}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {guidanceKeys.map((key) => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      {/* Details Text */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h4 className="font-semibold text-card-foreground">{t("detailedAnalysis")}</h4>
        <Textarea
          value={local.details}
          onChange={(e) => updateDetails(e.target.value)}
          disabled={readonly}
          rows={6}
          className="text-sm resize-none"
          placeholder={t("detailedAnalysisPlaceholder")}
        />
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
