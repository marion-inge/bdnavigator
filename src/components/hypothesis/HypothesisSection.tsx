import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, CheckCircle2, RefreshCw } from "lucide-react";
import { Opportunity } from "@/lib/types";
import { HypothesisData, createDefaultHypothesis } from "@/lib/hypothesisTypes";
import { HypothesisForm } from "./HypothesisForm";
import { DevelopHypothesisDialog } from "./DevelopHypothesisDialog";
import { exportHypothesisXlsx } from "@/lib/hypothesisExport";
import { useI18n } from "@/lib/i18n";
import idaRobot from "@/assets/ida-robot.png";

interface Props {
  opportunity: Opportunity;
  onSave: (h: HypothesisData) => void;
  readonly?: boolean;
}

export function HypothesisSection({ opportunity, onSave, readonly }: Props) {
  const { language } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const hypothesis = opportunity.hypothesis ?? createDefaultHypothesis();
  const hasCompletedScoring = !!opportunity.roughScoringAnswers && Object.keys(opportunity.roughScoringAnswers).length > 0;

  const toggleStatus = () => {
    const nextConfirmed = hypothesis.status !== "confirmed";
    onSave({
      ...hypothesis,
      status: nextConfirmed ? "confirmed" : "draft",
      confirmedAt: nextConfirmed ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const formatTs = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(language === "de" ? "de-DE" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{language === "de" ? "Hypothesen-Builder" : "Hypothesis Builder"}</h2>
          <p className="text-sm text-muted-foreground">
            {language === "de"
              ? "Strukturierte Input-Sheets für Industry-, Customer-, Competitor-, Market Potential- und Buying Center-Scans."
              : "Structured input sheets for Industry, Customer, Competitor, Market Potential and Buying Center scans."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hypothesis.status === "confirmed" ? "default" : "secondary"} className="gap-1">
            {hypothesis.status === "confirmed" ? <CheckCircle2 className="h-3 w-3" /> : null}
            {hypothesis.status === "confirmed"
              ? (language === "de" ? "Bestätigt" : "Confirmed")
              : (language === "de" ? "Entwurf" : "Draft")}
            {hypothesis.status === "confirmed" && hypothesis.confirmedAt && (
              <span className="ml-1 text-[10px] font-normal opacity-80">· {formatTs(hypothesis.confirmedAt)}</span>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} disabled={readonly || !hasCompletedScoring} className="gap-1.5">
            <img src={idaRobot} alt="" className="h-4 w-4" />
            {language === "de" ? "Mit IDA entwickeln" : "Develop with IDA"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportHypothesisXlsx(hypothesis, opportunity.title, language)} className="gap-1.5">
            <FileDown className="h-3.5 w-3.5" />
            {language === "de" ? "Excel exportieren" : "Export Excel"}
          </Button>
          <Button variant={hypothesis.status === "confirmed" ? "secondary" : "default"} size="sm" onClick={toggleStatus} disabled={readonly} className="gap-1.5">
            {hypothesis.status === "confirmed" ? <RefreshCw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {hypothesis.status === "confirmed"
              ? (language === "de" ? "Auf Entwurf setzen" : "Set to draft")
              : (language === "de" ? "Bestätigen" : "Confirm")}
          </Button>
        </div>
      </div>


      {!hasCompletedScoring && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          {language === "de"
            ? "Bitte zuerst den Idea-Scoring-Fragebogen ausfüllen — IDA nutzt diese Antworten als Basis für den Hypothesen-Entwurf."
            : "Complete the Idea Scoring questionnaire first — IDA uses those answers as the basis for drafting the hypothesis."}
        </div>
      )}

      <HypothesisForm hypothesis={hypothesis} onChange={onSave} readonly={readonly} />

      <DevelopHypothesisDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunityId={opportunity.id}
        existing={hypothesis}
        onDrafted={onSave}
      />
    </div>
  );
}
