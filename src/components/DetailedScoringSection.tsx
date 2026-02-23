import { useI18n } from "@/lib/i18n";
import { DetailedScoring, createDefaultDetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoringOverviewTab } from "./detailed-scoring/ScoringOverviewTab";
import { MarketAttractivenessTab } from "./detailed-scoring/MarketAttractivenessTab";
import { CommercialViabilityTab } from "./detailed-scoring/CommercialViabilityTab";
import { FeasibilityTab } from "./detailed-scoring/FeasibilityTab";
import { RiskTab } from "./detailed-scoring/RiskTab";
import { StrategicFitTab } from "./detailed-scoring/StrategicFitTab";
import { CompetitorLandscapeTab } from "./detailed-scoring/CompetitorLandscapeTab";
import { CustomerLandscapeTab } from "./detailed-scoring/CustomerLandscapeTab";
import { OrganisationalReadinessTab } from "./detailed-scoring/OrganisationalReadinessTab";
import { PilotCustomerTab } from "./detailed-scoring/PilotCustomerTab";
import { RelatedAnalyses, type StrategicAnalysisTab } from "./detailed-scoring/RelatedAnalyses";

interface Props {
  detailedScoring?: DetailedScoring;
  onSave: (ds: DetailedScoring) => void;
  readonly?: boolean;
  onNavigateToAnalysis?: (analysisTab: StrategicAnalysisTab) => void;
}

export function DetailedScoringSection({ detailedScoring, onSave, readonly, onNavigateToAnalysis }: Props) {
  const { t } = useI18n();
  const [scoring, setScoring] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());

  const handleUpdate = (updated: DetailedScoring) => {
    setScoring(updated);
    onSave(updated);
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">{t("scoringOverview")}</TabsTrigger>
        <TabsTrigger value="market" className="text-xs sm:text-sm">{t("marketAttractiveness")}</TabsTrigger>
        <TabsTrigger value="customer" className="text-xs sm:text-sm">{t("maCustomerLandscape")}</TabsTrigger>
        <TabsTrigger value="competitor" className="text-xs sm:text-sm">{t("dsCompetitorLandscape")}</TabsTrigger>
        <TabsTrigger value="strategic" className="text-xs sm:text-sm">{t("strategicFit")}</TabsTrigger>
        <TabsTrigger value="feasibility" className="text-xs sm:text-sm">{t("feasibility")}</TabsTrigger>
        <TabsTrigger value="orgReadiness" className="text-xs sm:text-sm">{t("dsOrgReadiness")}</TabsTrigger>
        <TabsTrigger value="commercial" className="text-xs sm:text-sm">{t("commercialViability")}</TabsTrigger>
        <TabsTrigger value="risk" className="text-xs sm:text-sm">{t("risk")}</TabsTrigger>
        <TabsTrigger value="pilotCustomer" className="text-xs sm:text-sm">{t("dsPilotCustomer" as any)}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ScoringOverviewTab scoring={scoring} />
      </TabsContent>

      <TabsContent value="market">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="market" onNavigate={onNavigateToAnalysis} />
          <MarketAttractivenessTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="customer">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="customer" onNavigate={onNavigateToAnalysis} />
          <CustomerLandscapeTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="competitor">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="competitor" onNavigate={onNavigateToAnalysis} />
          <CompetitorLandscapeTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="strategic">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="strategic" onNavigate={onNavigateToAnalysis} />
          <StrategicFitTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="feasibility">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="feasibility" onNavigate={onNavigateToAnalysis} />
          <FeasibilityTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="orgReadiness">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="orgReadiness" onNavigate={onNavigateToAnalysis} />
          <OrganisationalReadinessTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="commercial">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="commercial" onNavigate={onNavigateToAnalysis} />
          <CommercialViabilityTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="risk">
        <div className="space-y-4">
          <RelatedAnalyses scoringTab="risk" onNavigate={onNavigateToAnalysis} />
          <RiskTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
        </div>
      </TabsContent>

      <TabsContent value="pilotCustomer">
        <PilotCustomerTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
      </TabsContent>
    </Tabs>
  );
}
