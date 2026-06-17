import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

type Framework = "ansoff" | "bcg" | "mckinsey" | "three_horizons";

interface FrameworkResult {
  framework: Framework;
  position?: string;
  horizon?: string;
  description: string;
  rationale: string;
  filesUsed?: string[];
}

interface Props {
  opportunityId: string;
  framework: Framework;
  context?: Record<string, any>;
  onResult: (result: FrameworkResult) => void;
}

export function IdaFrameworkButton({ opportunityId, framework, context, onResult }: Props) {
  const { language } = useI18n();
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ida-framework-analysis", {
        body: { opportunityId, framework, language, context },
      });
      if (error) {
        const msg = (error as any).message || "IDA failed";
        // Try to surface server error message
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
      onResult(data as FrameworkResult);
      const fileNote = data.filesUsed?.length ? ` (${data.filesUsed.length} file${data.filesUsed.length > 1 ? "s" : ""})` : "";
      toast.success(`IDA filled the framework from attachments${fileNote}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "IDA failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" size="sm" variant="secondary" onClick={run} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "IDA analyzing…" : "IDA: Analyze attachments"}
    </Button>
  );
}
