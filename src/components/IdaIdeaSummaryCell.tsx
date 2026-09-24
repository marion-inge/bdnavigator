import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Opportunity, calculateTotalScore } from "@/lib/types";

export interface IdeaSummary {
  status: string;
  openSteps: string[];
  recommendation: string;
  verdict: string;
  createdAt?: string;
}

export function buildSnapshot(opp: Opportunity) {
  const o: any = opp;
  const sa = o.strategicAnalyses?.sam || {};
  const count = (v: any) => (Array.isArray(v) ? v.length : 0);
  return {
    title: opp.title,
    description: (opp.description || "").slice(0, 500),
    stage: opp.stage,
    gates: (opp.gates || []).map((g: any) => ({ gate: g.gate, decision: g.decision, date: g.date })),
    ideaScore: Number(calculateTotalScore(opp.scoring).toFixed(1)),
    scanPackDone: o.scanPack ? Object.values(o.scanPack).filter((s: any) => s?.status === "done").length : 0,
    scanPackTotal: 6,
    tam: o.businessPlan?.marketAttractiveness?.analysis?.tam || null,
    sam: o.businessPlan?.marketAttractiveness?.analysis?.sam || null,
    somProjections: o.businessPlan?.somOverview?.projections || null,
    customerInterviews: count(sa.customerInterviewing?.interviews ?? sa.customerInterviewing),
    affiliateInterviews: count(sa.internalAffiliateInterviews?.interviews ?? sa.internalAffiliateInterviews),
    buInterviews: count(sa.internalBUInterviews?.interviews ?? sa.internalBUInterviews),
    hasInvestmentCase: !!o.investmentCase,
    businessCase: o.businessCase ? { npv: o.businessCase.npv, roi: o.businessCase.roi, investment: o.businessCase.investmentCost } : null,
    hasGoToMarket: !!o.goToMarketPlan,
  };
}

export async function runIdaSummary(opp: Opportunity, language: string): Promise<IdeaSummary> {
  const { data, error } = await supabase.functions.invoke("ida-idea-status-summary", {
    body: { language, snapshot: buildSnapshot(opp) },
  });
  if (error || data?.error) throw new Error(data?.error || error?.message);
  const s: IdeaSummary = data;
  await supabase.from("ai_assessments").insert({
    opportunity_id: opp.id,
    basis: "status_summary",
    summary: s.status,
    next_steps: s.openSteps,
    strengths: [s.recommendation],
    overall_rating: s.verdict,
  });
  return { ...s, createdAt: new Date().toISOString() };
}

const verdictCls: Record<string, string> = {
  go: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
  not_pursue: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]",
  stop: "bg-destructive/15 text-destructive",
};

export function IdaIdeaSummaryCell({
  opp, summary, language, onDone,
}: { opp: Opportunity; summary?: IdeaSummary; language: string; onDone: (s: IdeaSummary) => void }) {
  const [loading, setLoading] = useState(false);
  const de = language === "de";
  const run = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      onDone(await runIdaSummary(opp, language));
    } catch (err: any) {
      toast.error(de ? `IDA fehlgeschlagen: ${err.message}` : `IDA failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  if (!summary) {
    return (
      <Button size="sm" variant="outline" onClick={run} disabled={loading} className="h-7 text-xs">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Run IDA"}
      </Button>
    );
  }
  const verdictLabel = { go: "Go", not_pursue: de ? "Nicht weiterverfolgen" : "Do not pursue", stop: "Stop" }[summary.verdict] || summary.verdict;
  return (
    <div className="text-xs space-y-1 w-[340px] whitespace-normal" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2">
        <span className={`px-1.5 py-0.5 rounded font-semibold ${verdictCls[summary.verdict] || "bg-muted"}`}>{verdictLabel}</span>
        <button onClick={run} disabled={loading} className="text-muted-foreground hover:text-foreground" title={de ? "IDA erneut ausführen" : "Re-run IDA"}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </button>
      </div>
      <p className="text-card-foreground"><span className="font-semibold">{de ? "Status: " : "Status: "}</span>{summary.status}</p>
      {summary.openSteps?.length > 0 && (
        <div>
          <span className="font-semibold text-card-foreground">{de ? "Offene Schritte:" : "Open steps:"}</span>
          <ul className="list-disc pl-4 text-muted-foreground">
            {summary.openSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      <p className="text-card-foreground"><span className="font-semibold">{de ? "Empfehlung: " : "Recommendation: "}</span>{summary.recommendation}</p>
    </div>
  );
}
