import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GoToMarketPlan, ChecklistItem, createDefaultGoToMarketPlan, LeadGenerationData, BusinessCase, createDefaultBusinessCase, DetailedScoring, createDefaultDetailedScoring } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Rocket, DollarSign, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import { PilotCustomerGtmSection } from "./gtm/PilotCustomerGtmSection";
import { LeadGenerationSection } from "./gtm/LeadGenerationSection";
import { EditableSection } from "@/components/EditableSection";
import { BusinessCaseSection } from "@/components/BusinessCaseSection";
import { CommercialViabilityTab } from "@/components/detailed-scoring/CommercialViabilityTab";

interface Props {
  goToMarketPlan?: GoToMarketPlan;
  onSave: (plan: GoToMarketPlan) => void;
  readonly?: boolean;
  businessCase?: BusinessCase;
  onSaveBusinessCase?: (bc: BusinessCase) => void;
  detailedScoring?: DetailedScoring;
  onSaveDetailedScoring?: (ds: DetailedScoring) => void;
}

const defaultLeadGen: LeadGenerationData = { channels: [], activities: [], pipelineNotes: "" };

export function GoToMarketSection({ goToMarketPlan, onSave, readonly: propReadonly, businessCase, onSaveBusinessCase, detailedScoring, onSaveDetailedScoring }: Props) {
  const { t, language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [data, setData] = useState<GoToMarketPlan>(goToMarketPlan || createDefaultGoToMarketPlan());
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const [scoring, setScoring] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());

  const update = (updated: GoToMarketPlan) => {
    setData(updated);
    onSave(updated);
  };

  const handleUpdateScoring = (updated: DetailedScoring) => {
    setScoring(updated);
    onSaveDetailedScoring?.(updated);
  };

  const addChecklistItem = () => {
    update({ ...data, checklist: [...data.checklist, { id: crypto.randomUUID(), text: "", done: false }] });
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    update({ ...data, checklist: data.checklist.map((item) => (item.id === id ? { ...item, ...updates } : item)) });
  };

  const removeChecklistItem = (id: string) => {
    update({ ...data, checklist: data.checklist.filter((item) => item.id !== id) });
  };

  const fields: { key: keyof GoToMarketPlan; label: string; placeholder: string }[] = [
    { key: "targetSegments", label: t("gtmTargetSegments"), placeholder: t("gtmTargetSegmentsPlaceholder") },
    { key: "channels", label: t("gtmChannels"), placeholder: t("gtmChannelsPlaceholder") },
    { key: "pricingStrategy", label: t("gtmPricingStrategy"), placeholder: t("gtmPricingStrategyPlaceholder") },
    { key: "keyPartners", label: t("gtmKeyPartners"), placeholder: t("gtmKeyPartnersPlaceholder") },
    { key: "kpis", label: t("gtmKpis"), placeholder: t("gtmKpisPlaceholder") },
  ];

  const agentContext = { section: "Go-to-Market Plan", goToMarketPlan: data, businessCase, commercialViability: scoring?.commercialViability };

  return (
    <div className="space-y-4">


    <Tabs defaultValue="gtm" className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="gtm" className="text-xs sm:text-sm gap-1.5">
          <Rocket className="h-3.5 w-3.5" />
          {bp("GTM Strategy", "GTM-Strategie")}
        </TabsTrigger>
        <TabsTrigger value="business-case" className="text-xs sm:text-sm gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          {bp("Business Case", "Business Case")}
        </TabsTrigger>
        <TabsTrigger value="pricing" className="text-xs sm:text-sm gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          {bp("Pricing", "Pricing")}
        </TabsTrigger>
      </TabsList>

      {/* GTM Strategy Tab */}
      <TabsContent value="gtm">
        <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("gtmTitle")}</h2>
            </div>

            {/* GTM Strategy */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    {t("gtmStrategy")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("gtmLaunchDate")}</Label>
                      <Input
                        type="date"
                        value={data.launchDate}
                        onChange={(e) => update({ ...data, launchDate: e.target.value })}
                        disabled={readonly}
                      />
                    </div>
                  </div>
                  {fields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Textarea
                        value={data[key] as string}
                        onChange={(e) => update({ ...data, [key]: e.target.value })}
                        placeholder={placeholder}
                        disabled={readonly}
                        rows={3}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Checklist */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("gtmChecklist")}</CardTitle>
                    {!readonly && (
                      <Button variant="outline" size="sm" onClick={addChecklistItem} className="gap-1">
                        <Plus className="h-3.5 w-3.5" /> {t("gtmAddItem")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.checklist.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t("gtmNoItems")}</p>
                  ) : (
                    data.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={(checked) => updateChecklistItem(item.id, { done: !!checked })}
                          disabled={readonly}
                        />
                        <Input
                          value={item.text}
                          onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                          placeholder={t("gtmItemPlaceholder")}
                          disabled={readonly}
                          className={`flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}
                        />
                        {!readonly && (
                          <Button variant="ghost" size="icon" onClick={() => removeChecklistItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                  {data.checklist.length > 0 && (
                    <div className="pt-2 text-xs text-muted-foreground">
                      {data.checklist.filter((i) => i.done).length}/{data.checklist.length} {t("gtmCompleted")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader><CardTitle>{t("gtmNotes")}</CardTitle></CardHeader>
                <CardContent>
                  <Textarea
                    value={data.notes}
                    onChange={(e) => update({ ...data, notes: e.target.value })}
                    placeholder={t("gtmNotesPlaceholder")}
                    disabled={readonly}
                    rows={5}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Pilot Customer Approach */}
            <PilotCustomerGtmSection
              agreements={data.pilotAgreements || []}
              notes={data.pilotNotes || ""}
              onUpdate={(agreements, notes) => update({ ...data, pilotAgreements: agreements, pilotNotes: notes })}
              readonly={readonly}
            />

            {/* Lead Generation */}
            <LeadGenerationSection
              data={data.leadGeneration || defaultLeadGen}
              onUpdate={(lg) => update({ ...data, leadGeneration: lg })}
              readonly={readonly}
            />
          </div>
        </EditableSection>
      </TabsContent>

      {/* Business Case Tab */}
      <TabsContent value="business-case">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Business Case</h2>
          </div>
          <BusinessCaseSection
            businessCase={businessCase}
            onSave={(bc) => onSaveBusinessCase?.(bc)}
            readonly={propReadonly}
          />
        </div>
      </TabsContent>

      {/* Pricing Tab */}
      <TabsContent value="pricing">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{bp("Pricing & Commercial Viability", "Pricing & Kommerzielle Tragfähigkeit")}</h2>
          </div>
          <CommercialViabilityTab
            scoring={scoring}
            onUpdate={handleUpdateScoring}
            readonly={propReadonly}
          />
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
