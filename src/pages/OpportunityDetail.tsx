import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { ScoringSection } from "@/components/ScoringSection";
import { GateDecisionSection } from "@/components/GateDecisionSection";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, updateScoring, addGateDecision, updateOpportunity, deleteOpportunity } = useStore();
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

  const canMoveToScoring = opp.stage === "idea";
  const canMoveToGate1 = opp.stage === "scoring";
  const canMoveToGate2 = opp.stage === "business_case";

  const handleAdvanceStage = (stage: Stage) => {
    updateOpportunity(opp.id, { stage });
  };

  const handleDelete = () => {
    deleteOpportunity(opp.id);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                {opp.market && <span className="text-sm text-muted-foreground">{opp.market}</span>}
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
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="scoring">{t("scoring")}</TabsTrigger>
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("market")}</label>
                    <p className="mt-1 text-sm text-card-foreground">{opp.market || "—"}</p>
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

                {/* Stage advancement buttons */}
                <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("stage")}</label>
                  <div className="flex items-center gap-2">
                    <StageBadge stage={opp.stage} />
                  </div>
                  {canMoveToScoring && (
                    <Button size="sm" onClick={() => handleAdvanceStage("scoring")}>
                      {t("moveToScoring")}
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

          <TabsContent value="gates">
            <GateDecisionSection
              gates={opp.gates}
              currentStage={opp.stage}
              onSubmitDecision={(gate) => addGateDecision(opp.id, gate)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
