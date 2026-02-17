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
      {/* Decision timeline */}
      {gates.length > 0 ? (
        <div className="relative ml-4 border-l-2 border-border pl-6 space-y-8">
          {gates.map((g, i) => {
            const colorClass =
              g.decision === "go" ? "bg-success border-success" :
              g.decision === "hold" ? "bg-warning border-warning" :
              "bg-destructive border-destructive";
            const badgeClass =
              g.decision === "go" ? "bg-success/10 text-success" :
              g.decision === "hold" ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive";

            return (
              <div key={g.id} className="relative">
                {/* Timeline dot */}
                <div className={`absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 ${colorClass}`} />

                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {decisionIcons[g.decision]}
                      <span className="font-semibold text-card-foreground">
                        {t(g.gate === "gate1" ? "stage_gate1" : "stage_gate2")}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {t(g.decision === "no-go" ? "noGo" : g.decision as any)}
                      </span>
                    </div>
                    <time className="text-sm font-medium text-muted-foreground">
                      {new Date(g.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-card-foreground">{g.decider}</span>
                    <span>·</span>
                    <span>{t("decider")}</span>
                  </div>

                  {g.comment && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
                      {g.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
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
