import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { InvestmentCaseData, InvestmentCaseYearData, InvestmentCaseParameters, createDefaultInvestmentCase, BusinessPlanData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine, ComposedChart, Area,
} from "recharts";
import { TrendingUp, DollarSign, Calculator, Settings, BarChart3, FileText, Download, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { BusinessCaseAssessment } from "@/components/BusinessCaseAssessment";

interface Props {
  investmentCase?: InvestmentCaseData;
  onSave: (ic: InvestmentCaseData) => void;
  readonly?: boolean;
  businessPlan?: BusinessPlanData;
  opportunityId: string;
  title?: string;
  description?: string;
  industry?: string;
  technology?: string;
}

const formatK = (val: number) =>
  val ? `${(val / 1000).toFixed(0)} k€` : "0 k€";
const formatM = (val: number) =>
  Math.abs(val) >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)} M€` : `${(val / 1000).toFixed(0)} k€`;
const formatPct = (val: number) => `${(val * 100).toFixed(1)}%`;

export function InvestmentCaseSection({ investmentCase, onSave, readonly: propReadonly, businessPlan, opportunityId, title: oppTitle, description: oppDescription, industry, technology }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const defaults = createDefaultInvestmentCase();
  const [data, setData] = useState<InvestmentCaseData>(() => {
    if (!investmentCase) return defaults;
    return {
      ...investmentCase,
      parameters: { ...defaults.parameters, ...investmentCase.parameters },
    };
  });
  const [editing, setEditing] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const readonly = propReadonly || !editing;

  // ═══ Import from Business Plan ═══
  const importFromBusinessPlan = () => {
    if (!businessPlan) return;

    const analysis = businessPlan.marketAttractiveness?.analysis;
    const somOverview = businessPlan.somOverview;
    const samProjections = analysis?.samProjections;
    const tamProjections = analysis?.tamProjections;
    const grossMargin = businessPlan.commercialViability?.grossMargin || 0;
    const marketGrowthRate = analysis?.marketGrowthRate ? parseFloat(analysis.marketGrowthRate) : 0;

    // Determine market size from SAM (last year value) or TAM
    let marketSize = 0;
    if (samProjections?.length) {
      marketSize = samProjections[samProjections.length - 1]?.value || 0;
    } else if (tamProjections?.length) {
      marketSize = tamProjections[tamProjections.length - 1]?.value || 0;
    }

    // Update parameters with BP data
    const updatedParams = { ...data.parameters };
    if (marketSize > 0) updatedParams.marketSize = marketSize;
    if (marketGrowthRate > 0) updatedParams.marketGrowthRate = marketGrowthRate;

    // Import SOM market assumption parameters
    if (somOverview?.portfolioCoveragePct) updatedParams.portfolioCoverage = somOverview.portfolioCoveragePct;
    if (somOverview?.visibilityPct) updatedParams.visibility = somOverview.visibilityPct;
    if (somOverview?.visibilityGrowthPct) updatedParams.visibilityGrowthRate = somOverview.visibilityGrowthPct;
    if (somOverview?.hitratePct) updatedParams.hitrate = somOverview.hitratePct;

    // Auto-fill sales from SOM projections
    const updatedYearData = [...data.yearData];
    if (somOverview?.projections?.length) {
      const somProjections = somOverview.projections;
      for (let i = 0; i < updatedYearData.length; i++) {
        // Map SOM projection years to investment case years
        const somEntry = somProjections.find(p => p.year === updatedYearData[i].year) 
          || (i < somProjections.length ? somProjections[i] : null);
        if (somEntry && somEntry.value > 0) {
          updatedYearData[i] = { ...updatedYearData[i], sales: somEntry.value };
        }
      }
    } else if (businessPlan.commercialViability?.projections?.length) {
      // Fallback: use commercial viability revenue projections
      const cvProjections = businessPlan.commercialViability.projections;
      for (let i = 0; i < updatedYearData.length && i < cvProjections.length; i++) {
        if (cvProjections[i].revenue > 0) {
          updatedYearData[i] = { ...updatedYearData[i], sales: cvProjections[i].revenue };
        }
      }
    }

    // Apply gross margin if available
    if (grossMargin > 0) {
      for (let i = 0; i < updatedYearData.length; i++) {
        updatedYearData[i] = { ...updatedYearData[i], grossMarginPct: grossMargin };
      }
    }

    const updated = { ...data, parameters: updatedParams, yearData: updatedYearData };
    setData(updated);
    onSave(updated);
    toast.success(bp(
      "Market data imported from Business Plan",
      "Marktdaten aus Business Plan übernommen"
    ));
  };

  const hasBpData = !!(businessPlan?.somOverview?.projections?.length 
    || businessPlan?.commercialViability?.projections?.length
    || businessPlan?.marketAttractiveness?.analysis?.samProjections?.length);

  const update = (updated: InvestmentCaseData) => {
    setData(updated);
    onSave(updated);
  };

  const updateParam = (key: keyof InvestmentCaseParameters, value: number | boolean) => {
    const updated = { ...data, parameters: { ...data.parameters, [key]: value } };
    // Recalculate year count if duration changes
    if (key === "projectDuration" || key === "projectStart") {
      const years: InvestmentCaseYearData[] = [];
      const start = key === "projectStart" ? (value as number) : updated.parameters.projectStart;
      const dur = key === "projectDuration" ? (value as number) : updated.parameters.projectDuration;
      for (let i = 0; i <= dur + 4; i++) {
        const existing = data.yearData.find(y => y.year === start + i);
        years.push(existing || {
          year: start + i,
          investmentExternal: 0, investmentInternal: 0,
          rdExternal: 0, rdInternal: 0,
          sales: 0, cogs: 0, grossMarginPct: 30,
          sellingExpenses: 0, gaExpenses: 0, otherExpenses: 0,
        });
      }
      updated.yearData = years;
    }
    update(updated);
  };

  const updateYear = (yearIdx: number, field: keyof InvestmentCaseYearData, value: number) => {
    const yearData = [...data.yearData];
    yearData[yearIdx] = { ...yearData[yearIdx], [field]: value };
    update({ ...data, yearData });
  };

  // ═══ Computed Values ═══
  const calculations = useMemo(() => {
    const p = data.parameters;
    const years = data.yearData;
    const investDeprYears = Math.max(p.investDepreciationYears, 1);
    const rdDeprYears = Math.max(p.rdDepreciationYears, 1);
    const invDays = p.inventoryDays ?? 30;
    const recDays = p.receivableDays ?? 45;
    const payDays = p.payableDays ?? 30;

    // First pass: collect all investments/R&D for cumulative depreciation
    const results: any[] = [];
    
    for (let idx = 0; idx < years.length; idx++) {
      const y = years[idx];
      const totalInvestment = y.investmentExternal + y.investmentInternal;
      const totalRD = y.rdExternal + y.rdInternal;
      const grossMarginAbs = y.sales * (y.grossMarginPct / 100);
      const sellingExp = y.sales * (p.sellingExpensesPct / 100);
      const gaExp = y.sales * (p.gaExpensesPct / 100);
      const costsAfterGM = sellingExp + gaExp + y.otherExpenses;

      // Cumulative depreciation: each past year's investment depreciates over its lifetime
      let investDepr = 0;
      let rdDepr = 0;
      let cumInvest = 0;
      let cumInvestDepr = 0;
      let cumRD = 0;
      let cumRDDepr = 0;

      for (let j = 0; j <= idx; j++) {
        const pastInv = years[j].investmentExternal + years[j].investmentInternal;
        const pastRD = years[j].rdExternal + years[j].rdInternal;
        const yearsElapsed = idx - j;
        
        cumInvest += pastInv;
        cumRD += pastRD;

        // Annual depreciation for this vintage
        const invAnnualDepr = pastInv / investDeprYears;
        const rdAnnualDepr = pastRD / rdDeprYears;

        // Add to this year's total depreciation (only if still within depreciation period)
        if (yearsElapsed < investDeprYears) {
          investDepr += invAnnualDepr;
        }
        if (yearsElapsed < rdDeprYears) {
          rdDepr += rdAnnualDepr;
        }

        // Cumulative depreciation (total depreciated so far for this vintage)
        cumInvestDepr += Math.min(yearsElapsed + 1, investDeprYears) * invAnnualDepr;
        cumRDDepr += Math.min(yearsElapsed + 1, rdDeprYears) * rdAnnualDepr;
      }

      const grossMarginInclDepreciation = grossMarginAbs - investDepr - rdDepr;
      const ebit = grossMarginInclDepreciation - costsAfterGM;
      const ebitPct = y.sales > 0 ? ebit / y.sales : 0;

      // Non-current assets = cumulative investments - cumulative depreciation
      const nonCurrentAssets = Math.max((cumInvest - cumInvestDepr) + (cumRD - cumRDDepr), 0);

      // Working Capital
      const inventories = y.sales > 0 ? (y.sales * (1 - y.grossMarginPct / 100)) * (invDays / 365) : 0;
      const receivables = y.sales > 0 ? y.sales * (recDays / 365) : 0;
      const payables = y.sales > 0 ? (y.sales * (1 - y.grossMarginPct / 100)) * (payDays / 365) : 0;
      const workingCapital = inventories + receivables - payables;

      // Capital employed
      const capitalEmployed = Math.max(nonCurrentAssets + workingCapital, 1);
      const roce = ebit / capitalEmployed;

      // Delta Working Capital (increase in WC consumes cash)
      const prevWorkingCapital = idx > 0 ? results[idx - 1].workingCapital : 0;
      const deltaWorkingCapital = workingCapital - prevWorkingCapital;

      // Cash Flow = EBIT + Depreciation (non-cash) - Investments - Delta WC
      const annualCashFlow = ebit - totalInvestment - totalRD + investDepr + rdDepr - deltaWorkingCapital;

      results.push({
        year: y.year,
        totalInvestment,
        totalRD,
        sales: y.sales,
        cogs: y.sales * (1 - y.grossMarginPct / 100),
        grossMarginAbs,
        grossMarginPct: y.grossMarginPct,
        grossMarginInclDepreciation,
        sellingExp,
        gaExp,
        costsAfterGM,
        ebit,
        ebitPct,
        capitalEmployed,
        roce,
        annualCashFlow,
        investDepr,
        rdDepr,
        workingCapital,
        inventories,
        receivables,
        payables,
        nonCurrentAssets,
        deltaWorkingCapital,
      });
    }
    return results;
  }, [data]);

  const accumulatedCashFlow = useMemo(() => {
    let acc = 0;
    return calculations.map(c => {
      acc += c.annualCashFlow;
      return { year: c.year, accumulated: acc, annual: c.annualCashFlow };
    });
  }, [calculations]);

  const totalROCE = useMemo(() => {
    const roces = calculations.map(c => c.roce);
    return roces.reduce((s, r) => s + r, 0) / Math.max(roces.length, 1);
  }, [calculations]);

  const paybackPeriod = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < calculations.length; i++) {
      const prev = acc;
      acc += calculations[i].annualCashFlow;
      if (acc >= 0 && prev < 0) {
        const fraction = Math.abs(prev) / (Math.abs(prev) + acc);
        return i + fraction;
      }
    }
    return null;
  }, [calculations]);

  const npv = useMemo(() => {
    const wacc = data.parameters.wacc / 100;
    return calculations.reduce((sum, c, i) => {
      return sum + c.annualCashFlow / Math.pow(1 + wacc, i + 1);
    }, 0);
  }, [calculations, data.parameters.wacc]);

  const totalSales = calculations.reduce((s, c) => s + c.sales, 0);
  const totalEbit = calculations.reduce((s, c) => s + c.ebit, 0);

  return (
    <div className="space-y-6">
      {/* Edit toggle & Import */}
      {!propReadonly && (
        <div className="flex items-center justify-between gap-2">
          {hasBpData && (
            <Button variant="outline" size="sm" onClick={importFromBusinessPlan} disabled={!editing} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              {bp("Import from Business Plan", "Aus Business Plan übernehmen")}
            </Button>
          )}
          <div className="flex-1" />
          <Button variant={editing ? "default" : "outline"} onClick={() => setEditing(!editing)} size="sm">
            {editing ? bp("Done", "Fertig") : bp("Edit", "Bearbeiten")}
          </Button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label={bp("Total ROCE", "Gesamt-ROCE")}
          value={formatPct(totalROCE)}
          highlight
        />
        <KpiCard
          icon={<Calculator className="h-4 w-4" />}
          label={bp("Payback Period", "Amortisationsdauer")}
          value={paybackPeriod !== null ? `${paybackPeriod.toFixed(1)} Y` : "—"}
        />
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="NPV"
          value={formatM(npv)}
          highlight
        />
        <KpiCard
          icon={<BarChart3 className="h-4 w-4" />}
          label={bp("Total EBIT", "Gesamt-EBIT")}
          value={formatM(totalEbit)}
        />
      </div>

      {/* ═══ Parameters (Collapsible) ═══ */}
      <Collapsible open={showParameters} onOpenChange={setShowParameters}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between gap-1.5 text-xs">
            <span className="flex items-center gap-1.5"><Settings className="h-3 w-3" /> {bp("Parameters", "Parameter")}</span>
            {showParameters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Project Parameters", "Projekt-Parameter")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ParamField label={bp("Project Start", "Projektstart")} value={data.parameters.projectStart} onChange={(v) => updateParam("projectStart", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Start of Operation", "Betriebsbeginn")} value={data.parameters.startOfOperation} onChange={(v) => updateParam("startOfOperation", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Project Duration (Years)", "Projektdauer (Jahre)")} value={data.parameters.projectDuration} onChange={(v) => updateParam("projectDuration", v)} disabled={readonly} type="number" />
              <div className="flex items-center gap-3 col-span-full">
                <Switch checked={data.parameters.isSoftwareOnly} onCheckedChange={(v) => updateParam("isSoftwareOnly", v)} disabled={readonly} />
                <Label className="text-sm">{bp("Software Only", "Nur Software")}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Market Assumptions (read-only reference from Business Plan) */}
          <Card className="border-dashed">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2">{bp("Market Assumptions", "Marktannahmen")} <span className="text-[10px] text-muted-foreground font-normal">({bp("from Business Plan", "aus Business Plan")})</span></CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ParamField label={bp("Market Size (€)", "Marktgröße (€)")} value={data.parameters.marketSize} onChange={(v) => updateParam("marketSize", v)} disabled={true} type="number" />
              <ParamField label={bp("Market Growth Rate (%)", "Marktwachstum (%)")} value={data.parameters.marketGrowthRate} onChange={(v) => updateParam("marketGrowthRate", v)} disabled={true} type="number" />
              <ParamField label={bp("Portfolio Coverage (%)", "Portfolioabdeckung (%)")} value={data.parameters.portfolioCoverage} onChange={(v) => updateParam("portfolioCoverage", v)} disabled={true} type="number" />
              <ParamField label={bp("Visibility (%)", "Sichtbarkeit (%)")} value={data.parameters.visibility} onChange={(v) => updateParam("visibility", v)} disabled={true} type="number" />
              <ParamField label={bp("Visibility Growth (%)", "Sichtbarkeitswachstum (%)")} value={data.parameters.visibilityGrowthRate} onChange={(v) => updateParam("visibilityGrowthRate", v)} disabled={true} type="number" />
              <ParamField label={bp("Hitrate (%)", "Hitrate (%)")} value={data.parameters.hitrate} onChange={(v) => updateParam("hitrate", v)} disabled={true} type="number" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Cost Parameters", "Kosten-Parameter")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ParamField label={bp("G&A Expenses (% of Sales)", "V&V-Kosten (% vom Umsatz)")} value={data.parameters.gaExpensesPct} onChange={(v) => updateParam("gaExpensesPct", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Selling Expenses (% of Sales)", "Vertriebskosten (% vom Umsatz)")} value={data.parameters.sellingExpensesPct} onChange={(v) => updateParam("sellingExpensesPct", v)} disabled={readonly} type="number" />
              <ParamField label={bp("R&D Depreciation (Years)", "F&E-Abschreibung (Jahre)")} value={data.parameters.rdDepreciationYears} onChange={(v) => updateParam("rdDepreciationYears", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Invest Depreciation (Years)", "Invest-Abschreibung (Jahre)")} value={data.parameters.investDepreciationYears} onChange={(v) => updateParam("investDepreciationYears", v)} disabled={readonly} type="number" />
              <ParamField label="WACC (%)" value={data.parameters.wacc} onChange={(v) => updateParam("wacc", v)} disabled={readonly} type="number" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Working Capital Parameters", "Working Capital Parameter")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ParamField label={bp("Inventory Days", "Lagerdauer (Tage)")} value={data.parameters.inventoryDays} onChange={(v) => updateParam("inventoryDays", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Receivable Days (DSO)", "Forderungslaufzeit (Tage)")} value={data.parameters.receivableDays} onChange={(v) => updateParam("receivableDays", v)} disabled={readonly} type="number" />
              <ParamField label={bp("Payable Days (DPO)", "Zahlungsziel Lieferanten (Tage)")} value={data.parameters.payableDays} onChange={(v) => updateParam("payableDays", v)} disabled={readonly} type="number" />
            </CardContent>
          </Card>

          {/* Year-by-Year Input Table */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Year-by-Year Inputs", "Jährliche Eingaben")}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-48"></th>
                    {data.yearData.map(y => (
                      <th key={y.year} className="text-right py-2 px-2 font-semibold text-card-foreground min-w-[80px]">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <EditableTableRow label={bp("Investment External", "Investment Extern")} field="investmentExternal" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                  <EditableTableRow label={bp("Investment Internal", "Investment Intern")} field="investmentInternal" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                  <TableRow label={bp("Total Investment", "Gesamt-Investment")} values={calculations.map(c => c.totalInvestment)} format={formatK} bold />
                  <tr className="h-2" />
                  <EditableTableRow label={bp("R&D External", "F&E Extern")} field="rdExternal" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                  <EditableTableRow label={bp("R&D Internal", "F&E Intern")} field="rdInternal" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                  <TableRow label={bp("Total R&D", "Gesamt-F&E")} values={calculations.map(c => c.totalRD)} format={formatK} bold />
                  <tr className="h-2" />
                  <EditableTableRow label={bp("Sales / Turnover", "Umsatz")} field="sales" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                  <EditableTableRow label={bp("Gross Margin %", "Bruttomarge %")} field="grossMarginPct" yearData={data.yearData} onUpdate={updateYear} disabled={readonly} />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* ═══ Investment & R&D Summary ═══ */}
      <div className="space-y-6">
          {/* Business Case Calculation Table */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Business Case Calculation", "Business Case Berechnung")}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-48"></th>
                    {data.yearData.map(y => (
                      <th key={y.year} className="text-right py-2 px-2 font-semibold text-card-foreground">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow label={bp("Turnover / Sales", "Umsatz / Sales")} values={calculations.map(c => c.sales)} format={formatK} bold />
                  <TableRow label={bp("Gross Margin (%)", "Bruttomarge (%)")} values={calculations.map(c => c.grossMarginPct)} format={(v) => `${v.toFixed(0)}%`} />
                  <TableRow label={bp("Gross Margin (abs.)", "Bruttomarge (abs.)")} values={calculations.map(c => c.grossMarginAbs)} format={formatK} />
                  <TableRow label="COGS" values={calculations.map(c => c.cogs)} format={formatK} muted />
                  <TableRow label={bp("Selling Expenses", "Vertriebskosten")} values={calculations.map(c => c.sellingExp)} format={formatK} muted />
                  <TableRow label={bp("G&A Expenses", "V&V-Kosten")} values={calculations.map(c => c.gaExp)} format={formatK} muted />
                  <TableRow label="EBIT" values={calculations.map(c => c.ebit)} format={formatK} bold highlight />
                  <TableRow label="EBIT %" values={calculations.map(c => c.ebitPct)} format={(v) => `${(v * 100).toFixed(1)}%`} />
                  <TableRow label="ROCE" values={calculations.map(c => c.roce)} format={(v) => `${(v * 100).toFixed(1)}%`} highlight />
                  <tr className="h-2" />
                  <TableRow label={bp("Inventories", "Vorräte")} values={calculations.map(c => c.inventories)} format={formatK} muted />
                  <TableRow label={bp("Receivables", "Forderungen")} values={calculations.map(c => c.receivables)} format={formatK} muted />
                  <TableRow label={bp("Payables", "Verbindlichkeiten")} values={calculations.map(c => -c.payables)} format={formatK} muted />
                  <TableRow label={bp("Working Capital", "Working Capital")} values={calculations.map(c => c.workingCapital)} format={formatK} bold />
                  <TableRow label={bp("Capital Employed", "Eingesetztes Kapital")} values={calculations.map(c => c.capitalEmployed)} format={formatK} bold />
                  <tr className="h-2" />
                  <TableRow label={bp("Annual Cash Flow", "Jährl. Cashflow")} values={accumulatedCashFlow.map(c => c.annual)} format={formatK} />
                  <TableRow label={bp("Accumulated Cash Flow", "Kum. Cashflow")} values={accumulatedCashFlow.map(c => c.accumulated)} format={formatK} bold highlight />
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cash Flow Chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Cash Flow Development", "Cashflow-Entwicklung")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={accumulatedCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number) => formatK(v)} />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Bar dataKey="annual" fill="hsl(var(--primary))" opacity={0.4} name={bp("Annual", "Jährlich")} />
                  <Line type="monotone" dataKey="accumulated" stroke="hsl(var(--success))" strokeWidth={2} name={bp("Accumulated", "Kumuliert")} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      </div>

      {/* ═══ P&L / Business Case ═══ */}
      <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Investment & R&D Summary", "Investment & F&E Übersicht")}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-48"></th>
                    {data.yearData.map(y => (
                      <th key={y.year} className="text-right py-2 px-2 font-semibold text-card-foreground min-w-[80px]">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow label={bp("Investment External", "Investment Extern")} values={data.yearData.map(y => y.investmentExternal)} format={formatK} />
                  <TableRow label={bp("Investment Internal", "Investment Intern")} values={data.yearData.map(y => y.investmentInternal)} format={formatK} />
                  <TableRow label={bp("Total Investment", "Gesamt-Investment")} values={calculations.map(c => c.totalInvestment)} format={formatK} bold />
                  <TableRow label={bp("Invest Depreciation", "Invest-Abschreibung")} values={calculations.map(c => c.investDepr)} format={formatK} muted />
                  <tr className="h-2" />
                  <TableRow label={bp("R&D External", "F&E Extern")} values={data.yearData.map(y => y.rdExternal)} format={formatK} />
                  <TableRow label={bp("R&D Internal", "F&E Intern")} values={data.yearData.map(y => y.rdInternal)} format={formatK} />
                  <TableRow label={bp("Total R&D", "Gesamt-F&E")} values={calculations.map(c => c.totalRD)} format={formatK} bold />
                  <TableRow label={bp("R&D Depreciation", "F&E-Abschreibung")} values={calculations.map(c => c.rdDepr)} format={formatK} muted />
                  <tr className="h-2" />
                  <TableRow label={bp("Total Depreciation", "Gesamt-Abschreibung")} values={calculations.map(c => c.investDepr + c.rdDepr)} format={formatK} bold />
                  <TableRow label={bp("Non-Current Assets", "Anlagevermögen")} values={calculations.map(c => c.nonCurrentAssets)} format={formatK} bold highlight />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ROCE & NPV Tab ═══ */}
        <TabsContent value="roce" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("ROCE & NPV Calculation", "ROCE & NPV Berechnung")}</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-48"></th>
                    <th className="text-right py-2 px-2 font-semibold text-card-foreground">{bp("Total", "Gesamt")}</th>
                    {data.yearData.map(y => (
                      <th key={y.year} className="text-right py-2 px-2 font-semibold text-card-foreground">{y.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1.5 px-2 font-semibold text-card-foreground" colSpan={data.yearData.length + 2}>
                      {bp("Initial Investment / R&D", "Erstinvestment / F&E")}
                    </td>
                  </tr>
                  <TotalRow label={bp("Total Investment", "Gesamt-Investment")} total={calculations.reduce((s, c) => s + c.totalInvestment, 0)} values={calculations.map(c => c.totalInvestment)} format={formatK} />
                  <TotalRow label={bp("Total R&D", "Gesamt-F&E")} total={calculations.reduce((s, c) => s + c.totalRD, 0)} values={calculations.map(c => c.totalRD)} format={formatK} />
                  
                  <tr className="border-b border-border/50 mt-2">
                    <td className="py-1.5 px-2 font-semibold text-card-foreground pt-4" colSpan={data.yearData.length + 2}>
                      EBIT
                    </td>
                  </tr>
                  <TotalRow label={bp("Turnover / Sales", "Umsatz")} total={totalSales} values={calculations.map(c => c.sales)} format={formatK} />
                  <TotalRow label="EBIT" total={totalEbit} values={calculations.map(c => c.ebit)} format={formatK} bold />
                  <TotalRow label="EBIT %" total={totalSales > 0 ? totalEbit / totalSales : 0} values={calculations.map(c => c.ebitPct)} format={(v) => `${(v * 100).toFixed(1)}%`} totalFormat={(v) => `${(v * 100).toFixed(1)}%`} />

                  <tr className="border-b border-border/50">
                    <td className="py-1.5 px-2 font-semibold text-card-foreground pt-4" colSpan={data.yearData.length + 2}>
                      {bp("Working Capital", "Working Capital")}
                    </td>
                  </tr>
                  <TotalRow label={bp("Inventories", "Vorräte")} total={calculations.reduce((s, c) => s + c.inventories, 0)} values={calculations.map(c => c.inventories)} format={formatK} />
                  <TotalRow label={bp("Receivables", "Forderungen")} total={calculations.reduce((s, c) => s + c.receivables, 0)} values={calculations.map(c => c.receivables)} format={formatK} />
                  <TotalRow label={bp("Payables", "Verbindlichkeiten")} total={calculations.reduce((s, c) => s + c.payables, 0)} values={calculations.map(c => -c.payables)} format={formatK} />
                  <TotalRow label={bp("Net Working Capital", "Netto Working Capital")} total={calculations.reduce((s, c) => s + c.workingCapital, 0)} values={calculations.map(c => c.workingCapital)} format={formatK} bold />
                  <TotalRow label={bp("Capital Employed", "Eingesetztes Kapital")} total={calculations.reduce((s, c) => s + c.capitalEmployed, 0) / Math.max(calculations.length, 1)} values={calculations.map(c => c.capitalEmployed)} format={formatK} bold />

                  <tr className="border-b border-border/50">
                    <td className="py-1.5 px-2 font-semibold text-card-foreground pt-4" colSpan={data.yearData.length + 2}>
                      ROCE
                    </td>
                  </tr>
                  <TotalRow label="ROCE" total={totalROCE} values={calculations.map(c => c.roce)} format={(v) => `${(v * 100).toFixed(1)}%`} totalFormat={(v) => `${(v * 100).toFixed(1)}%`} bold highlight />

                  <tr className="border-b border-border/50">
                    <td className="py-1.5 px-2 font-semibold text-card-foreground pt-4" colSpan={data.yearData.length + 2}>
                      {bp("Net Present Value (NPV)", "Kapitalwert (NPV)")}
                    </td>
                  </tr>
                  <TotalRow label={bp("Depreciation (add-back)", "Abschreibungen (Rückrechnung)")} total={calculations.reduce((s, c) => s + c.investDepr + c.rdDepr, 0)} values={calculations.map(c => c.investDepr + c.rdDepr)} format={formatK} />
                  <TotalRow label={bp("Δ Working Capital", "Δ Working Capital")} total={calculations.reduce((s, c) => s + c.deltaWorkingCapital, 0)} values={calculations.map(c => -c.deltaWorkingCapital)} format={formatK} />
                  <TotalRow label={bp("Annual Cash Flow", "Jährl. Cashflow")} total={0} values={accumulatedCashFlow.map(c => c.annual)} format={formatK} bold />
                  <TotalRow label={bp("Accumulated Cash Flow", "Kum. Cashflow")} total={0} values={accumulatedCashFlow.map(c => c.accumulated)} format={formatK} bold highlight />
                  <tr className="border-b border-border/50">
                    <td className="py-2 px-2 text-muted-foreground">{bp("Discounted Cash Flow (NPV)", "Diskontierter Cashflow (NPV)")}</td>
                    <td className="py-2 px-2 text-right font-bold text-primary">{formatM(npv)}</td>
                    <td colSpan={data.yearData.length} className="py-2 px-2 text-right text-muted-foreground text-[10px]">
                      WACC: {data.parameters.wacc}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-muted-foreground">{bp("Payback Period (BEP)", "Amortisationsdauer (BEP)")}</td>
                    <td className="py-2 px-2 text-right font-bold text-primary">{paybackPeriod !== null ? `${paybackPeriod.toFixed(1)} Y` : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* ROCE Chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("ROCE & EBIT Development", "ROCE & EBIT Entwicklung")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={calculations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Bar yAxisId="left" dataKey="ebit" fill="hsl(var(--primary))" opacity={0.5} name="EBIT" />
                  <Line yAxisId="right" type="monotone" dataKey="roce" stroke="hsl(var(--warning))" strokeWidth={2} name="ROCE" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Notes Tab ═══ */}
        <TabsContent value="notes" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">{bp("Notes & Assumptions", "Notizen & Annahmen")}</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={data.notes}
                onChange={(e) => update({ ...data, notes: e.target.value })}
                disabled={readonly}
                rows={8}
                placeholder={bp("Document assumptions, sources, and key decisions...", "Annahmen, Quellen und Entscheidungen dokumentieren...")}
                className="text-sm resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ IDA Assessment Tab ═══ */}
        <TabsContent value="ida" className="space-y-4 mt-4">
          <BusinessCaseAssessment
            opportunityId={opportunityId}
            title={oppTitle}
            description={oppDescription}
            industry={industry}
            technology={technology}
            kpis={{
              totalROCE,
              npv,
              paybackPeriod,
              totalEbit,
              totalSales,
            }}
            parameters={data.parameters}
            yearData={calculations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══ Helper Components ═══

function KpiCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">{icon}</div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className={`text-xl font-bold mt-1 ${highlight ? "text-primary" : "text-card-foreground"}`}>{value}</p>
    </div>
  );
}

function ParamField({ label, value, onChange, disabled, type }: { label: string; value: number; onChange: (v: number) => void; disabled: boolean; type: string }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} disabled={disabled} className="text-sm" />
    </div>
  );
}

function TableRow({ label, values, format, bold, highlight, muted: isMuted }: {
  label: string; values: number[]; format: (v: number) => string; bold?: boolean; highlight?: boolean; muted?: boolean;
}) {
  return (
    <tr className={`border-b border-border/30 ${highlight ? "bg-primary/5" : ""}`}>
      <td className={`py-1.5 px-2 ${bold ? "font-semibold text-card-foreground" : isMuted ? "text-muted-foreground" : "text-card-foreground"}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`py-1.5 px-2 text-right tabular-nums ${bold ? "font-semibold" : ""} ${v < 0 ? "text-destructive" : highlight ? "text-primary" : "text-card-foreground"}`}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

function TotalRow({ label, total, values, format, totalFormat, bold, highlight }: {
  label: string; total: number; values: number[]; format: (v: number) => string; totalFormat?: (v: number) => string; bold?: boolean; highlight?: boolean;
}) {
  const fmt = totalFormat || format;
  return (
    <tr className={`border-b border-border/30 ${highlight ? "bg-primary/5" : ""}`}>
      <td className={`py-1.5 px-2 ${bold ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>{label}</td>
      <td className={`py-1.5 px-2 text-right tabular-nums ${bold ? "font-bold" : "font-medium"} ${total < 0 ? "text-destructive" : "text-primary"}`}>
        {total !== 0 ? fmt(total) : ""}
      </td>
      {values.map((v, i) => (
        <td key={i} className={`py-1.5 px-2 text-right tabular-nums ${bold ? "font-semibold" : ""} ${v < 0 ? "text-destructive" : highlight ? "text-primary" : "text-card-foreground"}`}>
          {format(v)}
        </td>
      ))}
    </tr>
  );
}

function EditableTableRow({ label, field, yearData, onUpdate, disabled }: {
  label: string; field: keyof InvestmentCaseYearData; yearData: InvestmentCaseYearData[]; onUpdate: (idx: number, field: keyof InvestmentCaseYearData, value: number) => void; disabled: boolean;
}) {
  return (
    <tr className="border-b border-border/30">
      <td className="py-1.5 px-2 text-card-foreground text-xs">{label}</td>
      {yearData.map((y, i) => (
        <td key={y.year} className="py-0.5 px-1">
          <Input
            type="number"
            value={y[field] || ""}
            onChange={(e) => onUpdate(i, field, parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="h-7 text-xs text-right w-full min-w-[70px]"
          />
        </td>
      ))}
    </tr>
  );
}
