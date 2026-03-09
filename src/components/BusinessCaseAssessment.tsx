import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  AIAssessmentResult,
  getRatingLabel,
  getRatingColor,
  saveAssessment,
  loadAssessment,
} from "@/lib/aiAssessmentService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, ArrowRight, Shield, Loader2 } from "lucide-react";
import idaRobot from "@/assets/ida-robot.png";

interface Props {
  opportunityId: string;
  title?: string;
  description?: string;
  industry?: string;
  technology?: string;
  kpis: {
    totalROCE: number;
    npv: number;
    paybackPeriod: number | null;
    totalEbit: number;
    totalSales: number;
  };
  parameters: Record<string, any>;
  yearData: Array<Record<string, any>>;
}

export function BusinessCaseAssessment({ opportunityId, title, description, industry, technology, kpis, parameters, yearData }: Props) {
  const { language } = useI18n();
  const [result, setResult] = useState<AIAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const basis = "business_case";

  useEffect(() => {
    loadAssessment(opportunityId, basis)
      .then((saved) => { if (saved) setResult(saved); })
      .finally(() => setInitialLoading(false));
  }, [opportunityId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("business-case-assessment", {
        body: { kpis, parameters, yearData, title, description, industry, technology, language },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      const assessment = data as AIAssessmentResult;
      setResult(assessment);
      await saveAssessment(opportunityId, basis, assessment);
    } catch (e) {
      setError(language === "de"
        ? "IDA konnte die Analyse nicht abschließen. Bitte erneut versuchen."
        : "IDA could not complete the analysis. Please try again.");
      console.error("Business case assessment error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <img src={idaRobot} alt="IDA" className="w-16 h-16" />
          <div>
            <h3 className="font-semibold text-card-foreground">
              IDA – {language === "de" ? "Business Case Analyse" : "Business Case Analysis"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {language === "de"
                ? "Ich analysiere deinen Business Case: ROCE, NPV, Payback, EBIT-Entwicklung, Cashflow-Dynamik und Working Capital. Du erhältst eine fundierte Bewertung mit konkreten Empfehlungen."
                : "I'll analyze your business case: ROCE, NPV, Payback, EBIT development, cash flow dynamics, and working capital. You'll get a thorough evaluation with actionable recommendations."}
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="mt-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "de" ? "IDA analysiert..." : "IDA is analyzing..."}
              </>
            ) : (
              <>
                <img src={idaRobot} alt="" className="h-4 w-4 mr-2" />
                {language === "de" ? "Business Case analysieren" : "Analyze Business Case"}
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
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
          <img src={idaRobot} alt="IDA" className="h-6 w-6" />
          <h3 className="font-semibold text-card-foreground">
            {language === "de" ? "IDAs Business Case Bewertung" : "IDA's Business Case Assessment"}
          </h3>
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
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--success))]">
            <TrendingUp className="h-4 w-4" />
            {language === "de" ? "Stärken" : "Strengths"}
          </div>
          <ul className="space-y-1">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-[hsl(var(--success))] mt-1 shrink-0">•</span>{s}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--warning))]">
            <AlertTriangle className="h-4 w-4" />
            {language === "de" ? "Schwächen" : "Weaknesses"}
          </div>
          <ul className="space-y-1">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-[hsl(var(--warning))] mt-1 shrink-0">•</span>{w}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <ArrowRight className="h-4 w-4" />
            {language === "de" ? "Empfehlungen" : "Recommendations"}
          </div>
          <ol className="space-y-1">
            {result.nextSteps.map((s, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-primary font-semibold mt-0 shrink-0">{i + 1}.</span>{s}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <Shield className="h-4 w-4" />
            {language === "de" ? "Risiken & Sensitivitäten" : "Risks & Sensitivities"}
          </div>
          <ul className="space-y-1">
            {result.pitfalls.map((p, i) => (
              <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                <span className="text-destructive mt-1 shrink-0">⚠</span>{p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <img src={idaRobot} alt="IDA" className="h-4 w-4" />
          <p className="text-[10px] text-muted-foreground">IDA – Internal Data Analyst</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
            <>
              <img src={idaRobot} alt="" className="h-3 w-3 mr-1" />
              {language === "de" ? "Neu analysieren" : "Re-analyze"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
