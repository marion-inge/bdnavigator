import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, createDefaultDetailedScoring, createDefaultBusinessCase, STAGE_ORDER, DetailedScoring } from "@/lib/types";
import { OpportunityOverview } from "@/components/OpportunityOverview";
import { StageBadge } from "@/components/StageBadge";
import { ScoringSection } from "@/components/ScoringSection";
import { BusinessPlanSection } from "@/components/business-plan/BusinessPlanSection";

import { GateDecisionSection } from "@/components/GateDecisionSection";
import { StrategicAnalysesSection } from "@/components/StrategicAnalysesSection";
import { GoToMarketSection } from "@/components/GoToMarketSection";
import { ImplementReviewSection } from "@/components/ImplementReviewSection";
import { FileAttachments } from "@/components/FileAttachments";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, LayoutDashboard, BarChart2, Search, Briefcase, GitMerge, LineChart, CheckCircle2, ChevronRight, ChevronDown, Menu, X, FileDown, RefreshCw, Paperclip, Globe, Target, TrendingUp, FolderOpen } from "lucide-react";
import { exportOpportunityPdf } from "@/lib/pdfExport";

type TabKey = "overview" | "scoring" | "detailed_scoring" | "business_case" | "implement_review" | "gates" | "strategic_analyses" | "files";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOpportunity, updateScoring, updateDetailedScoring, updateBusinessCase, addGateDecision, updateGateDecision, deleteGateDecision, revertStage, updateOpportunity, deleteOpportunity } = useStore();
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saDefaultTab, setSaDefaultTab] = useState<string | undefined>(undefined);
  const [bpExpanded, setBpExpanded] = useState(false);
  const [bpMainTab, setBpMainTab] = useState("combined");
  const [bpSubTab, setBpSubTab] = useState<string | undefined>(undefined);
  const [expandedBpSection, setExpandedBpSection] = useState<string | null>(null);

  const bp = (en: string, de: string) => language === "de" ? de : en;

  // Scroll to top when opportunity changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  const tabStageThreshold: Record<TabKey, Stage> = {
    overview:            "rough_scoring",
    scoring:             "gate1",
    detailed_scoring:    "gate2",
    business_case:       "implement_review",
    implement_review:    "closed",
    gates:               "implement_review",
    strategic_analyses:  "implement_review",
    files:               "closed",
  };
  const tabCurrentStage: Record<TabKey, Stage | ""> = {
    overview:           "idea",
    scoring:            "rough_scoring",
    detailed_scoring:   "detailed_scoring",
    business_case:      "business_case",
    implement_review:   "implement_review",
    gates:              "gate1",
    strategic_analyses: "",
    files:              "",
  };

  const isTabDone = (key: TabKey) =>
    STAGE_ORDER.indexOf(opp.stage) >= STAGE_ORDER.indexOf(tabStageThreshold[key]);
  const isTabCurrent = (key: TabKey) =>
    tabCurrentStage[key] !== "" && opp.stage === tabCurrentStage[key];

  const hasCompletedScoring = !!opp.roughScoringAnswers && Object.keys(opp.roughScoringAnswers).length > 0;
  const totalScore = hasCompletedScoring ? calculateTotalScore(opp.scoring) : null;

  // Business Plan sub-navigation structure
  const bpSubNav = [
    {
      key: "combined",
      label: bp("Overview", "Übersicht"),
      icon: <BarChart2 className="h-3 w-3" />,
    },
    {
      key: "tam",
      label: "TAM",
      icon: <Globe className="h-3 w-3" />,
      children: [
        { key: "tam-overview", label: bp("Overview", "Übersicht") },
        { key: "tam-research", label: bp("Market Research", "Marktforschung") },
        { key: "tam-pestel", label: "PESTEL" },
        { key: "tam-valuechain", label: bp("Value Chain", "Wertschöpfungskette") },
        { key: "tam-porter", label: "Porter's" },
        { key: "tam-swot", label: "SWOT" },
      ],
    },
    {
      key: "sam",
      label: "SAM",
      icon: <Target className="h-3 w-3" />,
      children: [
        { key: "sam-overview", label: bp("Overview", "Übersicht") },
        { key: "sam-customers", label: bp("Customer Landscape", "Kundenlandschaft") },
        { key: "sam-strategic", label: bp("Strategic Fit", "Strateg. Fit") },
        { key: "sam-portfolio", label: "Portfolio Fit" },
        { key: "sam-feasibility", label: bp("Feasibility", "Machbarkeit") },
        { key: "sam-org", label: bp("Org Readiness", "Org. Readiness") },
        { key: "sam-risk", label: bp("Risk", "Risiko") },
        { key: "sam-segmentation", label: bp("Segmentation", "Segmentierung") },
        { key: "sam-interviews", label: bp("Interviews", "Interviews") },
        { key: "sam-affiliate", label: bp("Affiliate Interviews", "Affiliate-Interviews") },
        { key: "sam-bu", label: bp("BU Interviews", "BU-Interviews") },
        { key: "sam-bmc", label: "BMC" },
        { key: "sam-lean", label: "Lean Canvas" },
      ],
    },
    {
      key: "som",
      label: "SOM",
      icon: <TrendingUp className="h-3 w-3" />,
      children: [
        { key: "som-overview", label: bp("Overview", "Übersicht") },
        { key: "som-competitor", label: bp("Competitors", "Wettbewerb") },
        
        { key: "som-pilot", label: bp("Pilot & Leads", "Pilot & Leads") },
        { key: "som-vpc", label: "VPC" },
        { key: "som-cba", label: bp("Customer Benefit", "Kundennutzen") },
        { key: "som-threecircles", label: bp("Three Circles", "Drei Kreise") },
        { key: "som-positioning", label: bp("Positioning", "Positionierung") },
        { key: "som-landscape", label: bp("Pos. Landscape", "Pos. Landschaft") },
      ],
    },
    {
      key: "others",
      label: bp("Others", "Sonstige"),
      icon: <FolderOpen className="h-3 w-3" />,
    },
  ];



  const handleBpSubNavClick = (mainTab: string, subTab?: string) => {
    setActiveTab("detailed_scoring");
    setBpMainTab(mainTab);
    setBpSubTab(subTab);
    setSidebarOpen(false);
  };

  const navItems: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: "overview",            label: t("overview"),          icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "scoring",             label: t("roughScoring"),      icon: <BarChart2 className="h-4 w-4" />, badge: totalScore !== null ? `${totalScore.toFixed(1)}` : undefined },
    { key: "detailed_scoring",    label: t("detailedScoring"),   icon: <Search className="h-4 w-4" /> },
    { key: "business_case",       label: t("businessCase"),      icon: <Briefcase className="h-4 w-4" /> },
    { key: "implement_review",    label: t("stage_implement_review"), icon: <RefreshCw className="h-4 w-4" /> },
    { key: "gates",               label: t("stageGates"),        icon: <GitMerge className="h-4 w-4" /> },
    { key: "strategic_analyses",  label: t("saTab"),             icon: <LineChart className="h-4 w-4" /> },
    { key: "files",               label: t("filesTitle"),        icon: <Paperclip className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-4 sm:px-6 xl:px-8 py-3 sm:py-4 max-w-[1600px] mx-auto space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 shrink-0" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <StageBadge stage={opp.stage} />
              {opp.industry && <span className="text-xs text-muted-foreground hidden sm:inline">{opp.industry}</span>}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <LanguageSwitch />
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => exportOpportunityPdf(opp)} title="PDF Export">
                <FileDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <h1 className="text-sm sm:text-lg font-bold text-card-foreground leading-tight pl-0 sm:pl-[76px] md:pl-[44px]">{opp.title}</h1>
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
          fixed top-0 left-0 h-full z-40 w-64 bg-card border-r border-border flex flex-col py-4 gap-0.5 px-3 transition-transform duration-200 ease-in-out overflow-y-auto
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
            const isBpItem = item.key === "detailed_scoring";

            return (
              <div key={item.key}>
                <button
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                    if (item.key !== "strategic_analyses") setSaDefaultTab(undefined);
                    if (isBpItem) {
                      setBpExpanded(!bpExpanded);
                    } else {
                      setBpExpanded(false);
                    }
                  }}
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
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      {item.badge}
                    </span>
                  )}
                  {current && !isActive && !item.badge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))] shrink-0" />
                  )}
                  {isBpItem ? (
                    bpExpanded && isActive ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  ) : (
                    isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  )}
                </button>

                {/* Business Plan Sub-Navigation */}
                {isBpItem && bpExpanded && isActive && (
                  <div className="ml-3 mt-0.5 mb-1 pl-4 border-l-2 border-primary/20 space-y-0.5">
                    {bpSubNav.map((section) => {
                      const isSectionActive = bpMainTab === section.key && !section.children;
                      const hasChildren = !!section.children;
                      const isSectionExpanded = expandedBpSection === section.key;
                      const isChildActive = hasChildren && section.children!.some(c => bpMainTab === section.key && bpSubTab === c.key);

                      return (
                        <div key={section.key}>
                          <button
                            onClick={() => {
                              if (hasChildren) {
                                setExpandedBpSection(isSectionExpanded ? null : section.key);
                                // Navigate to first child
                                if (!isSectionExpanded) {
                                  handleBpSubNavClick(section.key, section.children![0].key);
                                }
                              } else {
                                handleBpSubNavClick(section.key);
                                setExpandedBpSection(null);
                              }
                            }}
                            className={`
                              w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-left transition-colors
                              ${(isSectionActive || isChildActive)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                              }
                            `}
                          >
                            <span className="shrink-0">{section.icon}</span>
                            <span className="flex-1">{section.label}</span>
                            {hasChildren && (
                              isSectionExpanded
                                ? <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                                : <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                            )}
                          </button>

                          {/* Sub-tab children */}
                          {hasChildren && isSectionExpanded && (
                            <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5 mt-0.5">
                              {section.children!.map((child) => {
                                const isSubActive = bpMainTab === section.key && bpSubTab === child.key;
                                return (
                                  <button
                                    key={child.key}
                                    onClick={() => handleBpSubNavClick(section.key, child.key)}
                                    className={`
                                      w-full text-left px-2 py-1 rounded text-[11px] transition-colors
                                      ${isSubActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                                      }
                                    `}
                                  >
                                    {child.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8 py-6">
            {activeTab === "overview" && (
              <OpportunityOverview opportunity={opp} onAdvanceStage={handleAdvanceStage} onUpdate={(updates) => updateOpportunity(opp.id, updates)} onStartScoring={() => setActiveTab("scoring")} onRevertStage={() => revertStage(opp.id)} />
            )}
            {activeTab === "scoring" && (
              <ScoringSection
                scoring={opp.scoring}
                onSaveAll={({ scoring, answers, comments, sources }) => {
                  updateOpportunity(opp.id, {
                    scoring,
                    roughScoringAnswers: answers,
                    roughScoringComments: comments,
                    roughScoringSources: sources,
                  });
                }}
                readonly={opp.stage === "closed"}
                initialAnswers={opp.roughScoringAnswers}
                initialComments={opp.roughScoringComments}
                initialSources={opp.roughScoringSources}
                showResults={!!opp.roughScoringAnswers && Object.keys(opp.roughScoringAnswers).length > 0}
                opportunityId={opp.id}
                opportunityTitle={opp.title}
                opportunityDescription={opp.description}
                opportunitySolutionDescription={opp.solutionDescription}
                opportunityIndustry={opp.industry}
                opportunityGeography={opp.geography}
                opportunityTechnology={opp.technology}
                opportunityIdeaBringer={opp.ideaBringer}
                opportunityOwner={opp.owner}
              />
            )}
            {activeTab === "detailed_scoring" && (
              <BusinessPlanSection
                detailedScoring={opp.detailedScoring}
                strategicAnalyses={opp.strategicAnalyses}
                onSaveDetailed={(ds) => updateDetailedScoring(opp.id, ds)}
                onSaveStrategic={(sa) => updateOpportunity(opp.id, { strategicAnalyses: sa })}
                readonly={opp.stage === "closed"}
                onNavigateToAnalysis={(analysisTab) => {
                  setSaDefaultTab(analysisTab);
                  setActiveTab("strategic_analyses");
                }}
                activeMainTab={bpMainTab}
                activeSubTab={bpSubTab}
                onTabChange={(mainTab, subTab) => {
                  setBpMainTab(mainTab);
                  setBpSubTab(subTab);
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
            {activeTab === "files" && (
              <FileAttachments opportunityId={opp.id} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className="text-xs font-medium text-card-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}