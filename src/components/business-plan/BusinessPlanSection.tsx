import { useI18n } from "@/lib/i18n";
import { DetailedScoring, StrategicAnalyses, createDefaultDetailedScoring, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState } from "react";
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
import { EmbeddedVPC, EmbeddedCBA, EmbeddedThreeCircles, EmbeddedPositioning, EmbeddedTargetCosting } from "./embedded/SomModels";
import { SalesChannelAnalysisTab } from "./embedded/SalesChannelAnalysisTab";
import { Globe, Target, TrendingUp, BarChart3 } from "lucide-react";


export type StrategicAnalysisTab = string;

interface Props {
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
export function BusinessPlanSection({ detailedScoring, strategicAnalyses, onSaveDetailed, onSaveStrategic, readonly, activeMainTab, activeSubTab, onTabChange, opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const [scoring, setScoring] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());
  const [saData, setSaData] = useState<StrategicAnalyses>(strategicAnalyses || createDefaultStrategicAnalyses());

  const mainTab = activeMainTab || "combined";
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

  const tamProps = { data: saData.tam, onSave: (d: any) => handleUpdateSa({ ...saData, tam: d }), readonly };
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

  return (
    <div className="space-y-4">


    <Tabs value={mainTab} onValueChange={handleMainTabChange} className="space-y-6">

      {/* Combined Overview */}
      <TabsContent value="combined">
        <CombinedOverview scoring={scoring} strategicAnalyses={saData} onSaveStrategic={handleUpdateSa} readonly={readonly}
          onSaveDetailed={handleUpdateScoring} />
      </TabsContent>

      {/* ═══ TAM ═══ */}
      <TabsContent value="tam">
        <Tabs value={getSubTab("tam", "tam-overview")} onValueChange={(v) => handleSubTabChange("tam", v)} className="space-y-4">
          <TabsContent value="tam-overview">
            <TamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
              strategicAnalyses={saData}
              opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
              solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
          </TabsContent>
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
        <Tabs value={getSubTab("sam", "sam-overview")} onValueChange={(v) => handleSubTabChange("sam", v)} className="space-y-4">
          <TabsContent value="sam-overview">
            <SamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
              strategicAnalyses={saData}
              opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
              solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
          </TabsContent>
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
        <Tabs value={getSubTab("som", "som-overview")} onValueChange={(v) => handleSubTabChange("som", v)} className="space-y-4">
          <TabsContent value="som-overview">
            <SomOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly}
              strategicAnalyses={saData}
              opportunityTitle={opportunityTitle} opportunityDescription={opportunityDescription}
              solutionDescription={solutionDescription} industry={industry} geography={geography} technology={technology} />
          </TabsContent>
          <TabsContent value="som-competitor">
            <CompetitorLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
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
    </div>
  );
}
