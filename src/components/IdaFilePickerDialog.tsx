import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Loader2 } from "lucide-react";
import { fetchOpportunityFiles } from "@/lib/backendAdapter";
import { useI18n } from "@/lib/i18n";
import idaRobot from "@/assets/ida-robot.png";

interface FileRecord {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  category?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  title?: string;
  /** Called with the selected file ids and names. */
  onConfirm: (fileIds: string[], fileNames: string[]) => void | Promise<void>;
  /** Show a running spinner on the confirm button (parent controls it during the IDA call). */
  running?: boolean;
}

export function IdaFilePickerDialog({ open, onOpenChange, opportunityId, title, onConfirm, running }: Props) {
  const { language } = useI18n();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchOpportunityFiles(opportunityId).then((res: any) => {
      setFiles((res?.data as FileRecord[]) ?? []);
      setLoading(false);
    });
  }, [open, opportunityId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === files.length) setSelected(new Set());
    else setSelected(new Set(files.map((f) => f.id)));
  };

  const handleConfirm = async () => {
    const ids = Array.from(selected);
    const names = files.filter((f) => selected.has(f.id)).map((f) => f.file_name);
    await onConfirm(ids, names);
  };

  const dlgTitle = title || (language === "de" ? "Dateien für IDA auswählen" : "Select files for IDA");
  const emptyLabel = language === "de"
    ? "Noch keine Anhänge vorhanden. Laden Sie Dateien im Tab \"Dateien & Anhänge\" hoch."
    : "No attachments yet. Upload files in the \"Files & Attachments\" tab first.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={idaRobot} alt="" className="h-5 w-5" />
            {dlgTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {language === "de" ? "Lade Dateien..." : "Loading files..."}
            </div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{emptyLabel}</p>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-primary hover:underline"
                >
                  {selected.size === files.length
                    ? (language === "de" ? "Alle abwählen" : "Deselect all")
                    : (language === "de" ? "Alle auswählen" : "Select all")}
                </button>
                <span className="text-xs text-muted-foreground">
                  {selected.size} / {files.length} {language === "de" ? "ausgewählt" : "selected"}
                </span>
              </div>
              <ul className="space-y-1 max-h-[50vh] overflow-y-auto">
                {files.map((f) => (
                  <li key={f.id}>
                    <label className="flex items-center gap-2 p-2 rounded border border-border hover:bg-muted/40 cursor-pointer">
                      <Checkbox
                        checked={selected.has(f.id)}
                        onCheckedChange={() => toggle(f.id)}
                      />
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

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            {language === "de" ? "Abbrechen" : "Cancel"}
          </Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0 || running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src={idaRobot} alt="" className="h-4 w-4" />}
            {running
              ? (language === "de" ? "IDA analysiert..." : "IDA is analyzing...")
              : (language === "de" ? "IDA ausführen" : "Run IDA")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
