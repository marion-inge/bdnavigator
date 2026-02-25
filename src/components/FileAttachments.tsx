import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, Trash2, FileText, FileSpreadsheet, Presentation, Mail, Image, File, MessageSquare, X, Eye } from "lucide-react";
import { toast } from "sonner";

interface FileRecord {
  id: string;
  opportunity_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  comment: string;
  created_at: string;
}

const BUCKET = "opportunity-files";
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes(".sheet"))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <Presentation className="h-5 w-5 text-orange-500" />;
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileText className="h-5 w-5 text-blue-600" />;
  if (mimeType.includes("message") || mimeType.includes("email") || mimeType.includes("rfc822"))
    return <Mail className="h-5 w-5 text-purple-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

interface Props {
  opportunityId: string;
}

export function FileAttachments({ opportunityId }: Props) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");

  const fetchFiles = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("opportunity_files")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch files:", error);
      return;
    }
    setFiles(data ?? []);
  }, [opportunityId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name}: ${t("filesMaxSize")}`);
          continue;
        }

        const filePath = `${opportunityId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Upload failed: ${file.name}`);
          console.error(uploadError);
          continue;
        }

        const { error: dbError } = await (supabase as any)
          .from("opportunity_files")
          .insert({
            opportunity_id: opportunityId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type || "application/octet-stream",
          });

        if (dbError) {
          console.error("Failed to save file record:", dbError);
          continue;
        }
      }
      await fetchFiles();
      toast.success("Upload complete");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: FileRecord) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.file_path);
    if (data?.publicUrl) {
      window.open(data.publicUrl, "_blank");
    }
  };

  const handlePreview = (file: FileRecord) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.file_path);
    if (data?.publicUrl) {
      setPreviewUrl(data.publicUrl);
      setPreviewType(file.mime_type);
    }
  };

  const handleDelete = async (file: FileRecord) => {
    await supabase.storage.from(BUCKET).remove([file.file_path]);
    await (supabase as any).from("opportunity_files").delete().eq("id", file.id);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    toast.success("File deleted");
  };

  const handleSaveComment = async (fileId: string) => {
    await (supabase as any)
      .from("opportunity_files")
      .update({ comment: commentDraft })
      .eq("id", fileId);
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, comment: commentDraft } : f))
    );
    setEditingComment(null);
    setCommentDraft("");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t("filesTitle")}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{t("filesMaxSize")}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading ? t("filesUploading") : t("filesUpload")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.eml,.msg,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv"
            onChange={handleUpload}
          />
        </div>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t("filesEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="shrink-0 mt-0.5">{getFileIcon(file.mime_type)}</div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground truncate">
                    {file.file_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatSize(file.file_size)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(file.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {/* Comment display/edit */}
                {editingComment === file.id ? (
                  <div className="flex gap-2 items-end mt-1">
                    <Textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder={t("filesCommentPlaceholder")}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="default" className="text-xs h-7" onClick={() => handleSaveComment(file.id)}>
                        {t("filesSave")}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setEditingComment(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : file.comment ? (
                  <p
                    className="text-xs text-muted-foreground italic cursor-pointer hover:text-card-foreground mt-1"
                    onClick={() => { setEditingComment(file.id); setCommentDraft(file.comment); }}
                  >
                    💬 {file.comment}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!editingComment && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    title={t("filesComment")}
                    onClick={() => { setEditingComment(file.id); setCommentDraft(file.comment || ""); }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isPreviewable(file.mime_type) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handlePreview(file)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  title={t("filesDownload")}
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  title={t("filesDelete")}
                  onClick={() => handleDelete(file)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -top-10 right-0 h-8 w-8"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {previewType.startsWith("image/") ? (
              <img src={previewUrl} alt="Preview" className="max-h-[85vh] w-auto mx-auto rounded-lg shadow-2xl" />
            ) : previewType === "application/pdf" ? (
              <iframe src={previewUrl} className="w-full h-[85vh] rounded-lg shadow-2xl bg-white" />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
