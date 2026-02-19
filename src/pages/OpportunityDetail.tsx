import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, createDefaultDetailedScoring, createDefaultBusinessCase, createDefaultStrategicAnalyses, STAGE_ORDER } from "@/lib/types";
import { OpportunityOverview } from "@/components/OpportunityOverview";
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
  const { getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage, updateOpportunity, deleteOpportunity } = useStore();
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
            <OpportunityOverview opportunity={opp} onAdvanceStage={handleAdvanceStage} />
          </TabsContent>

          <TabsContent value="scoring">
            <ScoringSection
              scoring={opp.scoring}
              onSave={(scoring) => updateScoring(opp.id, scoring)}
              onSaveAnswers={(answers) => updateOpportunity(opp.id, { roughScoringAnswers: answers })}
              readonly={opp.stage === "closed"}
              initialAnswers={opp.roughScoringAnswers}
              showResults={STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf("rough_scoring")}
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
              onUpdateDecision={(gateId, updates) => updateGateDecision(opp.id, gateId, updates)}
              onDeleteDecision={(gateId) => deleteGateDecision(opp.id, gateId)}
              onRevertStage={() => revertStage(opp.id)}
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
