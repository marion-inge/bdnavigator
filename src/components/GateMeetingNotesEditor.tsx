import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GateRecord, GateMeetingNotes, GateActionItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, ListTodo, Plus, X, ClipboardList, Pencil } from "lucide-react";

interface Props {
  gate: "gate1" | "gate2" | "gate3";
  gates: GateRecord[];
  onUpdateDecision?: (gateId: string, updates: Partial<GateRecord>) => void;
}

const createEmptyMeetingNotes = (): GateMeetingNotes => ({
  participants: [],
  agenda: "",
  discussionNotes: "",
  decisions: "",
  actionItems: [],
});

export function GateMeetingNotesEditor({ gate, gates, onUpdateDecision }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const gateRecord = gates.find(g => g.gate === gate);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState<GateMeetingNotes>(
    gateRecord?.meetingNotes || createEmptyMeetingNotes()
  );
  const [newParticipant, setNewParticipant] = useState("");

  const gateLabel = gate === "gate1" ? "Gate 1" : gate === "gate2" ? "Gate 2" : "Gate 3";

  const addParticipant = () => {
    if (!newParticipant.trim()) return;
    setNotes(prev => ({ ...prev, participants: [...prev.participants, newParticipant.trim()] }));
    setNewParticipant("");
  };

  const removeParticipant = (idx: number) => {
    setNotes(prev => ({ ...prev, participants: prev.participants.filter((_, i) => i !== idx) }));
  };

  const addActionItem = () => {
    setNotes(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { id: crypto.randomUUID(), task: "", responsible: "", done: false }],
    }));
  };

  const updateActionItem = (id: string, patch: Partial<GateActionItem>) => {
    setNotes(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(a => a.id === id ? { ...a, ...patch } : a),
    }));
  };

  const removeActionItem = (id: string) => {
    setNotes(prev => ({ ...prev, actionItems: prev.actionItems.filter(a => a.id !== id) }));
  };

  const handleSave = () => {
    if (!gateRecord || !onUpdateDecision) return;
    const hasMeetingContent = notes.participants.length > 0 || notes.agenda || notes.discussionNotes || notes.decisions || notes.actionItems.length > 0;
    onUpdateDecision(gateRecord.id, {
      meetingNotes: hasMeetingContent ? notes : undefined,
    });
    setEditing(false);
  };

  if (!gateRecord) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-card-foreground">
            {bp(`${gateLabel} Meeting Notes`, `${gateLabel} Meeting-Protokoll`)}
          </h2>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {bp(
                `No ${gateLabel} decision has been recorded yet. Meeting notes can be added once a gate decision exists.`,
                `Es wurde noch keine ${gateLabel}-Entscheidung aufgezeichnet. Meeting-Protokolle können hinzugefügt werden, sobald eine Gate-Entscheidung vorliegt.`
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasContent = notes.participants.length > 0 || notes.agenda || notes.discussionNotes || notes.decisions || notes.actionItems.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-card-foreground">
            {bp(`${gateLabel} Meeting Notes`, `${gateLabel} Meeting-Protokoll`)}
          </h2>
        </div>
        {onUpdateDecision && (
          <Button
            variant={editing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (editing) handleSave();
              else setEditing(true);
            }}
          >
            {editing ? bp("Save", "Speichern") : (
              <span className="flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> {bp("Edit", "Bearbeiten")}</span>
            )}
          </Button>
        )}
      </div>

      {/* Gate Decision Info */}
      <Card className="border-dashed">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 text-sm">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              gateRecord.decision === "go" ? "bg-success/10 text-success" :
              gateRecord.decision === "hold" ? "bg-warning/10 text-warning" :
              "bg-destructive/10 text-destructive"
            }`}>
              {gateRecord.decision === "go" ? "Go" : gateRecord.decision === "hold" ? "Hold" : "No-Go"}
            </span>
            <span className="text-muted-foreground">{gateRecord.decider}</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground">
              {new Date(gateRecord.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </time>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <div className="space-y-5">
          {/* Participants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                {bp("Participants", "Teilnehmer")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {notes.participants.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
                    {p}
                    <button onClick={() => removeParticipant(i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  placeholder={bp("Add participant...", "Teilnehmer hinzufügen...")}
                  className="text-sm h-8"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                />
                <Button variant="outline" size="sm" className="h-8 px-2" onClick={addParticipant}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{bp("Agenda", "Agenda")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes.agenda}
                onChange={(e) => setNotes(prev => ({ ...prev, agenda: e.target.value }))}
                rows={3}
                placeholder={bp("Meeting agenda points...", "Agenda-Punkte...")}
                className="text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Discussion Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{bp("Discussion Notes", "Diskussionsnotizen")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes.discussionNotes}
                onChange={(e) => setNotes(prev => ({ ...prev, discussionNotes: e.target.value }))}
                rows={6}
                placeholder={bp("Key discussion points and observations...", "Wichtige Diskussionspunkte und Beobachtungen...")}
                className="text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Decisions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{bp("Decisions Made", "Getroffene Entscheidungen")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes.decisions}
                onChange={(e) => setNotes(prev => ({ ...prev, decisions: e.target.value }))}
                rows={3}
                placeholder={bp("Key decisions from this meeting...", "Wichtige Entscheidungen aus diesem Meeting...")}
                className="text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                {bp("Action Items", "Aufgaben")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notes.actionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-2.5">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(v) => updateActionItem(item.id, { done: !!v })}
                    className="mt-1"
                  />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      value={item.task}
                      onChange={(e) => updateActionItem(item.id, { task: e.target.value })}
                      placeholder={bp("Task...", "Aufgabe...")}
                      className={`text-xs h-7 ${item.done ? "line-through text-muted-foreground" : ""}`}
                    />
                    <Input
                      value={item.responsible}
                      onChange={(e) => updateActionItem(item.id, { responsible: e.target.value })}
                      placeholder={bp("Responsible...", "Verantwortlich...")}
                      className="text-xs h-7"
                    />
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={item.dueDate || ""}
                        onChange={(e) => updateActionItem(item.id, { dueDate: e.target.value })}
                        className="text-xs h-7 flex-1"
                      />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeActionItem(item.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addActionItem}>
                <Plus className="h-3 w-3" /> {bp("Add Action Item", "Aufgabe hinzufügen")}
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave}>{bp("Save Meeting Notes", "Meeting-Protokoll speichern")}</Button>
            <Button variant="ghost" onClick={() => {
              setNotes(gateRecord.meetingNotes || createEmptyMeetingNotes());
              setEditing(false);
            }}>{bp("Cancel", "Abbrechen")}</Button>
          </div>
        </div>
      ) : (
        /* Read-only view */
        hasContent ? (
          <div className="space-y-4">
            {notes.participants.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {bp("Participants", "Teilnehmer")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {notes.participants.map((p, i) => (
                      <span key={i} className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">{p}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {notes.agenda && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{bp("Agenda", "Agenda")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{notes.agenda}</p>
                </CardContent>
              </Card>
            )}
            {notes.discussionNotes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{bp("Discussion Notes", "Diskussionsnotizen")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{notes.discussionNotes}</p>
                </CardContent>
              </Card>
            )}
            {notes.decisions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{bp("Decisions Made", "Getroffene Entscheidungen")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{notes.decisions}</p>
                </CardContent>
              </Card>
            )}
            {notes.actionItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                    {bp("Action Items", "Aufgaben")}
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-normal text-muted-foreground">
                      {notes.actionItems.filter(a => !a.done).length}/{notes.actionItems.length} {bp("open", "offen")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {notes.actionItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className={`w-4 h-4 flex items-center justify-center rounded border ${item.done ? "bg-success/20 border-success text-success" : "border-border"}`}>
                        {item.done && <span className="text-[10px]">✓</span>}
                      </span>
                      <span className={`flex-1 ${item.done ? "line-through text-muted-foreground" : "text-card-foreground"}`}>{item.task}</span>
                      {item.responsible && <span className="text-muted-foreground text-xs">→ {item.responsible}</span>}
                      {item.dueDate && <span className="text-muted-foreground text-xs">{new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {bp("No meeting notes recorded yet.", "Noch kein Meeting-Protokoll erfasst.")}
              </p>
              {onUpdateDecision && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  {bp("Add Meeting Notes", "Meeting-Protokoll hinzufügen")}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
