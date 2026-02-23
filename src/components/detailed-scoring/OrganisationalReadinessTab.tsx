import { useI18n } from "@/lib/i18n";
import { DetailedScoring, OrganisationalReadiness } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const defaultOrgReadiness: OrganisationalReadiness = {
  score: 3,
  culture: "",
  processes: "",
  skills: "",
  leadership: "",
  resources: "",
  stakeholders: "",
  details: "",
};

export function OrganisationalReadinessTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<OrganisationalReadiness>(scoring.organisationalReadiness || defaultOrgReadiness);
  const [dirty, setDirty] = useState(false);

  const updateField = (field: keyof OrganisationalReadiness, value: string | number) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, organisationalReadiness: local });
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

  const dimensions: { key: keyof OrganisationalReadiness; label: string; placeholder: string; icon: string; color: string }[] = [
    { key: "culture", label: "dsOrCulture", placeholder: "dsOrCulturePlaceholder", icon: "🎭", color: "bg-violet-500/10 border-violet-500/30" },
    { key: "processes", label: "dsOrProcesses", placeholder: "dsOrProcessesPlaceholder", icon: "⚙️", color: "bg-blue-500/10 border-blue-500/30" },
    { key: "skills", label: "dsOrSkills", placeholder: "dsOrSkillsPlaceholder", icon: "🎓", color: "bg-green-500/10 border-green-500/30" },
    { key: "leadership", label: "dsOrLeadership", placeholder: "dsOrLeadershipPlaceholder", icon: "👑", color: "bg-yellow-500/10 border-yellow-500/30" },
    { key: "resources", label: "dsOrResources", placeholder: "dsOrResourcesPlaceholder", icon: "💰", color: "bg-emerald-500/10 border-emerald-500/30" },
    { key: "stakeholders", label: "dsOrStakeholders", placeholder: "dsOrStakeholdersPlaceholder", icon: "🤝", color: "bg-orange-500/10 border-orange-500/30" },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("dsOrgReadiness")}</h3>
              <p className="text-sm text-muted-foreground">{getScoreLabel(local.score)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                disabled={readonly}
                onClick={() => updateField("score", val)}
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
        </div>
      </div>

      {/* Readiness Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map(({ key, label, placeholder, icon, color }) => (
          <div key={key} className={`rounded-xl border p-5 ${color}`}>
            <Label className="text-sm font-semibold flex items-center gap-2">
              <span>{icon}</span> {t(label as any)}
            </Label>
            <Textarea
              className="mt-2 bg-background"
              value={local[key] as string}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={t(placeholder as any)}
              disabled={readonly}
              rows={4}
            />
          </div>
        ))}
      </div>

      {/* General Details */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-card-foreground">{t("detailedAnalysis")}</h3>
        </div>
        <Textarea
          value={local.details}
          onChange={(e) => updateField("details", e.target.value)}
          placeholder={t("detailedAnalysisPlaceholder")}
          disabled={readonly}
          rows={4}
        />
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
