import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import { getQuestionsByCategory, ScoringQuestion } from "@/lib/roughScoringQuestions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, MessageSquare, LinkIcon, Plus, X } from "lucide-react";
import { AIAssessment } from "@/components/AIAssessment";
import { Input } from "@/components/ui/input";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface RoughScoringWizardProps {
  scoring: Scoring;
  onSave: (scoring: Scoring, answers: Record<string, number>, comments: Record<string, string>, sources: Record<string, string[]>) => void;
  onAutoSave?: (data: { answers: Record<string, number>; comments: Record<string, string>; sources: Record<string, string[]> }) => void;
  readonly?: boolean;
  initialAnswers?: Record<string, number>;
  initialComments?: Record<string, string>;
  initialSources?: Record<string, string[]>;
  startWithSummary?: boolean;
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

export function RoughScoringWizard({ scoring, onSave, onAutoSave, readonly, initialAnswers, initialComments, initialSources, startWithSummary, opportunityId, opportunityTitle, opportunityDescription, opportunitySolutionDescription, opportunityIndustry, opportunityGeography, opportunityTechnology, opportunityIdeaBringer, opportunityOwner }: RoughScoringWizardProps) {
  const { t, language } = useI18n();
  const categorizedQuestions = useMemo(() => getQuestionsByCategory(), []);
  const allQuestions = useMemo(() => categorizedQuestions.flatMap((c) => c.questions), [categorizedQuestions]);

  // Find first unanswered question index for resuming
  const resumeIndex = useMemo(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      const idx = allQuestions.findIndex((q) => !initialAnswers[q.id] || initialAnswers[q.id] === 0);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(startWithSummary ? 0 : resumeIndex);
  const [answers, setAnswers] = useState<Answers>(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      return { ...initialAnswers };
    }
    const initial: Answers = {};
    for (const q of allQuestions) {
      initial[q.id] = scoring[q.category].score;
    }
    return initial;
  });
  const [comments, setComments] = useState<Record<string, string>>(() => {
    return initialComments && Object.keys(initialComments).length > 0 ? { ...initialComments } : {};
  });
  const [sources, setSources] = useState<Record<string, string[]>>(() => {
    return initialSources && Object.keys(initialSources).length > 0 ? { ...initialSources } : {};
  });
  const [showSummary, setShowSummary] = useState(!!startWithSummary);

  // Auto-save with debounce
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  const commentsRef = useRef(comments);
  const sourcesRef = useRef(sources);
  answersRef.current = answers;
  commentsRef.current = comments;
  sourcesRef.current = sources;

  const triggerAutoSave = useCallback(() => {
    if (!onAutoSave) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      onAutoSave({
        answers: answersRef.current,
        comments: commentsRef.current,
        sources: sourcesRef.current,
      });
    }, 500);
  }, [onAutoSave]);

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
    triggerAutoSave();
  };

  const handleNext = () => {
    const answer = answers[currentQuestion?.id] || 0;
    if (answer === 0) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Auto-save when reaching the results page
      const newScoring = answersToScoring(answers, allQuestions, scoring);
      onSave(newScoring, answers, comments, sources);
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
    onSave(newScoring, answers, comments, sources);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const resultScoring = answersToScoring(answers, allQuestions, scoring);
  const totalScore = calculateTotalScore(resultScoring);

  if (showSummary) {
    const categoryAverages = categorizedQuestions.map(({ category, questions }) => {
      const catAnswered = questions.filter((q) => answers[q.id] > 0);
      const avg = catAnswered.length > 0
        ? catAnswered.reduce((sum, q) => sum + answers[q.id], 0) / catAnswered.length
        : 0;
      return { category, avg: Math.round(avg * 10) / 10, finalScore: Math.round(avg), answered: catAnswered.length, total: questions.length };
    });

    const radarData = categoryAverages.map(({ category, avg }) => ({
      criterion: categoryLabels[category][language],
      score: category === "risk" ? (avg > 0 ? 6 - avg : 0) : avg,
      fullMark: 5,
    }));

    const getScoreColor = (score: number) => {
      if (score >= 4) return "text-green-600 dark:text-green-400";
      if (score >= 3) return "text-yellow-600 dark:text-yellow-400";
      return "text-red-600 dark:text-red-400";
    };

    const getScoreBg = (score: number) => {
      if (score >= 4) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      if (score >= 3) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            {language === "de" ? "Ergebnis" : "Results"}
          </h3>
          <Progress value={100} className="w-48 h-2" />
        </div>

        {/* Total Score + Spider Chart at top */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Total Score Card */}
          <div className={`rounded-xl border-2 p-6 text-center flex flex-col justify-center ${getScoreBg(totalScore)}`}>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("totalScore")}
            </span>
            <p className={`text-5xl font-bold mt-2 ${getScoreColor(totalScore)}`}>{totalScore.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground mt-1">/ 5.0</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                {language === "de" ? "Nochmal" : "Restart"}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("back")}
              </Button>
            </div>
          </div>

          {/* Spider/Radar Chart */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="font-semibold text-card-foreground mb-2 text-sm">
              {language === "de" ? "Kategorie-Übersicht" : "Category Overview"}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {language === "de" ? "Risiko ist invertiert (5 = niedrig)" : "Risk is inverted (5 = low)"}
            </p>
          </div>
        </div>

        {/* Category Score Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categoryAverages.map(({ category, avg, finalScore }) => {
            const displayScore = category === "risk" ? (avg > 0 ? 6 - avg : 0) : avg;
            return (
              <div key={category} className={`rounded-lg border p-3 text-center ${getScoreBg(displayScore)}`}>
                <p className="text-xs font-medium text-muted-foreground">{categoryLabels[category][language]}</p>
                <p className={`text-2xl font-bold mt-1 ${getScoreColor(displayScore)}`}>{finalScore}</p>
                <p className="text-xs text-muted-foreground">Ø {avg} · {SCORING_WEIGHTS[category]}x</p>
              </div>
            );
          })}
        </div>

        {/* Detailed category breakdown */}
        <div className="grid gap-4">
          {categorizedQuestions.map(({ category, questions }) => {
            const catData = categoryAverages.find(c => c.category === category)!;

            return (
              <div key={category} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      {categoryLabels[category][language]}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {language === "de" ? `${catData.answered}/${catData.total} beantwortet` : `${catData.answered}/${catData.total} answered`}
                      {" · "}
                      {language === "de" ? "Gewicht" : "Weight"}: {SCORING_WEIGHTS[category]}
                      {category === "risk" && (
                        <span className="ml-1">({t("riskNote")})</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">{language === "de" ? "Ø" : "Avg"} {catData.avg}</span>
                    <p className="text-2xl font-bold text-primary">{catData.finalScore}</p>
                  </div>
                </div>

                {/* Individual question scores */}
                <div className="space-y-1">
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
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
                      {comments[q.id] && (
                        <div className="flex items-start gap-1.5 ml-1 pb-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground italic">{comments[q.id]}</p>
                        </div>
                      )}
                      {sources[q.id] && sources[q.id].length > 0 && (
                        <div className="flex items-start gap-1.5 ml-1 pb-1">
                          <LinkIcon className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {sources[q.id].filter(Boolean).map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate max-w-[200px]">
                                {url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Assessment */}
        <AIAssessment
          scoring={resultScoring}
          answers={answers}
          comments={comments}
          title={opportunityTitle}
          description={opportunityDescription}
          solutionDescription={opportunitySolutionDescription}
          industry={opportunityIndustry}
          geography={opportunityGeography}
          technology={opportunityTechnology}
          ideaBringer={opportunityIdeaBringer}
          owner={opportunityOwner}
          opportunityId={opportunityId || "draft"}
        />
      </div>
    );
  }

  // Question view
  const currentAnswer = answers[currentQuestion.id] || 0;
  const currentCommentMissing = currentAnswer > 0 && !comments[currentQuestion.id]?.trim();

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

      {/* Category indicator — clickable question dots */}
        <div className="flex items-center gap-1">
          {categorizedQuestions.map(({ category, questions }, catIdx) => (
            <div key={category} className="flex items-center gap-0.5">
              {questions.map((q, qIdx) => {
                const globalIdx = categorizedQuestions
                  .slice(0, catIdx)
                  .reduce((sum, c) => sum + c.questions.length, 0) + qIdx;
                const isAnswered = answers[q.id] > 0;
                const isCurrent = globalIdx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(globalIdx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrent
                        ? "bg-primary ring-2 ring-primary/30 scale-125"
                        : isAnswered
                        ? "bg-primary/60 hover:bg-primary/80"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                    title={q.question[language]}
                  />
                );
              })}
              {catIdx < categorizedQuestions.length - 1 && (
                <div className="w-2" />
              )}
            </div>
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

        {/* Comment field (mandatory) */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">
              {language === "de" ? "Kommentar" : "Comment"} <span className="text-destructive">*</span>
            </label>
          </div>
          {currentQuestion.commentHint && (
            <p className="text-xs text-muted-foreground mb-2 italic">
              {currentQuestion.commentHint[language]}
            </p>
          )}
          <Textarea
            value={comments[currentQuestion.id] || ""}
            onChange={(e) => { setComments((prev) => ({ ...prev, [currentQuestion.id]: e.target.value })); triggerAutoSave(); }}
            placeholder={language === "de" ? "Begründung, Notizen, Anmerkungen..." : "Rationale, notes, remarks..."}
            disabled={readonly}
            rows={2}
            className={`text-sm resize-none ${
              !comments[currentQuestion.id]?.trim() && currentAnswer > 0 ? "border-destructive/50" : ""
            }`}
          />
          {!comments[currentQuestion.id]?.trim() && currentAnswer > 0 && (
            <p className="text-xs text-destructive mt-1">
              {language === "de" ? "Bitte Kommentar hinzufügen" : "Please add a comment"}
            </p>
          )}
        </div>

        {/* Sources */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground">
                {language === "de" ? "Quellen" : "Sources"}
              </label>
            </div>
            {!readonly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setSources((prev) => ({
                  ...prev,
                  [currentQuestion.id]: [...(prev[currentQuestion.id] || []), ""],
                }))}
              >
                <Plus className="h-3 w-3 mr-1" />
                {language === "de" ? "Link hinzufügen" : "Add link"}
              </Button>
            )}
          </div>
          {(sources[currentQuestion.id] || []).map((url, idx) => (
            <div key={idx} className="flex items-center gap-1.5 mb-1.5">
              <Input
                value={url}
                onChange={(e) => {
                  const updated = [...(sources[currentQuestion.id] || [])];
                  updated[idx] = e.target.value;
                  setSources((prev) => ({ ...prev, [currentQuestion.id]: updated }));
                  triggerAutoSave();
                }}
                placeholder="https://..."
                disabled={readonly}
                className="text-xs h-7"
              />
              {!readonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => {
                    const updated = (sources[currentQuestion.id] || []).filter((_, i) => i !== idx);
                    setSources((prev) => ({ ...prev, [currentQuestion.id]: updated }));
                    triggerAutoSave();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
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

        <Button onClick={handleNext} disabled={currentCommentMissing}>
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
