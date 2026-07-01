import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import JSZip from "npm:jszip@3.10.1";
import * as XLSX from "npm:xlsx@0.18.5";

const MAX_BYTES = 18 * 1024 * 1024;
const MAX_EXTRACTED_CHARS_PER_FILE = 220_000;

function classify(mime: string, name: string): "text" | "image" | "pdf" | "docx" | "xlsx" | "pptx" | "unsupported" {
  const lower = (name || "").toLowerCase();
  if ((mime || "").startsWith("text/") || mime === "application/json" || /\.(txt|md|csv|json|log|html|xml)$/i.test(lower)) return "text";
  if ((mime || "").startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lower)) return "image";
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (/\.(docx)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (/\.(xlsx|xls)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mime === "application/vnd.ms-excel") return "xlsx";
  if (/\.(pptx)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
  return "unsupported";
}

function bufToBase64(buf: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK) as any);
  return btoa(bin);
}

function stripXml(xml: string): string {
  return xml
    .replace(/<w:tab\s*\/?>/g, "\t")
    .replace(/<w:br\s*\/?>/g, "\n")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<a:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractDocxText(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const parts = Object.keys(zip.files)
    .filter((name) => /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i.test(name))
    .sort((a, b) => (a.includes("document.xml") ? -1 : b.includes("document.xml") ? 1 : a.localeCompare(b)));

  const chunks: string[] = [];
  for (const part of parts) {
    const xml = await zip.files[part].async("text");
    const text = stripXml(xml);
    if (text) chunks.push(`--- ${part} ---\n${text}`);
  }
  return chunks.join("\n\n");
}

function extractWorkbookText(buf: Uint8Array): string {
  const workbook = XLSX.read(buf, { type: "array", cellDates: true });
  const chunks: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false }).trim();
    if (csv) chunks.push(`--- Sheet: ${sheetName} ---\n${csv}`);
  }
  return chunks.join("\n\n");
}

async function extractPptxText(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const slideParts = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const an = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const bn = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return an - bn;
    });

  const chunks: string[] = [];
  for (const part of slideParts) {
    const xml = await zip.files[part].async("text");
    const text = stripXml(xml);
    if (text) chunks.push(`--- ${part} ---\n${text}`);
  }
  return chunks.join("\n\n");
}

async function toContentBlock(name: string, mime: string, buf: Uint8Array): Promise<any> {
  const kind = classify(mime, name);
  if (kind === "unsupported") return { type: "text", text: `[Attachment "${name}" cannot be read.]` };
  if (buf.byteLength > MAX_BYTES) return { type: "text", text: `[Attachment "${name}" exceeded size cap and was skipped.]` };
  if (kind === "text") {
    const text = new TextDecoder().decode(buf).slice(0, MAX_EXTRACTED_CHARS_PER_FILE);
    return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End of ${name} ---` };
  }
  if (kind === "docx" || kind === "xlsx" || kind === "pptx") {
    try {
      const text = kind === "docx"
        ? await extractDocxText(buf)
        : kind === "xlsx"
        ? extractWorkbookText(buf)
        : await extractPptxText(buf);
      const trimmed = text.slice(0, MAX_EXTRACTED_CHARS_PER_FILE).trim();
      return {
        type: "text",
        text: trimmed
          ? `--- File: ${name} (extracted ${kind.toUpperCase()} content) ---\n${trimmed}\n--- End of ${name} ---`
          : `[Attachment "${name}" was opened as ${kind.toUpperCase()}, but no readable text or table content was found.]`,
      };
    } catch (e) {
      console.error(`Office extraction failed for ${name}`, e);
      return { type: "text", text: `[Attachment "${name}" could not be extracted. Please convert it to PDF, TXT, CSV or XLSX and try again.]` };
    }
  }
  const b64 = bufToBase64(buf);
  if (kind === "image") return { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${b64}` } };
  return { type: "file", file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } };
}

// ─── schema groups ─────────────────────────────────────────────────────────
const strProps = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, { type: "string" }]));

const TAM_OVERVIEW_KEYS = ["scopeDefinition","geographicCoverage","assumptions","scopeExclusions","fullGlobalPotential","marketDevelopment","drivers","sources","sourceAssessment","derivationMethod","supportingModelNotes"];
const SAM_OVERVIEW_KEYS = ["samVsTamExplanation","includedIndustries","excludedIndustries","geographicFocus","geographicExclusions","targetGroups","unreachableGroups","relevanceOutlook","featureAdaptations","priceEvolution","resourceScenarios","requiredInvestments"];
const SOM_OVERVIEW_KEYS = ["marketShareVsSam","growthRate","visibilityRate","salesCapacity","pipeline","licenseToOperate","salesCapacityScenario","marketingBudgetScenario","positioningScenario"];

// 5-year projection array schema {year:1..5, value:number in M€}
const projectionsSchema = {
  type: "array",
  description: "Five-year market-size projection. Year is 1..5 (year 1 = current year). Value is in millions of EUR (M€). Provide your best estimate based on the documents; CAGR is auto-calculated from these.",
  items: {
    type: "object",
    properties: {
      year: { type: "integer", minimum: 1, maximum: 5 },
      value: { type: "number" },
    },
    required: ["year", "value"],
    additionalProperties: false,
  },
  minItems: 5,
  maxItems: 5,
};

const geographicalRegionsSchema = {
  type: "array",
  description: "Geographic breakdown table. Extract every visible region/country/cluster and its TAM/SAM/SOM value from the documents. Market size must preserve units exactly as supported by the source, preferably in M€ where available. Potential is a 1-5 rating based on the document evidence. Notes must include source context, assumptions and what the value represents.",
  items: {
    type: "object",
    properties: {
      region: { type: "string", description: "Region, country or market cluster name exactly as shown or clearly implied in the source." },
      marketSize: { type: "string", description: "Regional market size / potential with unit and year, e.g. '120 M€ in 2027' or 'approx. 35 customers × 0.8 M€/year'." },
      potential: { type: "integer", minimum: 1, maximum: 5, description: "Regional attractiveness / potential rating: 1 = very low, 5 = very high." },
      notes: { type: "string", description: "Short factual explanation and source reference/context from the document." },
    },
    required: ["region", "marketSize", "potential", "notes"],
    additionalProperties: false,
  },
};

const MARKET_RESEARCH_KEYS = ["secondaryResearch","primaryResearch","keyFigures","methodology","centralInsights","description","rationale"];
const PESTEL_KEYS = ["political","economic","social","technological","environmental","legal","description","rationale"];
const SWOT_KEYS = ["strengths","weaknesses","opportunities","threats","description","rationale"];
const VALUECHAIN_KEYS = ["description","rationale"];
const PORTER_FORCES = ["competitiveRivalry","threatOfNewEntrants","threatOfSubstitutes","bargainingPowerBuyers","bargainingPowerSuppliers"];

const BMC_KEYS = ["valueProposition","customerSegments","channels","customerRelationships","revenueStreams","keyResources","keyActivities","keyPartners","costStructure","description","rationale"];
const LEAN_KEYS = ["problem","solution","uniqueValueProposition","unfairAdvantage","customerSegments","keyMetrics","channels","costStructure","revenueStreams","description","rationale"];

const VPC_KEYS = ["customerJobs","customerPains","customerGains","productsServices","painRelievers","gainCreators","description","rationale"];
const CBA_KEYS = ["functionalBenefits","emotionalBenefits","socialBenefits","selfExpressiveBenefits","description","rationale"];
const THREE_KEYS = ["ourValue","competitorValue","customerNeeds","ourUnique","theirUnique","commonValue","unmetNeeds","description","rationale"];
const POS_KEYS = ["targetAudience","category","keyBenefit","reasonToBelieve","competitiveAlternative","differentiator","statement","description","rationale"];
const TC_KEYS = ["marketPriceRationale","marginRationale","gapAnalysis","actionPlan","overallAssessment"];

type SectionScope = "overview" | "tam" | "sam" | "som";

function buildSchema(scope: SectionScope) {
  const props: Record<string, any> = {};
  if (scope === "overview") {
    props.overview = {
      type: "object",
      properties: {
        tam: {
          type: "object",
          properties: {
            ...strProps(TAM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
            marketGrowthRate: { type: "string", description: "Narrative growth-rate statement, e.g. '15% CAGR through 2030'." },
          },
          required: ["projections", "marketGrowthRate"],
          additionalProperties: false,
        },
        sam: {
          type: "object",
          properties: {
            ...strProps(SAM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
          },
          required: ["projections"],
          additionalProperties: false,
        },
        som: {
          type: "object",
          properties: {
            ...strProps(SOM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
          },
          required: ["projections"],
          additionalProperties: false,
        },
      },
      required: ["tam", "sam", "som"],
      additionalProperties: false,
    };
  }
  if (scope === "tam") {
    props.tam = {
      type: "object",
      properties: {
        marketResearch: { type: "object", properties: strProps(MARKET_RESEARCH_KEYS), additionalProperties: false },
        pestel: { type: "object", properties: strProps(PESTEL_KEYS), additionalProperties: false },
        valueChain: { type: "object", properties: strProps(VALUECHAIN_KEYS), additionalProperties: false },
        porter: {
          type: "object",
          properties: {
            ...Object.fromEntries(PORTER_FORCES.map((f) => [f, { type: "string" }])),
            description: { type: "string" },
            rationale: { type: "string" },
          },
          additionalProperties: false,
        },
        swot: { type: "object", properties: strProps(SWOT_KEYS), additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (scope === "sam") {
    props.sam = {
      type: "object",
      properties: {
        customerSegmentation: { type: "object", properties: { description: { type: "string" }, rationale: { type: "string" } }, additionalProperties: false },
        businessModelling: { type: "object", properties: strProps(BMC_KEYS), additionalProperties: false },
        leanCanvas: { type: "object", properties: strProps(LEAN_KEYS), additionalProperties: false },
        risk: { type: "object", properties: { details: { type: "string" } }, additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (scope === "som") {
    props.som = {
      type: "object",
      properties: {
        competitorAnalysis: {
          type: "object",
          properties: {
            description: { type: "string" },
            rationale: { type: "string" },
            entries: {
              type: "array",
              description: "Every competitor mentioned in the documents. Extract each as a separate row.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Competitor company / product name exactly as shown." },
                  strengths: { type: "string", description: "Key strengths / advantages (2-4 concrete points)." },
                  weaknesses: { type: "string", description: "Key weaknesses / gaps (2-4 concrete points)." },
                  marketShare: { type: "string", description: "Market share with unit if available, e.g. '18%' or 'n/a'." },
                  strategy: { type: "string", description: "Strategic positioning / go-to-market approach in 1-2 sentences." },
                  threatLevel: { type: "integer", minimum: 1, maximum: 5, description: "Threat level 1 (low) to 5 (high)." },
                },
                required: ["name", "strengths", "weaknesses", "marketShare", "strategy", "threatLevel"],
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
        valuePropositionCanvas: { type: "object", properties: strProps(VPC_KEYS), additionalProperties: false },
        customerBenefitAnalysis: { type: "object", properties: strProps(CBA_KEYS), additionalProperties: false },
        threeCircleModel: { type: "object", properties: strProps(THREE_KEYS), additionalProperties: false },
        positioningStatement: { type: "object", properties: strProps(POS_KEYS), additionalProperties: false },
        targetCosting: { type: "object", properties: strProps(TC_KEYS), additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  return { type: "object", properties: props, additionalProperties: false };
}

const SECTION_DESCRIPTIONS: Record<SectionScope, string> = {
  overview: "the TAM / SAM / SOM Overview text fields (scope, geography, assumptions, drivers, sources, methodology, market-share, growth-rate, sales capacity, etc.)",
  tam: "the TAM strategic models: Market Research, PESTEL (Political/Economic/Social/Technological/Environmental/Legal), Value Chain, Porter's Five Forces (all 5 forces), and SWOT (Strengths/Weaknesses/Opportunities/Threats)",
  sam: "the SAM section: Customer Landscape narrative, Business Model Canvas (all 9 blocks), Lean Canvas (all 9 blocks), and the Risk narrative",
  som: "the SOM section: Competitor narrative, Value Proposition Canvas (jobs/pains/gains, products, pain relievers, gain creators), Customer Benefit Analysis (functional/emotional/social/self-expressive), Three Circles, Positioning statement, and Target Costing narrative",
};

const FIELD_GUIDE: Record<SectionScope, string> = {
  overview: `Fill every field you can support. Examples:
- tam.scopeDefinition, tam.geographicCoverage, tam.assumptions, tam.scopeExclusions, tam.fullGlobalPotential, tam.marketDevelopment, tam.drivers, tam.sources, tam.sourceAssessment, tam.derivationMethod, tam.supportingModelNotes
- tam.projections (5 years, M€) and tam.marketGrowthRate (narrative CAGR statement) — derive from market-size figures, growth rates, segment sizings, customer counts × price, or any other quantitative anchors present in the documents. ALWAYS attempt projections; clearly state assumptions in tam.assumptions / tam.derivationMethod.
- tam.geographicalRegions — IMPORTANT: extract the geographic breakdown table/chart for TAM. Include every visible region/country/cluster, the exact regional market size/potential with units/year, a 1-5 potential rating, and factual notes/source context. Do not collapse regional rows into one text paragraph.
- sam.samVsTamExplanation, sam.includedIndustries, sam.excludedIndustries, sam.geographicFocus, sam.geographicExclusions, sam.targetGroups, sam.unreachableGroups, sam.relevanceOutlook, sam.featureAdaptations, sam.priceEvolution, sam.resourceScenarios, sam.requiredInvestments
- sam.projections (5 years, M€) — derived as the addressable share of TAM based on industries, geography and target-group filters in the documents.
- sam.geographicalRegions — IMPORTANT: extract the regional SAM breakdown, reflecting only serviceable/accessibly addressable regions. Use source values directly where shown; otherwise derive only when the document provides enough regional TAM/filter evidence.
- som.marketShareVsSam, som.growthRate, som.visibilityRate, som.salesCapacity, som.pipeline, som.licenseToOperate, som.salesCapacityScenario, som.marketingBudgetScenario, som.positioningScenario
- som.projections (5 years, M€) — the realistically obtainable share given sales capacity, pipeline coverage and competitive position.
- som.geographicalRegions — IMPORTANT: extract the regional SOM breakdown, reflecting obtainable market by region based on pipeline, sales reach, visibility, market share or document-supported regional prioritization.`,
  tam: `Fill every field you can support across these models:
- marketResearch: secondaryResearch, primaryResearch, keyFigures, methodology, centralInsights, description, rationale
- pestel: political, economic, social, technological, environmental, legal, description, rationale
- valueChain: description, rationale
- porter: competitiveRivalry, threatOfNewEntrants, threatOfSubstitutes, bargainingPowerBuyers, bargainingPowerSuppliers, description, rationale
- swot: strengths, weaknesses, opportunities, threats, description, rationale`,
  sam: `Fill every field you can support across these models:
- customerSegmentation: description, rationale
- businessModelling (BMC): valueProposition, customerSegments, channels, customerRelationships, revenueStreams, keyResources, keyActivities, keyPartners, costStructure, description, rationale
- leanCanvas: problem, solution, uniqueValueProposition, unfairAdvantage, customerSegments, keyMetrics, channels, costStructure, revenueStreams, description, rationale
- risk: details`,
  som: `Fill every field you can support across these models:
- competitorAnalysis: description, rationale
- valuePropositionCanvas (VPC): customerJobs, customerPains, customerGains, productsServices, painRelievers, gainCreators, description, rationale
- customerBenefitAnalysis (CBA): functionalBenefits, emotionalBenefits, socialBenefits, selfExpressiveBenefits, description, rationale
- threeCircleModel: ourValue, competitorValue, customerNeeds, ourUnique, theirUnique, commonValue, unmetNeeds, description, rationale
- positioningStatement: targetAudience, category, keyBenefit, reasonToBelieve, competitiveAlternative, differentiator, statement, description, rationale
- targetCosting: marketPriceRationale, marginRationale, gapAnalysis, actionPlan, overallAssessment`,
};

async function runSection(
  scope: SectionScope,
  blocks: any[],
  anchor: string,
  lang: string,
  apiKey: string,
): Promise<any> {
  const schema = buildSchema(scope);

  const systemPrompt = `You are IDA (Internal Document Analyst), a senior business strategist embedded in NOVI. You will receive one or more source documents (PDFs, images, text). READ EVERY DOCUMENT END-TO-END before writing anything — do not skim, do not stop at the first page. Many of the documents contain tables, charts and small print that you MUST consider.

Your task: propose values for ${SECTION_DESCRIPTIONS[scope]} for an innovation opportunity.

Ground rules:
1. Use ALL the attached documents as evidence. Cross-reference between them.
2. Fill as many of the listed fields as the evidence reasonably supports — be generous but never invent.
3. Each value: 2-5 dense, factual sentences in ${lang}. Concrete numbers, names, regions, dates wherever the documents support them. No fluff.
4. If a number, study title, regulation or competitor name appears in a document, prefer to surface it (you may briefly note the source filename in parentheses).
5. Omit a field ONLY if zero evidence exists in the documents AND the opportunity anchor.
6. Output exclusively through the fill_business_plan tool.

Field guide:
${FIELD_GUIDE[scope]}`;

  const userIntro = `Opportunity anchor:\n${anchor || "(none provided)"}\n\nSource documents follow. Read them completely.\n\nReturn the proposal via the fill_business_plan tool — populate as many fields as the evidence supports.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Flash is dramatically faster than Pro on multi-document calls
      // and avoids the upstream idle timeouts we were seeing with Pro.
      model: "google/gemini-2.5-flash",
      max_tokens: 16000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [{ type: "text", text: userIntro }, ...blocks] },
      ],
      tools: [{
        type: "function",
        function: {
          name: "fill_business_plan",
          description: "Return proposed values for the Business Plan fields you can support from the attached documents. Populate every field for which the documents contain relevant evidence.",
          parameters: schema,
        },
      }],
      tool_choice: { type: "function", function: { name: "fill_business_plan" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`AI gateway error (${scope})`, response.status, text);
    const err: any = new Error(`gateway_${response.status}`);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const finish = choice?.finish_reason;
  if (finish && finish !== "stop" && finish !== "tool_calls") {
    console.warn(`Section ${scope} finish_reason=${finish}`);
  }
  const args = choice?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    console.error(`No tool call for ${scope}`, JSON.stringify(data).slice(0, 2000));
    return {};
  }
  try {
    return JSON.parse(args);
  } catch (e) {
    console.error(`Bad JSON for ${scope}`, e, args?.slice?.(0, 500));
    return {};
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json() as {
      opportunityId: string;
      fileIds: string[];
      scope?: "all" | "overview" | "tam" | "sam" | "som";
      language?: "en" | "de";
      context?: Record<string, any>;
    };

    if (!body.opportunityId || !body.fileIds?.length) {
      return new Response(JSON.stringify({ error: "no_files", message: "Please select at least one attachment." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scope = body.scope || "all";
    const lang = body.language === "de" ? "German" : "English";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: files } = await supabase
      .from("opportunity_files")
      .select("file_name, file_path, mime_type, file_size, comment")
      .eq("opportunity_id", body.opportunityId)
      .in("id", body.fileIds);

    const blocks: any[] = [];
    const usedFiles: string[] = [];
    for (const f of files ?? []) {
      if ((f.file_size || 0) > MAX_BYTES) {
        blocks.push({ type: "text", text: `[Attachment "${f.file_name}" too large, skipped.]` });
        continue;
      }
      const { data, error } = await supabase.storage.from("opportunity-files").download(f.file_path);
      if (error || !data) continue;
      const buf = new Uint8Array(await data.arrayBuffer());
      if (f.comment) blocks.push({ type: "text", text: `User note on "${f.file_name}": ${f.comment}` });
      const block = await toContentBlock(f.file_name, f.mime_type || "", buf);
      blocks.push(block);
      if (classify(f.mime_type || "", f.file_name) !== "unsupported") usedFiles.push(f.file_name);
    }

    if (blocks.length === 0) {
      return new Response(JSON.stringify({ error: "no_files", message: "Selected files could not be loaded." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = body.context || {};
    const anchor = [
      ctx.title ? `Title: ${ctx.title}` : "",
      ctx.description ? `Problem: ${ctx.description}` : "",
      ctx.solutionDescription ? `Solution & differentiator: ${ctx.solutionDescription}` : "",
      ctx.industry ? `Industry: ${ctx.industry}` : "",
      ctx.geography ? `Geography: ${ctx.geography}` : "",
      ctx.technology ? `Technology: ${ctx.technology}` : "",
    ].filter(Boolean).join("\n");

    const sections: SectionScope[] = scope === "all"
      ? ["overview", "tam", "sam", "som"]
      : [scope];

    // Run sections in parallel — each call has a small schema and a generous
    // output budget, so the model has room to be thorough per section.
    const results = await Promise.allSettled(
      sections.map((s) => runSection(s, blocks, anchor, lang, LOVABLE_API_KEY)),
    );

    const proposal: any = {};
    const failures: string[] = [];
    results.forEach((r, i) => {
      const s = sections[i];
      if (r.status === "fulfilled") {
        Object.assign(proposal, r.value || {});
      } else {
        const err: any = r.reason;
        console.error(`Section ${s} failed`, err);
        failures.push(s);
        if (err?.status === 429 || err?.status === 402) {
          // bubble up rate-limit / credits errors when ALL sections failed
        }
      }
    });

    if (Object.keys(proposal).length === 0) {
      const firstErr: any = results.find((r) => r.status === "rejected") as any;
      const status = firstErr?.reason?.status === 429 ? 429 : firstErr?.reason?.status === 402 ? 402 : 500;
      const message = status === 429 ? "Rate limit exceeded." : status === 402 ? "AI credits exhausted." : "IDA could not extract any fields. Try again or select different documents.";
      return new Response(JSON.stringify({ error: message }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ proposal, filesUsed: usedFiles, scope, failedSections: failures }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ida-business-plan-extraction error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
