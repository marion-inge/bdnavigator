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

import { Scoring, SCORING_WEIGHTS, calculateTotalScore } from "./types";
import { ScoringQuestion, ROUGH_SCORING_QUESTIONS } from "./roughScoringQuestions";

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

// ─── Mock Implementation ─────────────────────────────────────────────

function generateMockAssessment(input: AssessmentInput): AIAssessmentResult {
  const { answers, scoring, language } = input;
  const totalScore = calculateTotalScore(scoring);
  const rating = getOverallRating(totalScore);

  const categories = ["marketAttractiveness", "strategicFit", "feasibility", "commercialViability", "risk"] as const;
  
  const catScores = categories.map((cat) => ({
    category: cat,
    score: scoring[cat].score,
    weight: SCORING_WEIGHTS[cat],
  }));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const nextSteps: string[] = [];
  const pitfalls: string[] = [];

  const labels: Record<string, { en: string; de: string }> = {
    marketAttractiveness: { en: "Market Attractiveness", de: "Marktattraktivität" },
    strategicFit: { en: "Strategic Fit", de: "Strategischer Fit" },
    feasibility: { en: "Feasibility", de: "Machbarkeit" },
    commercialViability: { en: "Commercial Viability", de: "Kommerzielle Tragfähigkeit" },
    risk: { en: "Risk", de: "Risiko" },
  };

  for (const cs of catScores) {
    const label = labels[cs.category][language];
    if (cs.category === "risk") {
      if (cs.score <= 2) {
        strengths.push(language === "de"
          ? `Niedriges Risikoprofil – ${label} ist gut kontrolliert`
          : `Low risk profile – ${label} is well controlled`);
      } else if (cs.score >= 4) {
        weaknesses.push(language === "de"
          ? `Hohes Risiko in ${label} – sorgfältige Risikominimierung erforderlich`
          : `High risk in ${label} – careful mitigation needed`);
        pitfalls.push(language === "de"
          ? `Unvorhergesehene regulatorische oder technische Hürden könnten das Projekt verzögern`
          : `Unforeseen regulatory or technical hurdles could delay the project`);
      }
    } else {
      if (cs.score >= 4) {
        strengths.push(language === "de"
          ? `Starke Bewertung in ${label} (${cs.score}/5)`
          : `Strong rating in ${label} (${cs.score}/5)`);
      } else if (cs.score <= 2) {
        weaknesses.push(language === "de"
          ? `Schwache Bewertung in ${label} (${cs.score}/5) – Verbesserungspotenzial`
          : `Weak rating in ${label} (${cs.score}/5) – room for improvement`);
      }
    }
  }

  // Generate next steps based on weak areas
  if (scoring.marketAttractiveness.score <= 3) {
    nextSteps.push(language === "de"
      ? "Marktanalyse vertiefen: TAM/SAM quantifizieren und Kundenbedarf validieren"
      : "Deepen market analysis: quantify TAM/SAM and validate customer demand");
  }
  if (scoring.strategicFit.score <= 3) {
    nextSteps.push(language === "de"
      ? "Strategische Passung prüfen: Synergien mit bestehendem Portfolio klären"
      : "Review strategic fit: clarify synergies with existing portfolio");
  }
  if (scoring.feasibility.score <= 3) {
    nextSteps.push(language === "de"
      ? "Machbarkeitsstudie durchführen: Technologie-Readiness und Ressourcenbedarf bewerten"
      : "Conduct feasibility study: assess technology readiness and resource needs");
  }
  if (scoring.commercialViability.score <= 3) {
    nextSteps.push(language === "de"
      ? "Geschäftsmodell schärfen: Erlösmodell definieren und Margen kalkulieren"
      : "Sharpen business model: define revenue model and calculate margins");
  }
  if (scoring.risk.score >= 3) {
    nextSteps.push(language === "de"
      ? "Risikominimierungsplan erstellen: Top-Risiken identifizieren und Gegenmaßnahmen planen"
      : "Create risk mitigation plan: identify top risks and plan countermeasures");
  }

  // Always add general next steps
  nextSteps.push(language === "de"
    ? "Erste Kundengespräche führen, um die Annahmen zu validieren"
    : "Conduct initial customer interviews to validate assumptions");

  // General pitfalls based on score ranges
  if (totalScore >= 3.5) {
    pitfalls.push(language === "de"
      ? "Overconfidence-Bias: Gute Scores können dazu verleiten, kritische Annahmen nicht ausreichend zu hinterfragen"
      : "Overconfidence bias: Good scores can lead to insufficient questioning of critical assumptions");
  }
  if (scoring.feasibility.score >= 4 && scoring.commercialViability.score <= 2) {
    pitfalls.push(language === "de"
      ? "Technologie-Push-Falle: Hohe Machbarkeit bedeutet nicht automatisch kommerziellen Erfolg"
      : "Technology-push trap: High feasibility doesn't automatically mean commercial success");
  }
  if (scoring.marketAttractiveness.score >= 4 && scoring.strategicFit.score <= 2) {
    pitfalls.push(language === "de"
      ? "Attraktiver Markt, aber schwacher strategischer Fit – Gefahr der Ressourcenstreuung"
      : "Attractive market but weak strategic fit – risk of resource dilution");
  }

  // Ensure minimum content
  if (strengths.length === 0) {
    strengths.push(language === "de" ? "Ausgeglichenes Profil ohne extreme Schwächen" : "Balanced profile with no extreme weaknesses");
  }
  if (weaknesses.length === 0) {
    weaknesses.push(language === "de" ? "Keine gravierenden Schwächen identifiziert" : "No significant weaknesses identified");
  }
  if (pitfalls.length === 0) {
    pitfalls.push(language === "de"
      ? "Sicherstellen, dass genügend Marktvalidierung vor dem nächsten Gate erfolgt"
      : "Ensure sufficient market validation before the next gate");
  }

  // Summary
  const ratingLabel = getRatingLabel(rating, language);
  const summary = language === "de"
    ? `Die Idee wird insgesamt als "${ratingLabel}" eingestuft (Gesamtscore: ${totalScore.toFixed(1)}/5). ${strengths.length > weaknesses.length ? "Die Stärken überwiegen die Schwächen." : weaknesses.length > strengths.length ? "Es gibt mehrere Bereiche mit Verbesserungspotenzial." : "Stärken und Schwächen halten sich die Waage."} Eine vertiefte Analyse in den schwächeren Kategorien wird empfohlen, bevor die Idee zum nächsten Gate weitergeleitet wird.`
    : `The idea is rated overall as "${ratingLabel}" (total score: ${totalScore.toFixed(1)}/5). ${strengths.length > weaknesses.length ? "Strengths outweigh weaknesses." : weaknesses.length > strengths.length ? "There are several areas for improvement." : "Strengths and weaknesses are balanced."} A deeper analysis in weaker categories is recommended before advancing to the next gate.`;

  return { summary, strengths, weaknesses, nextSteps, pitfalls, overallRating: rating };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Generate an AI assessment for an opportunity based on scoring answers.
 * 
 * Replace this function body with a real API call when connecting
 * to your own LLM backend.
 */
export async function generateAssessment(input: AssessmentInput): Promise<AIAssessmentResult> {
  // Simulate network delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return generateMockAssessment(input);
}
