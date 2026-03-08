import { useI18n } from "@/lib/i18n";
import { StrategicAnalyses, CustomerSegmentEntry, CustomerInterviewEntry, InternalInterviewEntry, BusinessModelCanvas, LeanCanvas } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2 } from "lucide-react";

interface EmbeddedModelProps {
  strategicAnalyses: StrategicAnalyses;
  onSave: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
}

// ── Customer Segmentation ──
export function EmbeddedCustomerSegmentation({ strategicAnalyses, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const seg = strategicAnalyses.customerSegmentation || { entries: [], description: "", rationale: "" };
  const updateSeg = (updated: typeof seg) => onSave({ ...strategicAnalyses, customerSegmentation: updated });
  const addEntry = () => updateSeg({ ...seg, entries: [...seg.entries, { id: crypto.randomUUID(), name: "", size: "", needs: "", willingnessToPay: "", priority: "medium" }] });
  const removeEntry = (id: string) => updateSeg({ ...seg, entries: seg.entries.filter(e => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<CustomerSegmentEntry>) => updateSeg({ ...seg, entries: seg.entries.map(e => e.id === id ? { ...e, ...patch } : e) });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>👥 {bp("Customer Segmentation", "Kundensegmentierung")}</CardTitle>
            {!readonly && <Button variant="outline" size="sm" onClick={addEntry}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add", "Hinzufügen")}</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {seg.entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{bp("No segments defined.", "Keine Segmente definiert.")}</p>}
          {seg.entries.map(entry => (
            <div key={entry.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={entry.name} onChange={e => updateEntry(entry.id, { name: e.target.value })} placeholder={bp("Segment name", "Segmentname")} disabled={readonly} className="flex-1 font-medium" />
                <Select value={entry.priority} onValueChange={v => updateEntry(entry.id, { priority: v as any })} disabled={readonly}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
                {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">{bp("Size", "Größe")}</Label><Input value={entry.size} onChange={e => updateEntry(entry.id, { size: e.target.value })} disabled={readonly} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Needs", "Bedürfnisse")}</Label><Textarea value={entry.needs} onChange={e => updateEntry(entry.id, { needs: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Willingness to Pay", "Zahlungsbereitschaft")}</Label><Textarea value={entry.willingnessToPay} onChange={e => updateEntry(entry.id, { willingnessToPay: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
              </div>
            </div>
          ))}
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={seg.description} onChange={e => updateSeg({ ...seg, description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Customer Interviews ──
export function EmbeddedCustomerInterviews({ strategicAnalyses, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const ci = strategicAnalyses.customerInterviewing || { entries: [], description: "", rationale: "" };
  const updateCi = (updated: typeof ci) => onSave({ ...strategicAnalyses, customerInterviewing: updated });
  const addEntry = () => updateCi({ ...ci, entries: [...ci.entries, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), customerName: "", role: "", keyInsights: "", painPoints: "", quotes: "" }] });
  const removeEntry = (id: string) => updateCi({ ...ci, entries: ci.entries.filter(e => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<CustomerInterviewEntry>) => updateCi({ ...ci, entries: ci.entries.map(e => e.id === id ? { ...e, ...patch } : e) });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🎤 {bp("Customer Interviews", "Kundeninterviews")} ({ci.entries.length})</CardTitle>
            {!readonly && <Button variant="outline" size="sm" onClick={addEntry}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add", "Hinzufügen")}</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ci.entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{bp("No interviews recorded.", "Keine Interviews erfasst.")}</p>}
          {ci.entries.map(entry => (
            <div key={entry.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input type="date" value={entry.date} onChange={e => updateEntry(entry.id, { date: e.target.value })} disabled={readonly} className="w-36" />
                <Input value={entry.customerName} onChange={e => updateEntry(entry.id, { customerName: e.target.value })} placeholder={bp("Customer", "Kunde")} disabled={readonly} className="flex-1" />
                <Input value={entry.role} onChange={e => updateEntry(entry.id, { role: e.target.value })} placeholder={bp("Role", "Rolle")} disabled={readonly} className="w-40" />
                {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">{bp("Key Insights", "Zentrale Insights")}</Label><Textarea value={entry.keyInsights} onChange={e => updateEntry(entry.id, { keyInsights: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Pain Points", "Pain Points")}</Label><Textarea value={entry.painPoints} onChange={e => updateEntry(entry.id, { painPoints: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Quotes", "Zitate")}</Label><Textarea value={entry.quotes} onChange={e => updateEntry(entry.id, { quotes: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
              </div>
            </div>
          ))}
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={ci.description} onChange={e => updateCi({ ...ci, description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Internal Affiliate Interviews ──
function InternalInterviewsForm({ title, icon, dataKey, strategicAnalyses, onSave, readonly: propReadonly }: EmbeddedModelProps & { title: string; icon: string; dataKey: "internalAffiliateInterviews" | "internalBUInterviews" }) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const data = strategicAnalyses[dataKey] || { entries: [], description: "", rationale: "" };
  const updateData = (updated: typeof data) => onSave({ ...strategicAnalyses, [dataKey]: updated });
  const addEntry = () => updateData({ ...data, entries: [...data.entries, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), intervieweeName: "", role: "", department: "", keyInsights: "", recommendations: "", quotes: "" }] });
  const removeEntry = (id: string) => updateData({ ...data, entries: data.entries.filter(e => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<InternalInterviewEntry>) => updateData({ ...data, entries: data.entries.map(e => e.id === id ? { ...e, ...patch } : e) });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{icon} {title} ({data.entries.length})</CardTitle>
            {!readonly && <Button variant="outline" size="sm" onClick={addEntry}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add", "Hinzufügen")}</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{bp("No interviews recorded.", "Keine Interviews erfasst.")}</p>}
          {data.entries.map(entry => (
            <div key={entry.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Input type="date" value={entry.date} onChange={e => updateEntry(entry.id, { date: e.target.value })} disabled={readonly} className="w-36" />
                <Input value={entry.intervieweeName} onChange={e => updateEntry(entry.id, { intervieweeName: e.target.value })} placeholder={bp("Name", "Name")} disabled={readonly} className="flex-1 min-w-[120px]" />
                <Input value={entry.role} onChange={e => updateEntry(entry.id, { role: e.target.value })} placeholder={bp("Role", "Rolle")} disabled={readonly} className="w-36" />
                <Input value={entry.department} onChange={e => updateEntry(entry.id, { department: e.target.value })} placeholder={bp("Department / Affiliate", "Abteilung / Affiliate")} disabled={readonly} className="w-44" />
                {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">{bp("Key Insights", "Zentrale Insights")}</Label><Textarea value={entry.keyInsights} onChange={e => updateEntry(entry.id, { keyInsights: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Recommendations", "Empfehlungen")}</Label><Textarea value={entry.recommendations} onChange={e => updateEntry(entry.id, { recommendations: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
                <div><Label className="text-xs">{bp("Quotes", "Zitate")}</Label><Textarea value={entry.quotes} onChange={e => updateEntry(entry.id, { quotes: e.target.value })} disabled={readonly} rows={2} className="mt-1" /></div>
              </div>
            </div>
          ))}
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={data.description} onChange={e => updateData({ ...data, description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

export function EmbeddedInternalAffiliateInterviews(props: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  return <InternalInterviewsForm {...props} title={bp("Internal Affiliate Interviews", "Interne Affiliate-Interviews")} icon="🏢" dataKey="internalAffiliateInterviews" />;
}

export function EmbeddedInternalBUInterviews(props: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  return <InternalInterviewsForm {...props} title={bp("Internal BU Interviews", "Interne BU-Interviews")} icon="🏗️" dataKey="internalBUInterviews" />;
}

// ── Business Model Canvas ──
export function EmbeddedBMC({ strategicAnalyses, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const bm: BusinessModelCanvas = strategicAnalyses.businessModelling || { valueProposition: "", customerSegments: "", channels: "", customerRelationships: "", revenueStreams: "", keyResources: "", keyActivities: "", keyPartners: "", costStructure: "", description: "", rationale: "" };
  const updateBm = (patch: Partial<BusinessModelCanvas>) => onSave({ ...strategicAnalyses, businessModelling: { ...bm, ...patch } });

  const items: { key: keyof BusinessModelCanvas; label: string; color: string }[] = [
    { key: "valueProposition", label: bp("Value Proposition", "Wertversprechen"), color: "bg-primary/10 border-primary/30" },
    { key: "customerSegments", label: bp("Customer Segments", "Kundensegmente"), color: "bg-blue-500/10 border-blue-500/30" },
    { key: "channels", label: bp("Channels", "Kanäle"), color: "bg-green-500/10 border-green-500/30" },
    { key: "customerRelationships", label: bp("Relationships", "Beziehungen"), color: "bg-yellow-500/10 border-yellow-500/30" },
    { key: "revenueStreams", label: bp("Revenue Streams", "Einnahmen"), color: "bg-emerald-500/10 border-emerald-500/30" },
    { key: "keyResources", label: bp("Key Resources", "Schlüsselressourcen"), color: "bg-violet-500/10 border-violet-500/30" },
    { key: "keyActivities", label: bp("Key Activities", "Schlüsselaktivitäten"), color: "bg-orange-500/10 border-orange-500/30" },
    { key: "keyPartners", label: bp("Key Partners", "Schlüsselpartner"), color: "bg-pink-500/10 border-pink-500/30" },
    { key: "costStructure", label: bp("Cost Structure", "Kostenstruktur"), color: "bg-red-500/10 border-red-500/30" },
  ];

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>📐 Business Model Canvas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(({ key, label, color }) => (
              <div key={key} className={`rounded-lg border p-3 ${color}`}>
                <Label className="text-sm font-semibold">{label}</Label>
                <Textarea className="mt-2 bg-background" value={bm[key]} onChange={e => updateBm({ [key]: e.target.value })} disabled={readonly} rows={3} />
              </div>
            ))}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={bm.description} onChange={e => updateBm({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Lean Canvas ──
export function EmbeddedLeanCanvas({ strategicAnalyses, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const lc: LeanCanvas = strategicAnalyses.leanCanvas || { problem: "", solution: "", uniqueValueProposition: "", unfairAdvantage: "", customerSegments: "", keyMetrics: "", channels: "", costStructure: "", revenueStreams: "", description: "", rationale: "" };
  const updateLc = (patch: Partial<LeanCanvas>) => onSave({ ...strategicAnalyses, leanCanvas: { ...lc, ...patch } });

  const items: { key: keyof LeanCanvas; label: string; color: string }[] = [
    { key: "problem", label: bp("Problem", "Problem"), color: "bg-red-500/10 border-red-500/30" },
    { key: "solution", label: bp("Solution", "Lösung"), color: "bg-green-500/10 border-green-500/30" },
    { key: "uniqueValueProposition", label: "UVP", color: "bg-primary/10 border-primary/30" },
    { key: "unfairAdvantage", label: bp("Unfair Advantage", "Unfairer Vorteil"), color: "bg-violet-500/10 border-violet-500/30" },
    { key: "customerSegments", label: bp("Customers", "Kunden"), color: "bg-blue-500/10 border-blue-500/30" },
    { key: "keyMetrics", label: bp("Key Metrics", "Schlüsselmetriken"), color: "bg-yellow-500/10 border-yellow-500/30" },
    { key: "channels", label: bp("Channels", "Kanäle"), color: "bg-orange-500/10 border-orange-500/30" },
    { key: "costStructure", label: bp("Costs", "Kosten"), color: "bg-pink-500/10 border-pink-500/30" },
    { key: "revenueStreams", label: bp("Revenue", "Einnahmen"), color: "bg-emerald-500/10 border-emerald-500/30" },
  ];

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>📝 Lean Canvas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(({ key, label, color }) => (
              <div key={key} className={`rounded-lg border p-3 ${color}`}>
                <Label className="text-sm font-semibold">{label}</Label>
                <Textarea className="mt-2 bg-background" value={lc[key]} onChange={e => updateLc({ [key]: e.target.value })} disabled={readonly} rows={3} />
              </div>
            ))}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={lc.description} onChange={e => updateLc({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}
