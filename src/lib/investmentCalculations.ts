import { InvestmentCaseData, InvestmentCaseYearData, InvestmentCaseParameters } from "./types";

export interface YearCalcResult {
  year: number;
  totalInvestment: number;
  totalRD: number;
  sales: number;
  cogs: number;
  grossMarginAbs: number;
  grossMarginPct: number;
  grossMarginInclDepreciation: number;
  sellingExp: number;
  gaExp: number;
  costsAfterGM: number;
  ebit: number;
  ebitPct: number;
  capitalEmployed: number;
  roce: number;
  annualCashFlow: number;
  investDepr: number;
  rdDepr: number;
  workingCapital: number;
  inventories: number;
  receivables: number;
  payables: number;
  nonCurrentAssets: number;
  deltaWorkingCapital: number;
}

export interface AccumulatedCashFlowEntry {
  year: number;
  accumulated: number;
  annual: number;
}

export function calculateYearData(
  params: InvestmentCaseParameters,
  yearData: InvestmentCaseYearData[]
): YearCalcResult[] {
  const investDeprYears = Math.max(params.investDepreciationYears, 1);
  const rdDeprYears = Math.max(params.rdDepreciationYears, 1);
  const invDays = params.inventoryDays ?? 30;
  const recDays = params.receivableDays ?? 45;
  const payDays = params.payableDays ?? 30;

  const results: YearCalcResult[] = [];

  for (let idx = 0; idx < yearData.length; idx++) {
    const y = yearData[idx];
    const totalInvestment = y.investmentExternal + y.investmentInternal;
    const totalRD = y.rdExternal + y.rdInternal;
    const grossMarginAbs = y.sales * (y.grossMarginPct / 100);
    const sellingExp = y.sales * (params.sellingExpensesPct / 100);
    const gaExp = y.sales * (params.gaExpensesPct / 100);
    const costsAfterGM = sellingExp + gaExp + y.otherExpenses;

    let investDepr = 0;
    let rdDepr = 0;
    let cumInvest = 0;
    let cumInvestDepr = 0;
    let cumRD = 0;
    let cumRDDepr = 0;

    for (let j = 0; j <= idx; j++) {
      const pastInv = yearData[j].investmentExternal + yearData[j].investmentInternal;
      const pastRD = yearData[j].rdExternal + yearData[j].rdInternal;
      const yearsElapsed = idx - j;

      cumInvest += pastInv;
      cumRD += pastRD;

      const invAnnualDepr = pastInv / investDeprYears;
      const rdAnnualDepr = pastRD / rdDeprYears;

      if (yearsElapsed < investDeprYears) investDepr += invAnnualDepr;
      if (yearsElapsed < rdDeprYears) rdDepr += rdAnnualDepr;

      cumInvestDepr += Math.min(yearsElapsed + 1, investDeprYears) * invAnnualDepr;
      cumRDDepr += Math.min(yearsElapsed + 1, rdDeprYears) * rdAnnualDepr;
    }

    const grossMarginInclDepreciation = grossMarginAbs - investDepr - rdDepr;
    const ebit = grossMarginInclDepreciation - costsAfterGM;
    const ebitPct = y.sales > 0 ? ebit / y.sales : 0;
    const nonCurrentAssets = Math.max((cumInvest - cumInvestDepr) + (cumRD - cumRDDepr), 0);

    const inventories = y.sales > 0 ? (y.sales * (1 - y.grossMarginPct / 100)) * (invDays / 365) : 0;
    const receivables = y.sales > 0 ? y.sales * (recDays / 365) : 0;
    const payables = y.sales > 0 ? (y.sales * (1 - y.grossMarginPct / 100)) * (payDays / 365) : 0;
    const workingCapital = inventories + receivables - payables;

    const capitalEmployed = Math.max(nonCurrentAssets + workingCapital, 1);
    const roce = ebit / capitalEmployed;

    const prevWorkingCapital = idx > 0 ? results[idx - 1].workingCapital : 0;
    const deltaWorkingCapital = workingCapital - prevWorkingCapital;

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
}

export function calculateAccumulatedCashFlow(
  yearCalcs: YearCalcResult[]
): AccumulatedCashFlowEntry[] {
  let acc = 0;
  return yearCalcs.map((c) => {
    acc += c.annualCashFlow;
    return { year: c.year, accumulated: acc, annual: c.annualCashFlow };
  });
}

export function calculatePaybackPeriod(yearCalcs: YearCalcResult[]): number | null {
  let acc = 0;
  for (let i = 0; i < yearCalcs.length; i++) {
    const prev = acc;
    acc += yearCalcs[i].annualCashFlow;
    if (acc >= 0 && prev < 0) {
      const fraction = Math.abs(prev) / (Math.abs(prev) + acc);
      return i + fraction;
    }
  }
  return null;
}

export function calculateNPV(yearCalcs: YearCalcResult[], waccPct: number): number {
  const wacc = waccPct / 100;
  return yearCalcs.reduce((sum, c, i) => sum + c.annualCashFlow / Math.pow(1 + wacc, i + 1), 0);
}

export function calculateAverageROCE(yearCalcs: YearCalcResult[]): number {
  if (yearCalcs.length === 0) return 0;
  return yearCalcs.reduce((s, c) => s + c.roce, 0) / yearCalcs.length;
}
