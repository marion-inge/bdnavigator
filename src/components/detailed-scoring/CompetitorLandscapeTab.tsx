import { useI18n } from "@/lib/i18n";
import { DetailedScoring, CompetitorEntry } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Shield, Plus, Trash2 } from "lucide-react";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

export function CompetitorLandscapeTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t } = useI18n();
  // Use the competitor data from marketAttractiveness.analysis (shared data model)
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const update = (field: keyof typeof local.analysis, value: string) => {
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, [field]: value } }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, marketAttractiveness: local });
    setDirty(false);
  };

  // Competitor entries
  const compEntries = local.analysis.competitorEntries || [];
  const addCompetitor = () => {
    const newComp: CompetitorEntry = { name: "", marketShare: 0, threatLevel: 3 };
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, competitorEntries: [...(prev.analysis.competitorEntries || []), newComp] } }));
    setDirty(true);
  };
  const updateCompetitor = (idx: number, field: keyof CompetitorEntry, value: string | number) => {
    setLocal((prev) => {
      const comps = [...(prev.analysis.competitorEntries || [])];
      comps[idx] = { ...comps[idx], [field]: value };
      return { ...prev, analysis: { ...prev.analysis, competitorEntries: comps } };
    });
    setDirty(true);
  };
  const removeCompetitor = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, competitorEntries: (prev.analysis.competitorEntries || []).filter((_, i) => i !== idx) }
    }));
    setDirty(true);
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
    </div>
  );

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-card-foreground">{t("dsCompetitorLandscape")}</h3>
        </div>
      </div>

      {/* Competitor Landscape Content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <SectionHeader icon={Shield} title={t("maCompetitorLandscape")} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("competitors")}</h4>
            <Textarea value={local.analysis.competitors} onChange={(e) => update("competitors", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("competitorsPlaceholder")} />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("competitivePosition")}</h4>
            <Textarea value={local.analysis.competitivePosition} onChange={(e) => update("competitivePosition", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("competitivePositionPlaceholder")} />
          </div>
        </div>

        {/* Competitor Market Share Bar Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">{t("maCompetitorEntries")}</h4>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addCompetitor}>
                <Plus className="h-3 w-3 mr-1" />{t("maAddCompetitor")}
              </Button>
            )}
          </div>

          {compEntries.length > 0 && compEntries.some(c => c.name) && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={Math.max(180, compEntries.filter(c => c.name).length * 45)}>
                <BarChart data={compEntries.filter(c => c.name)} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} width={120} />
                  <Tooltip formatter={(value: number) => [`${value}%`, t("maMarketShare")]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="marketShare" radius={[0, 6, 6, 0]} barSize={28}>
                    {compEntries.filter(c => c.name).map((entry, i) => (
                      <Cell key={i} fill={entry.threatLevel >= 4 ? "hsl(var(--destructive))" : entry.threatLevel >= 3 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive inline-block" /> {t("maThreatLevel")} 4-5</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> {t("maThreatLevel")} 3</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/50 inline-block" /> {t("maThreatLevel")} 1-2</span>
              </div>
            </div>
          )}

          {compEntries.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3">{t("maNoCompetitors")}</p>
          )}

          {compEntries.map((comp, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 flex items-center gap-2 flex-wrap">
              <Input value={comp.name} onChange={(e) => updateCompetitor(idx, "name", e.target.value)} disabled={readonly} placeholder={t("maCompetitorName")} className="flex-1 min-w-[150px]" />
              <Input type="number" value={comp.marketShare} onChange={(e) => updateCompetitor(idx, "marketShare", Number(e.target.value))} disabled={readonly} placeholder={t("maMarketShare")} className="w-24" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{t("maThreatLevel")}:</span>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    disabled={readonly}
                    onClick={() => updateCompetitor(idx, "threatLevel", val)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                      comp.threatLevel === val
                        ? val >= 4 ? "bg-destructive text-destructive-foreground" : val >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              {!readonly && (
                <Button variant="ghost" size="sm" onClick={() => removeCompetitor(idx)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
    </EditableSection>
  );
}
