import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ROUGH_SCORING_QUESTIONS, getQuestionsByCategory } from "./roughScoringQuestions";
import { SCORING_WEIGHTS } from "./types";

const PRIMARY_COLOR: [number, number, number] = [59, 130, 246];
const HINT_COLOR: [number, number, number] = [100, 116, 139];

const CATEGORY_LABELS: Record<string, string> = {
  marketAttractiveness: "Marktattraktivität",
  strategicFit: "Strategischer Fit",
  feasibility: "Machbarkeit",
  commercialViability: "Kommerzielle Tragfähigkeit",
  risk: "Risiko",
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  marketAttractiveness: SCORING_WEIGHTS.marketAttractiveness,
  strategicFit: SCORING_WEIGHTS.strategicFit,
  feasibility: SCORING_WEIGHTS.feasibility,
  commercialViability: SCORING_WEIGHTS.commercialViability,
  risk: SCORING_WEIGHTS.risk,
};

const CATEGORY_ICONS: Record<string, string> = {
  marketAttractiveness: "📊",
  strategicFit: "🎯",
  feasibility: "⚙️",
  commercialViability: "💰",
  risk: "⚠️",
};

export function exportQuestionnairePdf() {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pw, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("NOVI – Idea Scoring Fragenkatalog", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("22 Fragen | 5 Kategorien | Druckvorlage", 14, 26);
  doc.setTextColor(0, 0, 0);

  let y = 42;

  // Scoring explanation
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...HINT_COLOR);
  doc.text(
    "Gewichtung: Marktattraktivität ×3 | Strategischer Fit ×3 | Machbarkeit ×2 | Kommerz. Tragfähigkeit ×2 | Risiko ×1 (invertiert: 6 − Score)",
    14,
    y
  );
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  y += 10;

  const categories = getQuestionsByCategory();
  let questionNum = 1;

  for (const { category, questions } of categories) {
    const catLabel = CATEGORY_LABELS[category] || category;
    const weight = CATEGORY_WEIGHTS[category] || 1;
    const icon = CATEGORY_ICONS[category] || "";
    const isRisk = category === "risk";

    // Check if we need a new page for the category header + at least one question
    if (y > ph - 80) {
      doc.addPage();
      y = 20;
    }

    // Category header
    doc.setFillColor(241, 245, 249);
    doc.rect(10, y - 5, pw - 20, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY_COLOR);
    const headerText = `${icon} ${catLabel} (${questions.length} Fragen, Gewicht ×${weight})${isRisk ? " – Höherer Score = Höheres Risiko" : ""}`;
    doc.text(headerText, 14, y + 3);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 14;

    for (const q of questions) {
      // Check page break — need space for question + table (~65px min)
      if (y > ph - 70) {
        doc.addPage();
        y = 20;
      }

      // Question title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${questionNum}. ${q.question.de}`, 14, y);
      y += 5;

      // Hint
      if (q.commentHint) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...HINT_COLOR);
        const hintLines = doc.splitTextToSize(`Hint: ${q.commentHint.de}`, pw - 28);
        doc.text(hintLines, 14, y);
        y += hintLines.length * 4 + 1;
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      }

      // Score table
      const tableBody = [1, 2, 3, 4, 5].map((score) => [
        String(score),
        q.descriptions[score as 1 | 2 | 3 | 4 | 5].de,
        "", // empty column for handwritten score
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Score", "Beschreibung", "✓"]],
        body: tableBody,
        headStyles: {
          fillColor: PRIMARY_COLOR,
          fontSize: 8,
          cellPadding: 2,
        },
        styles: {
          fontSize: 8,
          cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
          minCellHeight: 6,
        },
        columnStyles: {
          0: { cellWidth: 14, halign: "center", fontStyle: "bold" },
          1: { cellWidth: pw - 48 },
          2: { cellWidth: 12, halign: "center" },
        },
        margin: { left: 14, right: 14 },
        theme: "grid",
      });

      y = (doc as any).lastAutoTable.finalY + 4;

      // Comment line
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...HINT_COLOR);
      doc.text("Kommentar:", 14, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(38, y, pw - 14, y);
      y += 5;
      doc.line(14, y, pw - 14, y);
      y += 5;
      doc.line(14, y, pw - 14, y);
      doc.setTextColor(0, 0, 0);
      y += 8;

      questionNum++;
    }
  }

  // Summary box at end
  if (y > ph - 60) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(10, y - 2, pw - 20, 50, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("Zusammenfassung", 14, y + 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const summaryRows = [
    ["Marktattraktivität (×3):", "_____ / 5"],
    ["Strategischer Fit (×3):", "_____ / 5"],
    ["Machbarkeit (×2):", "_____ / 5"],
    ["Kommerz. Tragfähigkeit (×2):", "_____ / 5"],
    ["Risiko (×1, invertiert):", "_____ / 5"],
    ["", ""],
    ["Gesamtscore:", "_____ / 5.0"],
  ];

  let sy = y + 13;
  for (const [label, value] of summaryRows) {
    if (label === "" && value === "") {
      sy += 2;
      doc.setDrawColor(180, 180, 180);
      doc.line(14, sy, 100, sy);
      sy += 4;
      continue;
    }
    doc.setFont("helvetica", label === "Gesamtscore:" ? "bold" : "normal");
    doc.text(label, 16, sy);
    doc.text(value, 85, sy);
    sy += 5;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `NOVI – Idea Scoring Fragenkatalog – Seite ${i}/${pageCount}`,
      pw / 2,
      ph - 8,
      { align: "center" }
    );
  }

  doc.save(`NOVI_Idea_Scoring_Fragenkatalog.pdf`);
}
