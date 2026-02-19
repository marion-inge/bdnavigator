import { useI18n } from "@/lib/i18n";
import { GateRecord, GateDecision, Stage } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, PauseCircle, XCircle, Pencil, Trash2, Undo2 } from "lucide-react";
import { StageTimeline } from "@/components/StageTimeline";

interface GateDecisionSectionProps {
  gates: GateRecord[];
  currentStage: Stage;
  onSubmitDecision: (gate: GateRecord) => void;
  onUpdateDecision?: (gateId: string, updates: Partial<GateRecord>) => void;
  onDeleteDecision?: (gateId: string) => void;
  onRevertStage?: () => void;
}

const decisionIcons: Record<GateDecision, React.ReactNode> = {
  go: <CheckCircle className="h-4 w-4 text-success" />,
  hold: <PauseCircle className="h-4 w-4 text-warning" />,
  "no-go": <XCircle className="h-4 w-4 text-destructive" />,
};

export function GateDecisionSection({ gates, currentStage, onSubmitDecision, onUpdateDecision, onDeleteDecision, onRevertStage }: GateDecisionSectionProps) {
  const { t } = useI18n();
  const [decision, setDecision] = useState<GateDecision>("go");
  const [comment, setComment] = useState("");
  const [decider, setDecider] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDecision, setEditDecision] = useState<GateDecision>("go");
  const [editComment, setEditComment] = useState("");
  const [editDecider, setEditDecider] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);

  const canDecideGate1 = currentStage === "gate1";
  const canDecideGate2 = currentStage === "gate2";
  const canDecideGate3 = currentStage === "gate3";
  const activeGate = canDecideGate1 ? "gate1" : canDecideGate2 ? "gate2" : canDecideGate3 ? "gate3" : null;

  const canRevert = ["rough_scoring", "gate1", "detailed_scoring", "gate2", "business_case", "gate3", "go_to_market"].includes(currentStage);

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

  const startEdit = (g: GateRecord) => {
    setEditingId(g.id);
    setEditDecision(g.decision);
    setEditComment(g.comment);
    setEditDecider(g.decider);
  };

  const saveEdit = () => {
    if (!editingId || !onUpdateDecision) return;
    onUpdateDecision(editingId, {
      decision: editDecision,
      comment: editComment,
      decider: editDecider.trim(),
    });
    setEditingId(null);
  };

  const handleDelete = (gateId: string) => {
    if (confirmDeleteId === gateId) {
      onDeleteDecision?.(gateId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(gateId);
    }
  };

  const handleRevert = () => {
    if (showRevertConfirm) {
      onRevertStage?.();
      setShowRevertConfirm(false);
    } else {
      setShowRevertConfirm(true);
    }
  };

  const gateLabel = (gate: string) => {
    if (gate === "gate1") return t("stage_gate1");
    if (gate === "gate2") return t("stage_gate2");
    return t("stage_gate3");
  };

  return (
    <div className="space-y-6">
      {/* Stage Progress Timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("ovStageProgress")}</h3>
        <StageTimeline currentStage={currentStage} />
      </div>

      {/* Revert stage button */}
      {canRevert && onRevertStage && (
        <div className="flex items-center gap-3">
          <Button
            variant={showRevertConfirm ? "destructive" : "outline"}
            onClick={handleRevert}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            {showRevertConfirm ? t("revertConfirm") : t("revertStage")}
          </Button>
          {showRevertConfirm && (
            <Button variant="ghost" size="sm" onClick={() => setShowRevertConfirm(false)}>
              {t("cancelEdit")}
            </Button>
          )}
        </div>
      )}

      {gates.length > 0 ? (
        <div className="relative ml-4 border-l-2 border-border pl-6 space-y-8">
          {gates.map((g) => {
            const isEditing = editingId === g.id;
            const colorClass =
              g.decision === "go" ? "bg-success border-success" :
              g.decision === "hold" ? "bg-warning border-warning" :
              "bg-destructive border-destructive";
            const badgeClass =
              g.decision === "go" ? "bg-success/10 text-success" :
              g.decision === "hold" ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive";

            if (isEditing) {
              return (
                <div key={g.id} className="relative">
                  <div className={`absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 ${colorClass}`} />
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                    <h4 className="font-semibold text-foreground">{gateLabel(g.gate)}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decision")}</label>
                        <Select value={editDecision} onValueChange={(v) => setEditDecision(v as GateDecision)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="go">{t("go")}</SelectItem>
                            <SelectItem value="hold">{t("hold")}</SelectItem>
                            <SelectItem value="no-go">{t("noGo")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decider")}</label>
                        <Input value={editDecider} onChange={(e) => setEditDecider(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decisionComment")}</label>
                      <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} disabled={!editDecider.trim()} size="sm">{t("saveGate")}</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>{t("cancelEdit")}</Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={g.id} className="relative group">
                <div className={`absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 ${colorClass}`} />
                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {decisionIcons[g.decision]}
                      <span className="font-semibold text-card-foreground">{gateLabel(g.gate)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {t(g.decision === "no-go" ? "noGo" : g.decision as any)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(onUpdateDecision || onDeleteDecision) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onUpdateDecision && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(g)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDeleteDecision && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 ${confirmDeleteId === g.id ? "text-destructive bg-destructive/10" : "text-muted-foreground"}`}
                              onClick={() => handleDelete(g.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                      <time className="text-sm font-medium text-muted-foreground">
                        {new Date(g.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </time>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-card-foreground">{g.decider}</span>
                    <span>·</span>
                    <span>{t("decider")}</span>
                  </div>
                  {g.comment && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">{g.comment}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noDecisions")}</p>
      )}

      {activeGate && (
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-5 space-y-4">
          <h4 className="font-semibold text-foreground">
            {t("gateDecision")}: {gateLabel(activeGate)}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("decision")}</label>
              <Select value={decision} onValueChange={(v) => setDecision(v as GateDecision)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Button onClick={handleSubmit} disabled={!decider.trim()}>{t("submitDecision")}</Button>
        </div>
      )}
    </div>
  );
}
