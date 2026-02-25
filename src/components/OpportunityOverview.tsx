import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Opportunity, calculateTotalScore, STAGE_ORDER, SCORING_WEIGHTS } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { StageTimeline } from "@/components/StageTimeline";
import { AIAssessment } from "@/components/AIAssessment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Stage } from "@/lib/types";
import {
  Globe, Cpu, User, Calendar, FileText, CheckCircle2, Clock,
  XCircle, PauseCircle, ArrowRight, TrendingUp, AlertTriangle,
  DollarSign, Target, ChevronRight, Pencil, Check, X,
} from "lucide-react";

interface OpportunityOverviewProps {
  opportunity: Opportunity;
  onAdvanceStage: (stage: Stage) => void;
  onUpdate?: (updates: Partial<Opportunity>) => void;
}

// (STAGE_PROGRESS moved to StageTimeline component)


export function OpportunityOverview({ opportunity: opp, onAdvanceStage, onUpdate }: OpportunityOverviewProps) {
  const { t, language } = useI18n();
  const totalScore = calculateTotalScore(opp.scoring);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: opp.title, description: opp.description, industry: opp.industry, geography: opp.geography, technology: opp.technology, owner: opp.owner });

  const startEdit = () => {
    setEditData({ title: opp.title, description: opp.description, industry: opp.industry, geography: opp.geography, technology: opp.technology, owner: opp.owner });
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    onUpdate?.(editData);
    setEditing(false);
  };

  const canMoveToRoughScoring = opp.stage === "idea";
  const canMoveToGate1 = opp.stage === "rough_scoring";
  const canMoveToGate2 = opp.stage === "detailed_scoring";
  const canMoveToImplementReview = opp.stage === "business_case";
  const hasAction = canMoveToRoughScoring || canMoveToGate1 || canMoveToGate2 || canMoveToImplementReview;

  // Radar data (kept for potential future use)



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
          <div className={`flex items-center gap-6 ${detailedAvg !== null ? "w-full justify-around" : ""}`}>
            {/* Idea Score */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Idea Score</span>
              <div className="relative">
                <svg viewBox="0 0 120 120" className={detailedAvg !== null ? "w-20 h-20" : "w-28 h-28"}>
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
                  <span className={`${detailedAvg !== null ? "text-xl" : "text-3xl"} font-bold ${scoreColor}`}>{totalScore.toFixed(1)}</span>
                  <span className="text-[9px] text-muted-foreground">/ 5.0</span>
                </div>
              </div>
              <span className={`text-xs font-medium mt-1 ${scoreColor}`}>{scoreLabel}</span>
            </div>

            {/* Business Plan Score */}
            {detailedAvg !== null && (() => {
              const bpColor = detailedAvg >= 3.5 ? "text-[hsl(var(--success))]" : detailedAvg >= 2.5 ? "text-[hsl(var(--warning))]" : "text-destructive";
              const bpStroke = detailedAvg >= 3.5 ? "hsl(145, 55%, 40%)" : detailedAvg >= 2.5 ? "hsl(38, 90%, 50%)" : "hsl(0, 65%, 50%)";
              const bpLabel = detailedAvg >= 3.5 ? t("scoreHigh") : detailedAvg >= 2.5 ? t("scoreMedium") : t("scoreLow");
              return (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Business Plan</span>
                  <div className="relative">
                    <svg viewBox="0 0 120 120" className="w-20 h-20">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(220, 15%, 90%)" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke={bpStroke}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(detailedAvg / 5) * 327} 327`}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-xl font-bold ${bpColor}`}>{detailedAvg.toFixed(1)}</span>
                      <span className="text-[9px] text-muted-foreground">/ 5.0</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium mt-1 ${bpColor}`}>{bpLabel}</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Description & Meta */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            {editing ? (
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("title")}</label>
                <Input value={editData.title} onChange={(e) => setEditData(d => ({ ...d, title: e.target.value }))} />
              </div>
            ) : (
              <p className="text-sm text-card-foreground leading-relaxed flex-1">{opp.description || "—"}</p>
            )}
            {onUpdate && !editing && (
              <Button variant="ghost" size="icon" onClick={startEdit} className="shrink-0 ml-2">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {editing && (
              <div className="flex gap-1 ml-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={saveEdit} disabled={!editData.title.trim()}><Check className="h-4 w-4 text-[hsl(var(--success))]" /></Button>
              </div>
            )}
          </div>
          {editing ? (
            <>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("description")}</label>
                <Textarea value={editData.description} onChange={(e) => setEditData(d => ({ ...d, description: e.target.value }))} rows={3} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("industry")}</label>
                  <Input value={editData.industry} onChange={(e) => setEditData(d => ({ ...d, industry: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("geography")}</label>
                  <Input value={editData.geography} onChange={(e) => setEditData(d => ({ ...d, geography: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("technology")}</label>
                  <Input value={editData.technology} onChange={(e) => setEditData(d => ({ ...d, technology: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t("owner")}</label>
                  <Input value={editData.owner} onChange={(e) => setEditData(d => ({ ...d, owner: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetaItem icon={<FileText className="h-3.5 w-3.5" />} label={t("industry")} value={opp.industry} />
                <MetaItem icon={<Globe className="h-3.5 w-3.5" />} label={t("geography")} value={opp.geography} />
                <MetaItem icon={<Cpu className="h-3.5 w-3.5" />} label={t("technology")} value={opp.technology} />
                <MetaItem icon={<User className="h-3.5 w-3.5" />} label={t("owner")} value={opp.owner} />
              </div>
            </>
          )}
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
            {canMoveToImplementReview && (
              <Button size="sm" onClick={() => onAdvanceStage("implement_review")} className="gap-1.5">
                {t("moveToImplementReview")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* AI Assessment — use Business Plan scoring if available, otherwise Idea Scoring */}
      {(() => {
        const hasDetailedScoring = opp.detailedScoring && STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf("detailed_scoring");
        const hasIdeaScoring = opp.roughScoringAnswers && Object.keys(opp.roughScoringAnswers).length > 0;

        if (hasDetailedScoring) {
          const ds = opp.detailedScoring!;
          const dsScoring: typeof opp.scoring = {
            marketAttractiveness: { id: "marketAttractiveness", score: ds.marketAttractiveness.score, comment: "" },
            strategicFit: { id: "strategicFit", score: ds.strategicFit.score, comment: "" },
            feasibility: { id: "feasibility", score: ds.feasibility.score, comment: "" },
            commercialViability: { id: "commercialViability", score: ds.commercialViability.score, comment: "" },
            risk: { id: "risk", score: ds.risk.score, comment: "" },
          };
          const dsAnswers: Record<string, number> = {
            ds_market: ds.marketAttractiveness.score,
            ds_strategic: ds.strategicFit.score,
            ds_feasibility: ds.feasibility.score,
            ds_commercial: ds.commercialViability.score,
            ds_risk: ds.risk.score,
          };
          return (
            <AIAssessment
              scoring={dsScoring}
              answers={dsAnswers}
              title={opp.title}
              description={opp.description}
              basis={language === "de" ? "Business Plan Scoring" : "Business Plan Scoring"}
              opportunityId={opp.id}
            />
          );
        }

        if (hasIdeaScoring) {
          return (
            <AIAssessment
              scoring={opp.scoring}
              answers={opp.roughScoringAnswers!}
              title={opp.title}
              description={opp.description}
              basis={language === "de" ? "Idea Scoring (Fragenkatalog)" : "Idea Scoring (Questionnaire)"}
              opportunityId={opp.id}
            />
          );
        }

        return null;
      })()}

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
