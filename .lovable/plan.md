# Hypothesis Builder — Implementation Plan

## Entry point in the current idea flow

The idea detail page (`src/pages/OpportunityDetail.tsx`) already gates tabs by stage. The questionnaire ("Rough Scoring") lives in the `scoring` tab and completion is detected via `opp.roughScoringAnswers`.

- Add a new sidebar tab **"Hypothesis"** (key `hypothesis`), placed between `scoring` and `strategic_analyses`.
- Tab stage threshold: `rough_scoring` (visible once questionnaire started), but the "Develop Hypothesis" CTA inside the tab is **enabled only when `hasCompletedScoring` is true**; otherwise a call-out asks the user to complete the questionnaire first.
- Also surface a **"Develop Hypothesis"** button on the Scoring results view once the questionnaire is completed (deep-links to the new tab).
- Bilingual EN/DE via `src/lib/locales/{en,de}.json` — every label, tab title, field label, empty-state message.

## Data model changes

Add one JSONB column on `opportunities`: `hypothesis JSONB` (nullable). Single-row-per-idea, versioned by `updated_at`; the shape below covers Core + all five scan tabs and a status flag. Sync `src/integrations/supabase/types.ts` and add a `HypothesisData` type in `src/lib/types.ts`.

```ts
type HypothesisStatus = "draft" | "confirmed";
type ScanKey = "industry" | "customer" | "competitor" | "market_potential" | "buying_center";

interface HypothesisData {
  status: HypothesisStatus;
  selectedScans: ScanKey[];
  updatedAt: string;
  aiDraftedAt?: string;

  core: {
    hypothesisStatement: string;
    client: { company: string; businessUnit: string };
    offering: {
      name: string;
      description: string;              // 3–5 sentences
      specAnchors: string[];            // 5–10 anchors
      businessModel: "one-time" | "recurring" | "service" | "";
    };
    targetMarkets: Array<{ segment: string; region: string }>;
  };

  industry?: {
    studyPurpose: "market_entry" | "geo_expansion" | "partner_supplier_search"
                 | "competitive_positioning" | "portfolio_gap_screening" | "";
    segmentsInDepth: string[];
    depth: "strategic_overview" | "thorough" | "exhaustive" | "";
    geography: { primary: string[]; baseline: string[]; light: string[] };
    outputs: { valueChainMap: boolean; wordStudy: boolean; excelPlayerDb: boolean; slideDeck: boolean };
  };

  customer?: {
    products: string; reportMode: string; useCases: string; businessModel: string;
    targetMarket: string; customerTypes: string; preferences: string;
    tierCriteria: string; additionalComments: string;
  };

  competitor?: {
    client: string;
    offering: { name: string; description: string; specAnchors: string[] };
    targetMarkets: Array<{ segment: string; region: string }>;
    knownCompetitors: Array<{ name: string; clientBelief: string }>;
    benchmarkCriteria: string[];
    depthCap: number;                    // default 12
    criteriaWeights: Record<string, number>;
    targetCosting: { targetMargin: string; currentCost: string; wtpAnchors: string };
    frameworks: { vpc: boolean; cba: boolean; threeCircle: boolean; positioning: boolean; targetCosting: boolean };
    preferences: string; additionalComments: string;
  };

  marketPotential?: {
    pricePerUnitOrSeat: string;
    unitsPerCustomerType: Array<{ customerType: string; units: string }>;
    recurringOrOneTime: "recurring" | "one_time" | "";
    baseYear: string; currency: string;
    winRateAssumption: string; adoptionAssumption: string; addressableShareAssumption: string;
    scenarios: {
      conservative: string; realistic: string; aggressive: string;   // assumption sets
    };
  };

  buyingCenter?: {
    offeringDescription: string;         // 3–5 sentences
    seedInputType: "customer_scan_db" | "crm_export" | "lead_list" | "manual_account_list" | "";
    shortlistRule: string;
    depth: "full_mapping_50" | "contact_coverage_400" | "";
    deliveryNotes: string;
  };
}
```

Adapter: extend `src/lib/backendAdapter.ts` (`toDbOpportunity` / `fromDbOpportunity`) to map `hypothesis` ↔ DB. Migration adds `hypothesis JSONB` column plus GRANT (matching existing permissive policy set).

## UI

New folder `src/components/hypothesis/`:

- `HypothesisSection.tsx` — container rendered inside the new tab; shows status pill (Draft/Confirmed), timestamps, main action bar (Develop with IDA · Save · Confirm · Export XLSX), and the tab set.
- `DevelopHypothesisDialog.tsx` — multi-select of the 5 scans, then triggers the edge function, shows progress, writes result into `hypothesis`.
- `HypothesisForm.tsx` — accordion+tab layout: **Core** panel always visible; one collapsible panel per selected scan. Every field is editable; fields the AI could not infer render with a subtle amber "needs input" chip and are also listed in a "Needs your input" summary at the top of each tab.
- Reuse existing shadcn primitives (Tabs, Accordion, Input, Textarea, Select, Checkbox, Badge) to match NOVI styling; no new colors.

## AI drafting

New Supabase edge function `supabase/functions/hypothesis-draft/index.ts` (`verify_jwt = false`, added to `supabase/config.toml`), following the same pattern as `ida-idea-extraction` / `ida-business-plan-extraction`:

- Input: `{ opportunityId, selectedScans: ScanKey[], language: "en"|"de" }`.
- Server loads the opportunity (title, description, solution_description, industry, geography, technology, `rough_scoring_answers`, `rough_scoring_comments`, `rough_scoring_sources`, `scoring`), turns the questionnaire answers + comments into a compact textual brief via `ROUGH_SCORING_QUESTIONS` labels.
- Calls Lovable AI Gateway (`openai/gpt-5.5`) via `generateText` + `Output.object` with a Zod schema mirroring `HypothesisData` (Core + only the requested scan sections).
- Prompt rule: "If a field cannot be reasonably inferred from the questionnaire, leave it as empty string / empty array — do NOT fabricate." The client then flags empty required fields as "needs input".
- Returns the partial `HypothesisData`; client merges it into any existing hypothesis (preserving user edits — only fills blanks unless the user chose "Overwrite with AI draft").

## Excel export

Client-side using the already-installed `xlsx` package, in new `src/lib/hypothesisExport.ts`:

- One workbook `ScanInputSheets_<idea title>.xlsx`.
- Tab **Core / Hypothesis** always present.
- One tab per selected scan (in fixed order), name = scan display name.
- Each tab is a two-column sheet: column A = field label (localized to the current UI language), column B = value. Arrays flattened to one row per item with indexed labels (e.g. `Spec anchor 1`, `Spec anchor 2`) or comma-joined for short lists, per field. Booleans as `Yes/No` / `Ja/Nein`. Column widths preset for readability. First row per tab = tab title in bold via cell style.
- Triggered from the `HypothesisSection` toolbar; works regardless of Draft/Confirmed status.

## Questionnaire → hypothesis field mapping (what you should know)

The questionnaire (`src/lib/roughScoringQuestions.ts`) is a 1–5 rating per question with an optional free-text comment and sources list, grouped into `marketAttractiveness`, `strategicFit`, `feasibility`, `commercialViability`, `risk`. It gives **directional signal, not structured facts** — meaning:

- The AI can reliably draft: `core.hypothesisStatement`, `core.targetMarkets` (from `opp.industry` + `opp.geography` + `ma_market_size` comment which typically encodes TAM scope), `core.offering.description` (from `opp.description` + `solution_description`), `industry.studyPurpose` and `industry.depth` (inferred from strategic fit / feasibility comments), `competitor.knownCompetitors` (from the `ma_competition` question comment), `marketPotential.scenarios` (loosely from `ma_growth_rate` + `commercialViability` comments).
- The AI usually **cannot** infer: exact `specAnchors`, `client.businessUnit`, numeric `pricePerUnitOrSeat` / `baseYear` / `depthCap` / `criteriaWeights` / target-costing numbers, `buyingCenter.seedInputType`. These will typically be flagged "needs input".
- `opp.owner` and `opp.idea_bringer` are the best proxies for `core.client`, but the human still needs to confirm.

The plan therefore emphasizes the AI as a *draft assistant* + a strong "Needs your input" surface, not a one-click fill.

## Files to add / touch

Add:
- `src/components/hypothesis/HypothesisSection.tsx`
- `src/components/hypothesis/DevelopHypothesisDialog.tsx`
- `src/components/hypothesis/HypothesisForm.tsx` (+ small subcomponents per tab if needed)
- `src/lib/hypothesisExport.ts`
- `supabase/functions/hypothesis-draft/index.ts`

Modify:
- `src/pages/OpportunityDetail.tsx` (new tab, CTA on scoring results)
- `src/lib/types.ts` (`HypothesisData`, `Opportunity.hypothesis`)
- `src/lib/backendAdapter.ts` (mapping)
- `src/lib/store.tsx` (add `updateHypothesis`)
- `src/integrations/supabase/types.ts` (regenerated after migration)
- `src/lib/locales/en.json`, `src/lib/locales/de.json`
- `supabase/config.toml` (register function with `verify_jwt = false`)

Migration:
- `ALTER TABLE public.opportunities ADD COLUMN hypothesis JSONB;` (grants already cover the table).

## Open assumptions worth confirming

1. Excel labels export in the **current UI language**; add a language toggle in the export dialog only if you want both in one workbook.
2. "Confirmed" is informational (a pill + timestamp) — no downstream lock. Say if you want confirmed hypotheses to become read-only.
3. Re-running AI draft **fills only empty fields by default**, with an explicit "Overwrite with AI draft" checkbox for full regeneration.
