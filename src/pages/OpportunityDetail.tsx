import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, createDefaultDetailedScoring, createDefaultBusinessCase, STAGE_ORDER } from "@/lib/types";
import { OpportunityOverview } from "@/components/OpportunityOverview";
import { StageBadge } from "@/components/StageBadge";
import { ScoringSection } from "@/components/ScoringSection";
import { DetailedScoringSection } from "@/components/DetailedScoringSection";
import { BusinessCaseSection } from "@/components/BusinessCaseSection";
import { GateDecisionSection } from "@/components/GateDecisionSection";
import { StrategicAnalysesSection } from "@/components/StrategicAnalysesSection";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, LayoutDashboard, BarChart2, Search, Briefcase, GitMerge, LineChart } from "lucide-react";

type TabKey = "overview" | "scoring" | "detailed_scoring" | "business_case" | "gates" | "strategic_analyses";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage, updateOpportunity, deleteOpportunity } = useStore();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const opp = getOpportunity(id!);
  if (!opp) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Opportunity not found.</p>
      </div>
    );
  }

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

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview",            label: t("overview"),          icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "scoring",             label: t("roughScoring"),      icon: <BarChart2 className="h-4 w-4" /> },
    { key: "detailed_scoring",    label: t("detailedScoring"),   icon: <Search className="h-4 w-4" /> },
    { key: "business_case",       label: t("businessCase"),      icon: <Briefcase className="h-4 w-4" /> },
    { key: "gates",               label: t("stageGates"),        icon: <GitMerge className="h-4 w-4" /> },
    { key: "strategic_analyses",  label: t("saTab"),             icon: <LineChart className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
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

      {/* Body: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Vertical Sidebar Nav */}
        <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col py-3 gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors
                  ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {activeTab === "overview" && (
              <OpportunityOverview opportunity={opp} onAdvanceStage={handleAdvanceStage} />
            )}
            {activeTab === "scoring" && (
              <ScoringSection
                scoring={opp.scoring}
                onSave={(scoring) => updateScoring(opp.id, scoring)}
                onSaveAnswers={(answers) => updateOpportunity(opp.id, { roughScoringAnswers: answers })}
                readonly={opp.stage === "closed"}
                initialAnswers={opp.roughScoringAnswers}
                showResults={STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf("rough_scoring")}
              />
            )}
            {activeTab === "detailed_scoring" && (
              <DetailedScoringSection
                detailedScoring={opp.detailedScoring}
                onSave={(ds) => updateDetailedScoring(opp.id, ds)}
                readonly={opp.stage === "closed"}
              />
            )}
            {activeTab === "business_case" && (
              <BusinessCaseSection
                businessCase={opp.businessCase}
                onSave={(bc) => updateBusinessCase(opp.id, bc)}
                readonly={opp.stage === "closed"}
              />
            )}
            {activeTab === "gates" && (
              <GateDecisionSection
                gates={opp.gates}
                currentStage={opp.stage}
                onSubmitDecision={(gate) => addGateDecision(opp.id, gate)}
                onUpdateDecision={(gateId, updates) => updateGateDecision(opp.id, gateId, updates)}
                onDeleteDecision={(gateId) => deleteGateDecision(opp.id, gateId)}
                onRevertStage={() => revertStage(opp.id)}
              />
            )}
            {activeTab === "strategic_analyses" && (
              <StrategicAnalysesSection
                strategicAnalyses={opp.strategicAnalyses}
                onSave={(sa) => updateOpportunity(opp.id, { strategicAnalyses: sa })}
                readonly={opp.stage === "closed"}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
