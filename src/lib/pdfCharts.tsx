import React from "react";
import { createRoot } from "react-dom/client";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Legend, ReferenceLine, Cell,
} from "recharts";
import type { Opportunity } from "./types";
import { calculateYearData, calculateAccumulatedCashFlow } from "./investmentCalculations";

export interface PdfChart {
  title: string;
  dataUrl: string;
  width: number;
  height: number;
}

const AXIS = { fontSize: 11, fill: "#475569" } as const;
const GRID = "#e2e8f0";
const BLUE = "#2f80ed";
const GREEN = "#22a06b";
const AMBER = "#e6a012";
const RED = "#d64545";

const W = 900;

/** Render a React chart offscreen and rasterize its SVG to a PNG data URL. */
async function rasterize(node: React.ReactElement, width: number, height: number): Promise<string | null> {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${height}px;background:#ffffff;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    root.render(node);
    // let recharts commit its layout
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    await new Promise(r => setTimeout(r, 60));
    const svg = host.querySelector("svg");
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `text{font-family:Helvetica,Arial,sans-serif;}`;
    clone.insertBefore(style, clone.firstChild);
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#ffffff");
    clone.insertBefore(bg, style.nextSibling);

    const svgStr = new XMLSerializer().serializeToString(clone);
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
    const img = new Image();
    const loaded = new Promise<boolean>(res => {
      img.onload = () => res(true);
      img.onerror = () => res(false);
    });
    img.src = url;
    if (!(await loaded)) return null;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  } finally {
    setTimeout(() => {
      try { root.unmount(); } catch { /* noop */ }
      host.remove();
    }, 0);
  }
}

const num = (v: unknown) => (typeof v === "number" && !isNaN(v) ? v : 0);

/** Builds all charts available for this opportunity as PNG data URLs. */
export async function buildBusinessPlanCharts(opp: Opportunity): Promise<PdfChart[]> {
  const charts: PdfChart[] = [];
  const bp: any = opp.businessPlan;
  const ma: any = bp?.marketAttractiveness?.analysis;
  const push = async (title: string, node: React.ReactElement, h = 300) => {
    const dataUrl = await rasterize(node, W, h);
    if (dataUrl) charts.push({ title, dataUrl, width: W, height: h });
  };

  const tamProj: any[] = ma?.tamProjections || [];
  const samProj: any[] = ma?.samProjections || [];
  const somProj: any[] = bp?.somOverview?.projections || [];

  // 1. TAM / SAM / SOM development
  const devData = [1, 2, 3, 4, 5].map(y => ({
    year: `Year ${y}`,
    TAM: num(tamProj.find(p => p.year === y)?.value),
    SAM: num(samProj.find(p => p.year === y)?.value),
    SOM: num(somProj.find(p => p.year === y)?.value),
  }));
  if (devData.some(d => d.TAM || d.SAM || d.SOM)) {
    await push("TAM – SAM – SOM Development (5 Years, M EUR)", (
      <AreaChart width={W} height={320} data={devData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="year" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Legend />
        <Area isAnimationActive={false} type="monotone" dataKey="TAM" stroke={BLUE} fill={BLUE} fillOpacity={0.15} strokeWidth={2} />
        <Area isAnimationActive={false} type="monotone" dataKey="SAM" stroke={GREEN} fill={GREEN} fillOpacity={0.2} strokeWidth={2} />
        <Area isAnimationActive={false} type="monotone" dataKey="SOM" stroke={AMBER} fill={AMBER} fillOpacity={0.3} strokeWidth={2} />
      </AreaChart>
    ), 320);
  }

  // 2-4. Individual projections
  const single = async (label: string, proj: any[], color: string) => {
    if (!proj.some(p => num(p.value) > 0)) return;
    const data = proj.map(p => ({ name: `Y${p.year}`, [label]: num(p.value) }));
    await push(`${label} Projections (M EUR)`, (
      <BarChart width={W} height={260} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="name" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Bar isAnimationActive={false} dataKey={label} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    ), 260);
  };
  await single("TAM", tamProj, BLUE);
  await single("SAM", samProj, GREEN);
  await single("SOM", somProj, AMBER);

  // 5. Geographic potential (TAM / SAM / SOM regions, rating 1-5)
  const tamR: any[] = bp?.tamOverview?.geographicalRegions || [];
  const samR: any[] = bp?.samOverview?.geographicalRegions || [];
  const somR: any[] = bp?.somOverview?.geographicalRegions || [];
  const regionNames = [...new Set([...tamR, ...samR, ...somR].map(r => r?.region).filter(Boolean))];
  if (regionNames.length) {
    const geoData = regionNames.map(rn => ({
      region: rn,
      TAM: num(tamR.find(r => r.region === rn)?.potential),
      SAM: num(samR.find(r => r.region === rn)?.potential),
      SOM: num(somR.find(r => r.region === rn)?.potential),
    }));
    const h = Math.max(220, regionNames.length * 46 + 60);
    await push("Geographic Potential by Region (rating 1–5)", (
      <BarChart width={W} height={h} data={geoData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis type="number" domain={[0, 5]} tick={AXIS} />
        <YAxis type="category" dataKey="region" width={150} tick={AXIS} />
        <Legend />
        <Bar isAnimationActive={false} dataKey="TAM" fill={BLUE} />
        <Bar isAnimationActive={false} dataKey="SAM" fill={GREEN} />
        <Bar isAnimationActive={false} dataKey="SOM" fill={AMBER} />
      </BarChart>
    ), h);
  }

  // 6. Revenue vs. Costs (commercial viability)
  const cvProj: any[] = bp?.commercialViability?.projections || [];
  if (cvProj.some(p => num(p.revenue) > 0 || num(p.costs) > 0)) {
    const data = cvProj.map(p => ({
      year: `Y${p.year}`,
      Revenue: num(p.revenue),
      Costs: num(p.costs),
      Margin: num(p.revenue) - num(p.costs),
    }));
    await push("Revenue vs. Costs Projection", (
      <ComposedChart width={W} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="year" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Legend />
        <Bar isAnimationActive={false} dataKey="Revenue" fill={GREEN} />
        <Bar isAnimationActive={false} dataKey="Costs" fill={RED} />
        <Line isAnimationActive={false} type="monotone" dataKey="Margin" stroke={BLUE} strokeWidth={2} dot={false} />
      </ComposedChart>
    ), 300);
  }

  // 7-8. Investment case: cash flow & ROCE
  const ic: any = opp.investmentCase;
  if (ic?.yearData?.length) {
    const calcs = calculateYearData(ic.parameters, ic.yearData);
    const acc = calculateAccumulatedCashFlow(calcs);
    if (acc.length) {
      const data = acc.map((a: any) => ({
        year: String(a.year),
        Annual: num(a.annual),
        Accumulated: num(a.accumulated),
      }));
      await push("Cash Flow Development (EUR)", (
        <ComposedChart width={W} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="year" tick={AXIS} />
          <YAxis tick={AXIS} />
          <Legend />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar isAnimationActive={false} dataKey="Annual">
            {data.map((d, i) => <Cell key={i} fill={d.Annual >= 0 ? GREEN : RED} />)}
          </Bar>
          <Line isAnimationActive={false} type="monotone" dataKey="Accumulated" stroke={BLUE} strokeWidth={2} dot={false} />
        </ComposedChart>
      ), 300);
    }
    if (calcs.length) {
      const roceData = calcs.map((c: any) => ({ year: String(c.year), ROCE: Number((num(c.roce) * 100).toFixed(1)) }));
      await push("ROCE Development (%)", (
        <ComposedChart width={W} height={280} data={roceData}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
          <XAxis dataKey="year" tick={AXIS} />
          <YAxis tick={AXIS} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar isAnimationActive={false} dataKey="ROCE" fill={BLUE} radius={[4, 4, 0, 0]} />
        </ComposedChart>
      ), 280);
    }
  }

  return charts;
}
