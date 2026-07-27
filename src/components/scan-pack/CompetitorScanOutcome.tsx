import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Loader2, RefreshCw, Swords, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { ScanFileMeta } from "@/lib/scanPackTypes";
import { parseCompetitorXlsx, CompetitorScanData } from "@/lib/competitorScanParse";
import { parseCustomerDocx, DocxSection } from "@/lib/customerScanParse";

const BUCKET = "scan-deliverables";

const TIER_COLORS: Record<string, string> = {
  A: "hsl(0, 74%, 55%)",       // Tier A = strongest rivals — red
  B: "hsl(25, 90%, 55%)",
  C: "hsl(45, 93%, 47%)",
  D: "hsl(215, 15%, 55%)",
};

const MOMENTUM_COLORS: Record<string, string> = {
  GAINING: "hsl(142, 71%, 42%)",
  HOLDING: "hsl(215, 15%, 55%)",
  LOSING: "hsl(0, 74%, 55%)",
};

const SCORE_META: Record<string, { color: string; label: string }> = {
  "++": { color: "hsl(142, 71%, 42%)", label: "competitor clearly superior" },
  "+":  { color: "hsl(142, 55%, 55%)", label: "competitor superior" },
  "=":  { color: "hsl(210, 15%, 75%)", label: "parity" },
  "-":  { color: "hsl(25, 90%, 60%)",  label: "competitor inferior" },
  "--": { color: "hsl(0, 74%, 55%)",   label: "competitor clearly inferior" },
  "?":  { color: "hsl(215, 15%, 75%)", label: "unknown" },
};

interface Props {
  files: ScanFileMeta[];
}

export function CompetitorScanOutcome({ files }: Props) {
  const { language } = useI18n();
  const L = <T,>(en: T, de: T) => (language === "de" ? de : en);

  const xlsxFile = useMemo(
    () => files.find((f) => /\.xlsx$/i.test(f.name) || /spreadsheet/i.test(f.mime)),
    [files],
  );
  const docxFile = useMemo(
    () => files.find((f) => /\.docx$/i.test(f.name) || /wordprocessingml/i.test(f.mime)),
    [files],
  );

  const [data, setData] = useState<CompetitorScanData | null>(null);
  const [docxData, setDocxData] = useState<DocxSection[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (xlsxFile) {
        const { data: blob, error } = await supabase.storage.from(BUCKET).download(xlsxFile.path);
        if (error) throw error;
        setData(await parseCompetitorXlsx(blob));
      } else setData(null);
      if (docxFile) {
        const { data: blob, error } = await supabase.storage.from(BUCKET).download(docxFile.path);
        if (error) throw error;
        setDocxData(await parseCustomerDocx(blob));
      } else setDocxData(null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to parse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsxFile?.id, docxFile?.id]);

  if (!xlsxFile && !docxFile) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        {L(
          "Upload the Competitor Scan deliverables (Excel database + Word report) in the Scan Pack to see the outcome here.",
          "Bitte die Competitor-Scan-Deliverables (Excel-Datenbank + Word-Bericht) im Scan Pack hochladen, um das Ergebnis hier zu sehen.",
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Swords className="h-5 w-5" />
            {L("Competitor Scan Outcome", "Competitor-Scan-Ergebnis")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {L(
              "Benchmarked competitive landscape, market share, trends and strategic frameworks.",
              "Benchmarkte Wettbewerbslandschaft, Marktanteile, Trends und strategische Frameworks.",
            )}
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {L("Re-parse", "Neu einlesen")}
        </Button>
      </div>

      {loading && !data && !docxData && (
        <div className="text-xs text-muted-foreground italic">{L("Parsing deliverables…", "Lese Deliverables ein…")}</div>
      )}

      {(data || docxData) && (
        <Tabs defaultValue={data ? "overview" : "report"} className="space-y-3">
          <TabsList className="flex flex-wrap h-auto">
            {data && <TabsTrigger value="overview" className="text-xs">{L("Overview", "Überblick")}</TabsTrigger>}
            {data?.competitors.length ? <TabsTrigger value="competitors" className="text-xs">{L("Competitors", "Wettbewerber")}</TabsTrigger> : null}
            {data?.benchmarking.criteria.length ? <TabsTrigger value="benchmark" className="text-xs">{L("Benchmark", "Benchmark")}</TabsTrigger> : null}
            {data?.marketShare.length ? <TabsTrigger value="share" className="text-xs">{L("Market share", "Marktanteil")}</TabsTrigger> : null}
            {data?.winRate.length ? <TabsTrigger value="winrate" className="text-xs">{L("Win-rate", "Win-Rate")}</TabsTrigger> : null}
            {data?.trends.length ? <TabsTrigger value="trends" className="text-xs">{L("Trends", "Trends")}</TabsTrigger> : null}
            {data?.watch.length ? <TabsTrigger value="watch" className="text-xs">{L("Watch list", "Watchlist")}</TabsTrigger> : null}
            {data?.assumptions.length ? <TabsTrigger value="assumptions" className="text-xs">{L("Assumptions", "Annahmen")}</TabsTrigger> : null}
            {docxData && <TabsTrigger value="report" className="text-xs">{L("Report", "Bericht")}</TabsTrigger>}
          </TabsList>

          {data && (
            <TabsContent value="overview" className="m-0"><OverviewView data={data} L={L} /></TabsContent>
          )}
          {data && (
            <TabsContent value="competitors" className="m-0"><CompetitorsView data={data} L={L} /></TabsContent>
          )}
          {data && (
            <TabsContent value="benchmark" className="m-0"><BenchmarkView data={data} L={L} /></TabsContent>
          )}
          {data && (
            <TabsContent value="share" className="m-0"><MarketShareView data={data} L={L} /></TabsContent>
          )}
          {data && (
            <TabsContent value="winrate" className="m-0"><WinRateView data={data} L={L} /></TabsContent>
          )}
          {data && (
            <TabsContent value="trends" className="m-0"><TrendsView data={data} L={L} /></TabsContent>
          )}
          {data?.watch.length ? (
            <TabsContent value="watch" className="m-0"><WatchView data={data} L={L} /></TabsContent>
          ) : null}
          {data?.assumptions.length ? (
            <TabsContent value="assumptions" className="m-0"><AssumptionsView data={data} L={L} /></TabsContent>
          ) : null}
          {docxData && (
            <TabsContent value="report" className="m-0"><ReportView sections={docxData} L={L} /></TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

// ============================================================================

function OverviewView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  const shortlist = data.competitors.filter((c) => c.isShortlist);
  const tierA = shortlist.filter((c) => c.tier === "A").length;
  const gaining = shortlist.filter((c) => c.momentum === "GAINING").length;
  const camps = new Set(shortlist.map((c) => c.camp).filter(Boolean)).size;

  const tierData = ["A", "B", "C", "D"].map((t) => ({ tier: t, count: shortlist.filter((c) => c.tier === t).length }));
  const campData = Object.entries(
    shortlist.reduce<Record<string, number>>((m, c) => { const k = c.camp || "—"; m[k] = (m[k] || 0) + 1; return m; }, {}),
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const momData = Object.entries(
    shortlist.reduce<Record<string, number>>((m, c) => { const k = c.momentum || "—"; m[k] = (m[k] || 0) + 1; return m; }, {}),
  ).map(([name, value]) => ({ name, value }));

  const PIE = ["hsl(210, 80%, 55%)", "hsl(160, 65%, 45%)", "hsl(45, 90%, 55%)", "hsl(280, 60%, 60%)", "hsl(0, 70%, 60%)", "hsl(190, 70%, 45%)"];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Kpi label={L("Shortlist (deep)", "Shortlist (deep)")} value={shortlist.length} />
        <Kpi label={L("Tier A rivals", "Tier-A-Rivalen")} value={tierA} tone="danger" />
        <Kpi label={L("GAINING momentum", "GAINING-Momentum")} value={gaining} tone="success" />
        <Kpi label={L("Strategic camps", "Strateg. Camps")} value={camps} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card className="p-3">
          <div className="text-xs font-medium mb-2">{L("Tier distribution", "Tier-Verteilung")}</div>
          <DistList
            rows={tierData.map((d) => ({ label: `Tier ${d.tier}`, value: d.count, color: TIER_COLORS[d.tier] }))}
            total={shortlist.length}
          />
        </Card>
        <Card className="p-3">
          <div className="text-xs font-medium mb-2">{L("By strategic camp", "Nach strateg. Camp")}</div>
          <DistList
            rows={campData.map((d, i) => ({ label: d.name, value: d.value, color: PIE[i % PIE.length] }))}
            total={shortlist.length}
          />
        </Card>
        <Card className="p-3">
          <div className="text-xs font-medium mb-2">{L("Momentum mix", "Momentum-Mix")}</div>
          <DistList
            rows={momData.map((d, i) => ({ label: d.name, value: d.value, color: MOMENTUM_COLORS[d.name] || PIE[i % PIE.length] }))}
            total={shortlist.length}
          />
        </Card>
      </div>

      {data.marketShareContext.length > 0 && (
        <Card className="p-3 space-y-2">
          <div className="text-xs font-semibold flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {L("Niche denominator context", "Nischen-Nenner (Kontext)")}</div>
          {data.marketShareContext.map((c, i) => (
            <div key={i} className="text-[11px]">
              <span className="font-medium">{c.label}: </span>
              <span className="text-muted-foreground whitespace-pre-wrap">{c.value}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: "success" | "danger" }) {
  const cls = tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : "";
  return (
    <Card className="p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${cls}`}>{value}</div>
    </Card>
  );
}

// ============================================================================

function CompetitorsView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [campFilter, setCampFilter] = useState<string>("all");
  const [momFilter, setMomFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"shortlist" | "all">("shortlist");

  const rows = data.competitors.filter((c) => scope === "all" || c.isShortlist);
  const camps = Array.from(new Set(rows.map((c) => c.camp).filter(Boolean))).sort();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (c) =>
        (tierFilter === "all" || c.tier === tierFilter) &&
        (campFilter === "all" || c.camp === campFilter) &&
        (momFilter === "all" || c.momentum === momFilter) &&
        (!q || c.company.toLowerCase().includes(q) || c.hq.toLowerCase().includes(q) || c.overlap.toLowerCase().includes(q)),
    );
  }, [rows, tierFilter, campFilter, momFilter, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={scope} onValueChange={(v) => setScope(v as any)}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="shortlist">{L("Shortlist (deep)", "Shortlist (deep)")}</SelectItem>
            <SelectItem value="all">{L("All (incl. watch pre-list)", "Alle (inkl. Vorliste)")}</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder={L("Search company, HQ, overlap…", "Firma, HQ, Overlap suchen…")}
               value={search} onChange={(e) => setSearch(e.target.value)}
               className="h-8 text-xs max-w-[260px]" />
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All tiers", "Alle Tiers")}</SelectItem>
            {["A", "B", "C", "D"].map((t) => <SelectItem key={t} value={t}>Tier {t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={campFilter} onValueChange={setCampFilter}>
          <SelectTrigger className="h-8 w-[220px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All camps", "Alle Camps")}</SelectItem>
            {camps.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={momFilter} onValueChange={setMomFilter}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All momentum", "Alle Momentum")}</SelectItem>
            {["GAINING", "HOLDING", "LOSING"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">{filtered.length} / {rows.length}</span>
      </div>

      <div className="max-h-[500px] overflow-auto border border-border rounded">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[60px]">Tier</TableHead>
              <TableHead>{L("Company", "Unternehmen")}</TableHead>
              <TableHead>{L("Camp", "Camp")}</TableHead>
              <TableHead className="w-[120px]">HQ</TableHead>
              <TableHead className="w-[110px]">{L("Momentum", "Momentum")}</TableHead>
              <TableHead className="w-[60px]">O</TableHead>
              <TableHead className="w-[60px]">P</TableHead>
              <TableHead className="w-[60px]">E</TableHead>
              <TableHead>{L("Overlap vs reference", "Overlap ggü. Referenz")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, i) => (
              <TableRow key={`${c.company}-${i}`}>
                <TableCell>
                  {c.tier ? (
                    <Badge style={{ backgroundColor: TIER_COLORS[c.tier] || "hsl(var(--muted))", color: "white" }} className="text-xs px-2">
                      {c.tier}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell className="font-medium text-xs">{c.company}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.camp}</TableCell>
                <TableCell className="text-xs">{c.hq}</TableCell>
                <TableCell>
                  {c.momentum ? (
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: MOMENTUM_COLORS[c.momentum] || undefined }}>
                      {c.momentum === "GAINING" ? <TrendingUp className="h-3 w-3" />
                       : c.momentum === "LOSING" ? <TrendingDown className="h-3 w-3" />
                       : <Minus className="h-3 w-3" />}
                      {c.momentum}
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-xs">{c.O ?? "—"}</TableCell>
                <TableCell className="text-xs">{c.P ?? "—"}</TableCell>
                <TableCell className="text-xs">{c.E ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[360px]">{c.overlap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================================

function BenchmarkView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  const { competitors, criteria } = data.benchmarking;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-muted-foreground mr-1">{L("Legend:", "Legende:")}</span>
        {(["++", "+", "=", "-", "--", "?"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded" style={{ background: SCORE_META[s].color }} />
            <span className="font-mono">{s}</span>
            <span className="text-muted-foreground">{s === "=" ? L("parity", "Parität") : L(SCORE_META[s].label, SCORE_META[s].label)}</span>
          </span>
        ))}
      </div>
      <div className="max-h-[600px] overflow-auto border border-border rounded">
        <table className="w-full text-[10px]">
          <thead className="sticky top-0 bg-background z-10">
            <tr>
              <th className="text-left p-1.5 border-b border-border sticky left-0 bg-background min-w-[260px]">{L("Criterion", "Kriterium")}</th>
              <th className="text-left p-1.5 border-b border-border sticky left-[260px] bg-background w-[80px]">{L("Cat.", "Kat.")}</th>
              {competitors.map((c) => (
                <th key={c} className="p-1 border-b border-border text-[9px] font-medium align-bottom" style={{ minWidth: 60 }}>
                  <div className="rotate-[-45deg] origin-bottom-left whitespace-nowrap translate-y-[-4px] w-4 h-24">{c}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="p-1.5 sticky left-0 bg-background font-medium">{row.criterion}</td>
                <td className="p-1.5 sticky left-[260px] bg-background text-muted-foreground">{row.category}</td>
                {competitors.map((c) => {
                  const s = row.scores[c] || "";
                  const meta = SCORE_META[s];
                  return (
                    <td key={c} className="p-0 text-center align-middle">
                      <div title={`${c}: ${s}${meta ? " (" + meta.label + ")" : ""}`}
                           className="w-full h-6 flex items-center justify-center font-mono font-bold text-white text-[10px]"
                           style={{ background: meta?.color || "transparent", color: s === "=" ? "hsl(var(--foreground))" : "white" }}>
                        {s}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================

function MarketShareView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  // Parse midpoints of "10-16%" style ranges
  const parsed = data.marketShare.map((r) => {
    const m = r.share.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
    let mid: number | null = null;
    if (m) mid = (parseFloat(m[1]) + parseFloat(m[2])) / 2;
    else {
      const single = r.share.match(/(\d+(?:\.\d+)?)/);
      if (single) mid = parseFloat(single[1]);
    }
    return { ...r, mid };
  });
  const chartData = parsed
    .filter((r) => r.mid !== null && !/^avl/i.test(r.competitor))
    .sort((a, b) => (b.mid! - a.mid!))
    .slice(0, 12)
    .map((r) => ({ name: r.competitor.length > 32 ? r.competitor.slice(0, 30) + "…" : r.competitor, mid: r.mid, share: r.share }));

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="text-xs font-semibold mb-2">{L("Share midpoint (% of niche denominator)", "Anteil-Mittelwert (% des Nischen-Nenners)")}</div>
        <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 26)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={220} />
            <Tooltip formatter={(_v: any, _n, p: any) => [p.payload.share, L("Share range", "Anteil")]} />
            <Bar dataKey="mid" fill="hsl(210, 80%, 55%)" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{L("Competitor / group", "Wettbewerber / Gruppe")}</TableHead>
              <TableHead className="w-[110px]">{L("Share", "Anteil")}</TableHead>
              <TableHead className="w-[120px]">{L("Method", "Methode")}</TableHead>
              <TableHead className="w-[70px]">{L("Conf.", "Konf.")}</TableHead>
              <TableHead>{L("Basis", "Grundlage")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.marketShare.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{r.competitor}</TableCell>
                <TableCell className="text-xs font-mono">{r.share}</TableCell>
                <TableCell className="text-xs">{r.method}</TableCell>
                <TableCell className="text-xs">{r.confidence}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal">{r.basis}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================================

function WinRateView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  const modColor = (m: number | string) => {
    const n = typeof m === "number" ? m : parseFloat(String(m));
    if (!Number.isFinite(n)) return undefined;
    if (n >= 1.1) return "hsl(142, 71%, 42%)";
    if (n >= 1.0) return "hsl(160, 55%, 50%)";
    if (n >= 0.85) return "hsl(45, 90%, 50%)";
    return "hsl(0, 74%, 55%)";
  };
  return (
    <div className="border border-border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{L("Segment", "Segment")}</TableHead>
            <TableHead className="w-[140px]">{L("Region", "Region")}</TableHead>
            <TableHead>{L("Density (Industry Study)", "Dichte (Industriestudie)")}</TableHead>
            <TableHead>{L("GAINING in-segment", "GAINING im Segment")}</TableHead>
            <TableHead className="w-[90px] text-center">{L("Modifier", "Modifikator")}</TableHead>
            <TableHead className="w-[70px]">{L("Conf.", "Konf.")}</TableHead>
            <TableHead>{L("Basis", "Grundlage")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.winRate.map((r, i) => (
            <TableRow key={i}>
              <TableCell className="text-xs font-medium">{r.segment}</TableCell>
              <TableCell className="text-xs">{r.region}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.density}</TableCell>
              <TableCell className="text-xs">{r.gaining}</TableCell>
              <TableCell className="text-center">
                <Badge style={{ backgroundColor: modColor(r.modifier), color: "white" }} className="font-mono text-xs">
                  {typeof r.modifier === "number" ? `×${r.modifier.toFixed(2)}` : r.modifier}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">{r.confidence}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-normal">{r.basis}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================

function TrendsView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">{L("Per-competitor direction", "Richtung je Wettbewerber")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.trends.map((t, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-xs font-semibold">{t.competitor}</div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: MOMENTUM_COLORS[t.momentum] || undefined }}>
                  {t.momentum === "GAINING" ? <TrendingUp className="h-3 w-3" /> : t.momentum === "LOSING" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {t.momentum}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground whitespace-pre-wrap">{t.direction}</div>
            </Card>
          ))}
        </div>
      </div>

      {data.convergent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">{L("Convergent trends (market-level)", "Konvergente Trends (Marktebene)")}</h3>
          <div className="space-y-2">
            {data.convergent.map((c, i) => (
              <Card key={i} className="p-3">
                <div className="text-xs font-semibold mb-1">{c.trend}</div>
                <div className="text-[11px] text-muted-foreground whitespace-pre-wrap">{c.detail}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================

function WatchView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{L("Company", "Unternehmen")}</TableHead>
            <TableHead>{L("Camp", "Camp")}</TableHead>
            <TableHead className="w-[60px]">O</TableHead>
            <TableHead className="w-[60px]">P</TableHead>
            <TableHead className="w-[60px]">E</TableHead>
            <TableHead>{L("Reason not shortlisted", "Grund nicht Shortlist")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.watch.map((w, i) => (
            <TableRow key={i}>
              <TableCell className="text-xs font-medium">{w.company}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{w.camp}</TableCell>
              <TableCell className="text-xs">{w.O ?? "—"}</TableCell>
              <TableCell className="text-xs">{w.P ?? "—"}</TableCell>
              <TableCell className="text-xs">{w.E ?? "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-normal">{w.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================

function AssumptionsView({ data, L }: { data: CompetitorScanData; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">ID</TableHead>
            <TableHead className="w-[110px]">{L("Area", "Bereich")}</TableHead>
            <TableHead>{L("Assumption", "Annahme")}</TableHead>
            <TableHead>{L("Basis", "Grundlage")}</TableHead>
            <TableHead className="w-[60px]">{L("Conf.", "Konf.")}</TableHead>
            <TableHead>{L("Impact", "Impact")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.assumptions.map((a, i) => (
            <TableRow key={`${a.id}-${i}`}>
              <TableCell className="font-mono text-xs">{a.id}</TableCell>
              <TableCell className="text-xs">{a.area}</TableCell>
              <TableCell className="text-xs whitespace-normal">{a.assumption}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-normal">{a.basis}</TableCell>
              <TableCell className="text-xs">{a.confidence}</TableCell>
              <TableCell className="text-xs whitespace-normal text-muted-foreground">{a.impact}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================

function ReportView({ sections, L }: { sections: DocxSection[]; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="max-h-[600px] overflow-auto prose prose-sm max-w-none dark:prose-invert px-1">
      {sections.length === 0 && (
        <p className="text-xs text-muted-foreground italic">{L("No readable text found in the report.", "Kein lesbarer Text im Bericht gefunden.")}</p>
      )}
      {sections.map((s, i) => (
        <div key={i} className="mb-3">
          {s.heading && (
            s.level <= 1 ? <h3 className="text-sm font-bold mt-3 mb-1">{s.heading}</h3>
            : s.level === 2 ? <h4 className="text-xs font-semibold mt-2 mb-1">{s.heading}</h4>
            : <h5 className="text-xs font-medium mt-2 mb-1 text-muted-foreground">{s.heading}</h5>
          )}
          {s.paragraphs.map((p, j) => (
            <p key={j} className="text-xs leading-relaxed my-1 whitespace-pre-wrap">{p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
