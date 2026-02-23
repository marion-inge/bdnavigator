import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { Opportunity, calculateTotalScore, STAGE_ORDER, SCORING_WEIGHTS } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { StageTimeline } from "@/components/StageTimeline";
import { Button } from "@/components/ui/button";
import { Stage } from "@/lib/types";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell,
} from "recharts";
import {
  Globe, Cpu, User, Calendar, FileText, CheckCircle2, Clock,
  XCircle, PauseCircle, ArrowRight, TrendingUp, AlertTriangle,
  DollarSign, Target, ChevronRight,
} from "lucide-react";

interface OpportunityOverviewProps {
  opportunity: Opportunity;
  onAdvanceStage: (stage: Stage) => void;
}

// (STAGE_PROGRESS moved to StageTimeline component)

const CRITERION_COLORS: Record<string, string> = {
  marketAttractiveness: "hsl(200, 60%, 45%)",
  strategicFit: "hsl(260, 45%, 55%)",
  feasibility: "hsl(170, 50%, 40%)",
  commercialViability: "hsl(38, 90%, 50%)",
  risk: "hsl(0, 65%, 50%)",
};

export function OpportunityOverview({ opportunity: opp, onAdvanceStage }: OpportunityOverviewProps) {
  const { t } = useI18n();
  const totalScore = calculateTotalScore(opp.scoring);

  const canMoveToRoughScoring = opp.stage === "idea";
  const canMoveToGate1 = opp.stage === "rough_scoring";
  const canMoveToGate2 = opp.stage === "detailed_scoring";
  const canMoveToGate3 = opp.stage === "business_case";
  const canMoveToImplementReview = opp.stage === "go_to_market";
  const hasAction = canMoveToRoughScoring || canMoveToGate1 || canMoveToGate2 || canMoveToGate3 || canMoveToImplementReview;

  // Radar data
  const radarData = useMemo(() => {
    const keys = ["marketAttractiveness", "strategicFit", "feasibility", "commercialViability", "risk"] as const;
    return keys.map((key) => ({
      criterion: t(key),
      score: key === "risk" ? 6 - opp.scoring[key].score : opp.scoring[key].score,
      fullMark: 5,
    }));
  }, [opp.scoring, t]);

  // Bar chart for scoring breakdown
  const barData = useMemo(() => {
    const keys = ["marketAttractiveness", "strategicFit", "feasibility", "commercialViability", "risk"] as const;
    return keys.map((key) => ({
      key,
      label: t(key),
      score: opp.scoring[key].score,
      adjusted: key === "risk" ? 6 - opp.scoring[key].score : opp.scoring[key].score,
      weight: SCORING_WEIGHTS[key],
    }));
  }, [opp.scoring, t]);

  // Detailed scoring average
  const detailedAvg = useMemo(() => {
    if (!opp.detailedScoring) return null;
    const ds = opp.detailedScoring;
    return Math.round(
      ((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) * 10
    ) / 10;
  }, [opp.detailedScoring]);

  // Stage progress (timeline now handled by StageTimeline component)

  // Score color
  const scoreColor = totalScore >= 3.5 ? "text-[hsl(var(--success))]" : totalScore >= 2.5 ? "text-[hsl(var(--warning))]" : "text-destructive";
  const scoreLabel = totalScore >= 3.5 ? t("scoreHigh") : totalScore >= 2.5 ? t("scoreMedium") : t("scoreLow");

  return (
    <div className="space-y-5">
      {/* Top Row: Score Hero + Meta Info */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Score Hero */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("totalScore")}</span>
          <div className="relative">
            <svg viewBox="0 0 120 120" className="w-28 h-28">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(220, 15%, 90%)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={totalScore >= 3.5 ? "hsl(145, 55%, 40%)" : totalScore >= 2.5 ? "hsl(38, 90%, 50%)" : "hsl(0, 65%, 50%)"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(totalScore / 5) * 327} 327`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{totalScore.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">/ 5.0</span>
            </div>
          </div>
          <span className={`text-sm font-medium mt-2 ${scoreColor}`}>{scoreLabel}</span>
          {detailedAvg !== null && (
            <div className="mt-3 pt-3 border-t border-border w-full">
              <span className="text-xs text-muted-foreground">{t("detailedScoring")}</span>
              <p className="text-lg font-bold text-primary">{detailedAvg.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">/ 5.0</span></p>
            </div>
          )}
        </div>

        {/* Description & Meta */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <p className="text-sm text-card-foreground leading-relaxed">{opp.description || "—"}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaItem icon={<FileText className="h-3.5 w-3.5" />} label={t("industry")} value={opp.industry} />
            <MetaItem icon={<Globe className="h-3.5 w-3.5" />} label={t("geography")} value={opp.geography} />
            <MetaItem icon={<Cpu className="h-3.5 w-3.5" />} label={t("technology")} value={opp.technology} />
            <MetaItem icon={<User className="h-3.5 w-3.5" />} label={t("owner")} value={opp.owner} />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t("createdAt")}: {new Date(opp.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stage Progress Timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("ovStageProgress")}</h3>
        <StageTimeline currentStage={opp.stage} />
        {/* Action Button */}
        {hasAction && (
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-3">
            {canMoveToRoughScoring && (
              <Button size="sm" onClick={() => onAdvanceStage("rough_scoring")} className="gap-1.5">
                {t("moveToRoughScoring")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {canMoveToGate1 && (
              <Button size="sm" onClick={() => onAdvanceStage("gate1")} className="gap-1.5">
                → {t("stage_gate1")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {canMoveToGate2 && (
              <Button size="sm" onClick={() => onAdvanceStage("gate2")} className="gap-1.5">
                → {t("stage_gate2")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {canMoveToGate3 && (
              <Button size="sm" onClick={() => onAdvanceStage("gate3")} className="gap-1.5">
                → {t("stage_gate3")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {canMoveToImplementReview && (
              <Button size="sm" onClick={() => onAdvanceStage("implement_review")} className="gap-1.5">
                {t("moveToImplementReview")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Charts Row: Radar + Scoring Bars */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("scoringRadar")}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} outerRadius={75}>
              <PolarGrid stroke="hsl(220, 15%, 88%)" />
              <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="hsl(215, 50%, 30%)" fill="hsl(215, 50%, 30%)" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,88%)", borderRadius: "8px", fontSize: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Scoring Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("ovScoringBreakdown")}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,88%)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="adjusted" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {barData.map((entry) => (
                  <Cell key={entry.key} fill={CRITERION_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Gate History + Business Case Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gate Decision History */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("ovGateHistory")}</h3>
          {opp.gates.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noDecisions")}</p>
          ) : (
            <div className="space-y-3">
              {opp.gates.map((gate) => (
                <div key={gate.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="mt-0.5">
                    {gate.decision === "go" && <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />}
                    {gate.decision === "hold" && <PauseCircle className="h-4 w-4 text-[hsl(var(--warning))]" />}
                    {gate.decision === "no-go" && <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-card-foreground">{t(`stage_${gate.gate}` as any)}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        gate.decision === "go" ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" :
                        gate.decision === "hold" ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" :
                        "bg-destructive/15 text-destructive"
                      }`}>{t(gate.decision === "no-go" ? "noGo" : gate.decision as any)}</span>
                    </div>
                    {gate.comment && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gate.comment}</p>}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{gate.decider}</span>
                      <span>{new Date(gate.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Business Case Summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">{t("ovBcSummary")}</h3>
          {!opp.businessCase ? (
            <p className="text-sm text-muted-foreground">{t("ovNoBc")}</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <BcMetric icon={<DollarSign className="h-3.5 w-3.5" />} label={t("investmentCost")} value={`€${(opp.businessCase.investmentCost / 1e6).toFixed(1)}M`} />
                <BcMetric icon={<TrendingUp className="h-3.5 w-3.5" />} label={t("roi")} value={`${opp.businessCase.roi}%`} highlight />
                <BcMetric icon={<Clock className="h-3.5 w-3.5" />} label={t("paybackPeriod")} value={`${opp.businessCase.paybackPeriod} mo`} />
                <BcMetric icon={<Target className="h-3.5 w-3.5" />} label={t("npv")} value={`€${(opp.businessCase.npv / 1e6).toFixed(1)}M`} highlight />
              </div>
              {opp.businessCase.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-3">{opp.businessCase.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <p className="text-sm text-card-foreground font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

function BcMetric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40">
      <div className={`text-muted-foreground`}>{icon}</div>
      <div>
        <span className="text-[10px] text-muted-foreground block leading-tight">{label}</span>
        <span className={`text-sm font-bold ${highlight ? "text-primary" : "text-card-foreground"}`}>{value}</span>
      </div>
    </div>
  );
}
