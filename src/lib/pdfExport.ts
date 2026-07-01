import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Opportunity, Scoring, calculateTotalScore, SCORING_WEIGHTS, STAGE_ORDER } from "./types";
import { getQuestionsByCategory, ROUGH_SCORING_QUESTIONS } from "./roughScoringQuestions";
import { loadAssessment, AIAssessmentResult, getRatingLabel } from "./aiAssessmentService";

const STAGE_LABELS_EN: Record<string, string> = {
  idea: "Idea",
  rough_scoring: "Idea Scoring",
  gate1: "Gate 1",
  detailed_scoring: "Business Plan",
  gate2: "Gate 2",
  business_case: "Implementation & GTM Plan",
  implement_review: "Implementation & Review",
  closed: "Closed",
};

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
const HEADER_BG: [number, number, number] = [241, 245, 249];
const SUCCESS_COLOR: [number, number, number] = [34, 197, 94];
const WARNING_COLOR: [number, number, number] = [234, 179, 8];
const DANGER_COLOR: [number, number, number] = [239, 68, 68];

const CATEGORY_LABELS_EN: Record<string, string> = {
  marketAttractiveness: "Market Attractiveness",
  strategicFit: "Strategic Fit",
  feasibility: "Feasibility",
  commercialViability: "Commercial Viability",
  risk: "Risk",
};

/** Decode HTML entities like &amp; &lt; &gt; &quot; &#39; etc. */
function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
}

function fmt(n: number | undefined, suffix = ""): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("en-US") + suffix;
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

/** Safely render wrapped text with proper spacing */
function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 4): { y: number } {
  const decoded = decodeHtmlEntities(text);
  const lines = doc.splitTextToSize(decoded, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    y = ensureSpace(doc, y, lineHeight + 2);
    doc.text(lines[i], x, y);
    y += lineHeight;
  }
  return { y };
}

// ── Strategic Framework chart helpers ──

const POS_LABELS: Record<string, string> = {
  market_penetration: "Market Penetration",
  market_development: "Market Development",
  product_development: "Product Development",
  diversification: "Diversification",
  star: "Star",
  question_mark: "Question Mark",
  cash_cow: "Cash Cow",
  dog: "Dog",
  high_high: "Invest/Grow",
  high_medium: "Invest/Grow",
  medium_high: "Invest/Grow",
  high_low: "Selectivity",
  medium_medium: "Selectivity",
  low_high: "Selectivity",
  medium_low: "Harvest/Divest",
  low_medium: "Harvest/Divest",
  low_low: "Harvest/Divest",
  horizon1: "Horizon 1 – Core",
  horizon2: "Horizon 2 – Emerging",
  horizon3: "Horizon 3 – New",
};

function formatPosLabel(pos: string): string {
  return POS_LABELS[pos] || pos;
}

function drawCell(
  doc: jsPDF, x: number, y: number, w: number, h: number,
  label: string, active: boolean, bg: [number, number, number]
) {
  if (active) {
    doc.setFillColor(...PRIMARY_COLOR);
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.setLineWidth(0.8);
  } else {
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
  }
  doc.rect(x, y, w, h, "FD");
  doc.setTextColor(active ? 255 : 60, active ? 255 : 60, active ? 255 : 60);
  doc.setFont("helvetica", active ? "bold" : "normal");
  doc.setFontSize(8);
  const lines = doc.splitTextToSize(label, w - 2);
  const total = lines.length * 3.5;
  let ty = y + h / 2 - total / 2 + 3;
  for (const ln of lines) {
    doc.text(ln, x + w / 2, ty, { align: "center" });
    ty += 3.5;
  }
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.setDrawColor(0, 0, 0);
}

function drawAxisLabel(doc: jsPDF, text: string, x: number, y: number, rotate = 0) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text(text, x, y, rotate ? { angle: rotate, align: "center" } as any : { align: "center" });
  doc.setTextColor(0, 0, 0);
}

function drawFrameworkChart(
  doc: jsPDF, name: "ansoff" | "bcg" | "mckinsey" | "threeHorizons",
  pos: string, x: number, y: number
): number {
  const chartLeft = x + 24; // leave room for y-axis label
  const chartTop = y + 2;
  const size = 70; // total matrix size
  const cellLight: [number, number, number] = [248, 250, 252];
  const cellGreen: [number, number, number] = [220, 252, 231];
  const cellYellow: [number, number, number] = [254, 249, 195];
  const cellRed: [number, number, number] = [254, 226, 226];

  if (name === "ansoff") {
    const cw = size / 2;
    // Rows: existing products (top), new products (bottom)
    // Cols: existing markets (left), new markets (right)
    const cells: Array<{ key: string; label: string; col: number; row: number }> = [
      { key: "market_penetration", label: "Market Penetration", col: 0, row: 0 },
      { key: "market_development", label: "Market Development", col: 1, row: 0 },
      { key: "product_development", label: "Product Development", col: 0, row: 1 },
      { key: "diversification", label: "Diversification", col: 1, row: 1 },
    ];
    for (const c of cells) {
      drawCell(doc, chartLeft + c.col * cw, chartTop + c.row * cw, cw, cw, c.label, c.key === pos, cellLight);
    }
    // axis labels
    drawAxisLabel(doc, "Existing Markets", chartLeft + cw / 2, chartTop - 1);
    drawAxisLabel(doc, "New Markets", chartLeft + cw + cw / 2, chartTop - 1);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(90, 90, 90);
    (doc as any).text("Existing Products", chartLeft - 2, chartTop + cw / 2, { angle: 90, align: "center" });
    (doc as any).text("New Products", chartLeft - 2, chartTop + cw + cw / 2, { angle: 90, align: "center" });
    doc.setTextColor(0, 0, 0);
    return chartTop + size + 2;
  }

  if (name === "bcg") {
    const cw = size / 2;
    const cells: Array<{ key: string; label: string; col: number; row: number }> = [
      { key: "star", label: "Star", col: 0, row: 0 },
      { key: "question_mark", label: "Question Mark", col: 1, row: 0 },
      { key: "cash_cow", label: "Cash Cow", col: 0, row: 1 },
      { key: "dog", label: "Dog", col: 1, row: 1 },
    ];
    for (const c of cells) {
      drawCell(doc, chartLeft + c.col * cw, chartTop + c.row * cw, cw, cw, c.label, c.key === pos, cellLight);
    }
    drawAxisLabel(doc, "High Market Share", chartLeft + cw / 2, chartTop - 1);
    drawAxisLabel(doc, "Low Market Share", chartLeft + cw + cw / 2, chartTop - 1);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(90, 90, 90);
    (doc as any).text("High Growth", chartLeft - 2, chartTop + cw / 2, { angle: 90, align: "center" });
    (doc as any).text("Low Growth", chartLeft - 2, chartTop + cw + cw / 2, { angle: 90, align: "center" });
    doc.setTextColor(0, 0, 0);
    return chartTop + size + 2;
  }

  if (name === "mckinsey") {
    const cw = size / 3;
    const colorMap: Record<string, [number, number, number]> = {
      high_high: cellGreen, high_medium: cellGreen, medium_high: cellGreen,
      high_low: cellYellow, medium_medium: cellYellow, low_high: cellYellow,
      medium_low: cellRed, low_medium: cellRed, low_low: cellRed,
    };
    const labels: Record<string, string> = {
      high_high: "Invest/Grow", high_medium: "Invest/Grow", medium_high: "Invest/Grow",
      high_low: "Selectivity", medium_medium: "Selectivity", low_high: "Selectivity",
      medium_low: "Harvest", low_medium: "Harvest", low_low: "Harvest",
    };
    const rows = ["high", "medium", "low"] as const;
    const cols = ["low", "medium", "high"] as const;
    rows.forEach((ia, ri) => {
      cols.forEach((cs, ci) => {
        const key = `${ia}_${cs}`;
        drawCell(doc, chartLeft + ci * cw, chartTop + ri * cw, cw, cw, labels[key], key === pos, colorMap[key]);
      });
    });
    drawAxisLabel(doc, "Low CS", chartLeft + cw * 0.5, chartTop - 1);
    drawAxisLabel(doc, "Medium CS", chartLeft + cw * 1.5, chartTop - 1);
    drawAxisLabel(doc, "High CS", chartLeft + cw * 2.5, chartTop - 1);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(90, 90, 90);
    (doc as any).text("High IA", chartLeft - 2, chartTop + cw * 0.5, { angle: 90, align: "center" });
    (doc as any).text("Medium IA", chartLeft - 2, chartTop + cw * 1.5, { angle: 90, align: "center" });
    (doc as any).text("Low IA", chartLeft - 2, chartTop + cw * 2.5, { angle: 90, align: "center" });
    doc.setTextColor(0, 0, 0);
    return chartTop + size + 2;
  }

  if (name === "threeHorizons") {
    const pw = doc.internal.pageSize.getWidth();
    const totalW = pw - 28;
    const cw = (totalW - 6) / 3;
    const ch = 30;
    const items = [
      { key: "horizon1", title: "Horizon 1", sub: "Core Business", bg: [219, 234, 254] as [number, number, number] },
      { key: "horizon2", title: "Horizon 2", sub: "Emerging Opportunities", bg: [254, 243, 199] as [number, number, number] },
      { key: "horizon3", title: "Horizon 3", sub: "New Ventures", bg: [209, 250, 229] as [number, number, number] },
    ];
    items.forEach((h, i) => {
      const cx = x + i * (cw + 3);
      drawCell(doc, cx, y + 2, cw, ch, `${h.title}\n${h.sub}`, h.key === pos, h.bg);
    });
    return y + ch + 4;
  }

  return y;
}



export async function exportOpportunityPdf(opp: Opportunity) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, `NOVI – ${opp.title}`);

  let y = 38;

  // Meta info
  y = addSectionTitle(doc, y, "Overview");
  y = addKeyValue(doc, y, "Title", opp.title);
  y = addKeyValue(doc, y, "Stage", STAGE_LABELS_EN[opp.stage] || opp.stage);
  y = addKeyValue(doc, y, "Industry", opp.industry);
  y = addKeyValue(doc, y, "Geography", opp.geography);
  y = addKeyValue(doc, y, "Business Field", opp.technology);
  y = addKeyValue(doc, y, "Owner", opp.owner);
  y = addKeyValue(doc, y, "Created", new Date(opp.createdAt).toLocaleDateString("en-US"));

  if (opp.description) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Problem Description:", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const result = addWrappedText(doc, opp.description, 14, y, pw - 28, 5);
    y = result.y + 4;
  }

  if (opp.solutionDescription) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Solution Idea & Differentiator:", 14, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    const result = addWrappedText(doc, opp.solutionDescription, 14, y, pw - 28, 5);
    y = result.y + 4;
  }

  // ─── IDEA SCORING SECTION ───────────────────────────────────────────
  y += 4;
  y = addSectionTitle(doc, y, "Idea Scoring – Results");

  const roughScore = calculateTotalScore(opp.scoring);
  const answers: Record<string, number> = opp.roughScoringAnswers || {};
  const comments: Record<string, string> = opp.roughScoringComments || {};
  const scoringSources: Record<string, string[]> = opp.roughScoringSources || {};
  const categorizedQuestions = getQuestionsByCategory();

  // Total Score
  const scoreColor = getScoreColorRgb(roughScore);
  y = ensureSpace(doc, y, 20);
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(14, y - 2, pw - 28, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall Score: ${roughScore.toFixed(1)} / 5.0`, pw / 2, y + 8, { align: "center" });
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
    head: [["Category", "Avg Score", "Weight", "Answered", "Weighted"]],
    body: categoryAverages.map(({ category, avg, weight, answered, total }) => {
      const displayScore = category === "risk" ? (avg > 0 ? 6 - avg : 0) : avg;
      return [
        CATEGORY_LABELS_EN[category],
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
    return `${displayScore.toFixed(1)} x ${weight}`;
  });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Calculation: (${weightedParts.join(" + ")}) / ${totalWeight} = ${roughScore.toFixed(1)}`, 14, y);
  doc.text("Note: Risk is inverted (Score = 6 - Value)", 14, y + 4);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  y += 12;

  // ─── DETAILED Q&A PER CATEGORY ──────────────────────────────────────
  for (const { category, questions } of categorizedQuestions) {
    const catData = categoryAverages.find(c => c.category === category)!;

    y = ensureSpace(doc, y, 15);
    y = addSubSectionTitle(doc, y, `${CATEGORY_LABELS_EN[category]} (Avg ${catData.avg} | Weight ${catData.weight}x)`);

    for (const q of questions) {
      const answer = answers[q.id] || 0;
      const comment = comments[q.id] || "";
      const qSources = scoringSources[q.id] || [];

      // Calculate needed space
      const questionText = decodeHtmlEntities(q.question.en);
      const questionLines = doc.splitTextToSize(questionText, pw - 45);
      let neededSpace = questionLines.length * 5 + 10;
      if (answer > 0) neededSpace += 10;
      if (comment) neededSpace += doc.splitTextToSize(comment, pw - 40).length * 5 + 6;
      if (qSources.length > 0) neededSpace += qSources.length * 5 + 4;

      y = ensureSpace(doc, y, Math.min(neededSpace, 60));

      // Question text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(questionLines, 16, y);
      y += questionLines.length * 4.5 + 3;

      // All answer options (chosen one highlighted)
      const optionRows = [1, 2, 3, 4, 5].map((score) => {
        const desc = decodeHtmlEntities(q.descriptions[score as 1 | 2 | 3 | 4 | 5].en);
        const isChosen = score === answer;
        return [isChosen ? `> ${score}` : String(score), desc, isChosen ? "X" : ""];
      });

      autoTable(doc, {
        startY: y,
        head: [["Score", "Description", "Chosen"]],
        body: optionRows,
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, cellPadding: 1.5 },
        styles: { fontSize: 8, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 }, minCellHeight: 5 },
        columnStyles: {
          0: { cellWidth: 14, halign: "center", fontStyle: "bold" },
          1: { cellWidth: pw - 50 },
          2: { cellWidth: 14, halign: "center", fontStyle: "bold" },
        },
        margin: { left: 16, right: 14 },
        theme: "grid",
        didParseCell: (data) => {
          if (data.section === "body" && answer > 0) {
            const rowScore = data.row.index + 1;
            if (rowScore === answer) {
              const c = getScoreColorRgb(answer);
              data.cell.styles.fillColor = [c[0], c[1], c[2]];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 2;

      if (answer === 0) {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Not answered", 18, y + 2);
        doc.setTextColor(0, 0, 0);
        y += 6;
      }

      // Comment
      if (comment) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        const commentText = decodeHtmlEntities(`Comment: ${comment}`);
        const commentLines = doc.splitTextToSize(commentText, pw - 40);
        y = ensureSpace(doc, y, commentLines.length * 4.5 + 2);
        doc.text(commentLines, 18, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        y += commentLines.length * 4.5 + 3;
      }

      // Sources
      if (qSources.filter(Boolean).length > 0) {
        doc.setFontSize(7);
        doc.setTextColor(59, 130, 246);
        for (const src of qSources.filter(Boolean)) {
          y = ensureSpace(doc, y, 5);
          doc.textWithLink(src.length > 80 ? src.substring(0, 77) + "..." : src, 18, y, { url: src });
          y += 4;
        }
        doc.setTextColor(0, 0, 0);
        y += 2;
      }

      doc.setFontSize(10);
      y += 3;
    }

    y += 5;
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
    const ratingLabel = getRatingLabel(idaAssessment.overallRating, "en");
    y = addKeyValue(doc, y, "Overall Rating", ratingLabel);
    y += 2;

    // Summary
    if (idaAssessment.summary) {
      y = ensureSpace(doc, y, 15);
      doc.setFontSize(9);
      const result = addWrappedText(doc, idaAssessment.summary, 14, y, pw - 28, 4.5);
      y = result.y + 4;
      doc.setFontSize(10);
    }

    // Strengths & Weaknesses side by side via table
    const maxLen = Math.max(idaAssessment.strengths.length, idaAssessment.weaknesses.length);
    const swBody: string[][] = [];
    for (let i = 0; i < maxLen; i++) {
      swBody.push([
        idaAssessment.strengths[i] ? decodeHtmlEntities(idaAssessment.strengths[i]) : "",
        idaAssessment.weaknesses[i] ? decodeHtmlEntities(idaAssessment.weaknesses[i]) : "",
      ]);
    }
    if (swBody.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["Strengths", "Weaknesses"]],
        body: swBody,
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: (pw - 28) / 2 }, 1: { cellWidth: (pw - 28) / 2 } },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // Next Steps
    if (idaAssessment.nextSteps.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["#", "Next Steps"]],
        body: idaAssessment.nextSteps.map((s, i) => [String(i + 1), decodeHtmlEntities(s)]),
        headStyles: { fillColor: PRIMARY_COLOR, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 10 } },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    // Pitfalls
    if (idaAssessment.pitfalls.length > 0) {
      y = ensureSpace(doc, y, 15);
      autoTable(doc, {
        startY: y,
        head: [["Pitfalls"]],
        body: idaAssessment.pitfalls.map(p => [decodeHtmlEntities(p)]),
        headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }
  }

  // ─── STRATEGIC FRAMEWORKS (Idea Scoring) ────────────────────────────
  const ideaModels = opp.strategicAnalyses?.ideaScoring;
  if (ideaModels) {
    const frameworks: Array<{ name: "ansoff" | "bcg" | "mckinsey" | "threeHorizons"; label: string; data: { position?: string; horizon?: string; description: string; rationale: string } }> = [
      { name: "ansoff", label: "Ansoff Matrix", data: ideaModels.ansoff },
      { name: "bcg", label: "BCG Matrix", data: ideaModels.bcg },
      { name: "mckinsey", label: "McKinsey Matrix", data: ideaModels.mckinsey },
      { name: "threeHorizons", label: "3 Horizons", data: ideaModels.threeHorizons },
    ];
    const hasAny = frameworks.some(f => (f.data.position || (f.data as any).horizon || f.data.description || f.data.rationale));
    if (hasAny) {
      y += 4;
      y = addSectionTitle(doc, y, "Strategic Frameworks");
      for (const f of frameworks) {
        const pos = (f.data as any).position || (f.data as any).horizon || "";
        if (!pos && !f.data.description && !f.data.rationale) continue;
        y = ensureSpace(doc, y, 95);
        y = addSubSectionTitle(doc, y, f.label + (pos ? ` – ${formatPosLabel(pos)}` : ""));
        y = drawFrameworkChart(doc, f.name, pos, 14, y);
        y += 4;
        if (f.data.description) {
          y = ensureSpace(doc, y, 10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("Description:", 14, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const r = addWrappedText(doc, f.data.description, 14, y, pw - 28, 4.5);
          y = r.y + 3;
        }
        if (f.data.rationale) {
          y = ensureSpace(doc, y, 10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("Rationale:", 14, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const r = addWrappedText(doc, f.data.rationale, 14, y, pw - 28, 4.5);
          y = r.y + 4;
        }
        doc.setFontSize(10);
      }
    }
  }


  const ds = opp.businessPlan;
  if (ds) {
    y += 4;
    y = addSectionTitle(doc, y, "Business Plan");
    const detailedTotal = Math.round(((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) * 10) / 10;

    autoTable(doc, {
      startY: y,
      head: [["Criterion", "Score (1-5)"]],
      body: [
        ["Market Attractiveness", String(ds.marketAttractiveness.score)],
        ["Strategic Fit", String(ds.strategicFit.score)],
        ["Feasibility", String(ds.feasibility.score)],
        ["Commercial Viability", String(ds.commercialViability.score)],
        ["Risk (inverted)", String(ds.risk.score)],
      ],
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
    y = addKeyValue(doc, y, "Business Plan Overall Score", detailedTotal.toFixed(1) + " / 5.0");

    // TAM/SAM
    const ma = ds.marketAttractiveness.analysis;
    if (ma.tamProjections?.some(p => p.value > 0) || ma.samProjections?.some(p => p.value > 0)) {
      y += 4;
      y = addSectionTitle(doc, y, "TAM / SAM Projections");
      if (ma.tamDescription) {
        y = addKeyValue(doc, y, "TAM Definition", ma.tamDescription.substring(0, 100));
      }
      if (ma.samDescription) {
        y = addKeyValue(doc, y, "SAM Definition", ma.samDescription.substring(0, 100));
      }

      autoTable(doc, {
        startY: y,
        head: [["Year", "TAM (M EUR)", "SAM (M EUR)"]],
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
      y = addSectionTitle(doc, y, "Revenue Projection (5 Years)");
      autoTable(doc, {
        startY: y,
        head: [["Year", "Revenue (EUR)", "Costs (EUR)", "Profit (EUR)"]],
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
      y = addSectionTitle(doc, y, "Risk Register");
      autoTable(doc, {
        startY: y,
        head: [["Risk", "Category", "P", "I", "Mitigation"]],
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
      head: [["Metric", "Value"]],
      body: [
        ["Investment Cost", fmt(bc.investmentCost, " EUR")],
        ["Expected Annual Revenue", fmt(bc.expectedRevenue, " EUR")],
        ["ROI", fmt(bc.roi, " %")],
        ["Break-Even", fmt(bc.breakEvenMonths, " months")],
        ["Payback Period", fmt(bc.paybackPeriod, " months")],
        ["NPV", fmt(bc.npv, " EUR")],
      ],
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
    if (bc.notes) {
      y = addKeyValue(doc, y, "Notes", bc.notes.substring(0, 200));
    }
  }

  // Gate Decisions
  if (opp.gates.length > 0) {
    y += 4;
    y = addSectionTitle(doc, y, "Gate Decisions");
    autoTable(doc, {
      startY: y,
      head: [["Gate", "Decision", "Decider", "Date", "Comment"]],
      body: opp.gates.map(g => [
        g.gate.toUpperCase().replace("GATE", "Gate "),
        g.decision.toUpperCase(),
        g.decider || "—",
        g.date ? new Date(g.date).toLocaleDateString("en-US") : "—",
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
      `NOVI – Exported on ${new Date().toLocaleDateString("en-US")} – Page ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`${opp.title.replace(/[^a-zA-Z0-9 ]/g, "_")}_Report.pdf`);
}

// ── Dashboard Overview PDF ──

export function exportDashboardPdf(opportunities: Opportunity[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, "NOVI – Pipeline Overview");

  let y = 38;

  // Summary KPIs
  y = addSectionTitle(doc, y, "Summary");
  const active = opportunities.filter(o => o.stage !== "closed").length;
  const gtm = opportunities.filter(o => o.stage === "implement_review").length;
  const avgScore = opportunities.length > 0
    ? (opportunities.reduce((s, o) => s + calculateTotalScore(o.scoring), 0) / opportunities.length).toFixed(1)
    : "—";

  y = addKeyValue(doc, y, "Total Opportunities", String(opportunities.length));
  y = addKeyValue(doc, y, "Active", String(active));
  y = addKeyValue(doc, y, "In Implementation", String(gtm));
  y = addKeyValue(doc, y, "Average Score", avgScore);

  // Stage distribution
  y += 4;
  y = addSectionTitle(doc, y, "Distribution by Stage");
  const stageCounts = STAGE_ORDER.map(s => ({
    stage: STAGE_LABELS_EN[s] || s,
    count: opportunities.filter(o => o.stage === s).length,
  })).filter(s => s.count > 0);

  autoTable(doc, {
    startY: y,
    head: [["Stage", "Count"]],
    body: stageCounts.map(s => [s.stage, String(s.count)]),
    headStyles: { fillColor: PRIMARY_COLOR },
    styles: { fontSize: 9 },
    margin: { left: 14 },
    tableWidth: 120,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Full pipeline table
  y = addSectionTitle(doc, y, "All Opportunities");

  autoTable(doc, {
    startY: y,
    head: [["Title", "Stage", "Industry", "Geography", "Business Field", "Owner", "Idea Score", "BP Score", "Payback"]],
    body: opportunities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(opp => {
        const rs = calculateTotalScore(opp.scoring).toFixed(1);
        const ds = opp.businessPlan;
        const detScore = ds
          ? (((ds.marketAttractiveness.score + ds.strategicFit.score + ds.feasibility.score + ds.commercialViability.score + (6 - ds.risk.score)) / 5) ).toFixed(1)
          : "—";
        const payback = opp.businessCase?.paybackPeriod ? `${opp.businessCase.paybackPeriod} mo` : "—";
        return [
          opp.title,
          STAGE_LABELS_EN[opp.stage] || opp.stage,
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
      `NOVI – Exported on ${new Date().toLocaleDateString("en-US")} – Page ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`NOVI_Pipeline_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════
// Business Plan – full export
// ═══════════════════════════════════════════════════════════════════════

type Field = { label: string; value: any };

const INTENSITY_LABEL: Record<number, string> = { 1: "Very Low", 2: "Low", 3: "Medium", 4: "High", 5: "Very High" };

function hasText(v: any): boolean {
  return v !== undefined && v !== null && String(v).trim() !== "" && String(v).trim() !== "0";
}

function addLongText(doc: jsPDF, y: number, label: string, text: string, pw: number): number {
  if (!hasText(text)) return y;
  y = ensureSpace(doc, y, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(label + ":", 14, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  const r = addWrappedText(doc, String(text), 14, y, pw - 28, 4.5);
  return r.y + 3;
}

function addFieldGroup(doc: jsPDF, y: number, title: string, fields: Field[], pw: number): number {
  const shown = fields.filter(f => hasText(f.value));
  if (shown.length === 0) return y;
  y = ensureSpace(doc, y, 14);
  y = addSubSectionTitle(doc, y, title);
  autoTable(doc, {
    startY: y,
    body: shown.map(f => [f.label, decodeHtmlEntities(String(f.value))]),
    styles: { fontSize: 8.5, cellPadding: 2.5, valign: "top" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold", fillColor: HEADER_BG }, 1: { cellWidth: pw - 28 - 55 } },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });
  return (doc as any).lastAutoTable.finalY + 4;
}

function addTable(doc: jsPDF, y: number, title: string, head: string[], body: any[][], pw: number, colStyles?: any): number {
  if (body.length === 0) return y;
  y = ensureSpace(doc, y, 20);
  if (title) y = addSubSectionTitle(doc, y, title);
  autoTable(doc, {
    startY: y,
    head: [head],
    body: body.map(r => r.map(c => decodeHtmlEntities(String(c ?? "")))),
    headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2, valign: "top" },
    margin: { left: 14, right: 14 },
    columnStyles: colStyles,
    theme: "grid",
  });
  return (doc as any).lastAutoTable.finalY + 4;
}

function addRegions(doc: jsPDF, y: number, title: string, regions: any[], pw: number): number {
  if (!regions || regions.length === 0) return y;
  return addTable(doc, y, title, ["Region", "Market Size", "Potential (1-5)", "Notes"],
    regions.map((r: any) => [r.region || "—", r.marketSize || "—", String(r.potential ?? "—"), r.notes || ""]),
    pw, { 3: { cellWidth: 70 } });
}

function addYearValues(doc: jsPDF, y: number, title: string, values: any[], unit: string, pw: number): number {
  if (!values || values.length === 0 || !values.some((v: any) => v.value > 0)) return y;
  return addTable(doc, y, title, ["Year", `Value (${unit})`],
    values.map((v: any) => [String(v.year), fmt(v.value)]), pw);
}

export async function exportBusinessPlanPdf(opp: Opportunity) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();

  addHeader(doc, "NOVI – Business Plan");
  let y = 38;

  // ─── OVERVIEW ─────────────────────────────────────────────────
  y = addSectionTitle(doc, y, "Opportunity");
  y = addKeyValue(doc, y, "Title", opp.title);
  y = addKeyValue(doc, y, "Stage", STAGE_LABELS_EN[opp.stage] || opp.stage);
  y = addKeyValue(doc, y, "Industry", opp.industry);
  y = addKeyValue(doc, y, "Geography", opp.geography);
  y = addKeyValue(doc, y, "Business Field", opp.technology);
  y = addKeyValue(doc, y, "Owner", opp.owner);
  y = addLongText(doc, y + 2, "Problem Description", opp.description || "", pw);
  y = addLongText(doc, y, "Solution Idea & Differentiator", opp.solutionDescription || "", pw);

  const bp = opp.businessPlan;
  const sa = opp.strategicAnalyses;

  // ─── COMBINED INTERPRETATION ────────────────────────────────
  const ci = bp?.combinedInterpretation;
  if (ci && (ci.overallPotential || ci.samDevelopment || ci.somDevelopment || ci.gapsAndLevers)) {
    y += 2;
    y = addSectionTitle(doc, y, "Combined Interpretation (TAM / SAM / SOM)");
    y = addFieldGroup(doc, y, "Interpretation", [
      { label: "Overall Potential", value: ci.overallPotential },
      { label: "SAM Development", value: ci.samDevelopment },
      { label: "SOM Development", value: ci.somDevelopment },
      { label: "Gaps & Levers", value: ci.gapsAndLevers },
    ], pw);
  }

  // ═══ TAM ═══
  y += 4;
  y = addSectionTitle(doc, y, "TAM – Total Addressable Market");

  const tamO = bp?.tamOverview;
  if (tamO) {
    y = addFieldGroup(doc, y, "TAM Overview", [
      { label: "Scope Definition", value: tamO.scopeDefinition },
      { label: "Geographic Coverage", value: tamO.geographicCoverage },
      { label: "Assumptions", value: tamO.assumptions },
      { label: "Scope Exclusions", value: tamO.scopeExclusions },
      { label: "Full Global Potential", value: tamO.fullGlobalPotential },
      { label: "Market Development", value: tamO.marketDevelopment },
      { label: "Drivers", value: tamO.drivers },
      { label: "Sources", value: tamO.sources },
      { label: "Source Assessment", value: tamO.sourceAssessment },
      { label: "Derivation Method", value: tamO.derivationMethod },
      { label: "Supporting Model Notes", value: tamO.supportingModelNotes },
    ], pw);
    y = addRegions(doc, y, "TAM – Geographic Breakdown", tamO.geographicalRegions || [], pw);
  }

  // TAM projections from marketAttractiveness
  const ma = bp?.marketAttractiveness?.analysis;
  if (ma) {
    y = addYearValues(doc, y, "TAM Projections", ma.tamProjections || [], "M EUR", pw);
    y = addLongText(doc, y, "TAM Description", ma.tamDescription || "", pw);
  }

  // TAM Models
  const tam = sa?.tam;
  if (tam?.marketResearch) {
    const mr = tam.marketResearch;
    y = addFieldGroup(doc, y, "Market Research", [
      { label: "Secondary Research", value: mr.secondaryResearch },
      { label: "Primary Research", value: mr.primaryResearch },
      { label: "Key Figures", value: mr.keyFigures },
      { label: "Methodology", value: mr.methodology },
      { label: "Central Insights", value: mr.centralInsights },
      { label: "Description", value: mr.description },
      { label: "Rationale", value: mr.rationale },
    ], pw);
  }
  if (tam?.pestel) {
    const p = tam.pestel;
    y = addFieldGroup(doc, y, "PESTEL Analysis", [
      { label: "Political", value: p.political },
      { label: "Economic", value: p.economic },
      { label: "Social", value: p.social },
      { label: "Technological", value: p.technological },
      { label: "Environmental", value: p.environmental },
      { label: "Legal", value: p.legal },
      { label: "Description", value: p.description },
      { label: "Rationale", value: p.rationale },
    ], pw);
  }
  if (tam?.valueChain?.stages?.length) {
    y = addTable(doc, y, "Industry Value Chain",
      ["Stage", "Our Position", "Margin (1-5)", "Differentiators", "Dynamics"],
      tam.valueChain.stages.map(s => [s.name, s.isOurPosition ? "Yes" : "—", String(s.marginAttractiveness), s.differentiators, s.dynamics]),
      pw, { 3: { cellWidth: 50 }, 4: { cellWidth: 50 } });
    y = addLongText(doc, y, "Value Chain – Description", tam.valueChain.description, pw);
    y = addLongText(doc, y, "Value Chain – Rationale", tam.valueChain.rationale, pw);
  }
  if (tam?.porter) {
    const pf = tam.porter;
    const fRow = (name: string, f: any) => [name, INTENSITY_LABEL[f.intensity] || String(f.intensity), f.description || ""];
    y = addTable(doc, y, "Porter's Five Forces",
      ["Force", "Intensity", "Description"],
      [
        fRow("Competitive Rivalry", pf.competitiveRivalry),
        fRow("Threat of New Entrants", pf.threatOfNewEntrants),
        fRow("Threat of Substitutes", pf.threatOfSubstitutes),
        fRow("Bargaining Power – Buyers", pf.bargainingPowerBuyers),
        fRow("Bargaining Power – Suppliers", pf.bargainingPowerSuppliers),
      ], pw, { 2: { cellWidth: 90 } });
    y = addLongText(doc, y, "Porter – Description", pf.description, pw);
    y = addLongText(doc, y, "Porter – Rationale", pf.rationale, pw);
  }
  if (tam?.swot) {
    const s = tam.swot;
    y = addFieldGroup(doc, y, "SWOT Analysis", [
      { label: "Strengths", value: s.strengths },
      { label: "Weaknesses", value: s.weaknesses },
      { label: "Opportunities", value: s.opportunities },
      { label: "Threats", value: s.threats },
      { label: "Description", value: s.description },
      { label: "Rationale", value: s.rationale },
    ], pw);
  }
  if (tam?.customersFound?.entries?.length) {
    const cf = tam.customersFound;
    y = addLongText(doc, y, "Customers Found – Research Scope", cf.researchScope, pw);
    y = addLongText(doc, y, "Bottom-up Assumptions", cf.bottomUpAssumptions, pw);
    if (cf.averageValuePerCustomer) y = addKeyValue(doc, y, "Avg Value per Customer (M EUR)", String(cf.averageValuePerCustomer));
    y = addTable(doc, y, "Customers Found",
      ["Company", "Country", "Tier", "Type", "Segment", "Variants", "Value (M EUR)", "Status"],
      cf.entries.map(e => [e.company, e.country || e.geography, e.tier, e.customerType, e.segment, e.variantCount, fmt(e.estimatedValue), e.status]),
      pw);
  }

  // ═══ SAM ═══
  y += 4;
  y = addSectionTitle(doc, y, "SAM – Serviceable Addressable Market");
  const samO = bp?.samOverview;
  if (samO) {
    y = addFieldGroup(doc, y, "SAM Overview", [
      { label: "SAM vs TAM", value: samO.samVsTamExplanation },
      { label: "Included Industries", value: samO.includedIndustries },
      { label: "Excluded Industries", value: samO.excludedIndustries },
      { label: "Geographic Focus", value: samO.geographicFocus },
      { label: "Geographic Exclusions", value: samO.geographicExclusions },
      { label: "Target Groups", value: samO.targetGroups },
      { label: "Unreachable Groups", value: samO.unreachableGroups },
      { label: "Relevance Outlook", value: samO.relevanceOutlook },
      { label: "Feature Adaptations", value: samO.featureAdaptations },
      { label: "Price Evolution", value: samO.priceEvolution },
      { label: "Resource Scenarios", value: samO.resourceScenarios },
      { label: "Required Investments", value: samO.requiredInvestments },
    ], pw);
    y = addRegions(doc, y, "SAM – Geographic Breakdown", samO.geographicalRegions || [], pw);
    const sca = samO.salesChannelAnalysis;
    if (sca?.entries?.length) {
      y = addTable(doc, y, "Sales Channel Analysis",
        ["Channel", "Type", "Reach", "Cost", "Segments", "Rating"],
        sca.entries.map(c => [c.channelName, c.channelType, c.reach, c.costLevel, c.targetSegments, String(c.rating)]),
        pw);
      y = addLongText(doc, y, "Channel Strategy", sca.channelStrategy, pw);
      y = addLongText(doc, y, "Channel Mix", sca.channelMix, pw);
    }
  }
  if (ma) {
    y = addYearValues(doc, y, "SAM Projections", ma.samProjections || [], "M EUR", pw);
    y = addLongText(doc, y, "SAM Description", ma.samDescription || "", pw);
  }

  // SAM detailed scoring subcategories
  if (bp?.strategicFit) {
    y = addKeyValue(doc, y, "Strategic Fit Score", `${bp.strategicFit.score} / 5`);
    y = addLongText(doc, y, "Strategic Fit – Details", bp.strategicFit.details, pw);
    if (bp.strategicFit.alignmentDimensions?.length) {
      y = addTable(doc, y, "Alignment Dimensions", ["Dimension", "Current", "Required"],
        bp.strategicFit.alignmentDimensions.map(d => [d.label, String(d.current), String(d.required)]), pw);
    }
    if (bp.strategicFit.capabilityGaps?.length) {
      y = addTable(doc, y, "Capability Gaps", ["Capability", "Current", "Required", "Priority", "Action"],
        bp.strategicFit.capabilityGaps.map(g => [g.capability, String(g.currentLevel), String(g.requiredLevel), g.priority, g.action]), pw);
    }
  }
  if (bp?.portfolioFit) {
    y = addKeyValue(doc, y, "Portfolio Fit Score", `${bp.portfolioFit.score} / 5`);
    if (bp.portfolioFit.dimensions?.length) {
      y = addTable(doc, y, "Portfolio Fit Dimensions", ["Dimension", "Score", "Notes"],
        bp.portfolioFit.dimensions.map(d => [d.label, String(d.score), d.notes]), pw);
    }
    y = addFieldGroup(doc, y, "Portfolio Fit – Details", [
      { label: "Cannibalization Risk", value: bp.portfolioFit.cannibalizationRisk },
      { label: "Cross-Selling Potential", value: bp.portfolioFit.crossSellingPotential },
      { label: "Shared Resources", value: bp.portfolioFit.sharedResources },
      { label: "Notes", value: bp.portfolioFit.notes },
    ], pw);
  }
  if (bp?.feasibility) {
    y = addKeyValue(doc, y, "Feasibility Score", `${bp.feasibility.score} / 5`);
    if (bp.feasibility.trl) y = addKeyValue(doc, y, "TRL", String(bp.feasibility.trl));
    y = addLongText(doc, y, "Feasibility – Details", bp.feasibility.details, pw);
    if (bp.feasibility.milestones?.length) {
      y = addTable(doc, y, "Feasibility Milestones", ["Milestone", "Target Date", "Status"],
        bp.feasibility.milestones.map((m: any) => [m.name || m.milestone, m.targetDate || m.date, m.status]), pw);
    }
  }
  if (bp?.organisationalReadiness) {
    const o = bp.organisationalReadiness;
    y = addKeyValue(doc, y, "Organisational Readiness Score", `${o.score} / 5`);
    y = addFieldGroup(doc, y, "Organisational Readiness", [
      { label: "Culture", value: o.culture },
      { label: "Processes", value: o.processes },
      { label: "Skills", value: o.skills },
      { label: "Leadership", value: o.leadership },
      { label: "Resources", value: o.resources },
      { label: "Stakeholders", value: o.stakeholders },
      { label: "Details", value: o.details },
    ], pw);
  }
  if (bp?.risk) {
    y = addKeyValue(doc, y, "Risk Score", `${bp.risk.score} / 5`);
    y = addLongText(doc, y, "Risk – Details", bp.risk.details, pw);
    if (bp.risk.riskItems?.length) {
      y = addTable(doc, y, "Risk Register", ["Risk", "Category", "Probability", "Impact", "Mitigation"],
        bp.risk.riskItems.map(r => [r.name, r.category, String(r.probability), String(r.impact), r.mitigation]), pw);
    }
  }

  const sam = sa?.sam;
  if (sam?.customerSegmentation?.entries?.length) {
    const cs = sam.customerSegmentation;
    y = addTable(doc, y, "Customer Segmentation", ["Segment", "Size", "Needs", "WTP", "Priority"],
      cs.entries.map(e => [e.name, e.size, e.needs, e.willingnessToPay, e.priority]), pw);
    y = addLongText(doc, y, "Segmentation – Description", cs.description, pw);
    y = addLongText(doc, y, "Segmentation – Rationale", cs.rationale, pw);
  }
  const renderInterviews = (title: string, group: any) => {
    if (!group?.entries?.length) return;
    y = addTable(doc, y, title, ["Date", "Name", "Role", "Insights", "Rec/Pain", "Quotes"],
      group.entries.map((e: any) => [e.date, e.customerName || e.intervieweeName, e.role + (e.department ? ` / ${e.department}` : ""), e.keyInsights, e.painPoints || e.recommendations, e.quotes]),
      pw);
    y = addLongText(doc, y, `${title} – Description`, group.description, pw);
    y = addLongText(doc, y, `${title} – Rationale`, group.rationale, pw);
  };
  renderInterviews("Customer Interviews", sam?.customerInterviewing);
  renderInterviews("Internal Affiliate Interviews", sam?.internalAffiliateInterviews);
  renderInterviews("Internal BU Interviews", sam?.internalBUInterviews);

  if (sam?.businessModelling) {
    const b = sam.businessModelling;
    y = addFieldGroup(doc, y, "Business Model Canvas", [
      { label: "Value Proposition", value: b.valueProposition },
      { label: "Customer Segments", value: b.customerSegments },
      { label: "Channels", value: b.channels },
      { label: "Customer Relationships", value: b.customerRelationships },
      { label: "Revenue Streams", value: b.revenueStreams },
      { label: "Key Resources", value: b.keyResources },
      { label: "Key Activities", value: b.keyActivities },
      { label: "Key Partners", value: b.keyPartners },
      { label: "Cost Structure", value: b.costStructure },
      { label: "Description", value: b.description },
      { label: "Rationale", value: b.rationale },
    ], pw);
  }
  if (sam?.leanCanvas) {
    const l = sam.leanCanvas;
    y = addFieldGroup(doc, y, "Lean Canvas", [
      { label: "Problem", value: l.problem },
      { label: "Solution", value: l.solution },
      { label: "Unique Value Proposition", value: l.uniqueValueProposition },
      { label: "Unfair Advantage", value: l.unfairAdvantage },
      { label: "Customer Segments", value: l.customerSegments },
      { label: "Key Metrics", value: l.keyMetrics },
      { label: "Channels", value: l.channels },
      { label: "Cost Structure", value: l.costStructure },
      { label: "Revenue Streams", value: l.revenueStreams },
      { label: "Description", value: l.description },
      { label: "Rationale", value: l.rationale },
    ], pw);
  }

  // ═══ SOM ═══
  y += 4;
  y = addSectionTitle(doc, y, "SOM – Serviceable Obtainable Market");
  const somO = bp?.somOverview;
  if (somO) {
    y = addYearValues(doc, y, "SOM Projections", somO.projections || [], "M EUR", pw);
    y = addFieldGroup(doc, y, "SOM Overview", [
      { label: "Market Share vs SAM", value: somO.marketShareVsSam },
      { label: "Growth Rate", value: somO.growthRate },
      { label: "Visibility Rate", value: somO.visibilityRate },
      { label: "Sales Capacity", value: somO.salesCapacity },
      { label: "Pipeline", value: somO.pipeline },
      { label: "License to Operate", value: somO.licenseToOperate },
      { label: "Sales Capacity Scenario", value: somO.salesCapacityScenario },
      { label: "Marketing Budget Scenario", value: somO.marketingBudgetScenario },
      { label: "Positioning Scenario", value: somO.positioningScenario },
      { label: "Portfolio Coverage %", value: somO.portfolioCoveragePct },
      { label: "Visibility %", value: somO.visibilityPct },
      { label: "Visibility Growth %", value: somO.visibilityGrowthPct },
      { label: "Hitrate %", value: somO.hitratePct },
    ], pw);
    y = addRegions(doc, y, "SOM – Geographic Breakdown", somO.geographicalRegions || [], pw);
  }

  // Competitor Landscape
  if (bp?.competitorLandscape) {
    y = addKeyValue(doc, y, "Competitor Landscape Score", `${bp.competitorLandscape.score} / 5`);
    const cla: any = bp.competitorLandscape.analysis || {};
    y = addLongText(doc, y, "Competitor Landscape Notes", cla.notes || cla.description || "", pw);
  }
  if (bp?.pilotCustomer) {
    y = addKeyValue(doc, y, "Pilot Customer Score", `${bp.pilotCustomer.score} / 5`);
    y = addLongText(doc, y, "Pilot Notes", bp.pilotCustomer.notes, pw);
    if (bp.pilotCustomer.entries?.length) {
      y = addTable(doc, y, "Pilot Customer Candidates",
        ["Name", "Industry", "Status", "Validation", "Feedback"],
        bp.pilotCustomer.entries.map(e => [e.name, e.industry, e.contactStatus, e.validationResults, e.feedback]), pw);
    }
  }

  const som = sa?.som;
  if (som?.competitorAnalysis?.entries?.length) {
    const c = som.competitorAnalysis;
    y = addTable(doc, y, "Competitor Analysis",
      ["Competitor", "Market Share", "Threat", "Strengths", "Weaknesses", "Strategy"],
      c.entries.map(e => [e.name, e.marketShare, String(e.threatLevel), e.strengths, e.weaknesses, e.strategy]), pw);
    y = addLongText(doc, y, "Competitor Analysis – Description", c.description, pw);
    y = addLongText(doc, y, "Competitor Analysis – Rationale", c.rationale, pw);
  }
  if (som?.valuePropositionCanvas) {
    const v = som.valuePropositionCanvas;
    y = addFieldGroup(doc, y, "Value Proposition Canvas", [
      { label: "Customer Jobs", value: v.customerJobs },
      { label: "Customer Pains", value: v.customerPains },
      { label: "Customer Gains", value: v.customerGains },
      { label: "Products & Services", value: v.productsServices },
      { label: "Pain Relievers", value: v.painRelievers },
      { label: "Gain Creators", value: v.gainCreators },
      { label: "Description", value: v.description },
      { label: "Rationale", value: v.rationale },
    ], pw);
  }
  if (som?.customerBenefitAnalysis) {
    const c = som.customerBenefitAnalysis;
    y = addFieldGroup(doc, y, "Customer Benefit Analysis", [
      { label: "Functional Benefits", value: c.functionalBenefits },
      { label: "Emotional Benefits", value: c.emotionalBenefits },
      { label: "Social Benefits", value: c.socialBenefits },
      { label: "Self-Expressive Benefits", value: c.selfExpressiveBenefits },
      { label: "Description", value: c.description },
      { label: "Rationale", value: c.rationale },
    ], pw);
  }
  if (som?.threeCircleModel) {
    const t = som.threeCircleModel;
    y = addFieldGroup(doc, y, "Three Circle Model", [
      { label: "Our Value", value: t.ourValue },
      { label: "Competitor Value", value: t.competitorValue },
      { label: "Customer Needs", value: t.customerNeeds },
      { label: "Our Unique", value: t.ourUnique },
      { label: "Their Unique", value: t.theirUnique },
      { label: "Common Value", value: t.commonValue },
      { label: "Unmet Needs", value: t.unmetNeeds },
      { label: "Description", value: t.description },
      { label: "Rationale", value: t.rationale },
    ], pw);
  }
  if (som?.positioningStatement) {
    const p = som.positioningStatement;
    y = addFieldGroup(doc, y, "Positioning Statement", [
      { label: "Target Audience", value: p.targetAudience },
      { label: "Category", value: p.category },
      { label: "Key Benefit", value: p.keyBenefit },
      { label: "Reason to Believe", value: p.reasonToBelieve },
      { label: "Competitive Alternative", value: p.competitiveAlternative },
      { label: "Differentiator", value: p.differentiator },
      { label: "Statement", value: p.statement },
      { label: "Description", value: p.description },
      { label: "Rationale", value: p.rationale },
    ], pw);
  }
  if (som?.positioningLandscape?.entries?.length) {
    const pl = som.positioningLandscape;
    y = addTable(doc, y, `Positioning Landscape (X: ${pl.xAxisLabel || "—"}, Y: ${pl.yAxisLabel || "—"})`,
      ["Name", "Ours", "X", "Y"],
      pl.entries.map(e => [e.name, e.isOurs ? "Yes" : "—", String(e.xValue), String(e.yValue)]), pw);
    y = addLongText(doc, y, "Positioning Landscape – Description", pl.description, pw);
    y = addLongText(doc, y, "Positioning Landscape – Rationale", pl.rationale, pw);
  }
  if (som?.targetCosting) {
    const tc = som.targetCosting;
    y = addFieldGroup(doc, y, "Target Costing", [
      { label: "Market Price", value: tc.marketPrice },
      { label: "Target Margin %", value: tc.targetMarginPct },
      { label: "Allowable Cost", value: tc.allowableCost },
      { label: "Market Price Rationale", value: tc.marketPriceRationale },
      { label: "Margin Rationale", value: tc.marginRationale },
      { label: "Gap Analysis", value: tc.gapAnalysis },
      { label: "Action Plan", value: tc.actionPlan },
      { label: "Overall Assessment", value: tc.overallAssessment },
    ], pw);
    if (tc.components?.length) {
      y = addTable(doc, y, "Target Costing – Components",
        ["Component", "Current Cost", "Allowable Cost", "Gap", "Actions"],
        tc.components.map(c => [c.name, fmt(c.currentCost), fmt(c.allowableCost), fmt((c.currentCost || 0) - (c.allowableCost || 0)), c.actions]), pw);
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `NOVI – Business Plan – Exported on ${new Date().toLocaleDateString("en-US")} – Page ${i}/${pageCount}`,
      pw / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" }
    );
  }

  doc.save(`${opp.title.replace(/[^a-zA-Z0-9 ]/g, "_")}_BusinessPlan.pdf`);
}

