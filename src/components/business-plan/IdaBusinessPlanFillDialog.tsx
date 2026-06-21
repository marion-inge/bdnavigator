import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, ChevronRight } from "lucide-react";
import { fetchOpportunityFiles, invokeFunction } from "@/lib/backendAdapter";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import idaRobot from "@/assets/ida-robot.png";
import type { DetailedScoring, StrategicAnalyses } from "@/lib/types";
import { fieldsForGroup, readProposal, type IdaFieldDef, type ProposalGroup } from "@/lib/businessPlanIdaFields";

interface FileRecord {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  scope: ProposalGroup | "all";
  scoring: DetailedScoring;
  strategicAnalyses: StrategicAnalyses;
  context: {
    title?: string;
    description?: string;
    solutionDescription?: string;
    industry?: string;
    geography?: string;
    technology?: string;
  };
  onApply: (next: { scoring: DetailedScoring; sa: StrategicAnalyses }) => void;
}

type Step = "pick" | "running" | "preview";

export function IdaBusinessPlanFillDialog({
  open, onOpenChange, opportunityId, scope, scoring, strategicAnalyses, context, onApply,
}: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => (language === "de" ? de : en);

  const [step, setStep] = useState<Step>("pick");
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [proposal, setProposal] = useState<any>(null);
  const [filesUsed, setFilesUsed] = useState<string[]>([]);

  /** per-field edited proposal value (key = field.path) */
  const [edits, setEdits] = useState<Record<string, string>>({});
  /** per-field accept toggle */
  const [accept, setAccept] = useState<Record<string, boolean>>({});

  const allFields = useMemo(() => fieldsForGroup(scope), [scope]);

  useEffect(() => {
    if (!open) return;
    setStep("pick");
    setProposal(null);
    setEdits({});
    setAccept({});
    setSelectedFiles(new Set());
    setLoadingFiles(true);
    fetchOpportunityFiles(opportunityId).then((res: any) => {
      setFiles((res?.data as FileRecord[]) ?? []);
      setLoadingFiles(false);
    });
  }, [open, opportunityId]);

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAllFiles = () => {
    setSelectedFiles((prev) => (prev.size === files.length ? new Set() : new Set(files.map((f) => f.id))));
  };

  const runExtraction = async () => {
    setStep("running");
    try {
      const { data, error } = await invokeFunction("ida-business-plan-extraction", {
        opportunityId,
        fileIds: Array.from(selectedFiles),
        scope,
        language,
        context,
      });
      if (error || !data || (data as any).error) {
        const msg = (data as any)?.message || (data as any)?.error || (error as any)?.message || "IDA failed";
        toast.error(msg);
        setStep("pick");
        return;
      }
      const prop = (data as any).proposal;
      setProposal(prop);
      setFilesUsed((data as any).filesUsed || []);

      // Pre-populate edits + default acceptance (only fields that came back AND are currently empty)
      const newEdits: Record<string, string> = {};
      const newAccept: Record<string, boolean> = {};
      for (const f of allFields) {
        const proposed = readProposal(prop, f.path);
        if (proposed) {
          newEdits[f.path] = proposed;
          const current = f.get(scoring, strategicAnalyses);
          newAccept[f.path] = !current.trim(); // accept by default only if field is empty
        }
      }
      setEdits(newEdits);
      setAccept(newAccept);
      setStep("preview");
      toast.success(bp(`IDA proposed values for ${Object.keys(newEdits).length} fields`, `IDA hat Werte für ${Object.keys(newEdits).length} Felder vorgeschlagen`));
    } catch (e: any) {
      toast.error(e.message || "IDA failed");
      setStep("pick");
    }
  };

  const handleApply = () => {
    let s = scoring;
    let sa = strategicAnalyses;
    let count = 0;
    for (const f of allFields) {
      if (!accept[f.path]) continue;
      const v = edits[f.path] ?? "";
      if (!v) continue;
      const next = f.apply(s, sa, v);
      s = next.scoring;
      sa = next.sa;
      count++;
    }
    onApply({ scoring: s, sa });
    toast.success(bp(`Applied ${count} fields`, `${count} Felder übernommen`));
    onOpenChange(false);
  };

  // Group fields with proposals by section for the preview
  const sections = useMemo(() => {
    const map = new Map<string, IdaFieldDef[]>();
    for (const f of allFields) {
      if (!(f.path in edits)) continue; // skip fields the AI did not propose
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    }
    return Array.from(map.entries());
  }, [allFields, edits]);

  const proposedCount = Object.keys(edits).length;
  const acceptedCount = Object.values(accept).filter(Boolean).length;

  const scopeLabel = scope === "all" ? bp("entire Business Plan", "gesamten Businessplan")
    : scope === "overview" ? bp("Overview", "Übersicht")
    : scope.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (step !== "running") onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={idaRobot} alt="" className="h-5 w-5" />
            {bp(`Fill ${scopeLabel} with IDA`, `${scopeLabel} mit IDA ausfüllen`)}
          </DialogTitle>
          <DialogDescription>
            {step === "pick" && bp(
              "Select the uploaded files IDA should read. It will propose values for every text field it can support — you review and accept per field before anything is written.",
              "Wählen Sie die hochgeladenen Dateien aus, die IDA lesen soll. IDA schlägt Werte für alle belegbaren Textfelder vor – Sie prüfen und übernehmen pro Feld, bevor etwas geschrieben wird.",
            )}
            {step === "preview" && bp(
              `IDA proposed ${proposedCount} field${proposedCount === 1 ? "" : "s"}. Check the boxes you want to apply. By default, only fields that are currently empty are checked.`,
              `IDA hat ${proposedCount} Felder vorgeschlagen. Aktivieren Sie die Felder, die übernommen werden sollen. Standardmäßig sind nur leere Felder angehakt.`,
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {step === "pick" && (
            <div className="space-y-3 pt-2">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {bp("Loading files...", "Dateien werden geladen...")}
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {bp("No attachments yet. Upload files in the \"Files & Attachments\" tab first.", "Noch keine Anhänge. Laden Sie Dateien zuerst im Tab \"Dateien & Anhänge\" hoch.")}
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <button type="button" onClick={toggleAllFiles} className="text-xs text-primary hover:underline">
                      {selectedFiles.size === files.length ? bp("Deselect all", "Alle abwählen") : bp("Select all", "Alle auswählen")}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {selectedFiles.size} / {files.length} {bp("selected", "ausgewählt")}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {files.map((f) => (
                      <li key={f.id}>
                        <label className="flex items-center gap-2 p-2 rounded border hover:bg-muted/40 cursor-pointer">
                          <Checkbox checked={selectedFiles.has(f.id)} onCheckedChange={() => toggleFile(f.id)} />
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate flex-1">{f.file_name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {Math.round((f.file_size || 0) / 1024)} KB
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {step === "running" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {bp("IDA is reading your documents and proposing field values...", "IDA liest Ihre Dokumente und schlägt Werte vor...")}
              </p>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-5 pt-2">
              {filesUsed.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {bp("Sources:", "Quellen:")} {filesUsed.join(", ")}
                </p>
              )}
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {bp("IDA could not confidently propose any field from the selected documents.", "IDA konnte aus den ausgewählten Dokumenten keine Felder belegen.")}
                </p>
              )}
              {sections.map(([section, fs]) => (
                <div key={section} className="border rounded-md">
                  <div className="px-3 py-2 bg-muted/40 border-b text-sm font-semibold flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    {section}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {fs.filter((f) => accept[f.path]).length} / {fs.length} {bp("selected", "ausgewählt")}
                    </span>
                  </div>
                  <div className="divide-y">
                    {fs.map((f) => {
                      const label = language === "de" ? f.labelDe : f.labelEn;
                      const current = f.get(scoring, strategicAnalyses);
                      const proposed = edits[f.path] ?? "";
                      return (
                        <div key={f.path} className="p-3 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={!!accept[f.path]}
                              onCheckedChange={(v) => setAccept((p) => ({ ...p, [f.path]: !!v }))}
                            />
                            <span className="text-sm font-medium">{label}</span>
                            {current.trim() && (
                              <span className="text-[10px] uppercase tracking-wide text-amber-600 ml-auto">
                                {bp("will overwrite existing", "überschreibt bestehenden")}
                              </span>
                            )}
                          </label>
                          {current.trim() && (
                            <div className="text-xs">
                              <div className="text-muted-foreground mb-0.5">{bp("Current", "Aktuell")}:</div>
                              <div className="p-2 rounded bg-muted/30 border whitespace-pre-wrap text-muted-foreground line-clamp-4">
                                {current}
                              </div>
                            </div>
                          )}
                          <div className="text-xs">
                            <div className="text-muted-foreground mb-0.5">{bp("IDA proposal", "IDA-Vorschlag")}:</div>
                            <Textarea
                              value={proposed}
                              onChange={(e) => setEdits((p) => ({ ...p, [f.path]: e.target.value }))}
                              rows={Math.max(2, Math.min(8, Math.ceil(proposed.length / 100)))}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === "pick" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{bp("Cancel", "Abbrechen")}</Button>
              <Button onClick={runExtraction} disabled={selectedFiles.size === 0} className="gap-2">
                <img src={idaRobot} alt="" className="h-4 w-4" />
                {bp("Run IDA", "IDA ausführen")}
              </Button>
            </>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("pick")}>{bp("Back", "Zurück")}</Button>
              <Button onClick={handleApply} disabled={acceptedCount === 0}>
                {bp(`Apply ${acceptedCount} field${acceptedCount === 1 ? "" : "s"}`, `${acceptedCount} Felder übernehmen`)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
