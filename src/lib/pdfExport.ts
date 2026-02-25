import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Opportunity, calculateTotalScore, STAGE_ORDER } from "./types";

const STAGE_LABELS: Record<string, string> = {
  idea: "Idee",
  rough_scoring: "Grobes Scoring",
  gate1: "Gate 1",
  detailed_scoring: "Detail-Scoring",
  gate2: "Gate 2",
  business_case: "Umsetzungs- und GTM-Plan",
  implement_review: "Umsetzung & Review",
  closed: "Geschlossen",
};

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
const HEADER_BG: [number, number, number] = [241, 245, 249];

function fmt(n: number | undefined, suffix = ""): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("de-DE") + suffix;
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  if (y > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, 14, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + 8;
}

function addKeyValue(doc: jsPDF, y: number, key: string, value: string): number {
  if (y > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.text(key + ":", 14, y);
  doc.setFont("helvetica", "normal");
  const keyWidth = doc.getTextWidth(key + ": ");
  doc.text(value || "—", 14 + keyWidth, y);
  return y + 6;
}

// ── Single Opportunity PDF ──

export function exportOpportunityPdf(opp: Opportunity) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, `BD Navigator – ${opp.title}`);

  let y = 38;

  // Meta info
  y = addSectionTitle(doc, y, "Übersicht");
  y = addKeyValue(doc, y, "Titel", opp.title);
  y = addKeyValue(doc, y, "Phase", STAGE_LABELS[opp.stage] || opp.stage);
  y = addKeyValue(doc, y, "Branche", opp.industry);
  y = addKeyValue(doc, y, "Geografie", opp.geography);
  y = addKeyValue(doc, y, "Technologie", opp.technology);
  y = addKeyValue(doc, y, "Verantwortlicher", opp.owner);
  y = addKeyValue(doc, y, "Erstellt", new Date(opp.createdAt).toLocaleDateString("de-DE"));

  if (opp.description) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Beschreibung:", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const lines = doc.splitTextToSize(opp.description, pw - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 4;
  }

  // Rough Scoring
  y += 4;
  y = addSectionTitle(doc, y, "Grobes Scoring");
  const roughScore = calculateTotalScore(opp.scoring);

  autoTable(doc, {
    startY: y,
    head: [["Kriterium", "Score (1–5)", "Gewicht", "Kommentar"]],
    body: [
      ["Marktattraktivität", String(opp.scoring.marketAttractiveness.score), "3", opp.scoring.marketAttractiveness.comment || "—"],
      ["Strategischer Fit", String(opp.scoring.strategicFit.score), "3", opp.scoring.strategicFit.comment || "—"],
      ["Machbarkeit", String(opp.scoring.feasibility.score), "2", opp.scoring.feasibility.comment || "—"],
      ["Kommerzielle Tragfähigkeit", String(opp.scoring.commercialViability.score), "2", opp.scoring.commercialViability.comment || "—"],
      ["Risiko (invertiert)", String(opp.scoring.risk.score), "1", opp.scoring.risk.comment || "—"],
    ],
    headStyles: { fillColor: PRIMARY_COLOR },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addKeyValue(doc, y, "Gesamtbewertung", roughScore.toFixed(1) + " / 5.0");

  // Detailed Scoring
  const ds = opp.detailedScoring;
  if (ds) {
    y += 4;
    y = addSectionTitle(doc, y, "Detail-Scoring");
    const detailedTotal = Math.round(((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) * 10) / 10;

    autoTable(doc, {
      startY: y,
      head: [["Kriterium", "Score (1–5)"]],
      body: [
        ["Marktattraktivität", String(ds.marketAttractiveness.score)],
        ["Strategischer Fit", String(ds.strategicFit.score)],
        ["Machbarkeit", String(ds.feasibility.score)],
        ["Kommerzielle Tragfähigkeit", String(ds.commercialViability.score)],
        ["Risiko (invertiert)", String(ds.risk.score)],
      ],
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
    y = addKeyValue(doc, y, "Detail-Gesamtbewertung", detailedTotal.toFixed(1) + " / 5.0");

    // TAM/SAM
    const ma = ds.marketAttractiveness.analysis;
    if (ma.tamProjections?.some(p => p.value > 0) || ma.samProjections?.some(p => p.value > 0)) {
      y += 4;
      y = addSectionTitle(doc, y, "TAM / SAM Projektionen");
      if (ma.tamDescription) {
        y = addKeyValue(doc, y, "TAM-Definition", ma.tamDescription.substring(0, 100));
      }
      if (ma.samDescription) {
        y = addKeyValue(doc, y, "SAM-Definition", ma.samDescription.substring(0, 100));
      }

      autoTable(doc, {
        startY: y,
        head: [["Jahr", "TAM (M€)", "SAM (M€)"]],
        body: ma.tamProjections.map((tp, i) => [
          String(tp.year),
          fmt(tp.value),
          fmt(ma.samProjections[i]?.value),
        ]),
        headStyles: { fillColor: PRIMARY_COLOR },
        styles: { fontSize: 9 },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Commercial viability projections
    if (ds.commercialViability.projections?.some(p => p.revenue > 0)) {
      y += 2;
      y = addSectionTitle(doc, y, "Umsatzprojektion (5 Jahre)");
      autoTable(doc, {
        startY: y,
        head: [["Jahr", "Umsatz (€)", "Kosten (€)", "Gewinn (€)"]],
        body: ds.commercialViability.projections.map(p => [
          String(p.year),
          fmt(p.revenue),
          fmt(p.costs),
          fmt(p.revenue - p.costs),
        ]),
        headStyles: { fillColor: PRIMARY_COLOR },
        styles: { fontSize: 9 },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Risk items
    if (ds.risk.riskItems && ds.risk.riskItems.length > 0) {
      y += 2;
      y = addSectionTitle(doc, y, "Risikoregister");
      autoTable(doc, {
        startY: y,
        head: [["Risiko", "Kategorie", "P", "I", "Mitigation"]],
        body: ds.risk.riskItems.map(r => [
          r.name, r.category, String(r.probability), String(r.impact), r.mitigation || "—"
        ]),
        headStyles: { fillColor: PRIMARY_COLOR },
        styles: { fontSize: 8 },
        margin: { left: 14 },
        columnStyles: { 4: { cellWidth: 60 } },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }
  }

  // Business Case
  const bc = opp.businessCase;
  if (bc) {
    y += 4;
    y = addSectionTitle(doc, y, "Business Case");
    autoTable(doc, {
      startY: y,
      head: [["Kennzahl", "Wert"]],
      body: [
        ["Investitionskosten", fmt(bc.investmentCost, " €")],
        ["Erwarteter Jahresumsatz", fmt(bc.expectedRevenue, " €")],
        ["ROI", fmt(bc.roi, " %")],
        ["Break-Even", fmt(bc.breakEvenMonths, " Monate")],
        ["Amortisationszeit", fmt(bc.paybackPeriod, " Monate")],
        ["NPV", fmt(bc.npv, " €")],
      ],
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
    if (bc.notes) {
      y = addKeyValue(doc, y, "Anmerkungen", bc.notes.substring(0, 200));
    }
  }

  // Gate Decisions
  if (opp.gates.length > 0) {
    y += 4;
    y = addSectionTitle(doc, y, "Gate-Entscheidungen");
    autoTable(doc, {
      startY: y,
      head: [["Gate", "Entscheidung", "Entscheider", "Datum", "Kommentar"]],
      body: opp.gates.map(g => [
        g.gate.toUpperCase().replace("GATE", "Gate "),
        g.decision.toUpperCase(),
        g.decider || "—",
        g.date ? new Date(g.date).toLocaleDateString("de-DE") : "—",
        g.comment || "—",
      ]),
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 9 },
      margin: { left: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `BD Navigator – Exportiert am ${new Date().toLocaleDateString("de-DE")} – Seite ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`${opp.title.replace(/[^a-zA-Z0-9äöüÄÖÜß ]/g, "_")}_Report.pdf`);
}

// ── Dashboard Overview PDF ──

export function exportDashboardPdf(opportunities: Opportunity[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, "BD Navigator – Pipeline-Übersicht");

  let y = 38;

  // Summary KPIs
  y = addSectionTitle(doc, y, "Zusammenfassung");
  const active = opportunities.filter(o => o.stage !== "closed").length;
  const gtm = opportunities.filter(o => o.stage === "implement_review").length;
  const avgScore = opportunities.length > 0
    ? (opportunities.reduce((s, o) => s + calculateTotalScore(o.scoring), 0) / opportunities.length).toFixed(1)
    : "—";

  y = addKeyValue(doc, y, "Gesamt-Opportunities", String(opportunities.length));
  y = addKeyValue(doc, y, "Aktiv", String(active));
  y = addKeyValue(doc, y, "Go-To-Market", String(gtm));
  y = addKeyValue(doc, y, "Durchschnittlicher Score", avgScore);

  // Stage distribution
  y += 4;
  y = addSectionTitle(doc, y, "Verteilung nach Phase");
  const stageCounts = STAGE_ORDER.map(s => ({
    stage: STAGE_LABELS[s] || s,
    count: opportunities.filter(o => o.stage === s).length,
  })).filter(s => s.count > 0);

  autoTable(doc, {
    startY: y,
    head: [["Phase", "Anzahl"]],
    body: stageCounts.map(s => [s.stage, String(s.count)]),
    headStyles: { fillColor: PRIMARY_COLOR },
    styles: { fontSize: 9 },
    margin: { left: 14 },
    tableWidth: 120,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Full pipeline table
  y = addSectionTitle(doc, y, "Alle Opportunities");

  autoTable(doc, {
    startY: y,
    head: [["Titel", "Phase", "Branche", "Geografie", "Technologie", "Verantwortl.", "Rough Score", "Detail Score", "Payback"]],
    body: opportunities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(opp => {
        const rs = calculateTotalScore(opp.scoring).toFixed(1);
        const ds = opp.detailedScoring;
        const detScore = ds
          ? (((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) ).toFixed(1)
          : "—";
        const payback = opp.businessCase?.paybackPeriod ? `${opp.businessCase.paybackPeriod} Mo` : "—";
        return [
          opp.title,
          STAGE_LABELS[opp.stage] || opp.stage,
          opp.industry || "—",
          opp.geography || "—",
          opp.technology || "—",
          opp.owner || "—",
          rs,
          detScore,
          payback,
        ];
      }),
    headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
    columnStyles: {
      0: { cellWidth: 50 },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `BD Navigator – Exportiert am ${new Date().toLocaleDateString("de-DE")} – Seite ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`BD_Navigator_Pipeline_${new Date().toISOString().slice(0, 10)}.pdf`);
}
