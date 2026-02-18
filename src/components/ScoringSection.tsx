import { useI18n } from "@/lib/i18n";
import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, ListChecks, SlidersHorizontal } from "lucide-react";
import { RoughScoringWizard } from "@/components/RoughScoringWizard";

interface ScoringProps {
  scoring: Scoring;
  onSave: (scoring: Scoring) => void;
  readonly?: boolean;
}

const criteriaKeys: (keyof Scoring)[] = [
  "marketAttractiveness",
  "strategicFit",
  "feasibility",
  "commercialViability",
  "risk",
];

export function ScoringSection({ scoring, onSave, readonly }: ScoringProps) {
  const { t, language } = useI18n();
  const [local, setLocal] = useState<Scoring>(scoring);
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<"wizard" | "direct">("wizard");

  const updateCriterion = (key: keyof Scoring, field: "score" | "comment", value: any) => {
    setLocal((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(local);
    setDirty(false);
  };

  const handleWizardSave = (newScoring: Scoring) => {
    // Preserve comments from local state
    const merged: Scoring = { ...newScoring };
    for (const key of criteriaKeys) {
      merged[key] = { ...newScoring[key], comment: local[key].comment };
    }
    setLocal(merged);
    onSave(merged);
    setDirty(false);
  };

  const totalScore = calculateTotalScore(local);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-end gap-2">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setMode("wizard")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "wizard"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-card-foreground"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            {language === "de" ? "Fragenkatalog" : "Questionnaire"}
          </button>
          <button
            onClick={() => setMode("direct")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "direct"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-card-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {language === "de" ? "Direkt-Scoring" : "Direct Scoring"}
          </button>
        </div>
      </div>

      {mode === "wizard" ? (
        <RoughScoringWizard
          scoring={local}
          onSave={handleWizardSave}
          readonly={readonly}
        />
      ) : (
        <>
          <div className="grid gap-4">
            {criteriaKeys.map((key) => (
              <div key={key} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-card-foreground">
                      {t(key as any)}
                      {key === "risk" && (
                        <span className="ml-2 text-xs text-muted-foreground">{t("riskNote")}</span>
                      )}
                    </h4>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-sm">
                          {t(`tooltip_${key}` as any)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t("weight")}: {SCORING_WEIGHTS[key]}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        disabled={readonly}
                        onClick={() => updateCriterion(key, "score", val)}
                        className={`w-9 h-9 rounded-md text-sm font-semibold transition-colors ${
                          local[key].score === val
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                        } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder={t("comment")}
                  value={local[key].comment}
                  onChange={(e) => updateCriterion(key, "comment", e.target.value)}
                  disabled={readonly}
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t("totalScore")}</span>
              <p className="text-3xl font-bold text-primary">{totalScore.toFixed(1)}</p>
            </div>
            {!readonly && (
              <Button onClick={handleSave} disabled={!dirty}>
                {t("save")}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
