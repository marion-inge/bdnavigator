import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GoToMarketPlan, ChecklistItem, createDefaultGoToMarketPlan, LeadGenerationData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Rocket } from "lucide-react";

import { PilotCustomerGtmSection } from "./gtm/PilotCustomerGtmSection";
import { LeadGenerationSection } from "./gtm/LeadGenerationSection";

interface Props {
  goToMarketPlan?: GoToMarketPlan;
  onSave: (plan: GoToMarketPlan) => void;
  readonly?: boolean;
}

const defaultLeadGen: LeadGenerationData = { channels: [], activities: [], pipelineNotes: "" };

export function GoToMarketSection({ goToMarketPlan, onSave, readonly }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<GoToMarketPlan>(goToMarketPlan || createDefaultGoToMarketPlan());

  const update = (updated: GoToMarketPlan) => {
    setData(updated);
    onSave(updated);
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

  return (
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
  );
}
