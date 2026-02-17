import { useI18n } from "@/lib/i18n";
import { GateRecord, GateDecision, Stage } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, PauseCircle, XCircle } from "lucide-react";

interface GateDecisionSectionProps {
  gates: GateRecord[];
  currentStage: Stage;
  onSubmitDecision: (gate: GateRecord) => void;
}

const decisionIcons: Record<GateDecision, React.ReactNode> = {
  go: <CheckCircle className="h-4 w-4 text-success" />,
  hold: <PauseCircle className="h-4 w-4 text-warning" />,
  "no-go": <XCircle className="h-4 w-4 text-destructive" />,
};

export function GateDecisionSection({ gates, currentStage, onSubmitDecision }: GateDecisionSectionProps) {
  const { t } = useI18n();
  const [decision, setDecision] = useState<GateDecision>("go");
  const [comment, setComment] = useState("");
  const [decider, setDecider] = useState("");

  const canDecideGate1 = currentStage === "gate1";
  const canDecideGate2 = currentStage === "gate2";
  const activeGate = canDecideGate1 ? "gate1" : canDecideGate2 ? "gate2" : null;

  const handleSubmit = () => {
    if (!activeGate || !decider.trim()) return;
    onSubmitDecision({
      id: crypto.randomUUID(),
      gate: activeGate,
      decision,
      comment,
      decider: decider.trim(),
      date: new Date().toISOString(),
    });
    setComment("");
    setDecider("");
    setDecision("go");
  };

  return (
    <div className="space-y-6">
      {/* Decision history */}
      {gates.length > 0 ? (
        <div className="space-y-3">
          {gates.map((g) => (
            <div key={g.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                {decisionIcons[g.decision]}
                <span className="font-semibold text-card-foreground">
                  {t(g.gate === "gate1" ? "stage_gate1" : "stage_gate2")}
                </span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                  g.decision === "go" ? "bg-success/10 text-success" :
                  g.decision === "hold" ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {t(g.decision === "no-go" ? "noGo" : g.decision as any)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{g.comment}</p>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>{t("decider")}: {g.decider}</span>
                <span>{new Date(g.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noDecisions")}</p>
      )}

      {/* New decision form */}
      {activeGate && (
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-5 space-y-4">
          <h4 className="font-semibold text-foreground">
            {t("gateDecision")}: {t(activeGate === "gate1" ? "stage_gate1" : "stage_gate2")}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decision")}</label>
              <Select value={decision} onValueChange={(v) => setDecision(v as GateDecision)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="go">{t("go")}</SelectItem>
                  <SelectItem value="hold">{t("hold")}</SelectItem>
                  <SelectItem value="no-go">{t("noGo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decider")}</label>
              <Input value={decider} onChange={(e) => setDecider(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decisionComment")}</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </div>

          <Button onClick={handleSubmit} disabled={!decider.trim()}>
            {t("submitDecision")}
          </Button>
        </div>
      )}
    </div>
  );
}
