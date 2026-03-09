import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, STAGE_ORDER } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { NewOpportunityDialog } from "@/components/NewOpportunityDialog";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { DashboardOverview } from "@/components/DashboardOverview";
import { AnsoffMatrixDashboard } from "@/components/AnsoffMatrixDashboard";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ThreeHorizonsDashboard } from "@/components/ThreeHorizonsDashboard";
import { ProcessOverview } from "@/components/ProcessOverview";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, BookOpen } from "lucide-react";
import { getRatingColor } from "@/lib/aiAssessmentService";
import idaRobot from "@/assets/ida-robot.png";
import { supabase } from "@/integrations/supabase/client";
import noviLogo from "@/assets/novi-logo.png";
import noviLogoV2 from "@/assets/novi-logo-v2.png";
import noviLogoV3 from "@/assets/novi-logo-v3.png";
import noviLogoV4 from "@/assets/novi-logo-v4.png";

export default function Index() {
  const { opportunities, loading } = useStore();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [geographyFilter, setGeographyFilter] = useState<string>("all");
  const [technologyFilter, setTechnologyFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [assessments, setAssessments] = useState<Record<string, { summary: string; overallRating: string }>>({});

  // Fetch all AI assessments in bulk
  useEffect(() => {
    if (opportunities.length === 0) return;
    (supabase as any)
      .from("ai_assessments")
      .select("opportunity_id, summary, overall_rating, basis")
      .eq("basis", "idea_scoring")
      .then(({ data }: any) => {
        if (!data) return;
        const map: Record<string, { summary: string; overallRating: string }> = {};
        for (const row of data) {
          map[row.opportunity_id] = { summary: row.summary, overallRating: row.overall_rating };
        }
        setAssessments(map);
      });
  }, [opportunities]);
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STAGE_ORDER) counts[s] = 0;
    for (const o of opportunities) counts[o.stage] = (counts[o.stage] || 0) + 1;
    return counts;
  }, [opportunities]);

  // Unique values for filters
  const uniqueIndustries = useMemo(() => [...new Set(opportunities.map((o) => o.industry).filter(Boolean))].sort(), [opportunities]);
  const uniqueGeographies = useMemo(() => [...new Set(opportunities.map((o) => o.geography).filter(Boolean))].sort(), [opportunities]);
  const uniqueTechnologies = useMemo(() => [...new Set(opportunities.map((o) => o.technology).filter(Boolean))].sort(), [opportunities]);
  const uniqueOwners = useMemo(() => [...new Set(opportunities.map((o) => o.owner).filter(Boolean))].sort(), [opportunities]);

  const funnelData = useMemo(() => {
    return STAGE_ORDER.filter((s) => s !== "closed").map((stage) => {
      const stageIdx = STAGE_ORDER.indexOf(stage);
      const count = opportunities.filter((o) => {
        const oppIdx = STAGE_ORDER.indexOf(o.stage);
        if (o.stage === "closed") {
          const maxGateIdx = o.gates.reduce((max, g) => {
            const gIdx = STAGE_ORDER.indexOf(g.gate);
            return gIdx > max ? gIdx : max;
          }, 0);
          return maxGateIdx >= stageIdx;
        }
        return oppIdx >= stageIdx;
      }).length;
      return { stage, label: t(`stage_${stage}` as any), count };
    });
  }, [opportunities, t]);

  const filtered = useMemo(() => {
    return opportunities
      .filter((o) => {
        const matchesSearch =
          !search ||
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.industry.toLowerCase().includes(search.toLowerCase()) ||
          o.geography.toLowerCase().includes(search.toLowerCase()) ||
          o.technology.toLowerCase().includes(search.toLowerCase()) ||
          o.owner.toLowerCase().includes(search.toLowerCase());
        const matchesStage = stageFilter === "all" || o.stage === stageFilter;
        const matchesIndustry = industryFilter === "all" || o.industry === industryFilter;
        const matchesGeography = geographyFilter === "all" || o.geography === geographyFilter;
        const matchesTechnology = technologyFilter === "all" || o.technology === technologyFilter;
        const matchesOwner = ownerFilter === "all" || o.owner === ownerFilter;
        return matchesSearch && matchesStage && matchesIndustry && matchesGeography && matchesTechnology && matchesOwner;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [opportunities, search, stageFilter, industryFilter, geographyFilter, technologyFilter, ownerFilter]);

  const stageOptions = [
    { value: "all", label: t("allStages") },
    ...STAGE_ORDER.map((s) => ({ value: s, label: t(`stage_${s}` as any) })),
  ];

  const hasActiveFilters = stageFilter !== "all" || industryFilter !== "all" || geographyFilter !== "all" || technologyFilter !== "all" || ownerFilter !== "all";

  const clearAllFilters = () => {
    setStageFilter("all");
    setIndustryFilter("all");
    setGeographyFilter("all");
    setTechnologyFilter("all");
    setOwnerFilter("all");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-3 sm:py-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img src={noviLogo} alt="NOVI" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-extrabold text-card-foreground tracking-tight truncate">{t("appTitle")}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{t("appSlogan")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={() => navigate("/guide")}>
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1.5">{t("guideLink")}</span>
            </Button>
            <LanguageSwitch />
            <NewOpportunityDialog />
          </div>
        </div>
      </header>

      {/* TEMP: Logo comparison – remove after decision */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-6">
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-bold text-card-foreground mb-4 text-center">Logo-Vergleich</h2>
          <div className="grid grid-cols-3 gap-6 items-center justify-items-center">
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Aktuell</p>
              <img src={noviLogo} alt="Aktuelles Logo" className="w-24 h-24 rounded-xl mx-auto" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">V2 – Schlicht</p>
              <img src={noviLogoV2} alt="Logo V2" className="w-24 h-24 rounded-xl mx-auto" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">V3 – Bunt</p>
              <img src={noviLogoV3} alt="Logo V3" className="w-24 h-24 rounded-xl mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8 py-6 space-y-6">
        {loading ? (
          <DashboardSkeleton />
        ) : (
        <>
        <ProcessOverview />

        <DashboardOverview opportunities={opportunities} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PipelineFunnel
            data={funnelData}
            activeStage={stageFilter}
            onStageClick={(stage) => setStageFilter(stageFilter === stage ? "all" : stage)}
          />
          <AnsoffMatrixDashboard opportunities={opportunities} />
        </div>

        <ThreeHorizonsDashboard opportunities={opportunities} />

        {/* Filters */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-card-foreground">{t("search")}</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground">
                <X className="h-3 w-3 mr-1" />
                {t("clearFilters")}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allStages")} />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allIndustries")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allIndustries")}</SelectItem>
                {uniqueIndustries.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={geographyFilter} onValueChange={setGeographyFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allGeographies")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allGeographies")}</SelectItem>
                {uniqueGeographies.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allTechnologies")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTechnologies")}</SelectItem>
                {uniqueTechnologies.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("allOwners")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allOwners")}</SelectItem>
                {uniqueOwners.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img src={noviLogo} alt="NOVI" className="h-12 w-12 opacity-40 mb-4" />
            <p className="text-muted-foreground">{t("noOpportunities")}</p>
          </div>
        ) : (
          <>
          {/* Mobile: Card layout */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((opp) => {
              const roughScore = calculateTotalScore(opp.scoring);
              const ds = opp.businessPlan;
              const detailedScore = ds
                ? Math.round(
                    ((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) * 10
                  ) / 10
                : null;
              return (
                <div
                  key={opp.id}
                  onClick={() => navigate(`/opportunity/${opp.id}`)}
                  className="rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-muted/30 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-card-foreground text-sm">{opp.title}</span>
                    <StageBadge stage={opp.stage} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {opp.industry && <span>{opp.industry}</span>}
                    {opp.geography && <span>{opp.geography}</span>}
                    {opp.owner && <span>{opp.owner}</span>}
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-muted-foreground">{t("roughScoring")}: <span className="font-semibold text-primary">{roughScore.toFixed(1)}</span></span>
                    {detailedScore !== null && (
                      <span className="text-muted-foreground">{t("detailedScoring")}: <span className="font-semibold text-primary">{detailedScore.toFixed(1)}</span></span>
                    )}
                  </div>
                  {assessments[opp.id] && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                      <img src={idaRobot} alt="IDA" className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{assessments[opp.id].summary}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Desktop: Table layout */}
          <div className="rounded-lg border border-border bg-card overflow-x-auto hidden sm:block">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("title")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("stage")}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("roughScoring")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[280px]">
                    <span className="flex items-center gap-1"><img src={idaRobot} alt="IDA" className="h-3 w-3" />{language === "de" ? "IDAs Empfehlung" : "IDA's Recommendation"}</span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("industry")}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("owner")}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("detailedScoring")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((opp) => {
                  const roughScore = calculateTotalScore(opp.scoring);
                  const ds = opp.businessPlan;
                  const detailedScore = ds
                    ? Math.round(
                        ((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) * 10
                      ) / 10
                    : null;
                  const payback = opp.businessCase?.paybackPeriod;
                  const assessment = assessments[opp.id];
                  return (
                    <tr
                      key={opp.id}
                      onClick={() => navigate(`/opportunity/${opp.id}`)}
                      className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-card-foreground">{opp.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StageBadge stage={opp.stage} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-primary">{roughScore.toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {assessment ? (
                          <div className="flex items-start gap-1.5">
                            <img src={idaRobot} alt="IDA" className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground leading-relaxed">{assessment.summary}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{opp.industry || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{opp.owner || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-primary">{detailedScore !== null ? detailedScore.toFixed(1) : "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
        </>
        )}
      </main>
    </div>
  );
}
