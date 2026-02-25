/**
 * AI Assessment Service – Abstracted interface for idea evaluation.
 * 
 * Currently uses a MOCK implementation that generates assessments locally.
 * To connect to a real LLM backend, replace the `generateAssessment` function
 * with an API call to your own endpoint.
 * 
 * Example for future integration:
 * ```
 * const response = await fetch(AI_ENDPOINT_URL, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
 *   body: JSON.stringify({ answers, scores, title, description, language }),
 * });
 * return await response.json() as AIAssessmentResult;
 * ```
 */

import { Scoring } from "./types";

export interface AIAssessmentResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  pitfalls: string[];
  overallRating: "very_promising" | "promising" | "moderate" | "challenging" | "critical";
}

interface AssessmentInput {
  answers: Record<string, number>;
  scoring: Scoring;
  title?: string;
  description?: string;
  language: "en" | "de";
}

// Rating thresholds
function getOverallRating(totalScore: number): AIAssessmentResult["overallRating"] {
  if (totalScore >= 4.5) return "very_promising";
  if (totalScore >= 3.5) return "promising";
  if (totalScore >= 2.5) return "moderate";
  if (totalScore >= 1.5) return "challenging";
  return "critical";
}

const RATING_LABELS: Record<AIAssessmentResult["overallRating"], { en: string; de: string }> = {
  very_promising: { en: "Very Promising", de: "Sehr vielversprechend" },
  promising: { en: "Promising", de: "Vielversprechend" },
  moderate: { en: "Moderate", de: "Moderat" },
  challenging: { en: "Challenging", de: "Herausfordernd" },
  critical: { en: "Critical", de: "Kritisch" },
};

export function getRatingLabel(rating: AIAssessmentResult["overallRating"], language: "en" | "de"): string {
  return RATING_LABELS[rating][language];
}

export function getRatingColor(rating: AIAssessmentResult["overallRating"]): string {
  switch (rating) {
    case "very_promising": return "hsl(var(--success))";
    case "promising": return "hsl(142 71% 45%)";
    case "moderate": return "hsl(var(--warning))";
    case "challenging": return "hsl(25 95% 53%)";
    case "critical": return "hsl(var(--destructive))";
  }
}

// ─── Database Persistence ────────────────────────────────────────────

export async function saveAssessment(
  opportunityId: string,
  basis: string,
  result: AIAssessmentResult
): Promise<void> {
  const { supabase } = await import("@/integrations/supabase/client");

  const { error } = await (supabase as any).from("ai_assessments").upsert(
    {
      opportunity_id: opportunityId,
      basis,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      next_steps: result.nextSteps,
      pitfalls: result.pitfalls,
      overall_rating: result.overallRating,
    },
    { onConflict: "opportunity_id,basis" }
  );

  if (error) {
    console.error("Failed to save assessment:", error);
  }
}

export async function loadAssessment(
  opportunityId: string,
  basis: string
): Promise<AIAssessmentResult | null> {
  const { supabase } = await import("@/integrations/supabase/client");

  const { data, error } = await (supabase as any)
    .from("ai_assessments")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .eq("basis", basis)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    summary: data.summary,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    nextSteps: data.next_steps,
    pitfalls: data.pitfalls,
    overallRating: data.overall_rating,
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Generate an AI assessment for an opportunity based on scoring answers.
 * Calls the ai-assessment edge function which uses Lovable AI.
 */
export async function generateAssessment(input: AssessmentInput): Promise<AIAssessmentResult> {
  const { supabase } = await import("@/integrations/supabase/client");

  const { data, error } = await supabase.functions.invoke("ai-assessment", {
    body: {
      scoring: input.scoring,
      answers: input.answers,
      title: input.title,
      description: input.description,
      language: input.language,
    },
  });

  if (error) {
    console.error("AI assessment error:", error);
    throw new Error(error.message || "Failed to generate assessment");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as AIAssessmentResult;
}
