import { useI18n } from "@/lib/i18n";
import { SomModels, ValuePropositionCanvas, CustomerBenefitAnalysis, ThreeCircleModel, PositioningStatement, PositioningLandscapeData, PositioningLandscapeEntry } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from "recharts";

interface EmbeddedModelProps {
  data: SomModels;
  onSave: (data: SomModels) => void;
  readonly?: boolean;
}

// ── Value Proposition Canvas ──
export function EmbeddedVPC({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const vpc: ValuePropositionCanvas = data.valuePropositionCanvas || { customerJobs: "", customerPains: "", customerGains: "", productsServices: "", painRelievers: "", gainCreators: "", description: "", rationale: "" };
  const updateVpc = (patch: Partial<ValuePropositionCanvas>) => onSave({ ...data, valuePropositionCanvas: { ...vpc, ...patch } });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>💎 Value Proposition Canvas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">👤 {bp("Customer Profile", "Kundenprofil")}</h4>
              {([
                { key: "customerJobs" as const, label: bp("Customer Jobs", "Kundenaufgaben"), color: "bg-blue-500/10 border-blue-500/30" },
                { key: "customerPains" as const, label: bp("Pains", "Pains"), color: "bg-red-500/10 border-red-500/30" },
                { key: "customerGains" as const, label: bp("Gains", "Gains"), color: "bg-green-500/10 border-green-500/30" },
              ]).map(({ key, label, color }) => (
                <div key={key} className={`rounded-lg border p-3 ${color}`}>
                  <Label className="text-sm font-semibold">{label}</Label>
                  <Textarea className="mt-2 bg-background" value={vpc[key]} onChange={e => updateVpc({ [key]: e.target.value })} disabled={readonly} rows={3} />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">📦 {bp("Value Map", "Value Map")}</h4>
              {([
                { key: "productsServices" as const, label: bp("Products & Services", "Produkte & Services"), color: "bg-violet-500/10 border-violet-500/30" },
                { key: "painRelievers" as const, label: bp("Pain Relievers", "Pain Relievers"), color: "bg-orange-500/10 border-orange-500/30" },
                { key: "gainCreators" as const, label: bp("Gain Creators", "Gain Creators"), color: "bg-emerald-500/10 border-emerald-500/30" },
              ]).map(({ key, label, color }) => (
                <div key={key} className={`rounded-lg border p-3 ${color}`}>
                  <Label className="text-sm font-semibold">{label}</Label>
                  <Textarea className="mt-2 bg-background" value={vpc[key]} onChange={e => updateVpc({ [key]: e.target.value })} disabled={readonly} rows={3} />
                </div>
              ))}
            </div>
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={vpc.description} onChange={e => updateVpc({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Customer Benefit Analysis ──
export function EmbeddedCBA({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const cba: CustomerBenefitAnalysis = data.customerBenefitAnalysis || { functionalBenefits: "", emotionalBenefits: "", socialBenefits: "", selfExpressiveBenefits: "", description: "", rationale: "" };
  const updateCba = (patch: Partial<CustomerBenefitAnalysis>) => onSave({ ...data, customerBenefitAnalysis: { ...cba, ...patch } });

  const items = [
    { key: "functionalBenefits" as const, label: bp("Functional Benefits", "Funktionaler Nutzen"), color: "bg-blue-500/10 border-blue-500/30", icon: "⚙️" },
    { key: "emotionalBenefits" as const, label: bp("Emotional Benefits", "Emotionaler Nutzen"), color: "bg-pink-500/10 border-pink-500/30", icon: "❤️" },
    { key: "socialBenefits" as const, label: bp("Social Benefits", "Sozialer Nutzen"), color: "bg-yellow-500/10 border-yellow-500/30", icon: "👥" },
    { key: "selfExpressiveBenefits" as const, label: bp("Self-Expressive Benefits", "Selbstdarstellender Nutzen"), color: "bg-violet-500/10 border-violet-500/30", icon: "✨" },
  ];

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>🎯 {bp("Customer Benefit Analysis", "Kundennutzenanalyse")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(({ key, label, color, icon }) => (
              <div key={key} className={`rounded-lg border p-3 ${color}`}>
                <Label className="text-sm font-semibold">{icon} {label}</Label>
                <Textarea className="mt-2 bg-background" value={cba[key]} onChange={e => updateCba({ [key]: e.target.value })} disabled={readonly} rows={3} />
              </div>
            ))}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={cba.description} onChange={e => updateCba({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Three Circle Model ──
export function EmbeddedThreeCircles({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const tcm: ThreeCircleModel = data.threeCircleModel || { ourValue: "", competitorValue: "", customerNeeds: "", ourUnique: "", theirUnique: "", commonValue: "", unmetNeeds: "", description: "", rationale: "" };
  const updateTcm = (patch: Partial<ThreeCircleModel>) => onSave({ ...data, threeCircleModel: { ...tcm, ...patch } });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>⭕ {bp("Three Circle Model", "Drei-Kreise-Modell")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 bg-blue-500/10 border-blue-500/30"><Label className="text-sm font-semibold">🔵 {bp("Our Value", "Unser Wert")}</Label><Textarea className="mt-2 bg-background" value={tcm.ourValue} onChange={e => updateTcm({ ourValue: e.target.value })} disabled={readonly} rows={3} /></div>
            <div className="rounded-lg border p-3 bg-red-500/10 border-red-500/30"><Label className="text-sm font-semibold">🔴 {bp("Competitor Value", "Wettbewerberwert")}</Label><Textarea className="mt-2 bg-background" value={tcm.competitorValue} onChange={e => updateTcm({ competitorValue: e.target.value })} disabled={readonly} rows={3} /></div>
            <div className="rounded-lg border p-3 bg-green-500/10 border-green-500/30"><Label className="text-sm font-semibold">🟢 {bp("Customer Needs", "Kundenbedürfnisse")}</Label><Textarea className="mt-2 bg-background" value={tcm.customerNeeds} onChange={e => updateTcm({ customerNeeds: e.target.value })} disabled={readonly} rows={3} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 bg-primary/10 border-primary/30"><Label className="text-sm font-semibold">🎯 {bp("Our Unique", "Unser Alleinstellung")}</Label><Textarea className="mt-2 bg-background" value={tcm.ourUnique} onChange={e => updateTcm({ ourUnique: e.target.value })} disabled={readonly} rows={2} /></div>
            <div className="rounded-lg border p-3 bg-orange-500/10 border-orange-500/30"><Label className="text-sm font-semibold">⚠️ {bp("Their Unique", "Deren Alleinstellung")}</Label><Textarea className="mt-2 bg-background" value={tcm.theirUnique} onChange={e => updateTcm({ theirUnique: e.target.value })} disabled={readonly} rows={2} /></div>
            <div className="rounded-lg border p-3 bg-yellow-500/10 border-yellow-500/30"><Label className="text-sm font-semibold">🤝 {bp("Common Value", "Gemeinsamer Wert")}</Label><Textarea className="mt-2 bg-background" value={tcm.commonValue} onChange={e => updateTcm({ commonValue: e.target.value })} disabled={readonly} rows={2} /></div>
            <div className="rounded-lg border p-3 bg-violet-500/10 border-violet-500/30"><Label className="text-sm font-semibold">💡 {bp("Unmet Needs", "Unerfüllte Bedürfnisse")}</Label><Textarea className="mt-2 bg-background" value={tcm.unmetNeeds} onChange={e => updateTcm({ unmetNeeds: e.target.value })} disabled={readonly} rows={2} /></div>
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={tcm.description} onChange={e => updateTcm({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Positioning Statement ──
export function EmbeddedPositioning({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const pos: PositioningStatement = data.positioningStatement || { targetAudience: "", category: "", keyBenefit: "", reasonToBelieve: "", competitiveAlternative: "", differentiator: "", statement: "", description: "", rationale: "" };
  const updatePos = (patch: Partial<PositioningStatement>) => onSave({ ...data, positioningStatement: { ...pos, ...patch } });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>📍 {bp("Positioning Statement", "Positionierungsaussage")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><Label>{bp("Target Audience", "Zielgruppe")}</Label><Textarea value={pos.targetAudience} onChange={e => updatePos({ targetAudience: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Category", "Kategorie")}</Label><Textarea value={pos.category} onChange={e => updatePos({ category: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Key Benefit", "Hauptnutzen")}</Label><Textarea value={pos.keyBenefit} onChange={e => updatePos({ keyBenefit: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Reason to Believe", "Grund zur Glaubwürdigkeit")}</Label><Textarea value={pos.reasonToBelieve} onChange={e => updatePos({ reasonToBelieve: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Competitive Alternative", "Wettbewerbs-Alternative")}</Label><Textarea value={pos.competitiveAlternative} onChange={e => updatePos({ competitiveAlternative: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Differentiator", "Differenzierung")}</Label><Textarea value={pos.differentiator} onChange={e => updatePos({ differentiator: e.target.value })} disabled={readonly} rows={2} /></div>
          </div>
          <div><Label className="font-semibold">{bp("Positioning Statement", "Positionierungsaussage")}</Label><Textarea value={pos.statement} onChange={e => updatePos({ statement: e.target.value })} disabled={readonly} rows={3} /></div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={pos.description} onChange={e => updatePos({ description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Positioning Landscape ──
export function EmbeddedPositioningLandscape({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const pl: PositioningLandscapeData = data.positioningLandscape || { xAxisLabel: "", yAxisLabel: "", entries: [], description: "", rationale: "" };
  const updatePl = (updated: PositioningLandscapeData) => onSave({ ...data, positioningLandscape: updated });
  const addEntry = () => updatePl({ ...pl, entries: [...pl.entries, { id: crypto.randomUUID(), name: "", isOurs: false, xValue: 5, yValue: 5 }] });
  const removeEntry = (id: string) => updatePl({ ...pl, entries: pl.entries.filter(e => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<PositioningLandscapeEntry>) => updatePl({ ...pl, entries: pl.entries.map(e => e.id === id ? { ...e, ...patch } : e) });

  const scatterData = pl.entries.map(e => ({ x: e.xValue, y: e.yValue, name: e.name, isOurs: e.isOurs }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle>🗺️ {bp("Positioning Landscape", "Positionierungslandschaft")}</CardTitle>{!readonly && <Button variant="outline" size="sm" onClick={addEntry}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Player", "Akteur hinzufügen")}</Button>}</div></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{bp("X-Axis", "X-Achse")}</Label><Input value={pl.xAxisLabel} onChange={e => updatePl({ ...pl, xAxisLabel: e.target.value })} disabled={readonly} /></div>
            <div><Label>{bp("Y-Axis", "Y-Achse")}</Label><Input value={pl.yAxisLabel} onChange={e => updatePl({ ...pl, yAxisLabel: e.target.value })} disabled={readonly} /></div>
          </div>
          {pl.entries.length > 0 && (
            <div className="w-full h-64 border rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="x" domain={[0, 10]} name={pl.xAxisLabel || "X"} tick={{ fontSize: 10 }} label={{ value: pl.xAxisLabel || "X", position: "bottom", fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" domain={[0, 10]} name={pl.yAxisLabel || "Y"} tick={{ fontSize: 10 }} label={{ value: pl.yAxisLabel || "Y", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <ZAxis range={[100, 100]} />
                  <Tooltip content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0].payload; return <div className="bg-popover text-popover-foreground border rounded-md px-3 py-2 text-sm shadow-md"><strong>{d.name}</strong> ({d.x}, {d.y})</div>; }} />
                  <Scatter data={scatterData}>{scatterData.map((entry, i) => (<Cell key={i} fill={entry.isOurs ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} />))}</Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
          {pl.entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{bp("Add players to create the positioning landscape.", "Fügen Sie Akteure hinzu.")}</p>}
          {pl.entries.map(entry => (
            <div key={entry.id} className={`rounded-lg border p-3 space-y-2 ${entry.isOurs ? "border-primary/50 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center gap-2">
                <Input value={entry.name} onChange={e => updateEntry(entry.id, { name: e.target.value })} placeholder={bp("Name", "Name")} disabled={readonly} className="flex-1" />
                <Button variant={entry.isOurs ? "default" : "outline"} size="sm" onClick={() => updateEntry(entry.id, { isOurs: !entry.isOurs })} disabled={readonly}>Us</Button>
                <div className="flex items-center gap-1"><span className="text-xs">X:</span><Slider min={0} max={10} step={1} value={[entry.xValue]} onValueChange={([v]) => updateEntry(entry.id, { xValue: v })} disabled={readonly} className="w-20" /></div>
                <div className="flex items-center gap-1"><span className="text-xs">Y:</span><Slider min={0} max={10} step={1} value={[entry.yValue]} onValueChange={([v]) => updateEntry(entry.id, { yValue: v })} disabled={readonly} className="w-20" /></div>
                {!readonly && <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
            </div>
          ))}
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={pl.description} onChange={e => updatePl({ ...pl, description: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}
