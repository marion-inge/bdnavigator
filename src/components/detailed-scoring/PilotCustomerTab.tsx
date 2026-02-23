import { useI18n } from "@/lib/i18n";
import { DetailedScoring, PilotCustomerData, PilotCustomerEntry, PilotContactStatus } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const defaultPilotData: PilotCustomerData = {
  score: 3,
  entries: [],
  notes: "",
};

const statusConfig: Record<PilotContactStatus, { label: string; color: string }> = {
  identified: { label: "Identified", color: "bg-muted text-muted-foreground" },
  contacted: { label: "Contacted", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  interested: { label: "Interested", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  loi_confirmed: { label: "LoI / Confirmed", color: "bg-green-500/15 text-green-700 dark:text-green-400" },
};

export function PilotCustomerTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<PilotCustomerData>(scoring.pilotCustomer || defaultPilotData);
  const [dirty, setDirty] = useState(false);

  const save = (updated: PilotCustomerData) => {
    setLocal(updated);
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, pilotCustomer: local });
    setDirty(false);
  };

  const addEntry = () => {
    save({
      ...local,
      entries: [...local.entries, { id: crypto.randomUUID(), name: "", industry: "", contactStatus: "identified", validationResults: "", feedback: "" }],
    });
  };

  const updateEntry = (id: string, updates: Partial<PilotCustomerEntry>) => {
    save({ ...local, entries: local.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)) });
  };

  const removeEntry = (id: string) => {
    save({ ...local, entries: local.entries.filter((e) => e.id !== id) });
  };

  const getScoreColor = (s: number) => {
    if (s >= 4) return "bg-green-500";
    if (s >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 4) return t("scoreHigh");
    if (s >= 3) return t("scoreMedium");
    return t("scoreLow");
  };

  const statusCounts = local.entries.reduce((acc, e) => {
    acc[e.contactStatus] = (acc[e.contactStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("dsPilotCustomer" as any)}</h3>
              <p className="text-sm text-muted-foreground">{t("dsPilotReadiness" as any)}: {getScoreLabel(local.score)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                disabled={readonly}
                onClick={() => save({ ...local, score: val })}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  local.score === val
                    ? "bg-primary text-primary-foreground shadow-md scale-110"
                    : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                } ${readonly ? "cursor-default" : "cursor-pointer"}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      {local.entries.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {(Object.entries(statusConfig) as [PilotContactStatus, typeof statusConfig[PilotContactStatus]][]).map(([status, cfg]) => (
            <div key={status} className={`rounded-lg px-4 py-2 text-sm font-medium ${cfg.color}`}>
              {cfg.label}: {statusCounts[status] || 0}
            </div>
          ))}
        </div>
      )}

      {/* Customer Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-card-foreground">{t("dsPilotTargetCustomers" as any)}</h3>
          </div>
          {!readonly && (
            <Button variant="outline" size="sm" onClick={addEntry} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> {t("dsPilotAddCustomer" as any)}
            </Button>
          )}
        </div>

        {local.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("dsPilotNoCustomers" as any)}</p>
        ) : (
          local.entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-card p-5 space-y-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <Label className="text-xs">{t("dsPilotName" as any)}</Label>
                    <Input
                      value={entry.name}
                      onChange={(e) => updateEntry(entry.id, { name: e.target.value })}
                      placeholder={t("dsPilotNamePlaceholder" as any)}
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("industry")}</Label>
                    <Input
                      value={entry.industry}
                      onChange={(e) => updateEntry(entry.id, { industry: e.target.value })}
                      placeholder={t("dsPilotIndustryPlaceholder" as any)}
                      disabled={readonly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("dsPilotStatus" as any)}</Label>
                    <Select
                      value={entry.contactStatus}
                      onValueChange={(v) => updateEntry(entry.id, { contactStatus: v as PilotContactStatus })}
                      disabled={readonly}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.entries(statusConfig) as [PilotContactStatus, typeof statusConfig[PilotContactStatus]][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!readonly && (
                  <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0 mt-4">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("dsPilotValidation" as any)}</Label>
                  <Textarea
                    value={entry.validationResults}
                    onChange={(e) => updateEntry(entry.id, { validationResults: e.target.value })}
                    placeholder={t("dsPilotValidationPlaceholder" as any)}
                    disabled={readonly}
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t("dsPilotFeedback" as any)}</Label>
                  <Textarea
                    value={entry.feedback}
                    onChange={(e) => updateEntry(entry.id, { feedback: e.target.value })}
                    placeholder={t("dsPilotFeedbackPlaceholder" as any)}
                    disabled={readonly}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Label className="font-semibold">{t("dsPilotNotes" as any)}</Label>
        <Textarea
          value={local.notes}
          onChange={(e) => save({ ...local, notes: e.target.value })}
          placeholder={t("dsPilotNotesPlaceholder" as any)}
          disabled={readonly}
          rows={4}
        />
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
