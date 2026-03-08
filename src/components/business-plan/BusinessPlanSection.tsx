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
import { EmbeddedCustomerSegmentation, EmbeddedCustomerInterviews, EmbeddedInternalAffiliateInterviews, EmbeddedInternalBUInterviews, EmbeddedBMC, EmbeddedLeanCanvas } from "./embedded/SamModels";
import { EmbeddedVPC, EmbeddedCBA, EmbeddedThreeCircles, EmbeddedPositioning, EmbeddedPositioningLandscape } from "./embedded/SomModels";
import { Globe, Target, TrendingUp, BarChart3 } from "lucide-react";
import { AgentPanel } from "@/components/agents/AgentPanel";

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
}
export function BusinessPlanSection({ detailedScoring, strategicAnalyses, onSaveDetailed, onSaveStrategic, readonly, activeMainTab, activeSubTab, onTabChange, opportunityTitle, opportunityDescription }: Props) {
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

  const saProps = { strategicAnalyses: saData, onSave: handleUpdateSa, readonly };

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
      <div className="flex items-center justify-between">
        <AgentPanel context={agentContext} sectionLabel="Business Plan" />
      </div>
    <Tabs value={mainTab} onValueChange={handleMainTabChange} className="space-y-6">

      {/* Combined Overview */}
      <TabsContent value="combined">
        <CombinedOverview scoring={scoring} strategicAnalyses={saData} onSaveStrategic={handleUpdateSa} readonly={readonly} />
      </TabsContent>

      {/* ═══ TAM ═══ */}
      <TabsContent value="tam">
        <Tabs value={getSubTab("tam", "tam-overview")} onValueChange={(v) => handleSubTabChange("tam", v)} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="tam-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="tam-research" className="text-xs">{bp("Market Research", "Marktforschung")}</TabsTrigger>
            <TabsTrigger value="tam-pestel" className="text-xs">PESTEL</TabsTrigger>
            <TabsTrigger value="tam-valuechain" className="text-xs">{bp("Value Chain", "Wertschöpfungskette")}</TabsTrigger>
            <TabsTrigger value="tam-porter" className="text-xs">Porter's</TabsTrigger>
            <TabsTrigger value="tam-swot" className="text-xs">SWOT</TabsTrigger>
          </TabsList>
          <TabsContent value="tam-overview">
            <TamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="tam-research">
            <EmbeddedMarketResearch {...saProps} />
          </TabsContent>
          <TabsContent value="tam-pestel">
            <EmbeddedPestel {...saProps} />
          </TabsContent>
          <TabsContent value="tam-valuechain">
            <EmbeddedValueChain {...saProps} />
          </TabsContent>
          <TabsContent value="tam-porter">
            <EmbeddedPorter {...saProps} />
          </TabsContent>
          <TabsContent value="tam-swot">
            <EmbeddedSwot {...saProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ SAM ═══ */}
      <TabsContent value="sam">
        <Tabs value={getSubTab("sam", "sam-overview")} onValueChange={(v) => handleSubTabChange("sam", v)} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="sam-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="sam-customers" className="text-xs">{bp("Customer Landscape", "Kundenlandschaft")}</TabsTrigger>
            <TabsTrigger value="sam-strategic" className="text-xs">{bp("Strategic Fit", "Strateg. Fit")}</TabsTrigger>
            <TabsTrigger value="sam-portfolio" className="text-xs">{bp("Portfolio Fit", "Portfolio Fit")}</TabsTrigger>
            <TabsTrigger value="sam-feasibility" className="text-xs">{bp("Feasibility", "Machbarkeit")}</TabsTrigger>
            <TabsTrigger value="sam-org" className="text-xs">{bp("Org Readiness", "Org. Readiness")}</TabsTrigger>
            <TabsTrigger value="sam-risk" className="text-xs">{bp("Risk", "Risiko")}</TabsTrigger>
            <TabsTrigger value="sam-segmentation" className="text-xs">{bp("Segmentation", "Segmentierung")}</TabsTrigger>
            <TabsTrigger value="sam-interviews" className="text-xs">{bp("Interviews", "Interviews")}</TabsTrigger>
            <TabsTrigger value="sam-affiliate" className="text-xs">{bp("Affiliate Interviews", "Affiliate-Interviews")}</TabsTrigger>
            <TabsTrigger value="sam-bu" className="text-xs">{bp("BU Interviews", "BU-Interviews")}</TabsTrigger>
            <TabsTrigger value="sam-bmc" className="text-xs">BMC</TabsTrigger>
            <TabsTrigger value="sam-lean" className="text-xs">Lean Canvas</TabsTrigger>
          </TabsList>
          <TabsContent value="sam-overview">
            <SamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
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
          <TabsContent value="sam-segmentation">
            <EmbeddedCustomerSegmentation {...saProps} />
          </TabsContent>
          <TabsContent value="sam-interviews">
            <EmbeddedCustomerInterviews {...saProps} />
          </TabsContent>
          <TabsContent value="sam-affiliate">
            <EmbeddedInternalAffiliateInterviews {...saProps} />
          </TabsContent>
          <TabsContent value="sam-bu">
            <EmbeddedInternalBUInterviews {...saProps} />
          </TabsContent>
          <TabsContent value="sam-bmc">
            <EmbeddedBMC {...saProps} />
          </TabsContent>
          <TabsContent value="sam-lean">
            <EmbeddedLeanCanvas {...saProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ SOM ═══ */}
      <TabsContent value="som">
        <Tabs value={getSubTab("som", "som-overview")} onValueChange={(v) => handleSubTabChange("som", v)} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="som-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="som-competitor" className="text-xs">{bp("Competitors", "Wettbewerb")}</TabsTrigger>
            
            <TabsTrigger value="som-pilot" className="text-xs">{bp("Pilot & Leads", "Pilot & Leads")}</TabsTrigger>
            <TabsTrigger value="som-vpc" className="text-xs">VPC</TabsTrigger>
            <TabsTrigger value="som-cba" className="text-xs">{bp("Customer Benefit", "Kundennutzen")}</TabsTrigger>
            <TabsTrigger value="som-threecircles" className="text-xs">{bp("Three Circles", "Drei Kreise")}</TabsTrigger>
            <TabsTrigger value="som-positioning" className="text-xs">{bp("Positioning", "Positionierung")}</TabsTrigger>
            <TabsTrigger value="som-landscape" className="text-xs">{bp("Pos. Landscape", "Pos. Landschaft")}</TabsTrigger>
          </TabsList>
          <TabsContent value="som-overview">
            <SomOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-competitor">
            <CompetitorLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-pilot">
            <PilotCustomerTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-vpc">
            <EmbeddedVPC {...saProps} />
          </TabsContent>
          <TabsContent value="som-cba">
            <EmbeddedCBA {...saProps} />
          </TabsContent>
          <TabsContent value="som-threecircles">
            <EmbeddedThreeCircles {...saProps} />
          </TabsContent>
          <TabsContent value="som-positioning">
            <EmbeddedPositioning {...saProps} />
          </TabsContent>
          <TabsContent value="som-landscape">
            <EmbeddedPositioningLandscape {...saProps} />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ═══ Others ═══ */}
    </Tabs>
    </div>
  );
}
