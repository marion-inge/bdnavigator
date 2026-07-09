## Problem

The idea detail page's left sidebar still shows the old "Business Plan → TAM / SAM / SOM" grouping. Under the new process, the work formerly split across TAM/SAM/SOM belongs to two distinct process phases:

- **Market Intelligence** (before G2) — desk research, frameworks, competitor & customer landscape, canvases, risk
- **Verification Market Potential / Feedback** (after G2) — interviews, pilots & leads, and the SAM/SOM sizing driven by that feedback

Nothing about the underlying data model or the tab components themselves needs to change — only how they are grouped and labeled in the left navigation.

## Proposed new sidebar grouping

Replace the three top-level nodes (TAM / SAM / SOM) under "Detailed Scoring / Business Plan" with two top-level nodes that mirror the new process phases. The `bp*` sub-tab keys stay the same so the underlying `BusinessPlanSection` routing keeps working.

### 1. Market Intelligence (Phase before G2)

TAM — full block (all of today's TAM):
- TAM Overview
- Market Research
- PESTEL
- Value Chain
- Porter's
- SWOT

From today's SAM:
- Sales Channels
- Customer Landscape
- Strategic Fit
- Portfolio Fit
- Feasibility
- Org Readiness
- Risk
- BMC
- Lean Canvas

From today's SOM:
- Competitors
- VPC (Value Proposition Canvas)
- Customer Benefit
- Three Circles
- Positioning
- Target Costing

### 2. Verification Market Potential (Phase after G2, "Feedback")

From today's SAM:
- SAM Overview (sizing informed by feedback)
- Customer Interviews
- Affiliate Interviews
- BU Interviews

From today's SOM:
- SOM Overview (sizing informed by feedback)
- Pilot & Leads

## Open questions before I implement

1. **SAM Overview & SOM Overview placement** — I've put both in the Feedback phase because the market-size numbers are typically confirmed by interviews and pilots. Do you agree, or would you like the sizing overviews to stay in Market Intelligence and have Feedback only host interviews/pilots?
2. **Top-level labels** — Should the two nodes read exactly "Market Intelligence" and "Verification Market Potential", matching the process bar? (DE: "Marktintelligenz" / "Verifikation Marktpotenzial")
3. **Keep TAM / SAM / SOM as sub-headers inside Market Intelligence?** e.g. Market Intelligence → TAM / (from SAM) / (from SOM) as visual sub-groups, or fully flatten into one list.
4. **"Detailed Scoring" parent node** — keep the current parent label, or rename it to something process-aligned (e.g. "Market Analysis")?

## Technical scope (single file)

- `src/pages/OpportunityDetail.tsx`: rewrite the `bpSubNav` array (lines ~122-179) into two groups with the new children. No changes to `BusinessPlanSection`, tab keys, data model, or i18n keys other than adding labels for the two new group headers.

Once you answer the four questions I'll ship the change.
