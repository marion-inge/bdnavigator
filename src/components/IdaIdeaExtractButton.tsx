import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import idaRobot from "@/assets/ida-robot.png";

export interface ExtractedIdea {
  title?: string;
  description?: string;
  solutionDescription?: string;
  industry?: string;
  geography?: string;
  technology?: string;
  filesUsed?: string[];
}

interface Props {
  /** Inline files (used before opportunity exists, e.g. New Opportunity dialog). */
  files?: File[];
  /** Saved opportunity to pull files from category "idea". */
  opportunityId?: string;
  category?: string;
  onResult: (r: ExtractedIdea) => void;
  size?: "sm" | "default";
  className?: string;
}

async function fileToBase64(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK) as any);
  }
  return btoa(bin);
}

export function IdaIdeaExtractButton({ files, opportunityId, category, onResult, size = "sm", className }: Props) {
  const { language } = useI18n();
  const [loading, setLoading] = useState(false);

  const disabled = loading || ((!files || files.length === 0) && !opportunityId);

  const run = async () => {
    setLoading(true);
    try {
      let body: any = { language };
      if (files && files.length > 0) {
        const encoded = await Promise.all(
          files.map(async (f) => ({ name: f.name, mime: f.type, dataBase64: await fileToBase64(f) }))
        );
        body.files = encoded;
      } else if (opportunityId) {
        body.opportunityId = opportunityId;
        body.category = category || "idea";
      }

      const { data, error } = await supabase.functions.invoke("ida-idea-extraction", { body });
      if (error) {
        const msg = (error as any).message || "IDA failed";
        try {
          const ctx = (error as any).context;
          if (ctx?.body) {
            const parsed = typeof ctx.body === "string" ? JSON.parse(ctx.body) : ctx.body;
            toast.error(parsed.message || parsed.error || msg);
            return;
          }
        } catch {}
        toast.error(msg);
        return;
      }
      if (!data || data.error) {
        toast.error(data?.message || data?.error || "IDA failed");
        return;
      }
      onResult(data as ExtractedIdea);
      const n = data.filesUsed?.length || 0;
      toast.success(
        language === "de"
          ? `IDA hat die Felder aus ${n} Datei${n === 1 ? "" : "en"} extrahiert`
          : `IDA extracted fields from ${n} file${n === 1 ? "" : "s"}`
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "IDA failed");
    } finally {
      setLoading(false);
    }
  };

  const askLabel = language === "de" ? "IDA ausfüllen lassen" : "Fill with IDA";
  const loadingLabel = language === "de" ? "IDA analysiert..." : "IDA is analyzing...";

  return (
    <Button
      type="button"
      size={size}
      onClick={run}
      disabled={disabled}
      className={`bg-primary hover:bg-primary/90 text-primary-foreground gap-2 ${className ?? ""}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src={idaRobot} alt="" className="h-4 w-4" />}
      {loading ? loadingLabel : askLabel}
    </Button>
  );
}
