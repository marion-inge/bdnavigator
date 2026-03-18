import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { invokeFunction } from "@/lib/backendAdapter";
import { toast } from "sonner";
import markRobot from "@/assets/mark-robot.png";

export type ResearchType = "pestel" | "porter" | "tam" | "competitor";

interface OpportunityContext {
  title: string;
  description: string;
  solutionDescription?: string;
  industry: string;
  geography: string;
  technology: string;
}

interface Props {
  researchType: ResearchType;
  titleEn: string;
  titleDe: string;
  descriptionEn: string;
  descriptionDe: string;
  opportunity: OpportunityContext;
  extra?: Record<string, string>;
  onResult?: (content: string, citations: string[]) => void;
}

export function MarkWebSearch({
  researchType, titleEn, titleDe, descriptionEn, descriptionDe,
  opportunity, extra, onResult,
}: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; citations: string[] } | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mark-web-research", {
        body: {
          researchType,
          opportunity,
          extra,
          language: language as "en" | "de",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult({ content: data.content, citations: data.citations || [] });
      onResult?.(data.content, data.citations || []);
      toast.success(bp("Research completed!", "Recherche abgeschlossen!"));
    } catch (err: any) {
      console.error("Mark web search error:", err);
      toast.error(bp("Research failed. Please try again.", "Recherche fehlgeschlagen. Bitte erneut versuchen."));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-agent-mark/40 bg-agent-mark-light p-6 space-y-4">
      <div className="flex flex-col items-center text-center gap-3">
        <img src={markRobot} alt="Mark" className="w-16 h-16" />
        <div>
          <h3 className="font-semibold text-card-foreground">
            Mark – {bp(titleEn, titleDe)}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {bp(descriptionEn, descriptionDe)}
          </p>
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          variant="outline"
          className="mt-2 border-agent-mark/30 text-agent-mark hover:bg-agent-mark/10"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{bp("Researching…", "Recherchiere…")}</>
          ) : result ? (
            <><Search className="h-4 w-4 mr-2" />{bp("Research Again", "Erneut recherchieren")}</>
          ) : (
            <><Search className="h-4 w-4 mr-2" />{bp("Start Research", "Recherche starten")}</>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <img src={markRobot} alt="" className="h-3.5 w-3.5" />
          Mark – Market Researcher
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm font-semibold text-card-foreground hover:text-primary transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {bp("Research Results", "Recherche-Ergebnisse")}
            </button>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? bp("Copied", "Kopiert") : bp("Copy", "Kopieren")}
            </Button>
          </div>

          {expanded && (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {result.content}
              </div>

              {result.citations.length > 0 && (
                <div className="border-t border-border pt-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">{bp("Sources", "Quellen")}:</p>
                  <ul className="space-y-1">
                    {result.citations.map((url, i) => (
                      <li key={i} className="text-xs">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 break-all"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
