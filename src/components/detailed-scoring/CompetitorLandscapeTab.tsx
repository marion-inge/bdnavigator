import { useI18n } from "@/lib/i18n";
import { MarkWebSearch } from "@/components/MarkWebSearch";
import { DetailedScoring, CompetitorEntry, CompetitorDimensionRating } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { Shield, Plus, Trash2, Target } from "lucide-react";
import { EditableSection } from "@/components/EditableSection";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const DIMENSION_KEYS = ["price", "techFeatures", "reach", "brandAwareness", "history", "usps"] as const;
type DimensionKey = typeof DIMENSION_KEYS[number];

const RADAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(45, 90%, 50%)",
  "hsl(280, 60%, 55%)",
];

export function CompetitorLandscapeTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedForRadar, setSelectedForRadar] = useState<Set<number>>(() => {
    const entries = scoring.marketAttractiveness?.analysis?.competitorEntries || [];
    const indices = new Set<number>();
    entries.forEach((c, i) => { if (c.name) indices.add(i); });
    return indices;
  });
  const readonly = propReadonly || !editing;

  const dimLabels: Record<DimensionKey, string> = {
    price: t("clDimPrice"),
    techFeatures: t("clDimTechFeatures"),
    reach: t("clDimReach"),
    brandAwareness: t("clDimBrandAwareness"),
    history: t("clDimHistory"),
    usps: t("clDimUsps"),
  };

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

  const ensureDimensions = (comp: CompetitorEntry): CompetitorDimensionRating[] => {
    const existing = comp.dimensionRatings || [];
    return DIMENSION_KEYS.map((dim) => {
      const found = existing.find((r) => r.dimension === dim);
      return found || { dimension: dim, score: 0, comment: "" };
    });
  };

  const addCompetitor = () => {
    const newComp: CompetitorEntry = {
      name: "", marketShare: 0, threatLevel: 3,
      dimensionRatings: DIMENSION_KEYS.map((d) => ({ dimension: d, score: 0, comment: "" })),
    };
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

  const updateDimensionRating = (compIdx: number, dim: DimensionKey, field: "score" | "comment", value: number | string) => {
    setLocal((prev) => {
      const comps = [...(prev.analysis.competitorEntries || [])];
      const ratings = ensureDimensions(comps[compIdx]).map((r) =>
        r.dimension === dim ? { ...r, [field]: value } : r
      );
      comps[compIdx] = { ...comps[compIdx], dimensionRatings: ratings };
      return { ...prev, analysis: { ...prev.analysis, competitorEntries: comps } };
    });
    setDirty(true);
  };

  const removeCompetitor = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, competitorEntries: (prev.analysis.competitorEntries || []).filter((_, i) => i !== idx) }
    }));
    setSelectedForRadar((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1); });
      return next;
    });
    setDirty(true);
  };

  const toggleRadarSelection = (idx: number) => {
    setSelectedForRadar((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Build radar chart data
  const radarData = DIMENSION_KEYS.map((dim) => {
    const point: Record<string, string | number> = { dimension: dimLabels[dim] };
    compEntries.forEach((comp, idx) => {
      if (selectedForRadar.has(idx) && comp.name) {
        const ratings = ensureDimensions(comp);
        const rating = ratings.find((r) => r.dimension === dim);
        point[comp.name] = rating?.score || 0;
      }
    });
    return point;
  });

  const selectedCompetitors = compEntries.filter((c, i) => selectedForRadar.has(i) && c.name);
  const hasRadarData = selectedCompetitors.length > 0 && selectedCompetitors.some((c) => {
    const ratings = ensureDimensions(c);
    return ratings.some((r) => r.score > 0);
  });

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

      {/* Text fields */}
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
      </div>

      {/* Competitor Market Share Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <SectionHeader icon={Shield} title={t("maCompetitorEntries")} />
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

        {/* Competitor rows */}
        {compEntries.map((comp, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 flex items-center gap-2 flex-wrap">
            <Input value={comp.name} onChange={(e) => updateCompetitor(idx, "name", e.target.value)} disabled={readonly} placeholder={t("maCompetitorName")} className="flex-1 min-w-[150px]" />
            <Input type="number" value={comp.marketShare} onChange={(e) => updateCompetitor(idx, "marketShare", Number(e.target.value))} disabled={readonly} placeholder={t("maMarketShare")} className="w-24" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{t("maThreatLevel")}:</span>
              {[1, 2, 3, 4, 5].map((val) => (
                <button key={val} disabled={readonly} onClick={() => updateCompetitor(idx, "threatLevel", val)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                    comp.threatLevel === val
                      ? val >= 4 ? "bg-destructive text-destructive-foreground" : val >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  } ${readonly ? "cursor-default" : "cursor-pointer"}`}>
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

      {/* Spider Chart: Competitor Strength Profile */}
      {compEntries.length > 0 && compEntries.some(c => c.name) && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <SectionHeader icon={Target} title={t("clRadarTitle")} />

          {/* Competitor selection for radar */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("clSelectCompetitors")}</p>
            <div className="flex flex-wrap gap-3">
              {compEntries.map((comp, idx) => comp.name ? (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedForRadar.has(idx)}
                    onCheckedChange={() => toggleRadarSelection(idx)}
                  />
                  <span className="text-sm font-medium" style={{ color: RADAR_COLORS[idx % RADAR_COLORS.length] }}>
                    {comp.name}
                  </span>
                </label>
              ) : null)}
            </div>
          </div>

          {/* Radar Chart */}
          {hasRadarData ? (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  {selectedCompetitors.map((comp, i) => {
                    const originalIdx = compEntries.findIndex((c) => c === comp);
                    return (
                      <Radar
                        key={comp.name}
                        name={comp.name}
                        dataKey={comp.name}
                        stroke={RADAR_COLORS[originalIdx % RADAR_COLORS.length]}
                        fill={RADAR_COLORS[originalIdx % RADAR_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    );
                  })}
                  <Legend />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-3">{t("clNoRatings")}</p>
          )}

          {/* Dimension scoring per competitor */}
          {compEntries.map((comp, compIdx) => comp.name ? (
            <div key={compIdx} className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
              <h4 className="font-semibold text-card-foreground flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: RADAR_COLORS[compIdx % RADAR_COLORS.length] }} />
                {comp.name}
              </h4>
              <div className="grid gap-3">
                {DIMENSION_KEYS.map((dim) => {
                  const ratings = ensureDimensions(comp);
                  const rating = ratings.find((r) => r.dimension === dim)!;
                  return (
                    <div key={dim} className="flex items-start gap-3 flex-wrap">
                      <div className="w-40 shrink-0">
                        <span className="text-sm font-medium text-card-foreground">{dimLabels[dim]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button key={val} disabled={readonly} onClick={() => updateDimensionRating(compIdx, dim, "score", val)}
                            className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                              rating.score === val
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            } ${readonly ? "cursor-default" : "cursor-pointer"}`}>
                            {val}
                          </button>
                        ))}
                      </div>
                      <Input
                        value={rating.comment}
                        onChange={(e) => updateDimensionRating(compIdx, dim, "comment", e.target.value)}
                        disabled={readonly}
                        placeholder={t("clDimComment")}
                        className="flex-1 min-w-[200px] text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null)}
        </div>
      )}

      {/* Mark Web Search Placeholder */}
      <MarkWebSearchPlaceholder
        titleEn="Competitor Web Research"
        titleDe="Wettbewerber Web-Recherche"
        descriptionEn="Mark will research competitor profiles, market shares, pricing strategies, and product differentiators from public web sources, press releases, and industry databases."
        descriptionDe="Mark recherchiert Wettbewerber-Profile, Marktanteile, Preisstrategien und Produktdifferenzierungen aus öffentlichen Webquellen, Pressemitteilungen und Branchendatenbanken."
      />

    </div>
    </EditableSection>
  );
}
