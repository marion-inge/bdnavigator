import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X, FileText } from "lucide-react";
import { IdaIdeaExtractButton } from "@/components/IdaIdeaExtractButton";
import { uploadOpportunityFile } from "@/lib/backendAdapter";
import { toast } from "sonner";

const MAX_SIZE = 20 * 1024 * 1024;

export function NewOpportunityDialog() {
  const { t } = useI18n();
  const { addOpportunity } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [geography, setGeography] = useState("");
  const [technology, setTechnology] = useState("");
  const [owner, setOwner] = useState("");
  const [ideaBringer, setIdeaBringer] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(""); setDescription(""); setSolutionDescription("");
    setIndustry(""); setGeography(""); setTechnology("");
    setOwner(""); setIdeaBringer(""); setFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: ${t("filesMaxSize")}`);
        continue;
      }
      next.push(f);
    }
    setFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const created = await addOpportunity({
        title: title.trim(),
        description,
        solutionDescription,
        industry,
        geography,
        technology,
        owner,
        ideaBringer,
      });
      if (files.length > 0 && created?.id) {
        for (const f of files) {
          const { error } = await uploadOpportunityFile(created.id, f, "", "idea");
          if (error) toast.error(`Upload failed: ${f.name}`);
        }
      }
      reset();
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("newOpportunity")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("newOpportunity")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Attachments + IDA */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {t("filesTitle") || "Attachments"}
              </span>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {t("filesUpload") || "Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.json,.md"
                  onChange={handleFileSelect}
                />
                <IdaIdeaExtractButton
                  files={files}
                  onResult={(r) => {
                    if (r.title && !title) setTitle(r.title);
                    if (r.description) setDescription(r.description);
                    if (r.solutionDescription) setSolutionDescription(r.solutionDescription);
                    if (r.industry) setIndustry(r.industry);
                    if (r.geography) setGeography(r.geography);
                    if (r.technology) setTechnology(r.technology);
                  }}
                />
              </div>
            </div>
            {files.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {t("filesEmpty") || "Attach files (PDF, image, text) — IDA can pre-fill the fields."}
              </p>
            ) : (
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-xs bg-background rounded px-2 py-1 border border-border">
                    <span className="flex items-center gap-1.5 truncate">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-muted-foreground shrink-0">({Math.round(f.size / 1024)} KB)</span>
                    </span>
                    <Button type="button" size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => removeFile(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("title")} *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("description")}</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("solutionDescription")}</label>
            <Textarea value={solutionDescription} onChange={(e) => setSolutionDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("industry")}</label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Marine, Aviation" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("geography")}</label>
              <Input value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="e.g. Europe, APAC" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("technology")}</label>
              <Input value={technology} onChange={(e) => setTechnology(e.target.value)} placeholder="e.g. Automotive, Energy, Healthcare" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("ideaBringer")}</label>
              <Input value={ideaBringer} onChange={(e) => setIdeaBringer(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("owner")}</label>
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim() || creating}>
              {creating ? "..." : t("create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
