import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Opportunity, Scoring, calculateTotalScore, SCORING_WEIGHTS, STAGE_ORDER } from "./types";
import { getQuestionsByCategory, ROUGH_SCORING_QUESTIONS } from "./roughScoringQuestions";
import { loadAssessment, AIAssessmentResult, getRatingLabel } from "./aiAssessmentService";

const STAGE_LABELS: Record<string, string> = {
  idea: "Idee",
  rough_scoring: "Idea Scoring",
  gate1: "Gate 1",
  detailed_scoring: "Business Plan",
  gate2: "Gate 2",
  business_case: "Umsetzungs- und GTM-Plan",
  implement_review: "Umsetzung & Review",
  closed: "Geschlossen",
};

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
const HEADER_BG: [number, number, number] = [241, 245, 249];
const SUCCESS_COLOR: [number, number, number] = [34, 197, 94];
const WARNING_COLOR: [number, number, number] = [234, 179, 8];
const DANGER_COLOR: [number, number, number] = [239, 68, 68];

const CATEGORY_LABELS: Record<string, string> = {
  marketAttractiveness: "Marktattraktivität",
  strategicFit: "Strategischer Fit",
  feasibility: "Machbarkeit",
  commercialViability: "Kommerzielle Tragfähigkeit",
  risk: "Risiko",
};

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

function addSubSectionTitle(doc: jsPDF, y: number, title: string): number {
  if (y > doc.internal.pageSize.getHeight() - 25) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text(title, 14, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + 6;
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

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 15) {
    doc.addPage();
    return 20;
  }
  return y;
}

function getScoreColorRgb(score: number): [number, number, number] {
  if (score >= 4) return SUCCESS_COLOR;
  if (score >= 3) return WARNING_COLOR;
  return DANGER_COLOR;
}

// ── Single Opportunity PDF ──

export async function exportOpportunityPdf(opp: Opportunity) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, `NOVI – ${opp.title}`);

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

  // ─── IDEA SCORING SECTION ───────────────────────────────────────────
  y += 4;
  y = addSectionTitle(doc, y, "Idea Scoring – Ergebnis");

  const roughScore = calculateTotalScore(opp.scoring);
  const answers: Record<string, number> = (opp as any).roughScoringAnswers || {};
  const comments: Record<string, string> = (opp as any).roughScoringComments || {};
  const scoringSources: Record<string, string[]> = (opp as any).roughScoringSources || {};
  const categorizedQuestions = getQuestionsByCategory();

  // Total Score
  const scoreColor = getScoreColorRgb(roughScore);
  y = ensureSpace(doc, y, 20);
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(14, y - 2, pw - 28, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Gesamtbewertung: ${roughScore.toFixed(1)} / 5.0`, pw / 2, y + 8, { align: "center" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 22;

  // Category Overview Table
  const categoryAverages = categorizedQuestions.map(({ category, questions }) => {
    const catAnswered = questions.filter((q) => answers[q.id] > 0);
    const avg = catAnswered.length > 0
      ? catAnswered.reduce((sum, q) => sum + answers[q.id], 0) / catAnswered.length
      : opp.scoring[category].score;
    return {
      category,
      avg: Math.round(avg * 10) / 10,
      finalScore: Math.round(avg),
      answered: catAnswered.length,
      total: questions.length,
      weight: SCORING_WEIGHTS[category],
    };
  });

  autoTable(doc, {
    startY: y,
    head: [["Kategorie", "Ø Score", "Gewicht", "Beantwortet", "Gewichtet"]],
    body: categoryAverages.map(({ category, avg, weight, answered, total }) => {
      const displayScore = category === "risk" ? (avg > 0 ? 6 - avg : 0) : avg;
      return [
        CATEGORY_LABELS[category],
        String(avg),
        `${weight}x`,
        `${answered}/${total}`,
        (displayScore * weight).toFixed(1),
      ];
    }),
    headStyles: { fillColor: PRIMARY_COLOR, fontSize: 9 },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;

  // Weighted Calculation
  y = ensureSpace(doc, y, 20);
  const totalWeight = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
  const weightedParts = categoryAverages.map(({ category, avg, weight }) => {
    const displayScore = category === "risk" ? (avg > 0 ? 6 - avg : 0) : avg;
    return `${displayScore.toFixed(1)}×${weight}`;
  });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Berechnung: (${weightedParts.join(" + ")}) ÷ ${totalWeight} = ${roughScore.toFixed(1)}`, 14, y);
  doc.text("Hinweis: Risiko ist invertiert (Score 6 − Wert)", 14, y + 4);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  y += 12;

  // ─── DETAILED Q&A PER CATEGORY ──────────────────────────────────────
  for (const { category, questions } of categorizedQuestions) {
    const catData = categoryAverages.find(c => c.category === category)!;

    y = ensureSpace(doc, y, 15);
    y = addSubSectionTitle(doc, y, `${CATEGORY_LABELS[category]} (Ø ${catData.avg} · Gewicht ${catData.weight}x)`);

    for (const q of questions) {
      const answer = answers[q.id] || 0;
      const comment = comments[q.id] || "";
      const qSources = scoringSources[q.id] || [];

      // Calculate needed space
      const questionLines = doc.splitTextToSize(q.question.de, pw - 45);
      let neededSpace = questionLines.length * 4 + 8;
      if (answer > 0) neededSpace += 5;
      if (comment) neededSpace += doc.splitTextToSize(comment, pw - 40).length * 4 + 4;
      if (qSources.length > 0) neededSpace += qSources.length * 4 + 2;

      y = ensureSpace(doc, y, neededSpace);

      // Question text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(questionLines, 16, y);
      y += questionLines.length * 4 + 2;

      // Answer
      if (answer > 0) {
        const desc = q.descriptions[answer as 1 | 2 | 3 | 4 | 5].de;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const ansColor = getScoreColorRgb(answer);
        doc.setFillColor(ansColor[0], ansColor[1], ansColor[2]);
        doc.roundedRect(18, y - 3.5, 10, 5, 1, 1, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(String(answer), 23, y, { align: "center" });
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(desc, pw - 60);
        doc.text(descLines, 32, y);
        y += Math.max(descLines.length * 4, 5) + 2;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Nicht beantwortet", 18, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }

      // Comment
      if (comment) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        const commentLines = doc.splitTextToSize(`Kommentar: ${comment}`, pw - 40);
        y = ensureSpace(doc, y, commentLines.length * 4);
        doc.text(commentLines, 18, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += commentLines.length * 4 + 2;
      }

      // Sources
      if (qSources.filter(Boolean).length > 0) {
        doc.setFontSize(7);
        doc.setTextColor(59, 130, 246);
        for (const src of qSources.filter(Boolean)) {
          y = ensureSpace(doc, y, 4);
          doc.textWithLink(src.length > 80 ? src.substring(0, 77) + "..." : src, 18, y, { url: src });
          y += 4;
        }
        doc.setTextColor(0, 0, 0);
        y += 1;
      }

      doc.setFontSize(10);
      y += 2;
    }

    y += 4;
  }

  // ─── IDA ASSESSMENT ─────────────────────────────────────────────────
  let idaAssessment: AIAssessmentResult | null = null;
  try {
    idaAssessment = await loadAssessment(opp.id, "idea_scoring");
  } catch (e) {
    console.warn("Could not load IDA assessment for PDF:", e);
  }

  if (idaAssessment) {
    y = ensureSpace(doc, y, 30);
    y = addSectionTitle(doc, y, "IDA – Intelligent Data Analyst");

    // Rating badge
    const ratingLabel = getRatingLabel(idaAssessment.overallRating, "de");
    y = addKeyValue(doc, y, "Gesamteinschätzung", ratingLabel);
    y += 2;

    // Summary
    if (idaAssessment.summary) {
      y = ensureSpace(doc, y, 15);
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(idaAssessment.summary, pw - 28);
      y = ensureSpace(doc, y, summaryLines.length * 4);
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 4 + 4;
      doc.setFontSize(10);
    }

    // Strengths & Weaknesses side by side via table
    const maxLen = Math.max(idaAssessment.strengths.length, idaAssessment.weaknesses.length);
    const swBody: string[][] = [];
    for (let i = 0; i < maxLen; i++) {
      swBody.push([
        idaAssessment.strengths[i] ? `✓ ${idaAssessment.strengths[i]}` : "",
        idaAssessment.weaknesses[i] ? `⚠ ${idaAssessment.weaknesses[i]}` : "",
      ]);
    }
    if (swBody.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["Stärken", "Schwächen"]],
        body: swBody,
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: (pw - 28) / 2 }, 1: { cellWidth: (pw - 28) / 2 } },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Next Steps
    if (idaAssessment.nextSteps.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["#", "Nächste Schritte"]],
        body: idaAssessment.nextSteps.map((s, i) => [String(i + 1), s]),
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 9 },
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 10 } },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }

    // Pitfalls
    if (idaAssessment.pitfalls.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["Stolpersteine"]],
        body: idaAssessment.pitfalls.map(p => [`⚠ ${p}`]),
        headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
        styles: { fontSize: 8 },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
    }
  }

  // ─── BUSINESS PLAN (existing) ───────────────────────────────────────
  const ds = opp.businessPlan;
  if (ds) {
    y += 4;
    y = addSectionTitle(doc, y, "Business Plan");
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
    y = addKeyValue(doc, y, "Business-Plan-Gesamtbewertung", detailedTotal.toFixed(1) + " / 5.0");

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
      `NOVI – Exportiert am ${new Date().toLocaleDateString("de-DE")} – Seite ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`${opp.title.replace(/[^a-zA-Z0-9äöüÄÖÜß ]/g, "_")}_Report.pdf`);
}

// ── Dashboard Overview PDF ──

export function exportDashboardPdf(opportunities: Opportunity[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, "NOVI – Pipeline-Übersicht");

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
  y = addKeyValue(doc, y, "In Umsetzung", String(gtm));
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
    head: [["Titel", "Phase", "Branche", "Geografie", "Technologie", "Verantwortl.", "Idea Score", "BP Score", "Payback"]],
    body: opportunities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(opp => {
        const rs = calculateTotalScore(opp.scoring).toFixed(1);
        const ds = opp.businessPlan;
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
      `NOVI – Exportiert am ${new Date().toLocaleDateString("de-DE")} – Seite ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`NOVI_Pipeline_${new Date().toISOString().slice(0, 10)}.pdf`);
}
