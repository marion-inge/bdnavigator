import { useI18n } from "@/lib/i18n";
import { GateRecord, GateDecision, GateMeetingNotes, GateActionItem, Stage, STAGE_ORDER } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, PauseCircle, XCircle, Pencil, Trash2, Undo2, ChevronDown, ChevronUp, Plus, X, ClipboardList, Users, ListTodo } from "lucide-react";
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

const createEmptyMeetingNotes = (): GateMeetingNotes => ({
  participants: [],
  agenda: "",
  discussionNotes: "",
  decisions: "",
  actionItems: [],
});

export function GateDecisionSection({ gates, currentStage, onSubmitDecision, onUpdateDecision, onDeleteDecision, onRevertStage }: GateDecisionSectionProps) {
  const { t, language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const [decision, setDecision] = useState<GateDecision>("go");
  const [comment, setComment] = useState("");
  const [decider, setDecider] = useState("");
  const [meetingNotes, setMeetingNotes] = useState<GateMeetingNotes>(createEmptyMeetingNotes());
  const [showMeetingNotes, setShowMeetingNotes] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDecision, setEditDecision] = useState<GateDecision>("go");
  const [editComment, setEditComment] = useState("");
  const [editDecider, setEditDecider] = useState("");
  const [editMeetingNotes, setEditMeetingNotes] = useState<GateMeetingNotes>(createEmptyMeetingNotes());
  const [showEditMeetingNotes, setShowEditMeetingNotes] = useState(false);
  const [editNewParticipant, setEditNewParticipant] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const canDecideGate1 = currentStage === "gate1";
  const canDecideGate2 = currentStage === "gate2";
  const canDecideGate3 = currentStage === "gate3";
  const activeGate = canDecideGate1 ? "gate1" : canDecideGate2 ? "gate2" : canDecideGate3 ? "gate3" : null;

  const canRevert = ["rough_scoring", "gate1", "detailed_scoring", "gate2", "investment_case", "gate3", "business_case", "implement_review"].includes(currentStage);

  const GATE_STAGE_INDEX: Record<string, number> = {
    gate1: STAGE_ORDER.indexOf("gate1"),
    gate2: STAGE_ORDER.indexOf("gate2"),
    gate3: STAGE_ORDER.indexOf("gate3"),
  };
  const currentStageIdx = STAGE_ORDER.indexOf(currentStage);
  const visibleGates = gates.filter((g) => {
    const gateIdx = GATE_STAGE_INDEX[g.gate];
    return gateIdx !== undefined && gateIdx < currentStageIdx;
  });

  const handleSubmit = () => {
    if (!activeGate || !decider.trim()) return;
    const hasMeetingContent = meetingNotes.participants.length > 0 || meetingNotes.agenda || meetingNotes.discussionNotes || meetingNotes.decisions || meetingNotes.actionItems.length > 0;
    onSubmitDecision({
      id: crypto.randomUUID(),
      gate: activeGate,
      decision,
      comment,
      decider: decider.trim(),
      date: new Date().toISOString(),
      meetingNotes: hasMeetingContent ? meetingNotes : undefined,
    });
    setComment("");
    setDecider("");
    setDecision("go");
    setMeetingNotes(createEmptyMeetingNotes());
    setShowMeetingNotes(false);
    setNewParticipant("");
  };

  const startEdit = (g: GateRecord) => {
    setEditingId(g.id);
    setEditDecision(g.decision);
    setEditComment(g.comment);
    setEditDecider(g.decider);
    setEditMeetingNotes(g.meetingNotes || createEmptyMeetingNotes());
    setShowEditMeetingNotes(!!g.meetingNotes);
  };

  const saveEdit = () => {
    if (!editingId || !onUpdateDecision) return;
    const hasMeetingContent = editMeetingNotes.participants.length > 0 || editMeetingNotes.agenda || editMeetingNotes.discussionNotes || editMeetingNotes.decisions || editMeetingNotes.actionItems.length > 0;
    onUpdateDecision(editingId, {
      decision: editDecision,
      comment: editComment,
      decider: editDecider.trim(),
      meetingNotes: hasMeetingContent ? editMeetingNotes : undefined,
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
    return t("stage_gate3" as any);
  };

  // Helpers for participants
  const addParticipant = (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, name: string, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!name.trim()) return;
    setter(prev => ({ ...prev, participants: [...prev.participants, name.trim()] }));
    inputSetter("");
  };

  const removeParticipant = (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, idx: number) => {
    setter(prev => ({ ...prev, participants: prev.participants.filter((_, i) => i !== idx) }));
  };

  // Helpers for action items
  const addActionItem = (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>) => {
    setter(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { id: crypto.randomUUID(), task: "", responsible: "", done: false }],
    }));
  };

  const updateActionItem = (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, id: string, patch: Partial<GateActionItem>) => {
    setter(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(a => a.id === id ? { ...a, ...patch } : a),
    }));
  };

  const removeActionItem = (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, id: string) => {
    setter(prev => ({ ...prev, actionItems: prev.actionItems.filter(a => a.id !== id) }));
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

      {visibleGates.length > 0 ? (
        <div className="relative ml-4 border-l-2 border-border pl-6 space-y-8">
          {visibleGates.map((g) => {
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

                    {/* Meeting Notes (Edit) */}
                    <MeetingNotesForm
                      notes={editMeetingNotes}
                      setNotes={setEditMeetingNotes}
                      show={showEditMeetingNotes}
                      setShow={setShowEditMeetingNotes}
                      newParticipant={editNewParticipant}
                      setNewParticipant={setEditNewParticipant}
                      bp={bp}
                      addParticipant={addParticipant}
                      removeParticipant={removeParticipant}
                      addActionItem={addActionItem}
                      updateActionItem={updateActionItem}
                      removeActionItem={removeActionItem}
                    />

                    <div className="flex gap-2">
                      <Button onClick={saveEdit} disabled={!editDecider.trim()} size="sm">{t("saveGate")}</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>{t("cancelEdit")}</Button>
                    </div>
                  </div>
                </div>
              );
            }

            const isNotesExpanded = expandedNotes[g.id] || false;
            const hasMeetingNotes = g.meetingNotes && (g.meetingNotes.participants.length > 0 || g.meetingNotes.agenda || g.meetingNotes.discussionNotes || g.meetingNotes.decisions || g.meetingNotes.actionItems.length > 0);

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

                  {/* Meeting Notes Display */}
                  {hasMeetingNotes && (
                    <Collapsible open={isNotesExpanded} onOpenChange={(open) => setExpandedNotes(prev => ({ ...prev, [g.id]: open }))}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between gap-1.5 text-xs mt-2 border-t border-border rounded-none pt-2">
                          <span className="flex items-center gap-1.5">
                            <ClipboardList className="h-3.5 w-3.5" />
                            {bp("Meeting Notes", "Meeting-Protokoll")}
                            {g.meetingNotes!.actionItems.length > 0 && (
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                                {g.meetingNotes!.actionItems.filter(a => !a.done).length}/{g.meetingNotes!.actionItems.length} {bp("open", "offen")}
                              </span>
                            )}
                          </span>
                          {isNotesExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3">
                        <MeetingNotesReadonly notes={g.meetingNotes!} bp={bp} />
                      </CollapsibleContent>
                    </Collapsible>
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

          {/* Meeting Notes (New) */}
          <MeetingNotesForm
            notes={meetingNotes}
            setNotes={setMeetingNotes}
            show={showMeetingNotes}
            setShow={setShowMeetingNotes}
            newParticipant={newParticipant}
            setNewParticipant={setNewParticipant}
            bp={bp}
            addParticipant={addParticipant}
            removeParticipant={removeParticipant}
            addActionItem={addActionItem}
            updateActionItem={updateActionItem}
            removeActionItem={removeActionItem}
          />

          <Button onClick={handleSubmit} disabled={!decider.trim()}>{t("submitDecision")}</Button>
        </div>
      )}
    </div>
  );
}

// ═══ Meeting Notes Form (reusable for new & edit) ═══
function MeetingNotesForm({
  notes, setNotes, show, setShow, newParticipant, setNewParticipant, bp,
  addParticipant, removeParticipant, addActionItem, updateActionItem, removeActionItem,
}: {
  notes: GateMeetingNotes;
  setNotes: React.Dispatch<React.SetStateAction<GateMeetingNotes>>;
  show: boolean;
  setShow: (v: boolean) => void;
  newParticipant: string;
  setNewParticipant: React.Dispatch<React.SetStateAction<string>>;
  bp: (en: string, de: string) => string;
  addParticipant: (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, name: string, inputSetter: React.Dispatch<React.SetStateAction<string>>) => void;
  removeParticipant: (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, idx: number) => void;
  addActionItem: (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>) => void;
  updateActionItem: (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, id: string, patch: Partial<GateActionItem>) => void;
  removeActionItem: (setter: React.Dispatch<React.SetStateAction<GateMeetingNotes>>, id: string) => void;
}) {
  return (
    <Collapsible open={show} onOpenChange={setShow}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between gap-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            {bp("Meeting Notes", "Meeting-Protokoll")}
          </span>
          {show ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* Participants */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            {bp("Participants", "Teilnehmer")}
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {notes.participants.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                {p}
                <button onClick={() => removeParticipant(setNotes, i)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder={bp("Add participant...", "Teilnehmer hinzufügen...")}
              className="text-sm h-8"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(setNotes, newParticipant, setNewParticipant); } }}
            />
            <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => addParticipant(setNotes, newParticipant, setNewParticipant)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Agenda */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">{bp("Agenda", "Agenda")}</label>
          <Textarea
            value={notes.agenda}
            onChange={(e) => setNotes(prev => ({ ...prev, agenda: e.target.value }))}
            rows={2}
            placeholder={bp("Meeting agenda points...", "Agenda-Punkte...")}
            className="text-sm resize-none"
          />
        </div>

        {/* Discussion Notes */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">{bp("Discussion Notes", "Diskussionsnotizen")}</label>
          <Textarea
            value={notes.discussionNotes}
            onChange={(e) => setNotes(prev => ({ ...prev, discussionNotes: e.target.value }))}
            rows={4}
            placeholder={bp("Key discussion points and observations...", "Wichtige Diskussionspunkte und Beobachtungen...")}
            className="text-sm resize-none"
          />
        </div>

        {/* Decisions */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">{bp("Decisions Made", "Getroffene Entscheidungen")}</label>
          <Textarea
            value={notes.decisions}
            onChange={(e) => setNotes(prev => ({ ...prev, decisions: e.target.value }))}
            rows={2}
            placeholder={bp("Key decisions from this meeting...", "Wichtige Entscheidungen aus diesem Meeting...")}
            className="text-sm resize-none"
          />
        </div>

        {/* Action Items */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
            {bp("Action Items", "Aufgaben")}
          </label>
          <div className="space-y-2">
            {notes.actionItems.map((item) => (
              <div key={item.id} className="flex items-start gap-2 rounded-md border border-border bg-card p-2">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(v) => updateActionItem(setNotes, item.id, { done: !!v })}
                  className="mt-1"
                />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={item.task}
                    onChange={(e) => updateActionItem(setNotes, item.id, { task: e.target.value })}
                    placeholder={bp("Task...", "Aufgabe...")}
                    className={`text-xs h-7 sm:col-span-1 ${item.done ? "line-through text-muted-foreground" : ""}`}
                  />
                  <Input
                    value={item.responsible}
                    onChange={(e) => updateActionItem(setNotes, item.id, { responsible: e.target.value })}
                    placeholder={bp("Responsible...", "Verantwortlich...")}
                    className="text-xs h-7"
                  />
                  <div className="flex gap-1">
                    <Input
                      type="date"
                      value={item.dueDate || ""}
                      onChange={(e) => updateActionItem(setNotes, item.id, { dueDate: e.target.value })}
                      className="text-xs h-7 flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeActionItem(setNotes, item.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addActionItem(setNotes)}>
              <Plus className="h-3 w-3" /> {bp("Add Action Item", "Aufgabe hinzufügen")}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ═══ Meeting Notes Readonly Display ═══
function MeetingNotesReadonly({ notes, bp }: { notes: GateMeetingNotes; bp: (en: string, de: string) => string }) {
  return (
    <div className="space-y-3 text-sm">
      {notes.participants.length > 0 && (
        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
            <Users className="h-3 w-3" /> {bp("Participants", "Teilnehmer")}
          </span>
          <div className="flex flex-wrap gap-1">
            {notes.participants.map((p, i) => (
              <span key={i} className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">{p}</span>
            ))}
          </div>
        </div>
      )}
      {notes.agenda && (
        <div>
          <span className="text-xs font-medium text-muted-foreground mb-1 block">{bp("Agenda", "Agenda")}</span>
          <p className="text-card-foreground whitespace-pre-wrap text-xs">{notes.agenda}</p>
        </div>
      )}
      {notes.discussionNotes && (
        <div>
          <span className="text-xs font-medium text-muted-foreground mb-1 block">{bp("Discussion Notes", "Diskussionsnotizen")}</span>
          <p className="text-card-foreground whitespace-pre-wrap text-xs">{notes.discussionNotes}</p>
        </div>
      )}
      {notes.decisions && (
        <div>
          <span className="text-xs font-medium text-muted-foreground mb-1 block">{bp("Decisions Made", "Getroffene Entscheidungen")}</span>
          <p className="text-card-foreground whitespace-pre-wrap text-xs">{notes.decisions}</p>
        </div>
      )}
      {notes.actionItems.length > 0 && (
        <div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
            <ListTodo className="h-3 w-3" /> {bp("Action Items", "Aufgaben")}
          </span>
          <div className="space-y-1">
            {notes.actionItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <span className={`w-4 h-4 flex items-center justify-center rounded border ${item.done ? "bg-success/20 border-success text-success" : "border-border"}`}>
                  {item.done && <CheckCircle className="h-3 w-3" />}
                </span>
                <span className={`flex-1 ${item.done ? "line-through text-muted-foreground" : "text-card-foreground"}`}>{item.task}</span>
                {item.responsible && <span className="text-muted-foreground">→ {item.responsible}</span>}
                {item.dueDate && <span className="text-muted-foreground">{new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
