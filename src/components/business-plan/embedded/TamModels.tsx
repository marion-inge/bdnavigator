import { useI18n } from "@/lib/i18n";
import { MarkWebSearch } from "@/components/MarkWebSearch";
import { StrategicAnalyses, createDefaultStrategicAnalyses, createDefaultValueChain, ValueChainStage, TamModels } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, MapPin } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface OpportunityContext {
  title: string;
  description: string;
  solutionDescription?: string;
  industry: string;
  geography: string;
  technology: string;
}

interface EmbeddedModelProps {
  data: TamModels;
  onSave: (data: TamModels) => void;
  readonly?: boolean;
  opportunity?: OpportunityContext;
}

// ── Market Research ──
export function EmbeddedMarketResearch({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const mr = data.marketResearch || { secondaryResearch: "", primaryResearch: "", keyFigures: "", methodology: "", centralInsights: "", description: "", rationale: "" };
  const update = (patch: Partial<typeof mr>) => onSave({ ...data, marketResearch: { ...mr, ...patch } });

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>🔬 {bp("Market Research", "Marktforschung")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>{bp("Secondary Research", "Sekundärrecherche")}</Label><Textarea value={mr.secondaryResearch} onChange={e => update({ secondaryResearch: e.target.value })} placeholder={bp("Market reports, studies, databases, publications...", "Marktstudien, Datenbanken, Publikationen...")} disabled={readonly} rows={4} /></div>
            <div><Label>{bp("Primary Research", "Primärrecherche")}</Label><Textarea value={mr.primaryResearch} onChange={e => update({ primaryResearch: e.target.value })} placeholder={bp("Surveys, interviews, expert panels, workshops...", "Umfragen, Interviews, Expertenpanels, Workshops...")} disabled={readonly} rows={4} /></div>
          </div>
          <div><Label>{bp("Key Figures & Data Points", "Kernzahlen & Datenpunkte")}</Label><Textarea value={mr.keyFigures} onChange={e => update({ keyFigures: e.target.value })} disabled={readonly} rows={3} /></div>
          <div><Label>{bp("Methodology", "Methodik")}</Label><Textarea value={mr.methodology} onChange={e => update({ methodology: e.target.value })} disabled={readonly} rows={2} /></div>
          <div><Label>{bp("Central Insights", "Zentrale Insights")}</Label><Textarea value={mr.centralInsights} onChange={e => update({ centralInsights: e.target.value })} disabled={readonly} rows={3} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={mr.description} onChange={e => update({ description: e.target.value })} disabled={readonly} rows={2} /></div>
            <div><Label>{bp("Rationale", "Begründung")}</Label><Textarea value={mr.rationale} onChange={e => update({ rationale: e.target.value })} disabled={readonly} rows={2} /></div>
          </div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── PESTEL ──
export function EmbeddedPestel({ data, onSave, readonly: propReadonly, opportunity }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const pestel = data.pestel;
  const update = (patch: Partial<typeof pestel>) => onSave({ ...data, pestel: { ...pestel, ...patch } });

  const factors = [
    { key: "political" as const, label: bp("Political", "Politisch"), icon: "🏛️",
      hint: bp("Consider: What regulations could restrict or enable your market? Trade policies, subsidies, political stability?", "Bedenke: Welche Regulierungen könnten deinen Markt einschränken oder fördern? Handelspolitik, Subventionen, politische Stabilität?") },
    { key: "economic" as const, label: bp("Economic", "Ökonomisch"), icon: "💰",
      hint: bp("Consider: How do interest rates, inflation, or economic cycles affect demand?", "Bedenke: Wie beeinflussen Zinsen, Inflation oder Konjunkturzyklen die Nachfrage?") },
    { key: "social" as const, label: bp("Social", "Sozial"), icon: "👥",
      hint: bp("Consider: Demographic shifts, changing work habits, sustainability awareness?", "Bedenke: Demographischer Wandel, veränderte Arbeitsgewohnheiten, Nachhaltigkeitsbewusstsein?") },
    { key: "technological" as const, label: bp("Technological", "Technologisch"), icon: "⚙️",
      hint: bp("Consider: Which technologies could make your offering obsolete? AI, automation, new standards? What disruptive innovations are emerging?", "Bedenke: Welche Technologien könnten dein Angebot obsolet machen? KI, Automatisierung, neue Standards? Welche disruptiven Innovationen zeichnen sich ab?") },
    { key: "environmental" as const, label: bp("Environmental", "Ökologisch"), icon: "🌍",
      hint: bp("Consider: Sustainability requirements, carbon regulations, circular economy trends?", "Bedenke: Nachhaltigkeitsanforderungen, CO₂-Regulierung, Kreislaufwirtschaft?") },
    { key: "legal" as const, label: bp("Legal", "Rechtlich"), icon: "⚖️",
      hint: bp("Consider: Upcoming laws, compliance requirements (ISO, GDPR), industry-specific norms that could impact your product or market access?", "Bedenke: Kommende Gesetze, Compliance-Anforderungen (ISO, DSGVO), branchenspezifische Normen die dein Produkt oder den Marktzugang beeinflussen?") },
  ];

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>🏛️ PESTEL</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {factors.map(({ key, label, icon, hint }) => (
              <div key={key} className="rounded-lg border border-border p-3 bg-card">
                <Label className="text-sm font-semibold">{icon} {label}</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2 italic">{hint}</p>
                <Textarea value={pestel[key]} onChange={e => update({ [key]: e.target.value })} placeholder={`${label}...`} disabled={readonly} rows={3} />
              </div>
            ))}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={pestel.description} onChange={e => update({ description: e.target.value })} disabled={readonly} /></div>
          <div><Label>{bp("Rationale", "Begründung")}</Label><Textarea value={pestel.rationale} onChange={e => update({ rationale: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
      {opportunity && (
        <MarkWebSearch
          researchType="pestel"
          titleEn="PESTEL Web Research"
          titleDe="PESTEL Web-Recherche"
          descriptionEn="Mark will research current political, economic, social, technological, environmental, and legal trends relevant to your industry and geography from public web sources."
          descriptionDe="Mark recherchiert aktuelle politische, ökonomische, soziale, technologische, ökologische und rechtliche Trends relevant für deine Branche und Geografie aus öffentlichen Webquellen."
          opportunity={opportunity}
        />
      )}
    </EditableSection>
  );
}

// ── Porter's Five Forces ──
export function EmbeddedPorter({ data, onSave, readonly: propReadonly, opportunity }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const porter = data.porter;
  const update = (updated: typeof porter) => onSave({ ...data, porter: updated });

  const forces = [
    { key: "competitiveRivalry" as const, label: bp("Competitive Rivalry", "Wettbewerbsrivalität"), icon: "⚔️",
      hint: bp("How intense is the competition? Price wars, innovation speed?", "Wie intensiv ist der Wettbewerb? Preiskämpfe, Innovationsgeschwindigkeit?") },
    { key: "threatOfNewEntrants" as const, label: bp("Threat of New Entrants", "Neue Marktteilnehmer"), icon: "🚪",
      hint: bp("How easy can new players enter? Low barriers = high threat.", "Wie leicht können neue Anbieter eintreten? Niedrige Barrieren = hohe Bedrohung.") },
    { key: "threatOfSubstitutes" as const, label: bp("Threat of Substitutes", "Substitute"), icon: "🔄",
      hint: bp("Which alternative technologies or approaches could replace your solution? Consider AI, automation, or entirely different methods solving the same problem.", "Welche alternativen Technologien oder Ansätze könnten deine Lösung ersetzen? Bedenke KI, Automatisierung oder völlig andere Methoden die das gleiche Problem lösen.") },
    { key: "bargainingPowerBuyers" as const, label: bp("Bargaining Power Buyers", "Verhandlungsmacht Käufer"), icon: "🛒",
      hint: bp("Can buyers easily switch? Few large customers = high power.", "Können Käufer leicht wechseln? Wenige Großkunden = hohe Macht.") },
    { key: "bargainingPowerSuppliers" as const, label: bp("Bargaining Power Suppliers", "Verhandlungsmacht Lieferanten"), icon: "🏭",
      hint: bp("How dependent are you on key suppliers or technologies?", "Wie abhängig bist du von Schlüssellieferanten oder Technologien?") },
  ];
  const radarData = forces.map(f => ({ force: f.label, value: porter[f.key].intensity }));

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>⚔️ Porter's Five Forces</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="force" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Radar name="Intensity" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {forces.map(({ key, label, icon, hint }) => {
              const force = porter[key];
              const intensityColor = force.intensity <= 2 ? "text-green-600" : force.intensity <= 3 ? "text-yellow-600" : "text-red-600";
              return (
                <div key={key} className="rounded-lg border border-border p-3 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{icon} {label}</Label>
                    <span className={`text-sm font-bold ${intensityColor}`}>{force.intensity}/5</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{hint}</p>
                  <Slider min={1} max={5} step={1} value={[force.intensity]} onValueChange={([v]) => update({ ...porter, [key]: { ...force, intensity: v } })} disabled={readonly} />
                  <Textarea value={force.description} onChange={e => update({ ...porter, [key]: { ...force, description: e.target.value } })} placeholder={`${label}...`} disabled={readonly} rows={2} />
                </div>
              );
            })}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={porter.description} onChange={e => update({ ...porter, description: e.target.value })} disabled={readonly} /></div>
          <div><Label>{bp("Rationale", "Begründung")}</Label><Textarea value={porter.rationale} onChange={e => update({ ...porter, rationale: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
      {opportunity && (
        <MarkWebSearch
          researchType="porter"
          titleEn="Competitive Forces Research"
          titleDe="Wettbewerbskräfte-Recherche"
          descriptionEn="Mark will research competitor landscape, market entry barriers, substitute products, and supplier/buyer dynamics from industry reports and public sources."
          descriptionDe="Mark recherchiert Wettbewerbslandschaft, Markteintrittsbarrieren, Substitutionsprodukte und Lieferanten-/Käufer-Dynamiken aus Branchenberichten und öffentlichen Quellen."
          opportunity={opportunity}
        />
      )}
    </EditableSection>
  );
}

// ── SWOT ──
export function EmbeddedSwot({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const swot = data.swot;
  const update = (patch: Partial<typeof swot>) => onSave({ ...data, swot: { ...swot, ...patch } });

  const quadrants = [
    { key: "strengths" as const, label: bp("Strengths", "Stärken"), color: "bg-green-500/10 border-green-500/30" },
    { key: "weaknesses" as const, label: bp("Weaknesses", "Schwächen"), color: "bg-red-500/10 border-red-500/30" },
    { key: "opportunities" as const, label: bp("Opportunities", "Chancen"), color: "bg-blue-500/10 border-blue-500/30" },
    { key: "threats" as const, label: bp("Threats", "Risiken"), color: "bg-yellow-500/10 border-yellow-500/30" },
  ];

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>📊 SWOT</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {quadrants.map(({ key, label, color }) => (
              <div key={key} className={`rounded-lg border p-4 ${color}`}>
                <Label className="text-sm font-semibold">{label}</Label>
                <Textarea className="mt-2 bg-background" value={swot[key]} onChange={e => update({ [key]: e.target.value })} placeholder={`${label}...`} disabled={readonly} rows={4} />
              </div>
            ))}
          </div>
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={swot.description} onChange={e => update({ description: e.target.value })} disabled={readonly} /></div>
          <div><Label>{bp("Rationale", "Begründung")}</Label><Textarea value={swot.rationale} onChange={e => update({ rationale: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}

// ── Industry Value Chain ──
export function EmbeddedValueChain({ data, onSave, readonly: propReadonly }: EmbeddedModelProps) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const vc = data.valueChain || createDefaultValueChain();
  const updateVc = (updated: typeof vc) => onSave({ ...data, valueChain: updated });

  const addStage = () => updateVc({ ...vc, stages: [...vc.stages, { id: crypto.randomUUID(), name: "", isOurPosition: false, marginAttractiveness: 3, differentiators: "", dynamics: "" }] });
  const removeStage = (id: string) => updateVc({ ...vc, stages: vc.stages.filter(s => s.id !== id) });
  const updateStage = (id: string, patch: Partial<ValueChainStage>) => updateVc({ ...vc, stages: vc.stages.map(s => s.id === id ? { ...s, ...patch } : s) });

  const marginColor = (v: number) => v >= 4 ? "text-green-600 bg-green-100 dark:bg-green-900/30" : v >= 3 ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" : "text-red-600 bg-red-100 dark:bg-red-900/30";

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <Card>
        <CardHeader><CardTitle>🔗 {bp("Industry Value Chain", "Branchen-Wertschöpfungskette")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {vc.stages.length > 0 && (
            <div className="overflow-x-auto py-4">
              <div className="flex items-stretch gap-1 min-w-max">
                {vc.stages.map((stage, i) => (
                  <div key={stage.id} className="flex items-center">
                    <div className={`relative rounded-lg border-2 p-3 min-w-[120px] text-center ${stage.isOurPosition ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                      {stage.isOurPosition && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> Our Pos.</div>}
                      <div className="text-xs font-semibold mt-1 line-clamp-2">{stage.name || "..."}</div>
                      <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${marginColor(stage.marginAttractiveness)}`}>{stage.marginAttractiveness}/5</div>
                    </div>
                    {i < vc.stages.length - 1 && <span className="px-1 text-muted-foreground font-bold">→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{bp("Stages", "Stufen")}</Label>
            {!readonly && <Button variant="outline" size="sm" onClick={addStage}><Plus className="h-3.5 w-3.5 mr-1" />{bp("Add Stage", "Stufe hinzufügen")}</Button>}
          </div>
          {vc.stages.map(stage => (
            <div key={stage.id} className={`rounded-lg border-2 p-3 space-y-2 ${stage.isOurPosition ? "border-primary/50 bg-primary/5" : "border-border"}`}>
              <div className="flex items-center gap-2">
                <Input value={stage.name} onChange={e => updateStage(stage.id, { name: e.target.value })} placeholder={bp("Stage name", "Stufenname")} disabled={readonly} className="flex-1" />
                <Button variant={stage.isOurPosition ? "default" : "outline"} size="sm" onClick={() => updateStage(stage.id, { isOurPosition: !stage.isOurPosition })} disabled={readonly} className="gap-1 text-xs"><MapPin className="h-3 w-3" /></Button>
                {!readonly && <Button variant="ghost" size="icon" onClick={() => removeStage(stage.id)} className="text-destructive h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{bp("Margin", "Marge")}:</span>
                <Slider min={1} max={5} step={1} value={[stage.marginAttractiveness]} onValueChange={([v]) => updateStage(stage.id, { marginAttractiveness: v })} disabled={readonly} className="flex-1" />
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${marginColor(stage.marginAttractiveness)}`}>{stage.marginAttractiveness}/5</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Textarea value={stage.differentiators} onChange={e => updateStage(stage.id, { differentiators: e.target.value })} placeholder={bp("Differentiators...", "Differenzierungsfaktoren...")} disabled={readonly} rows={2} className="text-xs" />
                <Textarea value={stage.dynamics} onChange={e => updateStage(stage.id, { dynamics: e.target.value })} placeholder={bp("Dynamics...", "Dynamiken...")} disabled={readonly} rows={2} className="text-xs" />
              </div>
            </div>
          ))}
          <div><Label>{bp("Description", "Beschreibung")}</Label><Textarea value={vc.description} onChange={e => updateVc({ ...vc, description: e.target.value })} disabled={readonly} /></div>
          <div><Label>{bp("Rationale", "Begründung")}</Label><Textarea value={vc.rationale} onChange={e => updateVc({ ...vc, rationale: e.target.value })} disabled={readonly} /></div>
        </CardContent>
      </Card>
    </EditableSection>
  );
}
