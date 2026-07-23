import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Loader2, RefreshCw, Users, Globe2, Layers } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { ScanFileMeta } from "@/lib/scanPackTypes";
import {
  parseCustomerXlsx, parseCustomerDocx, CustomerScanXlsxData, DocxSection,
} from "@/lib/customerScanParse";

const BUCKET = "scan-deliverables";

const TIER_COLORS: Record<string, string> = {
  A: "hsl(142, 71%, 45%)",
  B: "hsl(199, 89%, 48%)",
  C: "hsl(45, 93%, 47%)",
  D: "hsl(25, 95%, 53%)",
  E: "hsl(0, 84%, 60%)",
};

interface Props {
  files: ScanFileMeta[];
}

export function CustomerScanOutcome({ files }: Props) {
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

  const [xlsxData, setXlsxData] = useState<CustomerScanXlsxData | null>(null);
  const [docxData, setDocxData] = useState<DocxSection[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (xlsxFile) {
        const { data, error } = await supabase.storage.from(BUCKET).download(xlsxFile.path);
        if (error) throw error;
        setXlsxData(await parseCustomerXlsx(data));
      } else {
        setXlsxData(null);
      }
      if (docxFile) {
        const { data, error } = await supabase.storage.from(BUCKET).download(docxFile.path);
        if (error) throw error;
        setDocxData(await parseCustomerDocx(data));
      } else {
        setDocxData(null);
      }
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

  if (!xlsxFile && !docxFile) return null;

  return (
    <div className="rounded-md border border-border bg-muted/20 p-3 mt-2 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {L("Customer Scan Outcome", "Customer-Scan-Ergebnis")}
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
        <Tabs defaultValue={xlsxData ? "database" : "report"} className="space-y-3">
          <TabsList className="h-8">
            {xlsxData && <TabsTrigger value="database" className="text-xs">{L("Database", "Datenbank")}</TabsTrigger>}
            {xlsxData?.assumptions?.length ? (
              <TabsTrigger value="assumptions" className="text-xs">{L("Assumptions", "Annahmen")}</TabsTrigger>
            ) : null}
            {xlsxData?.watchList?.length ? (
              <TabsTrigger value="watch" className="text-xs">{L("Watch list", "Watchlist")}</TabsTrigger>
            ) : null}
            {docxData && <TabsTrigger value="report" className="text-xs">{L("Report", "Bericht")}</TabsTrigger>}
          </TabsList>

          {xlsxData && (
            <TabsContent value="database" className="space-y-3 m-0">
              <DatabaseView data={xlsxData} L={L} />
            </TabsContent>
          )}

          {xlsxData?.assumptions?.length ? (
            <TabsContent value="assumptions" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>{L("Area", "Bereich")}</TableHead>
                    <TableHead>{L("Assumption", "Annahme")}</TableHead>
                    <TableHead>{L("Basis", "Grundlage")}</TableHead>
                    <TableHead className="w-[80px]">{L("Conf.", "Konf.")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {xlsxData.assumptions.map((a, i) => (
                    <TableRow key={`${a.id}-${i}`}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell className="text-xs">{a.area}</TableCell>
                      <TableCell className="text-xs whitespace-normal">{a.assumption}</TableCell>
                      <TableCell className="text-xs whitespace-normal text-muted-foreground">{a.basis}</TableCell>
                      <TableCell className="text-xs">{a.confidence}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ) : null}

          {xlsxData?.watchList?.length ? (
            <TabsContent value="watch" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Tier</TableHead>
                    <TableHead>{L("Company", "Unternehmen")}</TableHead>
                    <TableHead>{L("Type", "Typ")}</TableHead>
                    <TableHead>{L("Role / why watched", "Rolle / Grund")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {xlsxData.watchList.map((w, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge variant="outline">{w.tier}</Badge></TableCell>
                      <TableCell className="font-medium text-xs">{w.company}</TableCell>
                      <TableCell className="text-xs">{w.type}</TableCell>
                      <TableCell className="text-xs whitespace-normal">{w.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ) : null}

          {docxData && (
            <TabsContent value="report" className="m-0">
              <ReportView sections={docxData} L={L} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function DatabaseView({ data, L }: { data: CustomerScanXlsxData; L: <T,>(en: T, de: T) => T }) {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const customers = data.customers;
  const segments = useMemo(
    () => Array.from(new Set(customers.map((c) => c.segment).filter(Boolean))).sort(),
    [customers],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        (tierFilter === "all" || c.tier === tierFilter) &&
        (segmentFilter === "all" || c.segment === segmentFilter) &&
        (!q || c.company.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.knownProjects.toLowerCase().includes(q)),
    );
  }, [customers, tierFilter, segmentFilter, search]);

  const tierCounts = useMemo(() => {
    const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    customers.forEach((r) => { if (r.tier && c[r.tier] !== undefined) c[r.tier]++; });
    return Object.entries(c).map(([tier, count]) => ({ tier, count }));
  }, [customers]);

  const segmentCounts = useMemo(() => {
    const m: Record<string, number> = {};
    customers.forEach((r) => { const k = r.segment || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [customers]);

  const regionCounts = useMemo(() => {
    const m: Record<string, number> = {};
    customers.forEach((r) => { const k = r.region || r.country || "—"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [customers]);

  const tierAB = customers.filter((c) => c.tier === "A" || c.tier === "B").length;
  const countries = new Set(customers.map((c) => c.country).filter(Boolean)).size;
  const segCount = new Set(customers.map((c) => c.segment).filter(Boolean)).size;

  const PIE_COLORS = ["hsl(210, 80%, 55%)", "hsl(160, 65%, 45%)", "hsl(45, 90%, 55%)", "hsl(280, 60%, 60%)", "hsl(0, 70%, 60%)", "hsl(190, 70%, 45%)", "hsl(30, 80%, 55%)", "hsl(340, 70%, 55%)"];

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground">{L("Total customers", "Kunden gesamt")}</div>
          <div className="text-xl font-bold">{customers.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground">{L("Tier A + B", "Tier A + B")}</div>
          <div className="text-xl font-bold text-emerald-600">{tierAB}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe2 className="h-3 w-3" />{L("Countries", "Länder")}</div>
          <div className="text-xl font-bold">{countries}</div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" />{L("Segments", "Segmente")}</div>
          <div className="text-xl font-bold">{segCount}</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("Tier distribution", "Tier-Verteilung")}</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tierCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {tierCounts.map((d) => <Cell key={d.tier} fill={TIER_COLORS[d.tier] || "hsl(var(--primary))"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("By segment", "Nach Segment")}</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={segmentCounts} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55}>
                {segmentCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-2">
          <div className="text-[11px] font-medium mb-1 px-1">{L("Top regions", "Top-Regionen")}</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={regionCounts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(210, 80%, 55%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={L("Search company, country, project…", "Firma, Land, Projekt suchen…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs max-w-[280px]"
        />
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All tiers", "Alle Tiers")}</SelectItem>
            {["A", "B", "C", "D", "E"].map((t) => <SelectItem key={t} value={t}>Tier {t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("All segments", "Alle Segmente")}</SelectItem>
            {segments.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} / {customers.length}
        </span>
      </div>

      {/* Table */}
      <div className="max-h-[420px] overflow-auto border border-border rounded">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[60px]">Tier</TableHead>
              <TableHead>{L("Company", "Unternehmen")}</TableHead>
              <TableHead>{L("Segment", "Segment")}</TableHead>
              <TableHead>{L("Region", "Region")}</TableHead>
              <TableHead>{L("Country", "Land")}</TableHead>
              <TableHead>{L("Known projects / activity", "Bekannte Projekte / Aktivität")}</TableHead>
              <TableHead>{L("Rationale", "Begründung")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, i) => (
              <TableRow key={i}>
                <TableCell>
                  {c.tier ? (
                    <Badge style={{ backgroundColor: TIER_COLORS[c.tier] || "hsl(var(--muted))", color: "white" }} className="text-xs px-2">
                      {c.tier}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell className="font-medium text-xs">{c.company}</TableCell>
                <TableCell className="text-xs">{c.segment}</TableCell>
                <TableCell className="text-xs">{c.region}</TableCell>
                <TableCell className="text-xs">{c.country}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[280px]">{c.knownProjects}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-normal max-w-[280px]">{c.tierRationale}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ReportView({ sections, L }: { sections: DocxSection[]; L: <T,>(en: T, de: T) => T }) {
  return (
    <div className="max-h-[500px] overflow-auto prose prose-sm max-w-none dark:prose-invert px-1">
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
