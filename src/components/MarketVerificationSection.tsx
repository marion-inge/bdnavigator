import { DetailedScoring, StrategicAnalyses, createDefaultDetailedScoring, createDefaultStrategicAnalyses } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmbeddedCustomerInterviews, EmbeddedInternalAffiliateInterviews, EmbeddedInternalBUInterviews } from "@/components/business-plan/embedded/SamModels";
import { PilotCustomerTab } from "@/components/detailed-scoring/PilotCustomerTab";
import { useI18n } from "@/lib/i18n";

export type MarketVerificationTab = "customer" | "affiliate" | "bu" | "pilot";

interface Props {
  activeTab: MarketVerificationTab;
  onTabChange: (tab: MarketVerificationTab) => void;
  detailedScoring?: DetailedScoring;
  strategicAnalyses?: StrategicAnalyses;
  onSaveDetailed: (data: DetailedScoring) => void;
  onSaveStrategic: (data: StrategicAnalyses) => void;
  readonly?: boolean;
}

export function MarketVerificationSection({
  activeTab,
  onTabChange,
  detailedScoring,
  strategicAnalyses,
  onSaveDetailed,
  onSaveStrategic,
  readonly,
}: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const scoring = detailedScoring || createDefaultDetailedScoring();
  const analyses = strategicAnalyses || createDefaultStrategicAnalyses();
  const samProps = {
    data: analyses.sam,
    onSave: (sam: StrategicAnalyses["sam"]) => onSaveStrategic({ ...analyses, sam }),
    readonly,
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{bp("Market Verification", "Marktverifizierung")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {bp("Validate the opportunity with customers, internal stakeholders, pilots and leads.", "Validieren Sie die Opportunity mit Kunden, internen Stakeholdern, Piloten und Leads.")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as MarketVerificationTab)} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="customer">{bp("Customer Interviews", "Kundeninterviews")}</TabsTrigger>
          <TabsTrigger value="affiliate">{bp("Affiliate Interviews", "Affiliate-Interviews")}</TabsTrigger>
          <TabsTrigger value="bu">{bp("BU Interviews", "BU-Interviews")}</TabsTrigger>
          <TabsTrigger value="pilot">{bp("Pilot & Leads", "Pilot & Leads")}</TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <EmbeddedCustomerInterviews {...samProps} />
        </TabsContent>
        <TabsContent value="affiliate">
          <EmbeddedInternalAffiliateInterviews {...samProps} />
        </TabsContent>
        <TabsContent value="bu">
          <EmbeddedInternalBUInterviews {...samProps} />
        </TabsContent>
        <TabsContent value="pilot">
          <PilotCustomerTab scoring={scoring} onUpdate={onSaveDetailed} readonly={readonly} />
        </TabsContent>
      </Tabs>
    </section>
  );
}