import { useI18n } from "@/lib/i18n";
import { DetailedScoring, MarketYearValue, StrategicAnalyses } from "@/lib/types";
import type { SomOverviewData, CombinedInterpretation } from "@/lib/businessPlanTypes";
import { createDefaultSomOverview } from "@/lib/businessPlanTypes";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EditableSection } from "@/components/EditableSection";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TrendingUp, Globe, Target, Map } from "lucide-react";

interface Props {
  scoring: DetailedScoring;
  strategicAnalyses?: StrategicAnalyses;
  onSaveStrategic?: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
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

const defaultInterpretation: CombinedInterpretation = {
  overallPotential: "",
  samDevelopment: "",
  somDevelopment: "",
  gapsAndLevers: "",
};

export function CombinedOverview({ scoring, strategicAnalyses, onSaveStrategic, readonly: propReadonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const tamProj = scoring.marketAttractiveness?.analysis?.tamProjections || [];
  const samProj = scoring.marketAttractiveness?.analysis?.samProjections || [];
  const somData: SomOverviewData = (scoring as any).somOverview || createDefaultSomOverview();
  const somProj = somData.projections || [];

  // Interpretation state
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const storedInterp: CombinedInterpretation = (scoring as any).combinedInterpretation || defaultInterpretation;
  const [interp, setInterp] = useState<CombinedInterpretation>(storedInterp);

  // Geographic data aggregation
  const tamRegions = (scoring as any).tamOverview?.geographicalRegions || [];
  const samRegions = (scoring as any).samOverview?.geographicalRegions || [];
  const somRegions = somData.geographicalRegions || [];

  const allRegionNames = [...new Set([
    ...tamRegions.map((r: any) => r.region),
    ...samRegions.map((r: any) => r.region),
    ...somRegions.map((r: any) => r.region),
  ])].filter(Boolean);

  // Chart data
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

  return (
    <div className="space-y-6">

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

      {/* Auto-Calculated Insights */}
      <Card>
        <CardHeader>
          <CardTitle>{bp("Auto-Calculated Insights", "Automatisch berechnete Insights")}</CardTitle>
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
            <p>{bp("Fill in TAM, SAM, and SOM projections to see insights.", "Füllen Sie TAM-, SAM- und SOM-Projektionen aus, um Insights zu sehen.")}</p>
          )}
        </CardContent>
      </Card>

      {/* Editable Interpretation */}
      <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
        <Card>
          <CardHeader>
            <CardTitle>📝 {bp("Interpretation & Key Takeaways", "Interpretation & Kernaussagen")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{bp("How does the overall potential develop?", "Wie entwickelt sich das Gesamtpotenzial?")}</Label>
              <Textarea value={interp.overallPotential} onChange={e => setInterp(prev => ({ ...prev, overallPotential: e.target.value }))} placeholder={bp("Describe the TAM trajectory, growth outlook, market dynamics...", "Beschreiben Sie die TAM-Entwicklung, Wachstumsausblick, Marktdynamik...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("How does the addressable portion (SAM) develop?", "Wie entwickelt sich der adressierbare Teil (SAM)?")}</Label>
              <Textarea value={interp.samDevelopment} onChange={e => setInterp(prev => ({ ...prev, samDevelopment: e.target.value }))} placeholder={bp("SAM trajectory, expansion opportunities, limitations...", "SAM-Entwicklung, Expansionsmöglichkeiten, Limitierungen...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("How does the obtainable portion (SOM) develop?", "Wie entwickelt sich der gewinnbare Teil (SOM)?")}</Label>
              <Textarea value={interp.somDevelopment} onChange={e => setInterp(prev => ({ ...prev, somDevelopment: e.target.value }))} placeholder={bp("SOM trajectory, realistic win rates, competitive positioning...", "SOM-Entwicklung, realistische Gewinnraten, Wettbewerbspositionierung...")} disabled={readonly} rows={3} />
            </div>
            <div>
              <Label>{bp("Where are the biggest gaps and levers?", "Wo liegen die größten Gaps und Hebel?")}</Label>
              <Textarea value={interp.gapsAndLevers} onChange={e => setInterp(prev => ({ ...prev, gapsAndLevers: e.target.value }))} placeholder={bp("Gap between SAM and SOM, key levers to close it, required investments...", "Gap zwischen SAM und SOM, Schlüsselhebel, erforderliche Investitionen...")} disabled={readonly} rows={3} />
            </div>
          </CardContent>
        </Card>
      </EditableSection>

      {/* Geographic Detail */}
      {allRegionNames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Map className="h-4 w-4" /> {bp("Geographic Breakdown", "Geografische Aufschlüsselung")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{bp("Region", "Region")}</TableHead>
                  <TableHead className="text-center">{bp("TAM Size", "TAM-Größe")}</TableHead>
                  <TableHead className="text-center">{bp("SAM Size", "SAM-Größe")}</TableHead>
                  <TableHead className="text-center">{bp("SOM Size", "SOM-Größe")}</TableHead>
                  <TableHead>{bp("Notes", "Anmerkungen")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRegionNames.map((region: string) => {
                  const tamR = tamRegions.find((r: any) => r.region === region);
                  const samR = samRegions.find((r: any) => r.region === region);
                  const somR = somRegions.find((r: any) => r.region === region);
                  return (
                    <TableRow key={region}>
                      <TableCell className="font-medium">{region}</TableCell>
                      <TableCell className="text-center text-blue-600 dark:text-blue-400">{tamR?.marketSize || "–"}</TableCell>
                      <TableCell className="text-center text-emerald-600 dark:text-emerald-400">{samR?.marketSize || "–"}</TableCell>
                      <TableCell className="text-center text-amber-600 dark:text-amber-400">{somR?.marketSize || "–"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{tamR?.notes || samR?.notes || somR?.notes || "–"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
