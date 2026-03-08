import { useI18n } from "@/lib/i18n";
import { DetailedScoring, MarketYearValue, SCORING_WEIGHTS, calculateTotalScore } from "@/lib/types";
import type { SomOverviewData } from "@/lib/businessPlanTypes";
import { createDefaultSomOverview } from "@/lib/businessPlanTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TrendingUp, Globe, Target } from "lucide-react";

interface Props {
  scoring: DetailedScoring;
}

function calcCagr(values: MarketYearValue[]): string {
  const sorted = [...values].sort((a, b) => a.year - b.year);
  if (sorted.length < 2) return "–";
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  if (first <= 0 || last <= 0) return "–";
  const n = sorted.length - 1;
  return `${((Math.pow(last / first, 1 / n) - 1) * 100).toFixed(1)}%`;
}

function formatValue(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
}

export function CombinedOverview({ scoring }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const tamProj = scoring.marketAttractiveness?.analysis?.tamProjections || [];
  const samProj = scoring.marketAttractiveness?.analysis?.samProjections || [];
  const somData: SomOverviewData = (scoring as any).somOverview || createDefaultSomOverview();
  const somProj = somData.projections || [];

  // Build chart data
  const years = [1, 2, 3, 4, 5];
  const chartData = years.map(y => ({
    year: `${bp("Year", "Jahr")} ${y}`,
    TAM: tamProj.find(p => p.year === y)?.value || 0,
    SAM: samProj.find(p => p.year === y)?.value || 0,
    SOM: somProj.find(p => p.year === y)?.value || 0,
  }));

  const hasTamData = tamProj.some(p => p.value > 0);
  const hasSamData = samProj.some(p => p.value > 0);
  const hasSomData = somProj.some(p => p.value > 0);
  const hasAnyData = hasTamData || hasSamData || hasSomData;

  // Scoring overview
  const scoringAsCriteria = {
    marketAttractiveness: { id: "marketAttractiveness", score: scoring.marketAttractiveness.score, comment: "" },
    strategicFit: { id: "strategicFit", score: scoring.strategicFit.score, comment: "" },
    feasibility: { id: "feasibility", score: scoring.feasibility.score, comment: "" },
    commercialViability: { id: "commercialViability", score: scoring.commercialViability.score, comment: "" },
    risk: { id: "risk", score: scoring.risk.score, comment: "" },
  };
  const totalScore = calculateTotalScore(scoringAsCriteria);
  const radarData = [
    { criterion: bp("Market Potential", "Marktpotenzial"), score: scoring.marketAttractiveness.score, fullMark: 5 },
    { criterion: bp("Strategic Fit", "Strateg. Fit"), score: scoring.strategicFit.score, fullMark: 5 },
    { criterion: bp("Feasibility", "Machbarkeit"), score: scoring.feasibility.score, fullMark: 5 },
    { criterion: bp("Commercial", "Kommerziell"), score: scoring.commercialViability.score, fullMark: 5 },
    { criterion: bp("Risk (inv.)", "Risiko (inv.)"), score: 6 - scoring.risk.score, fullMark: 5 },
  ];

  const getScoreColor = (s: number) => {
    if (s >= 4) return "text-green-600 dark:text-green-400";
    if (s >= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };
  const getScoreBg = (s: number) => {
    if (s >= 4) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    if (s >= 3) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className={`rounded-xl border-2 p-6 text-center ${getScoreBg(totalScore)}`}>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {bp("Business Plan Score", "Business Plan Score")}
        </span>
        <p className={`text-5xl font-bold mt-2 ${getScoreColor(totalScore)}`}>{totalScore.toFixed(1)}</p>
        <p className="text-sm text-muted-foreground mt-1">/ 5.0</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase">TAM CAGR</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calcCagr(tamProj)}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase">SAM CAGR</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{calcCagr(samProj)}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground uppercase">SOM CAGR</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{calcCagr(somProj)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{bp("TAM – SAM – SOM Development (5 Years)", "TAM – SAM – SOM Entwicklung (5 Jahre)")}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyData ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : `${v}`} />
                  <Tooltip formatter={(v: number) => formatValue(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="TAM" stackId="0" stroke="hsl(210, 80%, 55%)" fill="hsl(210, 80%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="SAM" stackId="0" stroke="hsl(160, 70%, 45%)" fill="hsl(160, 70%, 45%)" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="SOM" stackId="0" stroke="hsl(40, 85%, 50%)" fill="hsl(40, 85%, 50%)" fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {bp("Enter TAM, SAM, and SOM projections to see the chart.", "Tragen Sie TAM-, SAM- und SOM-Projektionen ein, um die Grafik zu sehen.")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Radar */}
        <Card>
          <CardHeader>
            <CardTitle>{bp("Scoring Radar", "Scoring-Radar")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{bp("5-Year Market Projections", "5-Jahres-Marktprojektionen")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                {years.map(y => <TableHead key={y} className="text-center">{bp("Year", "Jahr")} {y}</TableHead>)}
                <TableHead className="text-center">CAGR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-blue-600 dark:text-blue-400">TAM</TableCell>
                {years.map(y => <TableCell key={y} className="text-center">{formatValue(tamProj.find(p => p.year === y)?.value || 0)}</TableCell>)}
                <TableCell className="text-center font-semibold">{calcCagr(tamProj)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">SAM</TableCell>
                {years.map(y => <TableCell key={y} className="text-center">{formatValue(samProj.find(p => p.year === y)?.value || 0)}</TableCell>)}
                <TableCell className="text-center font-semibold">{calcCagr(samProj)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-amber-600 dark:text-amber-400">SOM</TableCell>
                {years.map(y => <TableCell key={y} className="text-center">{formatValue(somProj.find(p => p.year === y)?.value || 0)}</TableCell>)}
                <TableCell className="text-center font-semibold">{calcCagr(somProj)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>{bp("Key Insights", "Wesentliche Erkenntnisse")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {hasTamData && hasSamData && (
            <p>📊 {bp(
              `SAM represents ${samProj[0]?.value && tamProj[0]?.value ? ((samProj[0].value / tamProj[0].value) * 100).toFixed(1) : "–"}% of TAM in Year 1.`,
              `SAM repräsentiert ${samProj[0]?.value && tamProj[0]?.value ? ((samProj[0].value / tamProj[0].value) * 100).toFixed(1) : "–"}% des TAM in Jahr 1.`,
            )}</p>
          )}
          {hasSamData && hasSomData && (
            <p>🎯 {bp(
              `SOM target is ${somProj[0]?.value && samProj[0]?.value ? ((somProj[0].value / samProj[0].value) * 100).toFixed(1) : "–"}% of SAM in Year 1.`,
              `SOM-Ziel ist ${somProj[0]?.value && samProj[0]?.value ? ((somProj[0].value / samProj[0].value) * 100).toFixed(1) : "–"}% des SAM in Jahr 1.`,
            )}</p>
          )}
          {!hasAnyData && (
            <p>{bp(
              "Fill in TAM, SAM, and SOM projections in the respective overview pages to see insights here.",
              "Füllen Sie die TAM-, SAM- und SOM-Projektionen in den jeweiligen Übersichtsseiten aus, um hier Erkenntnisse zu sehen.",
            )}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
