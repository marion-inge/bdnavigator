import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ImplementReview, ChecklistItem, createDefaultImplementReview } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw } from "lucide-react";

interface Props {
  implementReview?: ImplementReview;
  onSave: (ir: ImplementReview) => void;
  readonly?: boolean;
}

export function ImplementReviewSection({ implementReview, onSave, readonly }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<ImplementReview>(implementReview || createDefaultImplementReview());

  const update = (updated: ImplementReview) => {
    setData(updated);
    onSave(updated);
  };

  const addChecklistItem = () => {
    update({ ...data, checklist: [...data.checklist, { id: crypto.randomUUID(), text: "", done: false }] });
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    update({ ...data, checklist: data.checklist.map((item) => (item.id === id ? { ...item, ...updates } : item)) });
  };

  const removeChecklistItem = (id: string) => {
    update({ ...data, checklist: data.checklist.filter((item) => item.id !== id) });
  };

  const statusOptions = [
    { value: "not_started", label: t("irStatusNotStarted") },
    { value: "in_progress", label: t("irStatusInProgress") },
    { value: "on_hold", label: t("irStatusOnHold") },
    { value: "completed", label: t("irStatusCompleted") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">{t("irTitle")}</h2>
      </div>

      {/* Status & Review */}
      <Card>
        <CardHeader><CardTitle>{t("irStatusReview")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t("irStatus")}</Label>
              <Select value={data.status} onValueChange={(v) => update({ ...data, status: v })} disabled={readonly}>
                <SelectTrigger><SelectValue placeholder={t("irStatus")} /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("irReviewDate")}</Label>
              <Input type="date" value={data.reviewDate} onChange={(e) => update({ ...data, reviewDate: e.target.value })} disabled={readonly} />
            </div>
            <div>
              <Label>{t("irReviewOutcome")}</Label>
              <Input value={data.reviewOutcome} onChange={(e) => update({ ...data, reviewOutcome: e.target.value })} placeholder={t("irReviewOutcomePlaceholder")} disabled={readonly} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Learnings */}
      <Card>
        <CardHeader><CardTitle>{t("irProgressLearnings")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("irProgressNotes")}</Label>
            <Textarea value={data.progressNotes} onChange={(e) => update({ ...data, progressNotes: e.target.value })}
              placeholder={t("irProgressNotesPlaceholder")} disabled={readonly} rows={4} />
          </div>
          <div>
            <Label>{t("irLessonsLearned")}</Label>
            <Textarea value={data.lessonsLearned} onChange={(e) => update({ ...data, lessonsLearned: e.target.value })}
              placeholder={t("irLessonsLearnedPlaceholder")} disabled={readonly} rows={4} />
          </div>
          <div>
            <Label>{t("irNextSteps")}</Label>
            <Textarea value={data.nextSteps} onChange={(e) => update({ ...data, nextSteps: e.target.value })}
              placeholder={t("irNextStepsPlaceholder")} disabled={readonly} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("irChecklist")}</CardTitle>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addChecklistItem} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> {t("irAddItem")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.checklist.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("irNoItems")}</p>
          ) : (
            data.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) => updateChecklistItem(item.id, { done: !!checked })}
                  disabled={readonly}
                />
                <Input
                  value={item.text}
                  onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                  placeholder={t("irItemPlaceholder")}
                  disabled={readonly}
                  className={`flex-1 ${item.done ? "line-through text-muted-foreground" : ""}`}
                />
                {!readonly && (
                  <Button variant="ghost" size="icon" onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))
          )}
          {data.checklist.length > 0 && (
            <div className="pt-2 text-xs text-muted-foreground">
              {data.checklist.filter((i) => i.done).length}/{data.checklist.length} {t("irCompleted")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle>{t("irNotes")}</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.notes} onChange={(e) => update({ ...data, notes: e.target.value })}
            placeholder={t("irNotesPlaceholder")} disabled={readonly} rows={5} />
        </CardContent>
      </Card>
    </div>
  );
}
