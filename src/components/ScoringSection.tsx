import { useI18n } from "@/lib/i18n";
import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RoughScoringWizard } from "@/components/RoughScoringWizard";

interface ScoringProps {
  scoring: Scoring;
  onSaveAll: (data: {
    scoring: Scoring;
    answers: Record<string, number>;
    comments: Record<string, string>;
    sources: Record<string, string[]>;
  }) => void;
  onAutoSave?: (data: {
    answers: Record<string, number>;
    comments: Record<string, string>;
    sources: Record<string, string[]>;
  }) => void;
  readonly?: boolean;
  initialAnswers?: Record<string, number>;
  initialComments?: Record<string, string>;
  initialSources?: Record<string, string[]>;
  showResults?: boolean;
  opportunityId?: string;
  opportunityTitle?: string;
  opportunityDescription?: string;
  opportunitySolutionDescription?: string;
  opportunityIndustry?: string;
  opportunityGeography?: string;
  opportunityTechnology?: string;
  opportunityIdeaBringer?: string;
  opportunityOwner?: string;
}

const criteriaKeys: (keyof Scoring)[] = [
  "marketAttractiveness",
  "strategicFit",
  "feasibility",
  "commercialViability",
  "risk",
];

export function ScoringSection({ scoring, onSaveAll, onAutoSave, readonly, initialAnswers, initialComments, initialSources, showResults, opportunityId, opportunityTitle, opportunityDescription, opportunitySolutionDescription, opportunityIndustry, opportunityGeography, opportunityTechnology, opportunityIdeaBringer, opportunityOwner }: ScoringProps) {
  const { language } = useI18n();
  const [local, setLocal] = useState<Scoring>(scoring);

  const handleWizardSave = (newScoring: Scoring, answers: Record<string, number>, comments: Record<string, string>, sources: Record<string, string[]>) => {
    const merged: Scoring = { ...newScoring };
    for (const key of criteriaKeys) {
      merged[key] = { ...newScoring[key], comment: local[key].comment };
    }
    setLocal(merged);
    onSaveAll({ scoring: merged, answers, comments, sources });
  };

  return (
    <div className="space-y-6">
      <RoughScoringWizard
        scoring={local}
        onSave={handleWizardSave}
        onAutoSave={onAutoSave}
        readonly={readonly}
        initialAnswers={initialAnswers}
        initialComments={initialComments}
        initialSources={initialSources}
        startWithSummary={showResults}
        opportunityId={opportunityId}
        opportunityTitle={opportunityTitle}
        opportunityDescription={opportunityDescription}
        opportunitySolutionDescription={opportunitySolutionDescription}
        opportunityIndustry={opportunityIndustry}
        opportunityGeography={opportunityGeography}
        opportunityTechnology={opportunityTechnology}
        opportunityIdeaBringer={opportunityIdeaBringer}
        opportunityOwner={opportunityOwner}
      />
    </div>
  );
}
