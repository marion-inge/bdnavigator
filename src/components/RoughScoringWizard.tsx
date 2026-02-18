import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import { getQuestionsByCategory, ScoringQuestion } from "@/lib/roughScoringQuestions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";

interface RoughScoringWizardProps {
  scoring: Scoring;
  onSave: (scoring: Scoring) => void;
  readonly?: boolean;
}

type Answers = Record<string, number>;

function scoringToAnswers(scoring: Scoring): Answers {
  // Initialize all answers to 0 (unanswered)
  return {};
}

function answersToScoring(answers: Answers, questions: ScoringQuestion[], baseScoring: Scoring): Scoring {
  const categories = ["marketAttractiveness", "strategicFit", "feasibility", "commercialViability", "risk"] as const;
  const newScoring = { ...baseScoring };

  for (const cat of categories) {
    const catQuestions = questions.filter((q) => q.category === cat);
    const answered = catQuestions.filter((q) => answers[q.id] && answers[q.id] > 0);
    if (answered.length > 0) {
      const avg = answered.reduce((sum, q) => sum + answers[q.id], 0) / answered.length;
      newScoring[cat] = { ...newScoring[cat], score: Math.round(avg) };
    }
  }

  return newScoring;
}

export function RoughScoringWizard({ scoring, onSave, readonly }: RoughScoringWizardProps) {
  const { t, language } = useI18n();
  const categorizedQuestions = useMemo(() => getQuestionsByCategory(), []);
  const allQuestions = useMemo(() => categorizedQuestions.flatMap((c) => c.questions), [categorizedQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    // Pre-fill from existing scoring
    const initial: Answers = {};
    for (const q of allQuestions) {
      initial[q.id] = scoring[q.category].score;
    }
    return initial;
  });
  const [showSummary, setShowSummary] = useState(false);

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentIndex];
  const answeredCount = Object.values(answers).filter((v) => v > 0).length;
  const progress = showSummary ? 100 : ((currentIndex) / totalQuestions) * 100;

  // Find which category the current question belongs to
  const currentCategoryIndex = categorizedQuestions.findIndex(
    (c) => c.category === currentQuestion?.category
  );

  const categoryLabels: Record<string, { en: string; de: string }> = {
    marketAttractiveness: { en: "Market Attractiveness", de: "Marktattraktivität" },
    strategicFit: { en: "Strategic Fit", de: "Strategischer Fit" },
    feasibility: { en: "Feasibility", de: "Machbarkeit" },
    commercialViability: { en: "Commercial Viability", de: "Kommerzielle Tragfähigkeit" },
    risk: { en: "Risk", de: "Risiko" },
  };

  const handleAnswer = (value: number) => {
    if (readonly) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSave = () => {
    const newScoring = answersToScoring(answers, allQuestions, scoring);
    onSave(newScoring);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const resultScoring = answersToScoring(answers, allQuestions, scoring);
  const totalScore = calculateTotalScore(resultScoring);

  if (showSummary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            {language === "de" ? "Ergebnis" : "Results"}
          </h3>
          <Progress value={100} className="w-48 h-2" />
        </div>

        <div className="grid gap-4">
          {categorizedQuestions.map(({ category, questions }) => {
            const catAnswered = questions.filter((q) => answers[q.id] > 0);
            const avg = catAnswered.length > 0
              ? catAnswered.reduce((sum, q) => sum + answers[q.id], 0) / catAnswered.length
              : 0;
            const roundedAvg = Math.round(avg * 10) / 10;
            const finalScore = Math.round(avg);

            return (
              <div key={category} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      {categoryLabels[category][language]}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {language === "de" ? `${catAnswered.length}/${questions.length} beantwortet` : `${catAnswered.length}/${questions.length} answered`}
                      {" · "}
                      {language === "de" ? "Gewicht" : "Weight"}: {SCORING_WEIGHTS[category]}
                      {category === "risk" && (
                        <span className="ml-1">({t("riskNote")})</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{language === "de" ? "Ø" : "Avg"} {roundedAvg}</span>
                    <p className="text-2xl font-bold text-primary">{finalScore}</p>
                  </div>
                </div>

                {/* Individual question scores */}
                <div className="space-y-1">
                  {questions.map((q) => (
                    <div key={q.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{q.question[language]}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <div
                            key={val}
                            className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center ${
                              answers[q.id] === val
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary/50 text-muted-foreground"
                            }`}
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Score */}
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">{t("totalScore")}</span>
            <p className="text-3xl font-bold text-primary">{totalScore.toFixed(1)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {language === "de" ? "Nochmal" : "Restart"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
            {!readonly && (
              <Button onClick={handleSave}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t("save")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Question view
  const currentAnswer = answers[currentQuestion.id] || 0;

  // Count questions before this category
  let questionsBeforeCategory = 0;
  for (let i = 0; i < currentCategoryIndex; i++) {
    questionsBeforeCategory += categorizedQuestions[i].questions.length;
  }
  const questionInCategory = currentIndex - questionsBeforeCategory + 1;
  const categorySize = categorizedQuestions[currentCategoryIndex].questions.length;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {language === "de" ? "Frage" : "Question"} {currentIndex + 1} / {totalQuestions}
          </span>
          <span>{answeredCount} / {totalQuestions} {language === "de" ? "beantwortet" : "answered"}</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Category indicator */}
        <div className="flex items-center gap-2">
          {categorizedQuestions.map(({ category }, idx) => (
            <div
              key={category}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx < currentCategoryIndex
                  ? "bg-primary"
                  : idx === currentCategoryIndex
                  ? "bg-primary/60"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {categoryLabels[currentQuestion.category][language]}
        </span>
        <span className="text-xs text-muted-foreground">
          {questionInCategory} / {categorySize}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-6">
          {currentQuestion.question[language]}
        </h3>

        {/* Score options */}
        <div className="space-y-2">
          {([1, 2, 3, 4, 5] as const).map((val) => (
            <button
              key={val}
              disabled={readonly}
              onClick={() => handleAnswer(val)}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                currentAnswer === val
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-accent hover:bg-accent/5"
              } ${readonly ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0 ${
                    currentAnswer === val
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {val}
                </div>
                <p className={`text-sm pt-1 ${
                  currentAnswer === val ? "text-card-foreground font-medium" : "text-muted-foreground"
                }`}>
                  {currentQuestion.descriptions[val][language]}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("back")}
        </Button>

        <Button onClick={handleNext} disabled={currentAnswer === 0}>
          {currentIndex === totalQuestions - 1 ? (
            <>
              {language === "de" ? "Ergebnis anzeigen" : "Show Results"}
              <CheckCircle2 className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              {language === "de" ? "Weiter" : "Next"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
