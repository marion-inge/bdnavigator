import { useI18n } from "@/lib/i18n";
import { DetailedScoring, StrategicAnalyses, createDefaultDetailedScoring, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CombinedOverview } from "./CombinedOverview";
import { TamOverview } from "./TamOverview";
import { SamOverview } from "./SamOverview";
import { SomOverview } from "./SomOverview";
import { StrategicFitTab } from "@/components/detailed-scoring/StrategicFitTab";
import { PortfolioFitTab } from "@/components/detailed-scoring/PortfolioFitTab";
import { FeasibilityTab } from "@/components/detailed-scoring/FeasibilityTab";
import { OrganisationalReadinessTab } from "@/components/detailed-scoring/OrganisationalReadinessTab";
import { RiskTab } from "@/components/detailed-scoring/RiskTab";
import { CustomerLandscapeTab } from "@/components/detailed-scoring/CustomerLandscapeTab";
import { CompetitorLandscapeTab } from "@/components/detailed-scoring/CompetitorLandscapeTab";

import { PilotCustomerTab } from "@/components/detailed-scoring/PilotCustomerTab";

import { EmbeddedMarketResearch, EmbeddedPestel, EmbeddedPorter, EmbeddedSwot, EmbeddedValueChain } from "./embedded/TamModels";

import { EmbeddedCustomerInterviews, EmbeddedInternalAffiliateInterviews, EmbeddedInternalBUInterviews, EmbeddedBMC, EmbeddedLeanCanvas } from "./embedded/SamModels";
import { CustomersFoundTab } from "./embedded/CustomersFoundTab";
import { EmbeddedVPC, EmbeddedCBA, EmbeddedThreeCircles, EmbeddedPositioning, EmbeddedTargetCosting } from "./embedded/SomModels";
import { SalesChannelAnalysisTab } from "./embedded/SalesChannelAnalysisTab";
import { Globe, Target, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import idaRobot from "@/assets/ida-robot.png";
import { IdaBusinessPlanFillDialog } from "./IdaBusinessPlanFillDialog";
import type { ProposalGroup } from "@/lib/businessPlanIdaFields";


export type StrategicAnalysisTab = string;

interface Props {
  opportunityId?: string;
  detailedScoring?: DetailedScoring;
  strategicAnalyses?: StrategicAnalyses;
  onSaveDetailed: (ds: DetailedScoring) => void;
  onSaveStrategic: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
  activeMainTab?: string;
  activeSubTab?: string;
  onTabChange?: (mainTab: string, subTab?: string) => void;
  opportunityTitle?: string;
  opportunityDescription?: string;
  solutionDescription?: string;
  industry?: string;
  geography?: string;
  technology?: string;
}
export function BusinessPlanSection({ opportunityId, detailedScoring, strategicAnalyses, onSaveDetailed, onSaveStrategic, readonly, activeMainTab, activeSubTab, onTabChange, opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const [scoring, setScoring] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());
  const [saData, setSaData] = useState<StrategicAnalyses>(strategicAnalyses || createDefaultStrategicAnalyses());

  const mainTab = activeMainTab || "tam";

  // Scroll the TAM/SAM/SOM section into view when navigated to a specific
  // sub-tab from the sidebar (the CombinedOverview above is very tall).
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeSubTab && tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeMainTab, activeSubTab]);
  const handleMainTabChange = (value: string) => {
    onTabChange?.(value, undefined);
  };

  const handleUpdateScoring = (updated: DetailedScoring) => {
    setScoring(updated);
    onSaveDetailed(updated);
  };

  const handleUpdateSa = (updated: StrategicAnalyses) => {
    setSaData(updated);
    onSaveStrategic(updated);
  };

  const oppContext = opportunityTitle ? { title: opportunityTitle, description: opportunityDescription || "", solutionDescription, industry: industry || "", geography: geography || "", technology: technology || "" } : undefined;
  const tamProps = { data: saData.tam, onSave: (d: any) => handleUpdateSa({ ...saData, tam: d }), readonly, opportunity: oppContext };
  const samProps = { data: saData.sam, onSave: (d: any) => handleUpdateSa({ ...saData, sam: d }), readonly };
  const somProps = { data: saData.som, onSave: (d: any) => handleUpdateSa({ ...saData, som: d }), readonly };

  // Helper for sub-tabs: use activeSubTab if provided, otherwise default
  const getSubTab = (section: string, defaultVal: string) => {
    if (activeMainTab === section && activeSubTab) return activeSubTab;
    return defaultVal;
  };
  const handleSubTabChange = (section: string, subTab: string) => {
    onTabChange?.(section, subTab);
  };

  const agentContext = {
    section: "Business Plan",
    mainTab,
    opportunityTitle,
    opportunityDescription,
    detailedScoring: scoring,
    strategicAnalyses: saData,
  };

  const [idaScope, setIdaScope] = useState<ProposalGroup | "all" | null>(null);
  const canRunIda = !!opportunityId && !readonly;

  const IdaButton = ({ scope, label }: { scope: ProposalGroup | "all"; label: string }) => (
    <Button
      type="button"
      size="sm"
      variant={scope === "all" ? "default" : "outline"}
      onClick={() => setIdaScope(scope)}
      disabled={!canRunIda}
      className="gap-2"
      title={!opportunityId ? "Save the idea first" : ""}
    >
      <img src={idaRobot} alt="" className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {canRunIda && (
          <IdaButton scope="all" label={bp("Fill Business Plan with IDA", "Businessplan mit IDA ausfüllen")} />
        )}
      </div>




      {/* Combined Overview — shown permanently above TAM/SAM/SOM */}
      <CombinedOverview scoring={scoring} strategicAnalyses={saData} onSaveStrategic={handleUpdateSa} readonly={readonly}
        onSaveDetailed={handleUpdateScoring} />

    <Tabs ref={tabsRef} value={mainTab} onValueChange={handleMainTabChange} className="space-y-6 scroll-mt-4">

      {/* ═══ TAM ═══ */}
      <TabsContent value="tam">
        {canRunIda && (
          <div className="flex justify-end mb-2"><IdaButton scope="tam" label={bp("Fill TAM with IDA", "TAM mit IDA ausfüllen")} /></div>
        )}
        <TamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
          strategicAnalyses={saData}
          onSaveTam={(d) => handleUpdateSa({ ...saData, tam: d })}
          onSaveSam={(d) => handleUpdateSa({ ...saData, sam: d })}
          opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
          solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
        <Tabs value={getSubTab("tam", "tam-research")} onValueChange={(v) => handleSubTabChange("tam", v)} className="space-y-4">
          <TabsContent value="tam-research">
            <EmbeddedMarketResearch {...tamProps} />
          </TabsContent>
          <TabsContent value="tam-pestel">
            <EmbeddedPestel {...tamProps} />
          </TabsContent>
          <TabsContent value="tam-valuechain">
            <EmbeddedValueChain {...tamProps} />
          </TabsContent>
          <TabsContent value="tam-porter">
            <EmbeddedPorter {...tamProps} />
          </TabsContent>
          <TabsContent value="tam-swot">
            <EmbeddedSwot {...tamProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ SAM ═══ */}
      <TabsContent value="sam">
        {canRunIda && (
          <div className="flex justify-end mb-2"><IdaButton scope="sam" label={bp("Fill SAM with IDA", "SAM mit IDA ausfüllen")} /></div>
        )}
        <SamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
          strategicAnalyses={saData}
          opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
          solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
        <Tabs value={getSubTab("sam", "sam-channels")} onValueChange={(v) => handleSubTabChange("sam", v)} className="space-y-4">
          <TabsContent value="sam-channels">
            <SalesChannelAnalysisTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-customers">
            <CustomerLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-strategic">
            <StrategicFitTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-portfolio">
            <PortfolioFitTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-feasibility">
            <FeasibilityTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-org">
            <OrganisationalReadinessTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-risk">
            <RiskTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-interviews">
            <EmbeddedCustomerInterviews {...samProps} />
          </TabsContent>
          <TabsContent value="sam-affiliate">
            <EmbeddedInternalAffiliateInterviews {...samProps} />
          </TabsContent>
          <TabsContent value="sam-bu">
            <EmbeddedInternalBUInterviews {...samProps} />
          </TabsContent>
          <TabsContent value="sam-bmc">
            <EmbeddedBMC {...samProps} />
          </TabsContent>
          <TabsContent value="sam-lean">
            <EmbeddedLeanCanvas {...samProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ SOM ═══ */}
      <TabsContent value="som">
        {canRunIda && (
          <div className="flex justify-end mb-2"><IdaButton scope="som" label={bp("Fill SOM with IDA", "SOM mit IDA ausfüllen")} /></div>
        )}
        <SomOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
          strategicAnalyses={saData}
          opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
          solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
        <Tabs value={getSubTab("som", "som-competitor")} onValueChange={(v) => handleSubTabChange("som", v)} className="space-y-4">
          <TabsContent value="som-competitor">
            <CompetitorLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} opportunity={oppContext} />
          </TabsContent>
          <TabsContent value="som-customers-found">
            <CustomersFoundTab
              {...samProps}
              title={bp("Customers Found – Customer Scan", "Gefundene Kunden – Customer Scan")}
              description={bp(
                "Detailed overview of customers identified through the Customer Scan (tier-ranked A–E). Import the Customer Scan Excel database, or add accounts manually. Feeds bottom-up sizing and Buying Center Scan seeding.",
                "Detailübersicht der über den Customer Scan identifizierten Kunden (Tier A–E). Excel-Datenbank des Customer Scan importieren oder Accounts manuell hinzufügen. Speist die Bottom-Up-Berechnung und den Buying Center Scan.",
              )}
            />
          </TabsContent>
          <TabsContent value="som-pilot">
            <PilotCustomerTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-vpc">
            <EmbeddedVPC {...somProps} />
          </TabsContent>
          <TabsContent value="som-cba">
            <EmbeddedCBA {...somProps} />
          </TabsContent>
          <TabsContent value="som-threecircles">
            <EmbeddedThreeCircles {...somProps} />
          </TabsContent>
          <TabsContent value="som-positioning">
            <EmbeddedPositioning {...somProps} />
          </TabsContent>
          <TabsContent value="som-targetcosting">
            <EmbeddedTargetCosting {...somProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ Others ═══ */}
    </Tabs>
    {opportunityId && idaScope && (
      <IdaBusinessPlanFillDialog
        open={!!idaScope}
        onOpenChange={(v) => { if (!v) setIdaScope(null); }}
        opportunityId={opportunityId}
        scope={idaScope}
        scoring={scoring}
        strategicAnalyses={saData}
        context={{ title: opportunityTitle, description: opportunityDescription, solutionDescription, industry, geography, technology }}
        onApply={({ scoring: s, sa }) => {
          handleUpdateScoring(s);
          handleUpdateSa(sa);
        }}
      />
    )}
    </div>
  );
}
