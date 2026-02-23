import { useI18n } from "@/lib/i18n";
import { PilotAgreement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  agreements: PilotAgreement[];
  notes: string;
  onUpdate: (agreements: PilotAgreement[], notes: string) => void;
  readonly?: boolean;
}

const statusColors: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  active: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function PilotCustomerGtmSection({ agreements, notes, onUpdate, readonly }: Props) {
  const { t } = useI18n();

  const add = () => {
    onUpdate([...agreements, {
      id: crypto.randomUUID(), customerName: "", scope: "", timeline: "",
      status: "planned", successCriteria: "", results: "",
    }], notes);
  };

  const update = (id: string, updates: Partial<PilotAgreement>) => {
    onUpdate(agreements.map((a) => (a.id === id ? { ...a, ...updates } : a)), notes);
  };

  const remove = (id: string) => {
    onUpdate(agreements.filter((a) => a.id !== id), notes);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            {t("gtmPilotTitle" as any)}
          </CardTitle>
          {!readonly && (
            <Button variant="outline" size="sm" onClick={add} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> {t("gtmPilotAdd" as any)}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {agreements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("gtmPilotEmpty" as any)}</p>
        ) : (
          agreements.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4 space-y-3 group">
              <div className="flex items-start justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div>
                    <Label className="text-xs">{t("gtmPilotCustomerName" as any)}</Label>
                    <Input value={a.customerName} onChange={(e) => update(a.id, { customerName: e.target.value })} disabled={readonly} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("gtmPilotTimeline" as any)}</Label>
                    <Input value={a.timeline} onChange={(e) => update(a.id, { timeline: e.target.value })} placeholder="Q2 2026 – Q3 2026" disabled={readonly} />
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={a.status} onValueChange={(v) => update(a.id, { status: v as any })} disabled={readonly}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">{t("gtmPilotPlanned" as any)}</SelectItem>
                        <SelectItem value="active">{t("gtmPilotActive" as any)}</SelectItem>
                        <SelectItem value="completed">{t("gtmPilotCompleted" as any)}</SelectItem>
                        <SelectItem value="cancelled">{t("gtmPilotCancelled" as any)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!readonly && (
                  <Button variant="ghost" size="icon" onClick={() => remove(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0 mt-4">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <Label className="text-xs">{t("gtmPilotScope" as any)}</Label>
                <Textarea value={a.scope} onChange={(e) => update(a.id, { scope: e.target.value })} disabled={readonly} rows={2} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{t("gtmPilotCriteria" as any)}</Label>
                  <Textarea value={a.successCriteria} onChange={(e) => update(a.id, { successCriteria: e.target.value })} disabled={readonly} rows={2} />
                </div>
                <div>
                  <Label className="text-xs">{t("gtmPilotResults" as any)}</Label>
                  <Textarea value={a.results} onChange={(e) => update(a.id, { results: e.target.value })} disabled={readonly} rows={2} />
                </div>
              </div>
            </div>
          ))
        )}
        <div>
          <Label className="text-xs font-semibold">{t("gtmPilotNotes" as any)}</Label>
          <Textarea value={notes} onChange={(e) => onUpdate(agreements, e.target.value)} disabled={readonly} rows={3} placeholder={t("gtmPilotNotesPlaceholder" as any)} />
        </div>
      </CardContent>
    </Card>
  );
}
