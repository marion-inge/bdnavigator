import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Scoring } from "@/lib/types";
import {
  generateAssessment,
  AIAssessmentResult,
  getRatingLabel,
  getRatingColor,
} from "@/lib/aiAssessmentService";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, Shield, Loader2 } from "lucide-react";

interface AIAssessmentProps {
  scoring: Scoring;
  answers: Record<string, number>;
  title?: string;
  description?: string;
  basis?: string;
}

export function AIAssessment({ scoring, answers, title, description, basis }: AIAssessmentProps) {
  const { language } = useI18n();
  const [result, setResult] = useState<AIAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const assessment = await generateAssessment({
        answers,
        scoring,
        title,
        description,
        language: language as "en" | "de",
      });
      setResult(assessment);
    } catch (e) {
      setError(language === "de" ? "Fehler bei der Analyse. Bitte erneut versuchen." : "Error generating assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">
              {language === "de" ? "KI-Einschätzung" : "AI Assessment"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {language === "de"
                ? "Erhalte eine automatische Bewertung deiner Idee mit Stärken, Schwächen, nächsten Schritten und möglichen Stolpersteinen."
                : "Get an automatic evaluation of your idea with strengths, weaknesses, next steps, and potential pitfalls."}
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="mt-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "de" ? "Analysiere..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {language === "de" ? "Einschätzung generieren" : "Generate Assessment"}
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-[10px] text-muted-foreground mt-1">
            Powered by Lovable AI
          </p>
        </div>
      </div>
    );
  }

  const ratingColor = getRatingColor(result.overallRating);
  const ratingLabel = getRatingLabel(result.overallRating, language as "en" | "de");

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">
            {language === "de" ? "KI-Einschätzung" : "AI Assessment"}
          </h3>
          {basis && (
            <span className="text-[10px] text-muted-foreground">
              {language === "de" ? "Basis" : "Based on"}: {basis}
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${ratingColor}20`, color: ratingColor }}
        >
          {ratingLabel}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>

      {/* Grid sections */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--success))]">
            <TrendingUp className="h-4 w-4" />
            {language === "de" ? "Stärken" : "Strengths"}
          </div>
          <ul className="space-y-1">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-[hsl(var(--success))] mt-1 shrink-0">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--warning))]">
            <AlertTriangle className="h-4 w-4" />
            {language === "de" ? "Schwächen" : "Weaknesses"}
          </div>
          <ul className="space-y-1">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-[hsl(var(--warning))] mt-1 shrink-0">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <ArrowRight className="h-4 w-4" />
            {language === "de" ? "Nächste Schritte" : "Next Steps"}
          </div>
          <ol className="space-y-1">
            {result.nextSteps.map((s, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-primary font-semibold mt-0 shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* Pitfalls */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <Shield className="h-4 w-4" />
            {language === "de" ? "Stolpersteine" : "Pitfalls"}
          </div>
          <ul className="space-y-1">
            {result.pitfalls.map((p, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-destructive mt-1 shrink-0">⚠</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Powered by Lovable AI
        </p>
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              {language === "de" ? "Neu generieren" : "Regenerate"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
