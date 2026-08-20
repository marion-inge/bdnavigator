import { useState } from "react";
import { Opportunity, calculateTotalScore } from "@/lib/types";
import { invokeFunction } from "@/lib/backendAdapter";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  opportunities: Opportunity[];
}

const STORAGE_KEY = "novi_portfolio_exec_summary";

function buildDigest(opportunities: Opportunity[]) {
  return opportunities.map((o) => {
    const ma = o.businessPlan?.marketAnalysis as any;
    const ic = o.investmentCase as any;
    return {
      title: o.title,
      stage: o.stage,
      score: calculateTotalScore(o.scoring),
      industry: o.industry,
      geography: o.geography,
      technology: o.technology,
      owner: o.owner,
      problem: (o.description || "").slice(0, 400),
      solution: (o.solutionDescription || "").slice(0, 400),
      tam: ma?.tam || "",
      sam: ma?.sam || "",
      marketGrowth: ma?.marketGrowthRate || "",
      npv: ic?.npv ?? null,
      paybackPeriod: ic?.paybackPeriod ?? null,
      lastGate: o.gates?.length ? o.gates[o.gates.length - 1] : null,
      hasBusinessPlan: !!o.businessPlan,
      hasBusinessCase: !!o.investmentCase,
      createdAt: o.createdAt,
    };
  });
}

function buildStats(opportunities: Opportunity[]) {
  const byStage: Record<string, number> = {};
  for (const o of opportunities) byStage[o.stage] = (byStage[o.stage] || 0) + 1;
  const scores = opportunities.map((o) => calculateTotalScore(o.scoring));
  return {
    totalIdeas: opportunities.length,
    byStage,
    averageScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    withBusinessPlan: opportunities.filter((o) => !!o.businessPlan).length,
    withBusinessCase: opportunities.filter((o) => !!o.investmentCase).length,
  };
}

function renderLine(line: string, i: number) {
  if (line.startsWith("## ")) {
    return (
      <h4 key={i} className="text-sm font-semibold text-card-foreground mt-4 first:mt-0">
        {line.replace(/^##\s*/, "")}
      </h4>
    );
  }
  const content = line.replace(/^[-*]\s*/, "");
  const parts = content.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={j} className="font-semibold text-card-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={j}>{p}</span>
    )
  );
  if (/^[-*]\s/.test(line)) {
    return (
      <li key={i} className="ml-4 list-disc text-sm text-muted-foreground leading-relaxed">
        {parts}
      </li>
    );
  }
  if (!line.trim()) return null;
  return (
    <p key={i} className="text-sm text-muted-foreground leading-relaxed">
      {parts}
    </p>
  );
}

export function PortfolioExecutiveSummary({ opportunities }: Props) {
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const [summary, setSummary] = useState<string>(stored?.summary || "");
  const [generatedAt, setGeneratedAt] = useState<string>(stored?.generatedAt || "");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!opportunities.length) {
      toast.error("No ideas to analyse yet.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await invokeFunction("portfolio-executive-summary", {
        digest: buildDigest(opportunities),
        stats: buildStats(opportunities),
      });
      if (error) throw new Error(error.message || "Request failed");
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
      setGeneratedAt(data.generatedAt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ summary: data.summary, generatedAt: data.generatedAt }));
      toast.success("Executive summary generated");
    } catch (e: any) {
      toast.error(e.message || "Could not generate the summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">IDA Executive Summary</h3>
          <p className="text-xs text-muted-foreground">
            Board-ready read across all {opportunities.length} ideas in the portfolio
            {generatedAt ? ` · last generated ${new Date(generatedAt).toLocaleString()}` : ""}
          </p>
        </div>
        <Button size="sm" variant={summary ? "outline" : "default"} onClick={generate} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : summary ? (
            <RefreshCw className="h-4 w-4 mr-1.5" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1.5" />
          )}
          {loading ? "Analysing…" : summary ? "Regenerate" : "Generate with IDA"}
        </Button>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-4 min-h-[120px]">
        {summary ? (
          <div className="space-y-1">{summary.split("\n").map(renderLine)}</div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No summary yet. IDA will read every idea — stage, score, market sizing, business case and gate history — and
            condense the portfolio into a board-ready assessment with top opportunities, risks and recommended decisions.
          </p>
        )}
      </div>
    </div>
  );
}
