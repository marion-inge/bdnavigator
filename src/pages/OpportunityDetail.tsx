import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, createDefaultDetailedScoring, createDefaultBusinessCase, STAGE_ORDER } from "@/lib/types";
import { OpportunityOverview } from "@/components/OpportunityOverview";
import { StageBadge } from "@/components/StageBadge";
import { ScoringSection } from "@/components/ScoringSection";
import { DetailedScoringSection } from "@/components/DetailedScoringSection";

import { GateDecisionSection } from "@/components/GateDecisionSection";
import { StrategicAnalysesSection } from "@/components/StrategicAnalysesSection";
import { GoToMarketSection } from "@/components/GoToMarketSection";
import { ImplementReviewSection } from "@/components/ImplementReviewSection";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, LayoutDashboard, BarChart2, Search, Briefcase, GitMerge, LineChart, CheckCircle2, ChevronRight, Menu, X, FileDown, RefreshCw } from "lucide-react";
import { exportOpportunityPdf } from "@/lib/pdfExport";

type TabKey = "overview" | "scoring" | "detailed_scoring" | "business_case" | "implement_review" | "gates" | "strategic_analyses";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage, updateOpportunity, deleteOpportunity } = useStore();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saDefaultTab, setSaDefaultTab] = useState<string | undefined>(undefined);

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

  // Map each nav item to the stage threshold that marks it as "completed"
  
  const tabStageThreshold: Record<TabKey, Stage> = {
    overview:            "rough_scoring",
    scoring:             "gate1",
    detailed_scoring:    "gate2",
    business_case:       "implement_review",
    implement_review:    "closed",
    gates:               "implement_review",
    strategic_analyses:  "implement_review",
  };
  const tabCurrentStage: Record<TabKey, Stage | ""> = {
    overview:           "idea",
    scoring:            "rough_scoring",
    detailed_scoring:   "detailed_scoring",
    business_case:      "business_case",
    implement_review:   "implement_review",
    gates:              "gate1",
    strategic_analyses: "",
  };

  const isTabDone = (key: TabKey) =>
    STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf(tabStageThreshold[key]);
  const isTabCurrent = (key: TabKey) =>
    tabCurrentStage[key] !== "" && opp.stage === tabCurrentStage[key];

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview",            label: t("overview"),          icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "scoring",             label: t("roughScoring"),      icon: <BarChart2 className="h-4 w-4" /> },
    { key: "detailed_scoring",    label: t("detailedScoring"),   icon: <Search className="h-4 w-4" /> },
    { key: "business_case",       label: t("businessCase"),      icon: <Briefcase className="h-4 w-4" /> },
    { key: "implement_review",    label: t("stage_implement_review"), icon: <RefreshCw className="h-4 w-4" /> },
    { key: "gates",               label: t("stageGates"),        icon: <GitMerge className="h-4 w-4" /> },
    { key: "strategic_analyses",  label: t("saTab"),             icon: <LineChart className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-4 sm:px-6 xl:px-8 py-4 flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            {/* Hamburger – only on mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-card-foreground leading-tight">{opp.title}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <StageBadge stage={opp.stage} />
                {opp.industry && <span className="text-sm text-muted-foreground hidden sm:inline">{opp.industry}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <Button variant="outline" size="icon" onClick={() => exportOpportunityPdf(opp)} title="PDF Export">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Vertical Sidebar Nav */}
        <aside className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-card border-r border-border flex flex-col py-4 gap-0.5 px-3 transition-transform duration-200 ease-in-out
          md:static md:h-auto md:translate-x-0 md:z-auto md:w-60 md:shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          {/* Header: progress + close button on mobile */}
          <div className="flex items-start justify-between px-2 pb-3 mb-1 border-b border-border">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Fortschritt</p>
              <StageBadge stage={opp.stage} />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden -mt-1 -mr-1 shrink-0" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const done = isTabDone(item.key);
            const current = isTabCurrent(item.key);
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setSidebarOpen(false); if (item.key !== "strategic_analyses") setSaDefaultTab(undefined); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors
                  ${isActive
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "text-card-foreground hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                  }
                `}
              >
                <span className={`shrink-0 ${isActive ? "text-primary-foreground" : done ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                  {done && !isActive ? <CheckCircle2 className="h-4 w-4" /> : item.icon}
                </span>
                <span className="flex-1 leading-tight">{item.label}</span>
                {current && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))] shrink-0" />
                )}
                {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />}
              </button>
            );
          })}
        </aside>


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8 py-6">
            {activeTab === "overview" && (
              <OpportunityOverview opportunity={opp} onAdvanceStage={handleAdvanceStage} />
            )}
            {activeTab === "scoring" && (
              <ScoringSection
                scoring={opp.scoring}
                onSave={(scoring) => updateScoring(opp.id, scoring)}
                onSaveAnswers={(answers) => updateOpportunity(opp.id, { roughScoringAnswers: answers })}
                onSaveComments={(comments) => updateOpportunity(opp.id, { roughScoringComments: comments })}
                readonly={opp.stage === "closed"}
                initialAnswers={opp.roughScoringAnswers}
                initialComments={opp.roughScoringComments}
                showResults={STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf("rough_scoring")}
              />
            )}
            {activeTab === "detailed_scoring" && (
              <DetailedScoringSection
                detailedScoring={opp.detailedScoring}
                onSave={(ds) => updateDetailedScoring(opp.id, ds)}
                readonly={opp.stage === "closed"}
                onNavigateToAnalysis={(analysisTab) => {
                  setSaDefaultTab(analysisTab);
                  setActiveTab("strategic_analyses");
                }}
              />
            )}
            {activeTab === "business_case" && (
              <GoToMarketSection
                goToMarketPlan={opp.goToMarketPlan}
                onSave={(plan) => updateOpportunity(opp.id, { goToMarketPlan: plan })}
                readonly={opp.stage === "closed"}
              />
            )}
            {activeTab === "implement_review" && (
              <ImplementReviewSection
                implementReview={opp.implementReview}
                onSave={(ir) => updateOpportunity(opp.id, { implementReview: ir })}
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
                defaultTab={saDefaultTab}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
