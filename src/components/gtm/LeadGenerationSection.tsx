import { useI18n } from "@/lib/i18n";
import { LeadGenerationData, LeadGenChannel, LeadGenActivity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Target, Zap } from "lucide-react";

interface Props {
  data: LeadGenerationData;
  onUpdate: (data: LeadGenerationData) => void;
  readonly?: boolean;
}

export function LeadGenerationSection({ data, onUpdate, readonly }: Props) {
  const { t } = useI18n();

  const addChannel = () => {
    onUpdate({ ...data, channels: [...data.channels, { id: crypto.randomUUID(), channel: "", strategy: "", targetLeads: 0, actualLeads: 0, conversionRate: 0 }] });
  };
  const updateChannel = (id: string, updates: Partial<LeadGenChannel>) => {
    onUpdate({ ...data, channels: data.channels.map((c) => (c.id === id ? { ...c, ...updates } : c)) });
  };
  const removeChannel = (id: string) => {
    onUpdate({ ...data, channels: data.channels.filter((c) => c.id !== id) });
  };

  const addActivity = () => {
    onUpdate({ ...data, activities: [...data.activities, { id: crypto.randomUUID(), activity: "", status: "planned", date: "", notes: "" }] });
  };
  const updateActivity = (id: string, updates: Partial<LeadGenActivity>) => {
    onUpdate({ ...data, activities: data.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)) });
  };
  const removeActivity = (id: string) => {
    onUpdate({ ...data, activities: data.activities.filter((a) => a.id !== id) });
  };

  const totalTarget = data.channels.reduce((s, c) => s + c.targetLeads, 0);
  const totalActual = data.channels.reduce((s, c) => s + c.actualLeads, 0);

  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t("gtmLeadChannels" as any)}
            </CardTitle>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addChannel} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> {t("gtmLeadAddChannel" as any)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.channels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("gtmLeadNoChannels" as any)}</p>
          ) : (
            <>
              {data.channels.map((ch) => (
                <div key={ch.id} className="rounded-lg border border-border p-4 space-y-3 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                      <div>
                        <Label className="text-xs">{t("gtmLeadChannel" as any)}</Label>
                        <Input value={ch.channel} onChange={(e) => updateChannel(ch.id, { channel: e.target.value })} placeholder="e.g. LinkedIn, Events" disabled={readonly} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("gtmLeadTarget" as any)}</Label>
                        <Input type="number" value={ch.targetLeads} onChange={(e) => updateChannel(ch.id, { targetLeads: Number(e.target.value) })} disabled={readonly} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("gtmLeadActual" as any)}</Label>
                        <Input type="number" value={ch.actualLeads} onChange={(e) => updateChannel(ch.id, { actualLeads: Number(e.target.value) })} disabled={readonly} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("gtmLeadConversion" as any)} (%)</Label>
                        <Input type="number" value={ch.conversionRate} onChange={(e) => updateChannel(ch.id, { conversionRate: Number(e.target.value) })} disabled={readonly} />
                      </div>
                    </div>
                    {!readonly && (
                      <Button variant="ghost" size="icon" onClick={() => removeChannel(ch.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0 mt-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">{t("gtmLeadStrategy" as any)}</Label>
                    <Textarea value={ch.strategy} onChange={(e) => updateChannel(ch.id, { strategy: e.target.value })} disabled={readonly} rows={2} />
                  </div>
                </div>
              ))}
              <div className="flex gap-6 rounded-lg bg-muted p-3 text-sm">
                <span className="font-medium">{t("gtmLeadTotalTarget" as any)}: {totalTarget}</span>
                <span className="font-medium">{t("gtmLeadTotalActual" as any)}: {totalActual}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t("gtmLeadActivities" as any)}
            </CardTitle>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addActivity} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> {t("gtmLeadAddActivity" as any)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("gtmLeadNoActivities" as any)}</p>
          ) : (
            data.activities.map((act) => (
              <div key={act.id} className="flex items-center gap-3 group">
                <Input value={act.activity} onChange={(e) => updateActivity(act.id, { activity: e.target.value })} placeholder={t("gtmLeadActivityName" as any)} disabled={readonly} className="flex-1" />
                <Input type="date" value={act.date} onChange={(e) => updateActivity(act.id, { date: e.target.value })} disabled={readonly} className="w-40" />
                <Select value={act.status} onValueChange={(v) => updateActivity(act.id, { status: v as any })} disabled={readonly}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {!readonly && (
                  <Button variant="ghost" size="icon" onClick={() => removeActivity(act.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pipeline Notes */}
      <Card>
        <CardHeader><CardTitle>{t("gtmLeadPipelineNotes" as any)}</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.pipelineNotes} onChange={(e) => onUpdate({ ...data, pipelineNotes: e.target.value })} disabled={readonly} rows={4} placeholder={t("gtmLeadPipelineNotesPlaceholder" as any)} />
        </CardContent>
      </Card>
    </div>
  );
}
