import { useI18n } from "@/lib/i18n";
import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditableSection } from "@/components/EditableSection";
import { Plus, Trash2, Upload, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TamModels, CustomerFoundEntry, CustomersFoundData } from "@/lib/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Props {
  data: TamModels;
  onSave: (data: TamModels) => void;
  readonly?: boolean;
}

const defaultCustomers = (): CustomersFoundData => ({
  entries: [],
  researchScope: "",
  bottomUpAssumptions: "",
  averageValuePerCustomer: 0,
  description: "",
});

const TIER_COLORS: Record<string, string> = {
  A: "hsl(142, 71%, 45%)",
  B: "hsl(199, 89%, 48%)",
  C: "hsl(45, 93%, 47%)",
  D: "hsl(25, 95%, 53%)",
  E: "hsl(0, 84%, 60%)",
};

export function CustomersFoundTab({ data, onSave, readonly: propReadonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;
  const fileRef = useRef<HTMLInputElement>(null);

  const cf = data.customersFound || defaultCustomers();
  const update = (patch: Partial<CustomersFoundData>) =>
    onSave({ ...data, customersFound: { ...cf, ...patch } });

  const addEntry = () => update({
    entries: [...cf.entries, {
      id: crypto.randomUUID(),
      company: "", country: "", geography: "", tier: "",
      customerType: "", segment: "", parentGroup: "",
      variantCount: "", estimatedValue: 0, status: "active",
      rationale: "", sources: "", notes: "",
    }],
  });
  const removeEntry = (id: string) => update({ entries: cf.entries.filter(e => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<CustomerFoundEntry>) =>
    update({ entries: cf.entries.map(e => e.id === id ? { ...e, ...patch } : e) });

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    cf.entries.forEach(e => { if (e.tier) counts[e.tier] = (counts[e.tier] || 0) + 1; });
    return Object.entries(counts).map(([tier, count]) => ({ tier, count }));
  }, [cf.entries]);

  const totalValue = useMemo(() => {
    return cf.entries.reduce((sum, e) => sum + (e.estimatedValue || cf.averageValuePerCustomer || 0), 0);
  }, [cf.entries, cf.averageValuePerCustomer]);

  const geoCounts = useMemo(() => {
    const m: Record<string, number> = {};
    cf.entries.forEach(e => { const g = e.geography || e.country || "—"; m[g] = (m[g] || 0) + 1; });
    return Object.entries(m).map(([geography, count]) => ({ geography, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [cf.entries]);

  const handleImport = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      // Try to find a "Customer Database" sheet, else first sheet with data
      let sheetName = wb.SheetNames.find(n => /customer/i.test(n)) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!rows.length) { toast.error(bp("No rows found", "Keine Zeilen gefunden")); return; }
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const pick = (row: any, keys: string[]) => {
        for (const k of Object.keys(row)) {
          if (keys.includes(norm(String(k)))) return String(row[k] ?? "");
        }
        return "";
      };
      const imported: CustomerFoundEntry[] = rows.map(r => ({
        id: crypto.randomUUID(),
        company: pick(r, ["company", "companyname", "name"]),
        country: pick(r, ["country"]),
        geography: pick(r, ["geography", "region"]),
        tier: (pick(r, ["tier"]).trim().toUpperCase().charAt(0) || "") as any,
        customerType: pick(r, ["customertype", "type"]),
        segment: pick(r, ["segment"]),
        parentGroup: pick(r, ["parentgroup", "parent", "group"]),
        variantCount: pick(r, ["verifiedvariantcount", "variantcount", "variants"]),
        estimatedValue: Number(pick(r, ["estimatedvalue", "value", "potential"])) || 0,
        status: pick(r, ["status"]) || "active",
        rationale: pick(r, ["tierrationale", "rationale"]),
        sources: pick(r, ["sources", "source"]),
        notes: pick(r, ["notes", "comment", "comments"]),
      })).filter(e => e.company);
      if (!imported.length) { toast.error(bp("Could not detect customer rows", "Konnte keine Kundenzeilen erkennen")); return; }
      update({ entries: [...cf.entries, ...imported] });
      toast.success(bp(`Imported ${imported.length} customers`, `${imported.length} Kunden importiert`));
    } catch (e: any) {
      toast.error(e.message || bp("Import failed", "Import fehlgeschlagen"));
    }
  };

  const tierBadge = (t: string) => {
    if (!t) return null;
    const color = TIER_COLORS[t] || "hsl(var(--muted-foreground))";
    return <Badge style={{ backgroundColor: color, color: "white" }} className="text-xs px-2 py-0">{t}</Badge>;
  };

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => setEditing(false)} readonly={propReadonly}>
      <div className="space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {bp("Customers Found – Bottom-Up TAM", "Gefundene Kunden – Bottom-Up TAM")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {bp(
                "Catalogue every potential customer identified in the target region and industry. The sum of their value builds a bottom-up TAM and substantiates the top-down estimate.",
                "Erfassen Sie jeden potenziellen Kunden in Zielregion und Industrie. Die Summe ergibt einen Bottom-Up-TAM und untermauert die Top-Down-Schätzung.",
              )}
            </p>
            <div>
              <Label>{bp("Research scope", "Recherche-Scope")}</Label>
              <Textarea
                value={cf.researchScope}
                onChange={e => update({ researchScope: e.target.value })}
                placeholder={bp("Which industry, geography and customer types were screened?", "Welche Branche, Geografie und Kundentypen wurden gescreent?")}
                disabled={readonly} rows={2}
              />
            </div>
            <div>
              <Label>{bp("Bottom-up assumptions", "Bottom-Up-Annahmen")}</Label>
              <Textarea
                value={cf.bottomUpAssumptions}
                onChange={e => update({ bottomUpAssumptions: e.target.value })}
                placeholder={bp("How is the value per customer derived? (e.g. license fee × variants, project value × power classes)", "Wie wird der Wert je Kunde abgeleitet? (z.B. Lizenz × Varianten, Projektwert × Leistungsklassen)")}
                disabled={readonly} rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{bp("Total customers", "Kunden gesamt")}</div>
            <div className="text-2xl font-bold">{cf.entries.length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{bp("Tier A + B", "Tier A + B")}</div>
            <div className="text-2xl font-bold text-emerald-600">{cf.entries.filter(e => e.tier === "A" || e.tier === "B").length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{bp("Geographies", "Geografien")}</div>
            <div className="text-2xl font-bold">{new Set(cf.entries.map(e => e.geography || e.country).filter(Boolean)).size}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {bp("Bottom-up TAM (M€)", "Bottom-Up TAM (M€)")}</div>
            <div className="text-2xl font-bold text-blue-600">{totalValue.toLocaleString()}</div>
            <div className="mt-2">
              <Label className="text-[10px] text-muted-foreground">{bp("Default value / customer (M€)", "Standardwert / Kunde (M€)")}</Label>
              <Input type="number" className="h-7" value={cf.averageValuePerCustomer || ""} onChange={e => update({ averageValuePerCustomer: Number(e.target.value) })} disabled={readonly} />
            </div>
          </CardContent></Card>
        </div>

        {/* Charts */}
        {cf.entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{bp("Tier distribution", "Tier-Verteilung")}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={tierCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="tier" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {tierCounts.map((d) => <Cell key={d.tier} fill={TIER_COLORS[d.tier] || "hsl(var(--primary))"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{bp("Top geographies", "Top-Geografien")}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={geoCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="geography" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(210, 80%, 55%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base">{bp("Customer database", "Kunden-Datenbank")}</CardTitle>
              {!readonly && (
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> {bp("Import XLSX/CSV", "XLSX/CSV importieren")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={addEntry}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> {bp("Add", "Hinzufügen")}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {cf.entries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {bp("No customers yet. Add manually or import an XLSX/CSV (columns: Company, Country, Geography, Tier, Customer Type, Segment, Variant Count, ...).", "Noch keine Kunden. Manuell hinzufügen oder XLSX/CSV importieren (Spalten: Company, Country, Geography, Tier, Customer Type, Segment, Variant Count, ...).")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">{bp("Company", "Unternehmen")}</TableHead>
                    <TableHead>{bp("Country", "Land")}</TableHead>
                    <TableHead>{bp("Geography", "Region")}</TableHead>
                    <TableHead className="w-[70px]">Tier</TableHead>
                    <TableHead>{bp("Type", "Typ")}</TableHead>
                    <TableHead>{bp("Segment", "Segment")}</TableHead>
                    <TableHead>{bp("Variants", "Varianten")}</TableHead>
                    <TableHead className="w-[100px]">{bp("Value (M€)", "Wert (M€)")}</TableHead>
                    <TableHead>{bp("Status", "Status")}</TableHead>
                    <TableHead className="min-w-[200px]">{bp("Rationale", "Begründung")}</TableHead>
                    <TableHead className="min-w-[200px]">{bp("Sources", "Quellen")}</TableHead>
                    {!readonly && <TableHead className="w-[40px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cf.entries.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>
                        {readonly
                          ? <span className="font-medium">{e.company}</span>
                          : <Input value={e.company} onChange={ev => updateEntry(e.id, { company: ev.target.value })} className="h-8" />}
                      </TableCell>
                      <TableCell>{readonly ? e.country : <Input value={e.country} onChange={ev => updateEntry(e.id, { country: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>{readonly ? e.geography : <Input value={e.geography} onChange={ev => updateEntry(e.id, { geography: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>
                        {readonly ? tierBadge(e.tier) : (
                          <Select value={e.tier || "none"} onValueChange={v => updateEntry(e.id, { tier: (v === "none" ? "" : v) as any })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">—</SelectItem>
                              {["A", "B", "C", "D", "E"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{readonly ? e.customerType : <Input value={e.customerType} onChange={ev => updateEntry(e.id, { customerType: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>{readonly ? e.segment : <Input value={e.segment} onChange={ev => updateEntry(e.id, { segment: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>{readonly ? e.variantCount : <Input value={e.variantCount} onChange={ev => updateEntry(e.id, { variantCount: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>{readonly ? (e.estimatedValue || "–") : <Input type="number" value={e.estimatedValue || ""} onChange={ev => updateEntry(e.id, { estimatedValue: Number(ev.target.value) })} className="h-8" />}</TableCell>
                      <TableCell>{readonly ? <span className="text-xs">{e.status}</span> : <Input value={e.status} onChange={ev => updateEntry(e.id, { status: ev.target.value })} className="h-8" />}</TableCell>
                      <TableCell>
                        {readonly
                          ? <span className="text-xs text-muted-foreground whitespace-normal break-words">{e.rationale}</span>
                          : <Textarea value={e.rationale} onChange={ev => updateEntry(e.id, { rationale: ev.target.value })} rows={2} className="text-xs min-h-[40px]" />}
                      </TableCell>
                      <TableCell>
                        {readonly
                          ? <span className="text-xs text-muted-foreground whitespace-normal break-words line-clamp-3">{e.sources}</span>
                          : <Textarea value={e.sources} onChange={ev => updateEntry(e.id, { sources: ev.target.value })} rows={2} className="text-xs min-h-[40px]" />}
                      </TableCell>
                      {!readonly && (
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => removeEntry(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EditableSection>
  );
}
