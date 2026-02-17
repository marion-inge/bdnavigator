import { useI18n } from "@/lib/i18n";
import { DetailedScoring, CustomerSegment, CompetitorEntry, GeographicalRegion } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { TrendingUp, Users, Shield, Globe, Target, Plus, Trash2 } from "lucide-react";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

export function MarketAttractivenessTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);

  const update = (field: keyof typeof local.analysis, value: string) => {
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, [field]: value } }));
    setDirty(true);
  };

  const updateScore = (score: number) => {
    setLocal((prev) => ({ ...prev, score }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, marketAttractiveness: local });
    setDirty(false);
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

  // TAM/SAM chart data
  const extractNumber = (text: string): number | null => {
    const match = text.match(/€?([\d.,]+)\s*(B|M|K|bn|mn)/i);
    if (!match) return null;
    const num = parseFloat(match[1].replace(",", "."));
    const unit = match[2].toUpperCase();
    if (unit === "B" || unit === "BN") return num * 1000;
    if (unit === "M" || unit === "MN") return num;
    if (unit === "K") return num / 1000;
    return num;
  };

  const tamNum = extractNumber(local.analysis.tam);
  const samNum = extractNumber(local.analysis.sam);
  const marketSizeData = tamNum && samNum ? [
    { name: "TAM", value: tamNum },
    { name: "SAM", value: samNum },
  ] : null;

  // Customer segments
  const segments = local.analysis.customerSegments || [];
  const addSegment = () => {
    const newSeg: CustomerSegment = { name: "", size: 0, description: "" };
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, customerSegments: [...(prev.analysis.customerSegments || []), newSeg] } }));
    setDirty(true);
  };
  const updateSegment = (idx: number, field: keyof CustomerSegment, value: string | number) => {
    setLocal((prev) => {
      const segs = [...(prev.analysis.customerSegments || [])];
      segs[idx] = { ...segs[idx], [field]: value };
      return { ...prev, analysis: { ...prev.analysis, customerSegments: segs } };
    });
    setDirty(true);
  };
  const removeSegment = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, customerSegments: (prev.analysis.customerSegments || []).filter((_, i) => i !== idx) }
    }));
    setDirty(true);
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

  // Geographical regions
  const regions = local.analysis.geographicalRegions || [];
  const addRegion = () => {
    const newReg: GeographicalRegion = { region: "", potential: 3, marketSize: "", notes: "" };
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, geographicalRegions: [...(prev.analysis.geographicalRegions || []), newReg] } }));
    setDirty(true);
  };
  const updateRegion = (idx: number, field: keyof GeographicalRegion, value: string | number) => {
    setLocal((prev) => {
      const regs = [...(prev.analysis.geographicalRegions || [])];
      regs[idx] = { ...regs[idx], [field]: value };
      return { ...prev, analysis: { ...prev.analysis, geographicalRegions: regs } };
    });
    setDirty(true);
  };
  const removeRegion = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, geographicalRegions: (prev.analysis.geographicalRegions || []).filter((_, i) => i !== idx) }
    }));
    setDirty(true);
  };

  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--primary) / 0.7)",
    "hsl(var(--primary) / 0.5)",
    "hsl(var(--primary) / 0.3)",
    "hsl(var(--accent))",
  ];

  const ScoreButtons = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          disabled={readonly}
          onClick={() => updateScore(val)}
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
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("marketAttractiveness")}</h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(local.score)}</p>
            </div>
          </div>
          <ScoreButtons />
        </div>
      </div>

      {/* ─── SECTION 1: Marktpotenzial ─── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <SectionHeader icon={TrendingUp} title={t("maMarketPotential")} />

        {/* TAM/SAM Chart */}
        {marketSizeData && (
          <div className="rounded-lg border border-border bg-background/50 p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">{t("marketSizeComparison")}</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={marketSizeData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: "hsl(var(--foreground))" }} width={50} />
                <Tooltip formatter={(value: number) => [`€${value >= 1000 ? `${(value / 1000).toFixed(1)}B` : `${value}M`}`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={40}>
                  <Cell fill="hsl(var(--primary))" fillOpacity={0.5} />
                  <Cell fill="hsl(var(--primary))" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("tam")}
            </h4>
            <Input value={local.analysis.tam} onChange={(e) => update("tam", e.target.value)} disabled={readonly} placeholder="e.g. €15B global market by 2030" />
            <h5 className="text-xs font-medium text-muted-foreground mt-2">{t("maTamDescription")}</h5>
            <Textarea value={local.analysis.tamDescription} onChange={(e) => update("tamDescription", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("maTamDescPlaceholder")} />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t("sam")}
            </h4>
            <Input value={local.analysis.sam} onChange={(e) => update("sam", e.target.value)} disabled={readonly} placeholder="e.g. €3B European segment" />
            <h5 className="text-xs font-medium text-muted-foreground mt-2">{t("maSamDescription")}</h5>
            <Textarea value={local.analysis.samDescription} onChange={(e) => update("samDescription", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("maSamDescPlaceholder")} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("maMarketGrowthRate")}
          </h4>
          <Input value={local.analysis.marketGrowthRate} onChange={(e) => update("marketGrowthRate", e.target.value)} disabled={readonly} placeholder={t("maGrowthRatePlaceholder")} />
        </div>
      </div>

      {/* ─── SECTION 2: Customer Landscape ─── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <SectionHeader icon={Users} title={t("maCustomerLandscape")} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("targetCustomers")}</h4>
            <Textarea value={local.analysis.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("targetCustomersPlaceholder")} />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("customerRelationship")}</h4>
            <Textarea value={local.analysis.customerRelationship} onChange={(e) => update("customerRelationship", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("customerRelationshipPlaceholder")} />
          </div>
        </div>

        {/* Customer Segments Pie Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">{t("maCustomerSegments")}</h4>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addSegment}>
                <Plus className="h-3 w-3 mr-1" />{t("maAddSegment")}
              </Button>
            )}
          </div>

          {segments.length > 0 && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={segments.filter(s => s.name && s.size > 0)}
                    dataKey="size"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ name, size }) => `${name} (${size}%)`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  >
                    {segments.filter(s => s.name && s.size > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3">{t("maNoSegments")}</p>
          )}

          {segments.map((seg, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={seg.name} onChange={(e) => updateSegment(idx, "name", e.target.value)} disabled={readonly} placeholder={t("maSegmentName")} className="flex-1" />
                <Input type="number" value={seg.size} onChange={(e) => updateSegment(idx, "size", Number(e.target.value))} disabled={readonly} placeholder={t("maSegmentSize")} className="w-24" />
                {!readonly && (
                  <Button variant="ghost" size="sm" onClick={() => removeSegment(idx)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
              <Input value={seg.description} onChange={(e) => updateSegment(idx, "description", e.target.value)} disabled={readonly} placeholder={t("maSegmentDesc")} className="text-sm" />
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 3: Competitor Landscape ─── */}
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

      {/* ─── SECTION 4: Geographical Focus ─── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <SectionHeader icon={Globe} title={t("maGeographicalFocus")} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">{t("maGeographicalFocus")}</h4>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addRegion}>
                <Plus className="h-3 w-3 mr-1" />{t("maAddRegion")}
              </Button>
            )}
          </div>

          {/* Radar chart for geographical potential */}
          {regions.length >= 3 && regions.some(r => r.region) && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={regions.filter(r => r.region).map(r => ({ region: r.region, potential: r.potential }))}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name={t("maRegionPotential")} dataKey="potential" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Fallback bar chart for <3 regions */}
          {regions.length > 0 && regions.length < 3 && regions.some(r => r.region) && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={regions.filter(r => r.region)} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="region" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="potential" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {regions.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3">{t("maNoRegions")}</p>
          )}

          {regions.map((reg, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Input value={reg.region} onChange={(e) => updateRegion(idx, "region", e.target.value)} disabled={readonly} placeholder={t("maRegionName")} className="flex-1 min-w-[120px]" />
                <Input value={reg.marketSize} onChange={(e) => updateRegion(idx, "marketSize", e.target.value)} disabled={readonly} placeholder={t("maRegionSizePlaceholder")} className="w-32" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{t("maRegionPotential")}:</span>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      disabled={readonly}
                      onClick={() => updateRegion(idx, "potential", val)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                        reg.potential === val
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      } ${readonly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                {!readonly && (
                  <Button variant="ghost" size="sm" onClick={() => removeRegion(idx)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
              <Input value={reg.notes} onChange={(e) => updateRegion(idx, "notes", e.target.value)} disabled={readonly} placeholder={t("maRegionNotesPlaceholder")} className="text-sm" />
            </div>
          ))}
        </div>
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
