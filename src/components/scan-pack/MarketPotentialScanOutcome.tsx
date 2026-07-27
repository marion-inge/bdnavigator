import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Loader2, RefreshCw, DollarSign, TrendingUp, Target, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { ScanFileMeta } from "@/lib/scanPackTypes";
import { parseMarketPotentialXlsx, MarketPotentialData, parseCustomerDocx, DocxSection } from "@/lib/marketPotentialParse";

const BUCKET = "scan-deliverables";

const TIER_COLORS: Record<string, string> = {
  A: "hsl(200, 85%, 45%)",
  B: "hsl(200, 60%, 60%)",
  C: "hsl(215, 15%, 55%)",
  D: "hsl(215, 10%, 70%)",
};
const CONF_COLORS: Record<string, string> = {
  A: "hsl(142, 71%, 42%)",
  B: "hsl(142, 55%, 55%)",
  C: "hsl(45, 93%, 47%)",
  D: "hsl(25, 90%, 55%)",
};

interface Props { files: ScanFileMeta[]; }

const fmtUsd = (n: number | null | undefined, unit: "auto" | "m" | "raw" = "auto"): string => {
  if (n === null || n === undefined || !isFinite(n)) return "—";
  if (unit === "m" || (unit === "auto" && Math.abs(n) >= 1_000_000)) {
    return `$${(n / 1_000_000).toFixed(n >= 100_000_000 ? 0 : 1)}m`;
  }
  if (unit === "auto" && Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};
const fmtNum = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString());
const fmtPct = (n: number | null | undefined, d = 1) => (n === null || n === undefined ? "—" : `${(n * 100).toFixed(d)}%`);

export function MarketPotentialScanOutcome({ files }: Props) {
  const { language } = useI18n();
  const L = <T,>(en: T, de: T) => (language === "de" ? de : en);

  const xlsxFile = useMemo(() => files.find((f) => /\.xlsx$/i.test(f.name) || /spreadsheet/i.test(f.mime)), [files]);
  const docxFile = useMemo(() => files.find((f) => /\.docx$/i.test(f.name) || /wordprocessingml/i.test(f.mime)), [files]);

  const [data, setData] = useState<MarketPotentialData | null>(null);
  const [docxData, setDocxData] = useState<DocxSection[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (xlsxFile) {
        const { data: blob, error } = await supabase.storage.from(BUCKET).download(xlsxFile.path);
        if (error) throw error;
        setData(await parseMarketPotentialXlsx(blob));
      } else setData(null);
      if (docxFile) {
        const { data: blob, error } = await supabase.storage.from(BUCKET).download(docxFile.path);
        if (error) throw error;
        setDocxData(await parseCustomerDocx(blob));
      } else setDocxData(null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to parse");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [xlsxFile?.id, docxFile?.id]);

  if (!xlsxFile && !docxFile) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        {L(
          "Upload the Market Potential Scan deliverables (Excel model + Word report) in the Scan Pack to see the outcome here.",
          "Bitte die Market-Potential-Scan-Deliverables (Excel-Modell + Word-Bericht) im Scan Pack hochladen, um das Ergebnis hier zu sehen.",
        )}
      </div>
    );
  }

  // Bottom-up filters
  const [segFilter, setSegFilter] = useState<string>("all");
  const [regFilter, setRegFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const segments = useMemo(() => Array.from(new Set(data?.bottomUp.map((r) => r.segment).filter(Boolean) ?? [])).sort(), [data]);
  const regions = useMemo(() => Array.from(new Set(data?.bottomUp.map((r) => r.region).filter(Boolean) ?? [])).sort(), [data]);
  const tiers = useMemo(() => Array.from(new Set(data?.bottomUp.map((r) => r.custFit).filter(Boolean) ?? [])).sort(), [data]);

  const filteredBu = useMemo(() => {
    if (!data) return [];
    return data.bottomUp.filter((r) => {
      if (segFilter !== "all" && r.segment !== segFilter) return false;
      if (regFilter !== "all" && r.region !== regFilter) return false;
      if (tierFilter !== "all" && r.custFit !== tierFilter) return false;
      if (q && !r.company.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data, segFilter, regFilter, tierFilter, q]);

  // Headline metrics (realistic column from scenarioResults)
  const headline = useMemo(() => {
    const find = (re: RegExp) => data?.scenarioResults.find((r) => re.test(r.layer));
    return {
      sam: find(/Verified named-account SAM/i),
      som: find(/SOM near-term/i),
      onboarding: find(/onboarding/i),
      sam5y: find(/SAM at \+5y/i),
      som5y: find(/SOM at \+5y/i),
      cum5y: find(/5-yr cumulative/i),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {L("Market Potential Scan — Outcome", "Market-Potential-Scan — Ergebnis")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {L(
              "TAM / SAM / SOM triangulated across bottom-up, top-down and analogy — realistic scenario shown by default.",
              "TAM / SAM / SOM triangulliert aus Bottom-up, Top-down und Analogie — realistisches Szenario standardmäßig.",
            )}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {data && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">{L("Overview", "Überblick")}</TabsTrigger>
            <TabsTrigger value="scenarios">{L("Scenarios", "Szenarien")}</TabsTrigger>
            <TabsTrigger value="bottomup">{L("Bottom-Up", "Bottom-Up")}</TabsTrigger>
            <TabsTrigger value="breakdowns">{L("Breakdowns", "Aufteilungen")}</TabsTrigger>
            <TabsTrigger value="triangulation">{L("Triangulation", "Triangulation")}</TabsTrigger>
            <TabsTrigger value="sensitivity">{L("Sensitivity", "Sensitivität")}</TabsTrigger>
            <TabsTrigger value="assumptions">{L("Assumptions", "Annahmen")}</TabsTrigger>
            {docxData && <TabsTrigger value="report">{L("Report", "Bericht")}</TabsTrigger>}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { title: L("TAM (AVL-addressable niche)", "TAM (adressierbare Nische)"), value: data.headline.find((h) => /^TAM today/i.test(h.label))?.value, icon: <Target className="h-4 w-4" /> },
                { title: L("Market SAM (top-down)", "Markt-SAM (Top-down)"), value: data.headline.find((h) => /^Market SAM/i.test(h.label))?.value, icon: <Layers className="h-4 w-4" /> },
                { title: L("Named-account SAM (bottom-up)", "Named-Account-SAM (Bottom-up)"), value: data.headline.find((h) => /^Verified named-account/i.test(h.label))?.value, icon: <DollarSign className="h-4 w-4" /> },
                { title: L("SOM near-term", "SOM kurzfristig"), value: data.headline.find((h) => /^SOM near-term/i.test(h.label))?.value, icon: <TrendingUp className="h-4 w-4" /> },
                { title: L("5-yr cumulative obtainable", "5-Jahre kumuliert erreichbar"), value: data.headline.find((h) => /5-yr cumulative/i.test(h.label))?.value, icon: <TrendingUp className="h-4 w-4" /> },
                { title: L("Headline sensitivity", "Wichtigste Sensitivität"), value: data.headline.find((h) => /sensitivity/i.test(h.label))?.value, icon: <Target className="h-4 w-4" /> },
              ].map((k, i) => (
                <Card key={i} className="p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {k.icon}<span>{k.title}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{k.value ?? "—"}</div>
                </Card>
              ))}
            </div>

            {/* Realistic scenario ladder */}
            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">
                {L("Realistic scenario — value ladder", "Realistisches Szenario — Wertleiter")}
              </div>
              <div className="space-y-2">
                {data.scenarioResults.map((r) => {
                  const max = Math.max(...data.scenarioResults.map((x) => x.aggressive ?? 0));
                  const pct = max ? ((r.realistic ?? 0) / max) * 100 : 0;
                  return (
                    <div key={r.layer} className="grid grid-cols-12 items-center gap-3">
                      <div className="col-span-4 text-xs text-foreground">{r.layer}</div>
                      <div className="col-span-6 h-6 rounded bg-muted">
                        <div className="h-full rounded bg-primary/70" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-foreground">{fmtUsd(r.realistic)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {L("Bars scaled to aggressive-scenario max. Values shown are realistic scenario.", "Balken skaliert auf Aggressiv-Maximum. Werte sind realistisches Szenario.")}
              </div>
            </Card>
          </TabsContent>

          {/* SCENARIOS */}
          <TabsContent value="scenarios" className="mt-4 space-y-4">
            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">{L("Driver assumptions (levers)", "Treiberannahmen (Hebel)")}</div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{L("Driver", "Treiber")}</TableHead>
                      <TableHead className="text-right">{L("Conservative", "Konservativ")}</TableHead>
                      <TableHead className="text-right">{L("Realistic", "Realistisch")}</TableHead>
                      <TableHead className="text-right">{L("Aggressive", "Aggressiv")}</TableHead>
                      <TableHead>{L("Basis", "Grundlage")}</TableHead>
                      <TableHead className="text-center">{L("Conf", "Konf")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.scenarioDrivers.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{d.driver}</TableCell>
                        <TableCell className="text-right">{typeof d.conservative === "number" ? d.conservative.toLocaleString() : d.conservative}</TableCell>
                        <TableCell className="text-right">{typeof d.realistic === "number" ? d.realistic.toLocaleString() : d.realistic}</TableCell>
                        <TableCell className="text-right">{typeof d.aggressive === "number" ? d.aggressive.toLocaleString() : d.aggressive}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.basis}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" style={{ borderColor: CONF_COLORS[d.confidence] ?? undefined, color: CONF_COLORS[d.confidence] ?? undefined }}>{d.confidence}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">{L("Scenario results (USD)", "Szenario-Ergebnisse (USD)")}</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scenarioResults.map((r) => ({
                    layer: r.layer.length > 24 ? r.layer.slice(0, 24) + "…" : r.layer,
                    Conservative: r.conservative ?? 0,
                    Realistic: r.realistic ?? 0,
                    Aggressive: r.aggressive ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="layer" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fmtUsd(v)} />
                    <Tooltip formatter={(v: any) => fmtUsd(Number(v))} />
                    <Legend />
                    <Bar dataKey="Conservative" fill="hsl(215, 20%, 65%)" />
                    <Bar dataKey="Realistic" fill="hsl(200, 85%, 45%)" />
                    <Bar dataKey="Aggressive" fill="hsl(142, 71%, 42%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* BOTTOM-UP */}
          <TabsContent value="bottomup" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Input placeholder={L("Search company…", "Firma suchen…")} value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Tier" /></SelectTrigger>
                <SelectContent><SelectItem value="all">{L("All tiers", "Alle Tiers")}</SelectItem>{tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={segFilter} onValueChange={setSegFilter}>
                <SelectTrigger className="w-56"><SelectValue placeholder="Segment" /></SelectTrigger>
                <SelectContent><SelectItem value="all">{L("All segments", "Alle Segmente")}</SelectItem>{segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={regFilter} onValueChange={setRegFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Region" /></SelectTrigger>
                <SelectContent><SelectItem value="all">{L("All regions", "Alle Regionen")}</SelectItem>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <div className="ml-auto text-xs text-muted-foreground self-center">
                {L("Showing", "Zeige")} {filteredBu.length} / {data.bottomUp.length}
              </div>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{L("Company", "Firma")}</TableHead>
                      <TableHead className="text-center">Tier</TableHead>
                      <TableHead>{L("Segment", "Segment")}</TableHead>
                      <TableHead>{L("Region", "Region")}</TableHead>
                      <TableHead>{L("Archetype", "Archetyp")}</TableHead>
                      <TableHead className="text-right">{L("Assets (real)", "Assets (real)")}</TableHead>
                      <TableHead className="text-right">{L("WR (real)", "WR (real)")}</TableHead>
                      <TableHead className="text-right">{L("Cust. potential (ARR)", "Kundenpot. (ARR)")}</TableHead>
                      <TableHead className="text-right">{L("SOM (real, ARR)", "SOM (real, ARR)")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBu.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.company}</TableCell>
                        <TableCell className="text-center"><Badge style={{ backgroundColor: TIER_COLORS[r.custFit] ?? undefined, color: "white" }}>{r.custFit}</Badge></TableCell>
                        <TableCell className="text-xs">{r.segment}</TableCell>
                        <TableCell className="text-xs">{r.region}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.archetype}</TableCell>
                        <TableCell className="text-right">{fmtNum(r.assetsReal)}</TableCell>
                        <TableCell className="text-right">{fmtPct(r.wrReal)}</TableCell>
                        <TableCell className="text-right">{fmtUsd(r.custPotReal)}</TableCell>
                        <TableCell className="text-right font-semibold">{fmtUsd(r.somReal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">{L("Accounts", "Accounts")}</div>
                <div className="text-xl font-semibold">{filteredBu.length}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">{L("Σ SAM (real ARR)", "Σ SAM (real ARR)")}</div>
                <div className="text-xl font-semibold">{fmtUsd(filteredBu.reduce((s, r) => s + (r.custPotReal ?? 0), 0))}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">{L("Σ SOM (real ARR)", "Σ SOM (real ARR)")}</div>
                <div className="text-xl font-semibold">{fmtUsd(filteredBu.reduce((s, r) => s + (r.somReal ?? 0), 0))}</div>
              </Card>
            </div>
          </TabsContent>

          {/* BREAKDOWNS */}
          <TabsContent value="breakdowns" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {data.breakdowns.map((g, gi) => (
                <Card key={gi} className="p-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">{g.label}</div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={g.rows.filter((r) => (r.samArr ?? 0) > 0)} dataKey="samArr" nameKey="group" outerRadius={70} label={(e: any) => `${e.group.split(" ")[0]}`}>
                          {g.rows.map((_, i) => <Cell key={i} fill={`hsl(${(i * 47) % 360}, 65%, 55%)`} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => fmtUsd(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{L("Group", "Gruppe")}</TableHead>
                        <TableHead className="text-right">#</TableHead>
                        <TableHead className="text-right">SAM</TableHead>
                        <TableHead className="text-right">SOM</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {g.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{r.group}</TableCell>
                          <TableCell className="text-right text-xs">{r.accounts}</TableCell>
                          <TableCell className="text-right text-xs">{fmtUsd(r.samArr)}</TableCell>
                          <TableCell className="text-right text-xs">{fmtUsd(r.somArr)}</TableCell>
                          <TableCell className="text-right text-xs">{fmtPct(r.samPct)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TRIANGULATION */}
          <TabsContent value="triangulation" className="mt-4 space-y-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{L("Estimate", "Schätzung")}</TableHead>
                    <TableHead>{L("Value", "Wert")}</TableHead>
                    <TableHead>{L("Basis", "Grundlage")}</TableHead>
                    <TableHead>{L("Recency / tier", "Aktualität / Tier")}</TableHead>
                    <TableHead className="text-center">{L("Conf", "Konf")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.triangulation.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{r.estimate}</TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">{r.value}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.basis}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.recency}</TableCell>
                      <TableCell className="text-center text-xs">{r.confidence}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            {data.reconciliationNote && (
              <Card className="border-l-4 border-l-primary p-4">
                <div className="mb-1 text-xs font-semibold uppercase text-primary">{L("Reconciliation", "Abgleich")}</div>
                <div className="text-xs leading-relaxed text-foreground">{data.reconciliationNote}</div>
              </Card>
            )}
          </TabsContent>

          {/* SENSITIVITY */}
          <TabsContent value="sensitivity" className="mt-4 space-y-4">
            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">{L("One-at-a-time driver flex on realistic SOM", "Einzeltreiber-Flex auf realistischen SOM")}</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...data.sensitivity].sort((a, b) => (b.swing ?? 0) - (a.swing ?? 0))} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => fmtUsd(v)} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="driver" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip formatter={(v: any) => fmtUsd(Number(v))} />
                    <Bar dataKey="swing" fill="hsl(200, 85%, 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{L("Driver", "Treiber")}</TableHead>
                    <TableHead className="text-right">{L("Low", "Niedrig")}</TableHead>
                    <TableHead className="text-right">{L("High", "Hoch")}</TableHead>
                    <TableHead className="text-right">{L("Swing", "Spannweite")}</TableHead>
                    <TableHead className="text-center">{L("Rank", "Rang")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sensitivity.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{r.driver}</TableCell>
                      <TableCell className="text-right text-xs">{fmtUsd(r.low)}</TableCell>
                      <TableCell className="text-right text-xs">{fmtUsd(r.high)}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">{fmtUsd(r.swing)}</TableCell>
                      <TableCell className="text-center text-xs">{r.rank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-4">
              <div className="mb-3 text-sm font-semibold text-foreground">{L("Reach bands (realistic)", "Reichweitenbänder (realistisch)")}</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{L("Band", "Band")}</TableHead>
                    <TableHead className="text-right">SAM ARR</TableHead>
                    <TableHead className="text-right">SOM ARR</TableHead>
                    <TableHead>{L("Read", "Lesart")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.reachBands.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{r.band}</TableCell>
                      <TableCell className="text-right text-xs">{fmtUsd(r.samArr)}</TableCell>
                      <TableCell className="text-right text-xs">{fmtUsd(r.somArr)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.read}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.concentrationNote && (
                <div className="mt-3 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  {data.concentrationNote}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ASSUMPTIONS */}
          <TabsContent value="assumptions" className="mt-4">
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{L("Area", "Bereich")}</TableHead>
                    <TableHead>{L("Assumption", "Annahme")}</TableHead>
                    <TableHead>{L("Basis", "Grundlage")}</TableHead>
                    <TableHead className="text-center">{L("Conf", "Konf")}</TableHead>
                    <TableHead>{L("Impact", "Wirkung")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assumptions.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-mono">{a.id}</TableCell>
                      <TableCell className="text-xs"><Badge variant="outline">{a.area}</Badge></TableCell>
                      <TableCell className="text-xs text-foreground">{a.assumption}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.basis}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" style={{ borderColor: CONF_COLORS[a.confidence] ?? undefined, color: CONF_COLORS[a.confidence] ?? undefined }}>{a.confidence}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.impact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* REPORT */}
          {docxData && (
            <TabsContent value="report" className="mt-4">
              <Card className="p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {docxData.map((s, i) => (
                    <div key={i} className="mb-4">
                      {s.heading && <h3 className="text-sm font-semibold text-foreground">{s.heading}</h3>}
                      {s.paragraphs.map((p, j) => (
                        <p key={j} className="text-xs leading-relaxed text-foreground/90">{p}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
