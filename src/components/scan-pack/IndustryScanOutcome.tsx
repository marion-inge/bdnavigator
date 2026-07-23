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

  const byCountry = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.country || "—"; if (k === "—") return; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [players]);

  const byKind = useMemo(() => {
    const m: Record<string, number> = {};
    players.forEach((p) => { const k = p.kind || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [players]);

  // Segment × Tier density matrix
  const TIERS = ["A", "B", "C", "D", "E"] as const;
  const segTierMatrix = useMemo(() => {
    const rows = segments.map((seg) => {
      const cells = TIERS.map((t) => players.filter((p) => p.segment === seg && p.tier === t).length);
      return { segment: seg, cells, total: cells.reduce((a, b) => a + b, 0) };
    });
    const maxCell = Math.max(1, ...rows.flatMap((r) => r.cells));
    return { rows: rows.sort((a, b) => b.total - a.total), maxCell };
  }, [players, segments]);

  const heatBg = (v: number, max: number) => {
    if (v === 0) return "hsl(var(--muted))";
    const t = Math.max(0.15, v / max);
    // emerald ramp with alpha
    return `hsl(160, 65%, ${Math.round(65 - 30 * t)}%)`;
  };

  const tierAB = players.filter((p) => p.tier === "A" || p.tier === "B").length;
  const countries = new Set(players.map((p) => p.country).filter(Boolean)).size;
  const maxLayer = Math.max(1, ...byLayer.map((l) => l.count));
  const topCountries = byCountry.slice(0, 5);
  const otherCountryCount = Math.max(0, countries - topCountries.length);

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

      {/* Executive intelligence matrix: value-chain distribution | segment × tier heat | global footprint */}
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Value chain distribution */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {L("Value chain distribution", "Value-Chain-Verteilung")}
              </h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                {layers.length} {L("LAYERS", "EBENEN")}
              </span>
            </div>
            <div className="space-y-2.5">
              {byLayer.map((l) => {
                const pct = (l.count / maxLayer) * 100;
                return (
                  <div key={l.name}>
                    <div className="flex justify-between items-end mb-1 gap-2">
                      <span className="text-xs font-semibold text-foreground truncate" title={l.name}>{l.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {l.count} {L("players", "Player")}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Segment × Tier density */}
          <div className="flex-[1.4] p-4 bg-muted/30 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {L("Segment density by tier", "Segmentdichte nach Tier")}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted border border-border" />
                  <span className="text-[10px] text-muted-foreground">{L("Low", "Niedrig")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160, 65%, 35%)" }} />
                  <span className="text-[10px] text-muted-foreground">{L("High", "Hoch")}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="grid gap-1 items-center" style={{ gridTemplateColumns: "minmax(80px, 1fr) repeat(5, minmax(0, 1fr)) 40px" }}>
                <span />
                {TIERS.map((t) => (
                  <span key={t} className="text-[10px] font-bold text-muted-foreground text-center">{t}</span>
                ))}
                <span className="text-[10px] font-bold text-muted-foreground text-center">Σ</span>
              </div>
              {segTierMatrix.rows.map((r) => (
                <div key={r.segment} className="grid gap-1 items-center" style={{ gridTemplateColumns: "minmax(80px, 1fr) repeat(5, minmax(0, 1fr)) 40px" }}>
                  <span className="text-[10px] font-medium text-foreground truncate pr-1" title={r.segment}>{r.segment}</span>
                  {r.cells.map((v, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: heatBg(v, segTierMatrix.maxCell) }}
                      title={`${r.segment} · Tier ${TIERS[i]} · ${v}`}
                    >
                      {v > 0 ? v : ""}
                    </div>
                  ))}
                  <span className="text-[10px] font-mono text-muted-foreground text-center">{r.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Global footprint */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {L("Global footprint", "Globale Präsenz")}
              </h3>
              <span className="text-[10px] font-semibold text-primary">
                {countries} {L("COUNTRIES", "LÄNDER")}
              </span>
            </div>
            <div className="space-y-3">
              {topCountries.map((c) => {
                const pct = players.length ? (c.count / players.length) * 100 : 0;
                const code = c.name.slice(0, 2).toUpperCase();
                return (
                  <div key={c.name} className="flex items-center justify-between group gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                        {code}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate" title={c.name}>{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {c.count} {L("players", "Player")} ({pct.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 w-14 bg-muted rounded-full shrink-0">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: `${Math.max(4, pct * 2.5)}%` }} />
                    </div>
                  </div>
                );
              })}
              {otherCountryCount > 0 && (
                <div className="pt-3 mt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground italic">
                    +{otherCountryCount} {L("other countries", "weitere Länder")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {byKind.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {L("By player kind", "Nach Player-Typ")}:
          </span>
          {byKind.map((k) => (
            <Badge key={k.name} variant="outline" className="text-[11px]">
              {k.name} · {k.value}
            </Badge>
          ))}
        </div>
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
