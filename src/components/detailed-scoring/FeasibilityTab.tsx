import { useI18n, TranslationKey } from "@/lib/i18n";
import { DetailedScoring, FeasibilityMilestone } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const TRL_DESCRIPTIONS: Record<number, { en: string; de: string }> = {
  1: { en: "Basic principles observed", de: "Grundlegende Prinzipien beobachtet" },
  2: { en: "Technology concept formulated", de: "Technologiekonzept formuliert" },
  3: { en: "Experimental proof of concept", de: "Experimenteller Proof of Concept" },
  4: { en: "Technology validated in lab", de: "Technologie im Labor validiert" },
  5: { en: "Technology validated in relevant environment", de: "Technologie in relevanter Umgebung validiert" },
  6: { en: "Technology demonstrated in relevant environment", de: "Technologie in relevanter Umgebung demonstriert" },
  7: { en: "System prototype demonstration", de: "System-Prototyp-Demonstration" },
  8: { en: "System complete and qualified", de: "System vollständig und qualifiziert" },
  9: { en: "Actual system proven in operational environment", de: "System im Betriebseinsatz bewährt" },
};

export function FeasibilityTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t, language } = useI18n();
  const [local, setLocal] = useState({
    ...scoring.feasibility,
    trl: scoring.feasibility.trl ?? 1,
    milestones: scoring.feasibility.milestones ?? [],
  });
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  const updateField = <K extends keyof typeof local>(field: K, value: typeof local[K]) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, feasibility: local });
    setDirty(false);
  };

  const addMilestone = () => {
    const ms: FeasibilityMilestone = {
      id: `ms-${Date.now()}`,
      name: "",
      targetDate: new Date().toISOString().split("T")[0],
      status: "planned",
    };
    updateField("milestones", [...local.milestones, ms]);
  };

  const updateMilestone = (index: number, updates: Partial<FeasibilityMilestone>) => {
    const milestones = [...local.milestones];
    milestones[index] = { ...milestones[index], ...updates };
    updateField("milestones", milestones);
  };

  const removeMilestone = (index: number) => {
    updateField("milestones", local.milestones.filter((_, i) => i !== index));
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

  const getTrlColor = (trl: number) => {
    if (trl >= 7) return "text-green-600 dark:text-green-400";
    if (trl >= 4) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTrlBgColor = (trl: number) => {
    if (trl >= 7) return "bg-green-500";
    if (trl >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrlCategory = (trl: number) => {
    if (trl >= 7) return language === "de" ? "Marktreif" : "Market Ready";
    if (trl >= 4) return language === "de" ? "Validierung" : "Validation";
    return language === "de" ? "Forschung" : "Research";
  };

  const statusIcon = (status: FeasibilityMilestone["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "delayed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusColor = (status: FeasibilityMilestone["status"]) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-yellow-500";
      case "delayed": return "bg-red-500";
      default: return "bg-muted-foreground/30";
    }
  };

  const sortedMilestones = [...local.milestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getScoreColor(local.score)}`} />
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{t("feasibility")}</h3>
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

      {/* TRL Assessment */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-5">
        <h4 className="font-semibold text-card-foreground flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          {t("feTrl")}
        </h4>

        {/* TRL Gauge */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <button
                  key={level}
                  disabled={readonly}
                  onClick={() => updateField("trl", level)}
                  className={`flex-1 h-10 rounded-md text-xs font-bold transition-all ${
                    level <= local.trl
                      ? getTrlBgColor(level) + " text-white"
                      : "bg-muted text-muted-foreground"
                  } ${readonly ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>{language === "de" ? "Forschung" : "Research"}</span>
              <span>{language === "de" ? "Validierung" : "Validation"}</span>
              <span>{language === "de" ? "Marktreif" : "Market Ready"}</span>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-4xl font-bold ${getTrlColor(local.trl)}`}>TRL {local.trl}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {TRL_DESCRIPTIONS[local.trl]?.[language] ?? TRL_DESCRIPTIONS[local.trl]?.en}
            </p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getTrlBgColor(local.trl)}`}>
              {getTrlCategory(local.trl)}
            </span>
          </div>
        </div>

        {/* TRL Reference Scale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { range: "1–3", label: language === "de" ? "Forschung" : "Research", color: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20" },
            { range: "4–6", label: language === "de" ? "Validierung" : "Validation", color: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20" },
            { range: "7–9", label: language === "de" ? "Marktreif" : "Market Ready", color: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" },
          ].map((cat) => (
            <div key={cat.range} className={`rounded-lg border p-3 text-center ${cat.color}`}>
              <p className="text-sm font-bold text-card-foreground">TRL {cat.range}</p>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="rounded-lg border-2 border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-card-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {t("feTimeline")}
          </h4>
          {!readonly && (
            <Button variant="outline" size="sm" onClick={addMilestone}>
              <Plus className="h-4 w-4 mr-1" />
              {t("feAddMilestone")}
            </Button>
          )}
        </div>

        {/* Visual Timeline */}
        {sortedMilestones.length > 0 ? (
          <div className="relative pl-6">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

            <div className="space-y-6">
              {sortedMilestones.map((ms, i) => {
                const originalIndex = local.milestones.findIndex((m) => m.id === ms.id);
                return (
                  <div key={ms.id} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-background ${statusColor(ms.status)}`} />

                    <div className="flex-1 rounded-lg border border-border bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {statusIcon(ms.status)}
                          <Input
                            value={ms.name}
                            onChange={(e) => updateMilestone(originalIndex, { name: e.target.value })}
                            disabled={readonly}
                            placeholder={t("feMilestoneName")}
                            className="h-8 text-sm font-medium"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={ms.targetDate}
                            onChange={(e) => updateMilestone(originalIndex, { targetDate: e.target.value })}
                            disabled={readonly}
                            className="h-8 text-xs w-36"
                          />
                          <Select
                            value={ms.status}
                            onValueChange={(v) => updateMilestone(originalIndex, { status: v as FeasibilityMilestone["status"] })}
                            disabled={readonly}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">{t("feStatusPlanned")}</SelectItem>
                              <SelectItem value="in_progress">{t("feStatusInProgress")}</SelectItem>
                              <SelectItem value="completed">{t("feStatusCompleted")}</SelectItem>
                              <SelectItem value="delayed">{t("feStatusDelayed")}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!readonly && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMilestone(originalIndex)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">{t("feNoMilestones")}</p>
        )}

        {/* Milestone summary bar */}
        {sortedMilestones.length > 0 && (
          <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            {(["completed", "in_progress", "planned", "delayed"] as const).map((status) => {
              const count = sortedMilestones.filter((m) => m.status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center gap-1.5">
                  {statusIcon(status)}
                  <span>{count} {t(`feStatus${status.charAt(0).toUpperCase() + status.slice(1).replace("_p", "P").replace("_", "")}` as TranslationKey)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidance */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          {t("assessmentGuidance")}
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {(["guidance_fe_1", "guidance_fe_2", "guidance_fe_3"] as TranslationKey[]).map((key) => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      {/* Details Text */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h4 className="font-semibold text-card-foreground">{t("detailedAnalysis")}</h4>
        <Textarea
          value={local.details}
          onChange={(e) => updateField("details", e.target.value)}
          disabled={readonly}
          rows={6}
          className="text-sm resize-none"
          placeholder={t("detailedAnalysisPlaceholder")}
        />
      </div>

    </div>
    </EditableSection>
  );
}
