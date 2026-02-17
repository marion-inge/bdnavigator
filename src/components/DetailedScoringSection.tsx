import { useI18n } from "@/lib/i18n";
import { DetailedScoring, createDefaultDetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoringOverviewTab } from "./detailed-scoring/ScoringOverviewTab";
import { MarketAttractivenessTab } from "./detailed-scoring/MarketAttractivenessTab";
import { CommercialViabilityTab } from "./detailed-scoring/CommercialViabilityTab";
import { FeasibilityTab } from "./detailed-scoring/FeasibilityTab";
import { RiskTab } from "./detailed-scoring/RiskTab";
import { CriterionTab } from "./detailed-scoring/CriterionTab";
import { Crosshair, Wrench, DollarSign, AlertTriangle } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

interface Props {
  detailedScoring?: DetailedScoring;
  onSave: (ds: DetailedScoring) => void;
  readonly?: boolean;
}

export function DetailedScoringSection({ detailedScoring, onSave, readonly }: Props) {
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
        <TabsTrigger value="strategic" className="text-xs sm:text-sm">{t("strategicFit")}</TabsTrigger>
        <TabsTrigger value="feasibility" className="text-xs sm:text-sm">{t("feasibility")}</TabsTrigger>
        <TabsTrigger value="commercial" className="text-xs sm:text-sm">{t("commercialViability")}</TabsTrigger>
        <TabsTrigger value="risk" className="text-xs sm:text-sm">{t("risk")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ScoringOverviewTab scoring={scoring} />
      </TabsContent>

      <TabsContent value="market">
        <MarketAttractivenessTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
      </TabsContent>

      <TabsContent value="strategic">
        <CriterionTab
          criterionKey="strategicFit"
          scoring={scoring}
          onUpdate={handleUpdate}
          readonly={readonly}
          icon={Crosshair}
          guidanceKeys={[
            "guidance_sf_1" as TranslationKey,
            "guidance_sf_2" as TranslationKey,
            "guidance_sf_3" as TranslationKey,
          ]}
        />
      </TabsContent>

      <TabsContent value="feasibility">
        <FeasibilityTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
      </TabsContent>

      <TabsContent value="commercial">
        <CommercialViabilityTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
      </TabsContent>

      <TabsContent value="risk">
        <RiskTab scoring={scoring} onUpdate={handleUpdate} readonly={readonly} />
      </TabsContent>
    </Tabs>
  );
}
