import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { SalesChannelEntry, SalesChannelAnalysis, SamOverviewData, createDefaultSamOverview } from "@/lib/businessPlanTypes";
import { DetailedScoring } from "@/lib/types";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

export function SalesChannelAnalysisTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const samOverview: SamOverviewData = (scoring as any).samOverview || createDefaultSamOverview();
  const [localChannels, setLocalChannels] = useState<SalesChannelAnalysis>(
    samOverview.salesChannelAnalysis || { entries: [], channelStrategy: "", channelMix: "" }
  );
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  const addChannel = () => { setLocalChannels(prev => ({ ...prev, entries: [...prev.entries, { id: crypto.randomUUID(), channelName: "", channelType: "direct", reach: "", costLevel: "medium", targetSegments: "", rating: 3, notes: "" }] })); markDirty(); };
  const removeChannel = (id: string) => { setLocalChannels(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) })); markDirty(); };
  const updateChannel = (id: string, patch: Partial<SalesChannelEntry>) => { setLocalChannels(prev => ({ ...prev, entries: prev.entries.map(e => e.id === id ? { ...e, ...patch } : e) })); markDirty(); };
  const updateChannelMeta = (patch: Partial<SalesChannelAnalysis>) => { setLocalChannels(prev => ({ ...prev, ...patch })); markDirty(); };

  const handleSave = () => {
    const updated: any = {
      ...scoring,
      samOverview: { ...samOverview, salesChannelAnalysis: localChannels },
    };
    onUpdate(updated);
    setDirty(false);
  };

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{bp("Sales Channel Analysis", "Vertriebskanal-Analyse")}</h2>
            <p className="text-sm text-muted-foreground">{bp("Analyze and evaluate distribution channels for the SAM", "Vertriebskanäle für den SAM analysieren und bewerten")}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {bp("Channels", "Kanäle")}</CardTitle>
              {!readonly && <Button size="sm" variant="outline" onClick={addChannel}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Channel", "Kanal hinzufügen")}</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {localChannels.entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{bp("No sales channels defined. Add channels to analyze your distribution strategy.", "Keine Vertriebskanäle definiert. Fügen Sie Kanäle hinzu, um Ihre Vertriebsstrategie zu analysieren.")}</p>
            ) : (
              <div className="space-y-3">
                {localChannels.entries.map(entry => (
                  <div key={entry.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input value={entry.channelName} onChange={e => updateChannel(entry.id, { channelName: e.target.value })} placeholder={bp("Channel name", "Kanalname")} disabled={readonly} className="flex-1 min-w-[140px] font-medium" />
                      <Select value={entry.channelType} onValueChange={v => updateChannel(entry.id, { channelType: v as SalesChannelEntry["channelType"] })} disabled={readonly}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">{bp("Direct", "Direkt")}</SelectItem>
                          <SelectItem value="indirect">{bp("Indirect", "Indirekt")}</SelectItem>
                          <SelectItem value="digital">{bp("Digital", "Digital")}</SelectItem>
                          <SelectItem value="partner">{bp("Partner", "Partner")}</SelectItem>
                          <SelectItem value="other">{bp("Other", "Sonstige")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={entry.costLevel} onValueChange={v => updateChannel(entry.id, { costLevel: v as SalesChannelEntry["costLevel"] })} disabled={readonly}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 {bp("Low Cost", "Niedrig")}</SelectItem>
                          <SelectItem value="medium">🟡 {bp("Medium", "Mittel")}</SelectItem>
                          <SelectItem value="high">🔴 {bp("High Cost", "Hoch")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 w-24">
                        <Label className="text-xs whitespace-nowrap">{bp("Rating", "Bewertung")}:</Label>
                        <Input type="number" min={1} max={5} value={entry.rating} onChange={e => updateChannel(entry.id, { rating: Number(e.target.value) })} disabled={readonly} className="w-14" />
                      </div>
                      {!readonly && <Button variant="ghost" size="icon" onClick={() => removeChannel(entry.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">{bp("Reach / Coverage", "Reichweite / Abdeckung")}</Label><Textarea value={entry.reach} onChange={e => updateChannel(entry.id, { reach: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                      <div><Label className="text-xs">{bp("Target Segments", "Zielsegmente")}</Label><Textarea value={entry.targetSegments} onChange={e => updateChannel(entry.id, { targetSegments: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                      <div><Label className="text-xs">{bp("Notes", "Anmerkungen")}</Label><Textarea value={entry.notes} onChange={e => updateChannel(entry.id, { notes: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{bp("Channel Strategy", "Kanalstrategie")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>{bp("Overarching Strategy", "Übergeordnete Strategie")}</Label>
              <Textarea value={localChannels.channelStrategy} onChange={e => updateChannelMeta({ channelStrategy: e.target.value })} placeholder={bp("What is the overarching sales channel strategy? Which channels are prioritized and why?", "Was ist die übergeordnete Vertriebskanalstrategie? Welche Kanäle werden priorisiert und warum?")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Channel Mix & Synergies", "Kanalmix & Synergien")}</Label>
              <Textarea value={localChannels.channelMix} onChange={e => updateChannelMeta({ channelMix: e.target.value })} placeholder={bp("How do the channels complement each other? What synergies exist?", "Wie ergänzen sich die Kanäle? Welche Synergien bestehen?")} disabled={readonly} rows={2} />
            </div>
          </CardContent>
        </Card>
      </div>
    </EditableSection>
  );
}
