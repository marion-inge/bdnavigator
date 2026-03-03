import { useI18n } from "@/lib/i18n";
import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RoughScoringWizard } from "@/components/RoughScoringWizard";

interface ScoringProps {
  scoring: Scoring;
  onSave: (scoring: Scoring) => void;
  onSaveAnswers?: (answers: Record<string, number>) => void;
  onSaveComments?: (comments: Record<string, string>) => void;
  onSaveSources?: (sources: Record<string, string[]>) => void;
  readonly?: boolean;
  initialAnswers?: Record<string, number>;
  initialComments?: Record<string, string>;
  initialSources?: Record<string, string[]>;
  showResults?: boolean;
  opportunityId?: string;
}

const criteriaKeys: (keyof Scoring)[] = [
  "marketAttractiveness",
  "strategicFit",
  "feasibility",
  "commercialViability",
  "risk",
];

export function ScoringSection({ scoring, onSave, onSaveAnswers, onSaveComments, onSaveSources, readonly, initialAnswers, initialComments, initialSources, showResults, opportunityId }: ScoringProps) {
  const { language } = useI18n();
  const [local, setLocal] = useState<Scoring>(scoring);

  const handleWizardSave = (newScoring: Scoring, answers: Record<string, number>, comments: Record<string, string>, sources: Record<string, string[]>) => {
    const merged: Scoring = { ...newScoring };
    for (const key of criteriaKeys) {
      merged[key] = { ...newScoring[key], comment: local[key].comment };
    }
    setLocal(merged);
    onSave(merged);
    onSaveAnswers?.(answers);
    onSaveComments?.(comments);
    onSaveSources?.(sources);
  };

  return (
    <div className="space-y-6">
      <RoughScoringWizard
        scoring={local}
        onSave={handleWizardSave}
        readonly={readonly}
        initialAnswers={initialAnswers}
        initialComments={initialComments}
        initialSources={initialSources}
        startWithSummary={showResults}
        opportunityId={opportunityId}
      />
    </div>
  );
}
