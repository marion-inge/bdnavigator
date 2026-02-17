import { useI18n } from "@/lib/i18n";
import { DetailedScoring } from "@/lib/types";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface Props {
  scoring: DetailedScoring;
}

export function ScoringOverviewTab({ scoring }: Props) {
  const { t } = useI18n();

  const radarData = [
    { criterion: t("marketAttractiveness"), score: scoring.marketAttractiveness.score, fullMark: 5 },
    { criterion: t("strategicFit"), score: scoring.strategicFit.score, fullMark: 5 },
    { criterion: t("feasibility"), score: scoring.feasibility.score, fullMark: 5 },
    { criterion: t("commercialViability"), score: scoring.commercialViability.score, fullMark: 5 },
    { criterion: t("risk"), score: 6 - scoring.risk.score, fullMark: 5 },
  ];

  const totalScore =
    (scoring.marketAttractiveness.score * 3 +
      scoring.strategicFit.score * 3 +
      scoring.feasibility.score * 2 +
      scoring.commercialViability.score * 2 +
      (6 - scoring.risk.score) * 1) /
    11;

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

  const criteria = [
    { key: "marketAttractiveness" as const, score: scoring.marketAttractiveness.score, weight: 3 },
    { key: "strategicFit" as const, score: scoring.strategicFit.score, weight: 3 },
    { key: "feasibility" as const, score: scoring.feasibility.score, weight: 2 },
    { key: "commercialViability" as const, score: scoring.commercialViability.score, weight: 2 },
    { key: "risk" as const, score: scoring.risk.score, weight: 1, inverted: true },
  ];

  return (
    <div className="space-y-6">
      {/* Total Score Card */}
      <div className={`rounded-xl border-2 p-6 text-center ${getScoreBg(totalScore)}`}>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("detailedTotalScore")}</span>
        <p className={`text-5xl font-bold mt-2 ${getScoreColor(totalScore)}`}>{totalScore.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground mt-1">/ 5.0</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h4 className="font-semibold text-card-foreground mb-4">{t("scoringRadar")}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Cards Grid */}
        <div className="space-y-3">
          {criteria.map(({ key, score, weight, inverted }) => {
            const displayScore = inverted ? 6 - score : score;
            return (
              <div key={key} className={`rounded-lg border p-4 flex items-center justify-between ${getScoreBg(displayScore)}`}>
                <div>
                  <p className="font-medium text-card-foreground">{t(key)}</p>
                  <p className="text-xs text-muted-foreground">{t("weight")}: {weight}x {inverted ? `• ${t("riskNote")}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>{score}</p>
                  <p className="text-xs text-muted-foreground">/ 5</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
