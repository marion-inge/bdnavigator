import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, createDefaultDetailedScoring, createDefaultBusinessCase, createDefaultStrategicAnalyses } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { ScoringSection } from "@/components/ScoringSection";
import { DetailedScoringSection } from "@/components/DetailedScoringSection";
import { BusinessCaseSection } from "@/components/BusinessCaseSection";
import { GateDecisionSection } from "@/components/GateDecisionSection";
import { StrategicAnalysesSection } from "@/components/StrategicAnalysesSection";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateOpportunity, deleteOpportunity } = useStore();
  const { t } = useI18n();

  const opp = getOpportunity(id!);
  if (!opp) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Opportunity not found.</p>
      </div>
    );
  }

  const totalScore = calculateTotalScore(opp.scoring);

  const canMoveToRoughScoring = opp.stage === "idea";
  const canMoveToGate1 = opp.stage === "rough_scoring";
  const canMoveToGate2 = opp.stage === "detailed_scoring";
  const canMoveToGate3 = opp.stage === "business_case";

  const handleAdvanceStage = (stage: Stage) => {
    const updates: Partial<typeof opp> = { stage };
    if (stage === "detailed_scoring" && !opp.detailedScoring) {
      updates.detailedScoring = createDefaultDetailedScoring();
    }
    if (stage === "business_case" && !opp.businessCase) {
      updates.businessCase = createDefaultBusinessCase();
    }
    updateOpportunity(opp.id, updates);
  };

  const handleDelete = () => {
    deleteOpportunity(opp.id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">{opp.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <StageBadge stage={opp.stage} />
                {opp.industry && <span className="text-sm text-muted-foreground">{opp.industry}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="scoring">{t("roughScoring")}</TabsTrigger>
            <TabsTrigger value="detailed_scoring">{t("detailedScoring")}</TabsTrigger>
            <TabsTrigger value="strategic_analyses">{t("saTab")}</TabsTrigger>
            <TabsTrigger value="business_case">{t("businessCase")}</TabsTrigger>
            <TabsTrigger value="gates">{t("stageGates")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("description")}</label>
                  <p className="mt-1 text-sm text-card-foreground">{opp.description || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("industry")}</label>
                    <p className="mt-1 text-sm text-card-foreground">{opp.industry || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("geography")}</label>
                    <p className="mt-1 text-sm text-card-foreground">{opp.geography || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("technology")}</label>
                    <p className="mt-1 text-sm text-card-foreground">{opp.technology || "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("owner")}</label>
                    <p className="mt-1 text-sm text-card-foreground">{opp.owner || "—"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("createdAt")}</label>
                  <p className="mt-1 text-sm text-card-foreground">{new Date(opp.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-5 text-center">
                  <span className="text-sm text-muted-foreground">{t("totalScore")}</span>
                  <p className="text-4xl font-bold text-primary mt-1">{totalScore.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ 5.0</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("stage")}</label>
                  <div className="flex items-center gap-2">
                    <StageBadge stage={opp.stage} />
                  </div>
                  {canMoveToRoughScoring && (
                    <Button size="sm" onClick={() => handleAdvanceStage("rough_scoring")}>
                      {t("moveToRoughScoring")}
                    </Button>
                  )}
                  {canMoveToGate1 && (
                    <Button size="sm" onClick={() => handleAdvanceStage("gate1")}>
                      → {t("stage_gate1")}
                    </Button>
                  )}
                  {canMoveToGate2 && (
                    <Button size="sm" onClick={() => handleAdvanceStage("gate2")}>
                      → {t("stage_gate2")}
                    </Button>
                  )}
                  {canMoveToGate3 && (
                    <Button size="sm" onClick={() => handleAdvanceStage("gate3")}>
                      → {t("stage_gate3")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoring">
            <ScoringSection
              scoring={opp.scoring}
              onSave={(scoring) => updateScoring(opp.id, scoring)}
              readonly={opp.stage === "closed"}
            />
          </TabsContent>

          <TabsContent value="detailed_scoring">
            <DetailedScoringSection
              detailedScoring={opp.detailedScoring}
              onSave={(ds) => updateDetailedScoring(opp.id, ds)}
              readonly={opp.stage === "closed"}
            />
          </TabsContent>

          <TabsContent value="business_case">
            <BusinessCaseSection
              businessCase={opp.businessCase}
              onSave={(bc) => updateBusinessCase(opp.id, bc)}
              readonly={opp.stage === "closed"}
            />
          </TabsContent>

          <TabsContent value="gates">
            <GateDecisionSection
              gates={opp.gates}
              currentStage={opp.stage}
              onSubmitDecision={(gate) => addGateDecision(opp.id, gate)}
            />
          </TabsContent>

          <TabsContent value="strategic_analyses">
            <StrategicAnalysesSection
              strategicAnalyses={opp.strategicAnalyses}
              onSave={(sa) => updateOpportunity(opp.id, { strategicAnalyses: sa })}
              readonly={opp.stage === "closed"}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
