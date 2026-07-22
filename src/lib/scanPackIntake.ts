// Format a scan's intake (from the saved hypothesis) as plain text for pasting
// into an external AI chat (e.g. Claude, ChatGPT).

import type { HypothesisData } from "./hypothesisTypes";
import type { ScanPackKey } from "./scanPackTypes";

function line(label: string, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    return `- ${label}: ${value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ")}`;
  }
  if (typeof value === "object") {
    const s = JSON.stringify(value);
    return s === "{}" ? "" : `- ${label}: ${s}`;
  }
  const s = String(value).trim();
  if (!s) return "";
  return `- ${label}: ${s}`;
}

function block(title: string, lines: string[]): string {
  const kept = lines.filter(Boolean);
  if (kept.length === 0) return "";
  return `## ${title}\n${kept.join("\n")}`;
}

function coreBlock(h: HypothesisData): string {
  const c = h.core;
  const targets = c.targetMarkets?.length
    ? c.targetMarkets.map((t) => `${t.segment} (${t.region})`).join(", ")
    : "";
  return block("Core hypothesis", [
    line("Statement", c.hypothesisStatement),
    line("Client", `${c.client.company}${c.client.businessUnit ? " / " + c.client.businessUnit : ""}`),
    line("Offering", c.offering.name),
    line("Offering description", c.offering.description),
    line("Spec anchors", c.offering.specAnchors),
    line("Business model", c.offering.businessModel),
    line("Target markets", targets),
  ]);
}

function scanBlock(h: HypothesisData, scan: ScanPackKey): string {
  switch (scan) {
    case "industry": {
      const s = h.industry;
      if (!s) return "";
      return block("Industry Study intake", [
        line("Study purpose", s.studyPurpose),
        line("Segments (in-depth)", s.segmentsInDepth),
        line("Depth", s.depth),
        line("Geography — primary", s.geography.primary),
        line("Geography — baseline", s.geography.baseline),
        line("Geography — light", s.geography.light),
        line("Outputs", Object.entries(s.outputs).filter(([, v]) => v).map(([k]) => k)),
      ]);
    }
    case "customer": {
      const s = h.customer;
      if (!s) return "";
      return block("Customer Scan intake", [
        line("Products", s.products),
        line("Report mode", s.reportMode),
        line("Use cases", s.useCases),
        line("Business model", s.businessModel),
        line("Target market", s.targetMarket),
        line("Customer types", s.customerTypes),
        line("Preferences", s.preferences),
        line("Tier criteria (A–E)", s.tierCriteria),
        line("Additional comments", s.additionalComments),
      ]);
    }
    case "competitor": {
      const s = h.competitor;
      if (!s) return "";
      const known = s.knownCompetitors?.length
        ? s.knownCompetitors.map((k) => `${k.name}${k.clientBelief ? " — " + k.clientBelief : ""}`).join("; ")
        : "";
      const fw = Object.entries(s.frameworks).filter(([, v]) => v).map(([k]) => k);
      return block("Competitor Scan intake", [
        line("Client", s.client),
        line("Offering", s.offering.name),
        line("Offering description", s.offering.description),
        line("Spec anchors", s.offering.specAnchors),
        line("Known competitors", known),
        line("Benchmark criteria", s.benchmarkCriteria),
        line("Depth cap", s.depthCap),
        line("Target margin", s.targetCosting.targetMargin),
        line("Current cost", s.targetCosting.currentCost),
        line("WTP anchors", s.targetCosting.wtpAnchors),
        line("Frameworks", fw),
        line("Preferences", s.preferences),
        line("Additional comments", s.additionalComments),
      ]);
    }
    case "market_potential": {
      const s = h.marketPotential;
      if (!s) return "";
      const units = s.unitsPerCustomerType?.length
        ? s.unitsPerCustomerType.map((u) => `${u.customerType}: ${u.units}`).join("; ")
        : "";
      return block("Market Potential Scan intake", [
        line("Price per unit / seat", s.pricePerUnitOrSeat),
        line("Units per customer type", units),
        line("Recurring vs. one-time", s.recurringOrOneTime),
        line("Base year", s.baseYear),
        line("Currency", s.currency),
        line("Win-rate assumption", s.winRateAssumption),
        line("Adoption assumption", s.adoptionAssumption),
        line("Addressable share assumption", s.addressableShareAssumption),
        line("Scenario — conservative", s.scenarios.conservative),
        line("Scenario — realistic", s.scenarios.realistic),
        line("Scenario — aggressive", s.scenarios.aggressive),
      ]);
    }
    case "buying_center": {
      const s = h.buyingCenter;
      if (!s) return "";
      return block("Buying Center Scan intake", [
        line("Offering description", s.offeringDescription),
        line("Seed input type", s.seedInputType),
        line("Shortlist rule", s.shortlistRule),
        line("Depth", s.depth),
        line("Delivery notes", s.deliveryNotes),
      ]);
    }
    case "assembler":
      return "";
  }
}

export function formatIntake(
  h: HypothesisData | undefined,
  scan: ScanPackKey | "all",
  ideaTitle: string,
): string {
  if (!h) return `No hypothesis has been drafted for "${ideaTitle}" yet.`;
  const header = `# Scan intake — ${ideaTitle}\nStatus: ${h.status}\n`;
  const core = coreBlock(h);
  const scans =
    scan === "all"
      ? ["industry", "customer", "competitor", "market_potential", "buying_center"]
          .map((k) => scanBlock(h, k as ScanPackKey))
          .filter(Boolean)
          .join("\n\n")
      : scanBlock(h, scan);
  return [header, core, scans].filter(Boolean).join("\n\n");
}
