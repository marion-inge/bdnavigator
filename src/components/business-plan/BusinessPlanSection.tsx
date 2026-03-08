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
import { CommercialViabilityTab } from "@/components/detailed-scoring/CommercialViabilityTab";
import { PilotCustomerTab } from "@/components/detailed-scoring/PilotCustomerTab";

import { EmbeddedMarketResearch, EmbeddedPestel, EmbeddedPorter, EmbeddedSwot, EmbeddedValueChain } from "./embedded/TamModels";
import { EmbeddedCustomerSegmentation, EmbeddedCustomerInterviews, EmbeddedInternalAffiliateInterviews, EmbeddedInternalBUInterviews, EmbeddedBMC, EmbeddedLeanCanvas } from "./embedded/SamModels";
import { EmbeddedVPC, EmbeddedCBA, EmbeddedThreeCircles, EmbeddedPositioning, EmbeddedPositioningLandscape } from "./embedded/SomModels";
import { Globe, Target, TrendingUp, BarChart3, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StrategicAnalysisTab = string;

interface Props {
  detailedScoring?: DetailedScoring;
  strategicAnalyses?: StrategicAnalyses;
  onSaveDetailed: (ds: DetailedScoring) => void;
  onSaveStrategic: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
  onNavigateToAnalysis?: (analysisTab: StrategicAnalysisTab) => void;
  activeMainTab?: string;
  activeSubTab?: string;
  onTabChange?: (mainTab: string, subTab?: string) => void;
}

function ModelLinkCard({ name, description, tabKey, onNavigate, icon }: {
  name: string; description: string; tabKey: string; onNavigate?: (tab: string) => void; icon?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{icon && <span className="mr-1.5">{icon}</span>}{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      {onNavigate && (
        <Button size="sm" variant="outline" onClick={() => onNavigate(tabKey)} className="shrink-0 gap-1">
          <ExternalLink className="h-3 w-3" />
          Open
        </Button>
      )}
    </div>
  );
}

export function BusinessPlanSection({ detailedScoring, strategicAnalyses, onSaveDetailed, onSaveStrategic, readonly, onNavigateToAnalysis, activeMainTab, activeSubTab, onTabChange }: Props) {
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

  return (
    <Tabs value={mainTab} onValueChange={handleMainTabChange} className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="combined" className="text-xs sm:text-sm gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          {bp("Overview", "Übersicht")}
        </TabsTrigger>
        <TabsTrigger value="tam" className="text-xs sm:text-sm gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          TAM
        </TabsTrigger>
        <TabsTrigger value="sam" className="text-xs sm:text-sm gap-1.5">
          <Target className="h-3.5 w-3.5" />
          SAM
        </TabsTrigger>
        <TabsTrigger value="som" className="text-xs sm:text-sm gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          SOM
        </TabsTrigger>
        <TabsTrigger value="others" className="text-xs sm:text-sm gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" />
          {bp("Others", "Sonstige")}
        </TabsTrigger>
      </TabsList>

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
      <TabsContent value="others">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{bp("Other Strategic Models", "Sonstige strategische Modelle")}</h2>
            <p className="text-sm text-muted-foreground">{bp("Strategic frameworks not directly assignable to TAM, SAM, or SOM.", "Strategische Frameworks, die nicht direkt TAM, SAM oder SOM zuordenbar sind.")}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ModelLinkCard name={bp("Ansoff Matrix", "Ansoff-Matrix")} description={bp("Growth strategy classification: market penetration, product/market development, diversification. Helps decide the overall strategic approach for the opportunity.", "Wachstumsstrategien: Marktdurchdringung, Produkt-/Marktentwicklung, Diversifikation. Hilft bei der strategischen Gesamtausrichtung.")} tabKey="ansoff" onNavigate={onNavigateToAnalysis} icon="📊" />
            <ModelLinkCard name={bp("BCG Matrix", "BCG-Matrix")} description={bp("Portfolio analysis by market share and growth rate: Star, Cash Cow, Question Mark, Dog. Useful for portfolio prioritization.", "Portfolio-Analyse nach Marktanteil und Wachstum: Star, Cash Cow, Fragezeichen, Armer Hund. Nützlich für Portfolio-Priorisierung.")} tabKey="bcg" onNavigate={onNavigateToAnalysis} icon="⭐" />
            <ModelLinkCard name={bp("McKinsey Matrix", "McKinsey-Matrix")} description={bp("9-cell matrix: industry attractiveness vs. competitive strength. Guides investment decisions and resource allocation.", "9-Felder-Matrix: Branchenattraktivität vs. Wettbewerbsstärke. Leitet Investitionsentscheidungen und Ressourcenallokation.")} tabKey="mckinsey" onNavigate={onNavigateToAnalysis} icon="📈" />
            <ModelLinkCard name={bp("3 Horizons of Growth", "3 Horizonte des Wachstums")} description={bp("Horizon 1 (core), Horizon 2 (emerging), Horizon 3 (future). Classifies the opportunity in the innovation pipeline timeline.", "Horizont 1 (Kern), Horizont 2 (aufstrebend), Horizont 3 (Zukunft). Ordnet die Opportunity in der Innovationspipeline-Timeline ein.")} tabKey="threeHorizons" onNavigate={onNavigateToAnalysis} icon="🌅" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
