import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Loader2, RefreshCw, Building2, Globe2, Layers, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { ScanFileMeta } from "@/lib/scanPackTypes";
import type { DocxSection } from "@/lib/customerScanParse";
import { parseIndustryXlsx, parseIndustryDocx, IndustryScanXlsxData } from "@/lib/industryScanParse";

const BUCKET = "scan-deliverables";

const TIER_COLORS: Record<string, string> = {
  A: "hsl(142, 71%, 45%)",
  B: "hsl(199, 89%, 48%)",
  C: "hsl(45, 93%, 47%)",
  D: "hsl(25, 95%, 53%)",
  E: "hsl(0, 84%, 60%)",
};

const PIE_COLORS = [
  "hsl(210, 80%, 55%)", "hsl(160, 65%, 45%)", "hsl(45, 90%, 55%)", "hsl(280, 60%, 60%)",
  "hsl(0, 70%, 60%)", "hsl(190, 70%, 45%)", "hsl(30, 80%, 55%)", "hsl(340, 70%, 55%)",
];

interface Props {
  files: ScanFileMeta[];
}

export function IndustryScanOutcome({ files }: Props) {
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

  const [xlsxData, setXlsxData] = useState<IndustryScanXlsxData | null>(null);
  const [docxData, setDocxData] = useState<DocxSection[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (xlsxFile) {
        const { data, error } = await supabase.storage.from(BUCKET).download(xlsxFile.path);
        if (error) throw error;
        setXlsxData(await parseIndustryXlsx(data));
      } else setXlsxData(null);
      if (docxFile) {
        const { data, error } = await supabase.storage.from(BUCKET).download(docxFile.path);
        if (error) throw error;
        setDocxData(await parseIndustryDocx(data));
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
      <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
        {L(
          "Upload the Industry Study deliverables (xlsx player database + Word study) in the Scan Pack to see the outcome here.",
          "Lade die Industriestudien-Deliverables (xlsx-Player-Datenbank + Word-Studie) im Scan Pack hoch, um das Ergebnis hier zu sehen.",
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold flex items-center gap-1.5">
          <Building2 className="h-4 w-4" />
          {L("Industry Scan Outcome", "Industrie-Scan-Ergebnis")}
        </div>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {L("Re-parse", "Neu einlesen")}
        </Button>
      </div>

      {loading && !xlsxData && !docxData && (
        <div className="text-xs text-muted-foreground italic">
          {L("Parsing deliverables…", "Lese Deliverables ein…")}
        </div>
      )}

      {(xlsxData || docxData) && (
        <Tabs defaultValue={xlsxData?.players.length ? "players" : (docxData ? "report" : "sizing")} className="space-y-3">
          <TabsList className="h-8 flex-wrap">
            {xlsxData?.players.length ? <TabsTrigger value="players" className="text-xs">{L("Players", "Player")}</TabsTrigger> : null}
            {xlsxData?.marketSizing.length ? <TabsTrigger value="sizing" className="text-xs">{L("Market sizing", "Marktvolumen")}</TabsTrigger> : null}
            {xlsxData?.frameworks.length ? <TabsTrigger value="frameworks" className="text-xs">{L("Frameworks", "Frameworks")}</TabsTrigger> : null}
            {xlsxData?.portfolioSegment.length ? <TabsTrigger value="portfolio" className="text-xs">{L("Portfolio × Segment", "Portfolio × Segment")}</TabsTrigger> : null}
            {docxData && <TabsTrigger value="report" className="text-xs">{L("Report", "Bericht")}</TabsTrigger>}
            {xlsxData?.methodology.length ? <TabsTrigger value="method" className="text-xs">{L("Methodology", "Methodik")}</TabsTrigger> : null}
          </TabsList>

          {xlsxData?.players.length ? (
            <TabsContent value="players" className="m-0 space-y-3">
              <PlayersView data={xlsxData} L={L} />
            </TabsContent>
          ) : null}

          {xlsxData?.marketSizing.length ? (
            <TabsContent value="sizing" className="m-0 space-y-3">
              <SizingView rows={xlsxData.marketSizing} L={L} />
            </TabsContent>
          ) : null}

          {xlsxData?.frameworks.length ? (
            <TabsContent value="frameworks" className="m-0">
              <FrameworksView rows={xlsxData.frameworks} L={L} />
            </TabsContent>
          ) : null}

          {xlsxData?.portfolioSegment.length ? (
            <TabsContent value="portfolio" className="m-0">
              <PortfolioMatrix data={xlsxData.portfolioSegment} L={L} />
            </TabsContent>
          ) : null}

          {docxData && (
            <TabsContent value="report" className="m-0">
              <ReportView sections={docxData} L={L} />
            </TabsContent>
          )}

          {xlsxData?.methodology.length ? (
            <TabsContent value="method" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">{L("Item", "Element")}</TableHead>
                    <TableHead>{L("Detail", "Detail")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {xlsxData.methodology.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs align-top">{m.item}</TableCell>
                      <TableCell className="text-xs whitespace-normal">{m.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ) : null}
        </Tabs>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function PlayersView({ data, L }: { data: IndustryScanXlsxData; L: <T,>(en: T, de: T) => T }) {
  const players = data.players;

  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const layers = useMemo(() => Array.from(new Set(players.map((p) => p.valueChainLayer).filter(Boolean))).sort(), [players]);
  const segments = useMemo(() => Array.from(new Set(players.map((p) => p.segment).filter(Boolean))).sort(), [players]);
  const kinds = useMemo(() => Array.from(new Set(players.map((p) => p.kind).filter(Boolean))).sort(), [players]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return players.filter(
      (p) =>
        (layerFilter === "all" || p.valueChainLayer === layerFilter) &&
        (segmentFilter === "all" || p.segment === segmentFilter) &&
        (tierFilter === "all" || p.tier === tierFilter) &&
        (kindFilter === "all" || p.kind === kindFilter) &&
        (!q || p.company.toLowerCase().includes(q) || p.country.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q)),
    );
  }, [players, layerFilter, segmentFilter, tierFilter, kindFilter, search]);

  const byLayer = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.valueChainLayer || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [players]);

  const bySegment = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.segment || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [players]);

  const byRegion = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.region || p.country || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [players]);

  const byKind = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.kind || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [players]);

  const tierAB = players.filter((p) => p.tier === "A" || p.tier === "B").length;
  const countries = new Set(players.map((p) => p.country).filter(Boolean)).size;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground">{L("Players total", "Player gesamt")}</div>
          <div className="text-xl font-bold">{players.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground">{L("Tier A + B", "Tier A + B")}</div>
          <div className="text-xl font-bold text-emerald-600">{tierAB}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" />{L("Value-chain layers", "VC-Ebenen")}</div>
          <div className="text-xl font-bold">{layers.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground">{L("Segments", "Segmente")}</div>
          <div className="text-xl font-bold">{segments.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe2 className="h-3 w-3" />{L("Countries", "Länder")}</div>
          <div className="text-xl font-bold">{countries}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Card className="p-2 md:col-span-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("By value-chain layer", "Nach Value-Chain-Ebene")}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byLayer} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(210, 80%, 55%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("By segment", "Nach Segment")}</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={bySegment} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60}>
                {bySegment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("Top regions", "Top-Regionen")}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(160, 65%, 45%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {byKind.length > 1 && (
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("By player kind", "Nach Player-Typ")}</div>
          <div className="flex flex-wrap gap-2 px-1 pb-1">
            {byKind.map((k) => (
              <Badge key={k.name} variant="outline" className="text-[11px]">
                {k.name} · {k.value}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={L("Search company, country, notes…", "Firma, Land, Notizen suchen…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs max-w-[260px]"
        />
        <Select value={layerFilter} onValueChange={setLayerFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All layers", "Alle Ebenen")}</SelectItem>
            {layers.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All segments", "Alle Segmente")}</SelectItem>
            {segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All tiers", "Alle Tiers")}</SelectItem>
            {["A", "B", "C", "D", "E"].map((t) => <SelectItem key={t} value={t}>Tier {t}</SelectItem>)}
          </SelectContent>
        </Select>
        {kinds.length > 1 && (
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{L("All kinds", "Alle Typen")}</SelectItem>
              {kinds.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} / {players.length}
        </span>
      </div>

      <div className="max-h-[420px] overflow-auto border border-border rounded">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[60px]">Tier</TableHead>
              <TableHead>{L("Company", "Unternehmen")}</TableHead>
              <TableHead>{L("Segment", "Segment")}</TableHead>
              <TableHead>{L("VC layer / sub-role", "VC-Ebene / Sub-Rolle")}</TableHead>
              <TableHead>{L("Country", "Land")}</TableHead>
              <TableHead>{L("Kind", "Typ")}</TableHead>
              <TableHead>{L("Notes", "Notizen")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => (
              <TableRow key={i}>
                <TableCell>
                  {p.tier ? (
                    <Badge style={{ backgroundColor: TIER_COLORS[p.tier] || "hsl(var(--muted))", color: "white" }} className="text-xs px-2">
                      {p.tier}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell className="font-medium text-xs">{p.company}</TableCell>
                <TableCell className="text-xs">{p.segment}</TableCell>
                <TableCell className="text-xs">
                  <div>{p.valueChainLayer}</div>
                  {p.subRole && <div className="text-[10px] text-muted-foreground">{p.subRole}</div>}
                </TableCell>
                <TableCell className="text-xs">{p.country}</TableCell>
                <TableCell className="text-xs">
                  {p.kind && <Badge variant="outline" className="text-[10px]">{p.kind}</Badge>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[300px]">{p.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SizingView({ rows, L }: { rows: import("@/lib/industryScanParse").MarketSizingRow[]; L: <T,>(en: T, de: T) => T }) {
  const pct = (n: number | null) => (n == null ? "—" : `${(n * 100).toFixed(1)}%`);
  const usd = (n: number | null) => (n == null ? "—" : n >= 1 ? `$${n.toFixed(1)}bn` : `$${(n * 1000).toFixed(0)}m`);

  const chartData = rows
    .filter((r) => r.baseYearSizeUsdBn != null)
    .map((r) => ({ name: `${r.segment}${r.region ? ` (${r.region})` : ""}`.slice(0, 40), size: r.baseYearSizeUsdBn as number }))
    .slice(0, 12);

  return (
    <div className="space-y-3">
      {chartData.length > 0 && (
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />{L("Base-year market size (USD bn)", "Marktvolumen Basisjahr (USD Mrd)")}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={200} />
              <Tooltip formatter={(v: any) => `$${Number(v).toFixed(1)}bn`} />
              <Bar dataKey="size" fill="hsl(210, 80%, 55%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="overflow-auto border border-border rounded max-h-[520px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>{L("Segment", "Segment")}</TableHead>
              <TableHead>{L("Region", "Region")}</TableHead>
              <TableHead className="text-right">{L("Size", "Größe")}</TableHead>
              <TableHead className="text-right">CAGR C / R / A</TableHead>
              <TableHead className="w-[60px]">Conf.</TableHead>
              <TableHead>{L("Addressable share", "Adressierbarer Anteil")}</TableHead>
              <TableHead>{L("Competitive density", "Wettbewerbsdichte")}</TableHead>
              <TableHead>{L("Notes", "Notizen")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{r.segment}</TableCell>
                <TableCell className="text-xs">{r.region}</TableCell>
                <TableCell className="text-xs text-right font-mono">
                  {usd(r.baseYearSizeUsdBn)}
                  {r.baseYear && <div className="text-[10px] text-muted-foreground">{r.baseYear}</div>}
                </TableCell>
                <TableCell className="text-xs text-right font-mono">
                  {pct(r.cagrConservative)} / {pct(r.cagrRealistic)} / {pct(r.cagrAggressive)}
                </TableCell>
                <TableCell className="text-xs">{r.cagrConfidence}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[200px]">{r.addressableShare}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[180px]">{r.competitiveDensity}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[240px]">{r.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function FrameworksView({ rows, L }: { rows: import("@/lib/industryScanParse").FrameworkRow[]; L: <T,>(en: T, de: T) => T }) {
  const grouped = useMemo(() => {
    const m: Record<string, typeof rows> = {};
    rows.forEach((r) => { (m[r.framework || "—"] ||= [] as any).push(r); });
    return Object.entries(m);
  }, [rows]);

  return (
    <div className="space-y-3">
      {grouped.map(([framework, items]) => (
        <Card key={framework} className="p-3">
          <div className="text-sm font-semibold mb-2">{framework}</div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{L("Item", "Element")}</TableHead>
                  <TableHead className="w-[130px]">{L("Category", "Kategorie")}</TableHead>
                  <TableHead className="w-[110px]">{L("Region", "Region")}</TableHead>
                  <TableHead>{L("Description", "Beschreibung")}</TableHead>
                  <TableHead className="w-[80px]">{L("Dir.", "Richt.")}</TableHead>
                  <TableHead className="w-[60px]">Conf.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium align-top">{r.item}</TableCell>
                    <TableCell className="text-xs">{r.category}</TableCell>
                    <TableCell className="text-xs">{r.region}</TableCell>
                    <TableCell className="text-xs whitespace-normal">{r.description}</TableCell>
                    <TableCell className="text-xs">{r.direction}</TableCell>
                    <TableCell className="text-xs">{r.confidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

function PortfolioMatrix({ data, L }: { data: IndustryScanXlsxData["portfolioSegment"]; L: <T,>(en: T, de: T) => T }) {
  const segments = data[0]?.cells.map((c) => c.segment) ?? [];
  const badgeTone = (txt: string) => {
    const t = txt.toLowerCase();
    if (t.startsWith("high")) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    if (t.startsWith("partial")) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    if (t.startsWith("low")) return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
    if (t.startsWith("medium")) return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30";
    return "bg-muted text-muted-foreground border-border";
  };
  return (
    <div className="overflow-auto border border-border rounded">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="min-w-[220px]">{L("Offering", "Angebot")}</TableHead>
            {segments.map((s) => <TableHead key={s} className="min-w-[220px] text-xs">{s}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-xs font-medium align-top">{row.offering}</TableCell>
              {row.cells.map((c, j) => {
                const label = (c.assessment.split(/[–-]/)[0] || "").trim();
                return (
                  <TableCell key={j} className="text-xs whitespace-normal align-top">
                    {label && <Badge variant="outline" className={`mb-1 text-[10px] ${badgeTone(label)}`}>{label}</Badge>}
                    <div className="text-[11px] text-muted-foreground">{c.assessment}</div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReportView({ sections, L }: { sections: DocxSection[]; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="max-h-[560px] overflow-auto prose prose-sm max-w-none dark:prose-invert px-1">
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
