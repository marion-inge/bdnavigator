import { useI18n } from "@/lib/i18n";
import { DetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Users, Shield, Target } from "lucide-react";

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

  // Extract numbers from TAM/SAM for visualization
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
    { name: "TAM", value: tamNum, label: local.analysis.tam },
    { name: "SAM", value: samNum, label: local.analysis.sam },
  ] : null;

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

  return (
    <div className="space-y-6">
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

      {/* Market Size Visualization */}
      {marketSizeData && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("marketSizeComparison")}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={marketSizeData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${v}M`}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: "hsl(var(--foreground))" }} width={50} />
              <Tooltip formatter={(value: number) => [`€${value >= 1000 ? `${(value / 1000).toFixed(1)}B` : `${value}M`}`, ""]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={40}>
                <Cell fill="hsl(var(--primary))" fillOpacity={0.7} />
                <Cell fill="hsl(var(--primary))" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Market Data Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("tam")}
          </h4>
          <Input value={local.analysis.tam} onChange={(e) => update("tam", e.target.value)} disabled={readonly} placeholder="e.g. €15B global market by 2030" />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t("sam")}
          </h4>
          <Input value={local.analysis.sam} onChange={(e) => update("sam", e.target.value)} disabled={readonly} placeholder="e.g. €3B European segment" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {t("targetCustomers")}
          </h4>
          <Textarea value={local.analysis.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("targetCustomersPlaceholder")} />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {t("customerRelationship")}
          </h4>
          <Textarea value={local.analysis.customerRelationship} onChange={(e) => update("customerRelationship", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("customerRelationshipPlaceholder")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {t("competitors")}
          </h4>
          <Textarea value={local.analysis.competitors} onChange={(e) => update("competitors", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("competitorsPlaceholder")} />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {t("competitivePosition")}
          </h4>
          <Textarea value={local.analysis.competitivePosition} onChange={(e) => update("competitivePosition", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("competitivePositionPlaceholder")} />
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
