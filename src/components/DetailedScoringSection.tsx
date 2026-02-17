import { useI18n } from "@/lib/i18n";
import { DetailedScoring, createDefaultDetailedScoring } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  detailedScoring?: DetailedScoring;
  onSave: (ds: DetailedScoring) => void;
  readonly?: boolean;
}

export function DetailedScoringSection({ detailedScoring, onSave, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());
  const [dirty, setDirty] = useState(false);

  const updateMarketField = (field: keyof DetailedScoring["marketAttractiveness"]["analysis"], value: string) => {
    setLocal((prev) => ({
      ...prev,
      marketAttractiveness: {
        ...prev.marketAttractiveness,
        analysis: { ...prev.marketAttractiveness.analysis, [field]: value },
      },
    }));
    setDirty(true);
  };

  const updateMarketScore = (score: number) => {
    setLocal((prev) => ({
      ...prev,
      marketAttractiveness: { ...prev.marketAttractiveness, score },
    }));
    setDirty(true);
  };

  const updateCriterionScore = (key: "strategicFit" | "feasibility" | "commercialViability" | "risk", score: number) => {
    setLocal((prev) => ({ ...prev, [key]: { ...prev[key], score } }));
    setDirty(true);
  };

  const updateCriterionDetails = (key: "strategicFit" | "feasibility" | "commercialViability" | "risk", details: string) => {
    setLocal((prev) => ({ ...prev, [key]: { ...prev[key], details } }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(local);
    setDirty(false);
  };

  const ScoreButtons = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          disabled={readonly}
          onClick={() => onChange(val)}
          className={`w-9 h-9 rounded-md text-sm font-semibold transition-colors ${
            value === val
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
          } ${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          {val}
        </button>
      ))}
    </div>
  );

  const otherCriteria: { key: "strategicFit" | "feasibility" | "commercialViability" | "risk"; isRisk?: boolean }[] = [
    { key: "strategicFit" },
    { key: "feasibility" },
    { key: "commercialViability" },
    { key: "risk", isRisk: true },
  ];

  return (
    <div className="space-y-6">
      {/* Market Attractiveness - detailed */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-card-foreground text-lg">{t("marketAttractiveness")}</h4>
          <ScoreButtons value={local.marketAttractiveness.score} onChange={updateMarketScore} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("tam")}</label>
            <Input value={local.marketAttractiveness.analysis.tam} onChange={(e) => updateMarketField("tam", e.target.value)} disabled={readonly} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("sam")}</label>
            <Input value={local.marketAttractiveness.analysis.sam} onChange={(e) => updateMarketField("sam", e.target.value)} disabled={readonly} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("targetCustomers")}</label>
            <Textarea value={local.marketAttractiveness.analysis.targetCustomers} onChange={(e) => updateMarketField("targetCustomers", e.target.value)} disabled={readonly} rows={2} className="text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("customerRelationship")}</label>
            <Textarea value={local.marketAttractiveness.analysis.customerRelationship} onChange={(e) => updateMarketField("customerRelationship", e.target.value)} disabled={readonly} rows={2} className="text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("competitors")}</label>
            <Textarea value={local.marketAttractiveness.analysis.competitors} onChange={(e) => updateMarketField("competitors", e.target.value)} disabled={readonly} rows={2} className="text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("competitivePosition")}</label>
            <Textarea value={local.marketAttractiveness.analysis.competitivePosition} onChange={(e) => updateMarketField("competitivePosition", e.target.value)} disabled={readonly} rows={2} className="text-sm resize-none" />
          </div>
        </div>
      </div>

      {/* Other criteria with detailed text */}
      {otherCriteria.map(({ key, isRisk }) => (
        <div key={key} className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">
              {t(key as any)}
              {isRisk && <span className="ml-2 text-xs text-muted-foreground">{t("riskNote")}</span>}
            </h4>
            <ScoreButtons value={local[key].score} onChange={(v) => updateCriterionScore(key, v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{t("details")}</label>
            <Textarea
              value={local[key].details}
              onChange={(e) => updateCriterionDetails(key, e.target.value)}
              disabled={readonly}
              rows={3}
              className="text-sm resize-none"
              placeholder={t("detailedAnalysis")}
            />
          </div>
        </div>
      ))}

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
