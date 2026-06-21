import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_BYTES = 8 * 1024 * 1024;

function classify(mime: string, name: string): "text" | "image" | "pdf" | "unsupported" {
  const lower = (name || "").toLowerCase();
  if ((mime || "").startsWith("text/") || mime === "application/json" || /\.(txt|md|csv|json|log|html|xml)$/i.test(lower)) return "text";
  if ((mime || "").startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lower)) return "image";
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  return "unsupported";
}

function bufToBase64(buf: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK) as any);
  return btoa(bin);
}

async function toContentBlock(name: string, mime: string, buf: Uint8Array): Promise<any> {
  const kind = classify(mime, name);
  if (kind === "unsupported") return { type: "text", text: `[Attachment "${name}" cannot be read.]` };
  if (buf.byteLength > MAX_BYTES) return { type: "text", text: `[Attachment "${name}" exceeded 8 MB and was skipped.]` };
  if (kind === "text") {
    const text = new TextDecoder().decode(buf).slice(0, 80_000);
    return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End ---` };
  }
  const b64 = bufToBase64(buf);
  if (kind === "image") return { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${b64}` } };
  return { type: "file", file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } };
}

// ─── schema groups ─────────────────────────────────────────────────────────
// String-only schemas. Tabular/numeric fields are intentionally excluded.
const strProps = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, { type: "string" }]));

const TAM_OVERVIEW_KEYS = ["scopeDefinition","geographicCoverage","assumptions","scopeExclusions","fullGlobalPotential","marketDevelopment","drivers","sources","sourceAssessment","derivationMethod","supportingModelNotes"];
const SAM_OVERVIEW_KEYS = ["samVsTamExplanation","includedIndustries","excludedIndustries","geographicFocus","geographicExclusions","targetGroups","unreachableGroups","relevanceOutlook","featureAdaptations","priceEvolution","resourceScenarios","requiredInvestments"];
const SOM_OVERVIEW_KEYS = ["marketShareVsSam","growthRate","visibilityRate","salesCapacity","pipeline","licenseToOperate","salesCapacityScenario","marketingBudgetScenario","positioningScenario"];

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

function buildSchema(scope: "all" | "overview" | "tam" | "sam" | "som") {
  const props: Record<string, any> = {};
  const wantOverview = scope === "all" || scope === "overview";
  const wantTam = scope === "all" || scope === "tam";
  const wantSam = scope === "all" || scope === "sam";
  const wantSom = scope === "all" || scope === "som";

  if (wantOverview) {
    props.overview = {
      type: "object",
      properties: {
        tam: { type: "object", properties: strProps(TAM_OVERVIEW_KEYS), additionalProperties: false },
        sam: { type: "object", properties: strProps(SAM_OVERVIEW_KEYS), additionalProperties: false },
        som: { type: "object", properties: strProps(SOM_OVERVIEW_KEYS), additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (wantTam) {
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
  if (wantSam) {
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
  if (wantSom) {
    props.som = {
      type: "object",
      properties: {
        competitorAnalysis: { type: "object", properties: { description: { type: "string" }, rationale: { type: "string" } }, additionalProperties: false },
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

    const scopeDescription = ({
      all: "the complete Business Plan (Overview text fields PLUS TAM, SAM and SOM strategic models)",
      overview: "the TAM / SAM / SOM Overview text fields",
      tam: "the TAM strategic models (Market Research, PESTEL, Value Chain, Porter's Five Forces, SWOT)",
      sam: "the SAM section (Customer Landscape narrative, Business Model Canvas, Lean Canvas, Risk narrative)",
      som: "the SOM section (Competitors narrative, Value Proposition Canvas, Customer Benefit Analysis, Three Circles, Positioning, Target Costing narrative)",
    } as const)[scope];

    const systemPrompt = `You are IDA (Internal Document Analyst), a senior business strategist. Read the attached document(s) carefully and propose values for ${scopeDescription} of an innovation opportunity. Ground every answer in evidence from the attachments combined with the opportunity anchor. If a field cannot be reasonably inferred, OMIT it from the response (do not invent). All answers in ${lang}. Be concise, factual, and actionable — typically 1-4 sentences per field. Never hallucinate numbers; if you state a figure, the document must support it.`;

    const userIntro = `Opportunity anchor:\n${anchor || "(none provided)"}\n\nSource documents are attached below.\n\nReturn the proposal via the fill_business_plan tool. Only include fields you can confidently support from the evidence; leave unsupported fields out entirely.`;

    const schema = buildSchema(scope);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [{ type: "text", text: userIntro }, ...blocks] },
        ],
        tools: [{
          type: "function",
          function: {
            name: "fill_business_plan",
            description: "Return proposed values for the Business Plan fields you can support from the attached documents.",
            parameters: schema,
          },
        }],
        tool_choice: { type: "function", function: { name: "fill_business_plan" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI gateway error", details: text }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      console.error("No tool call", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const proposal = JSON.parse(args);
    return new Response(JSON.stringify({ proposal, filesUsed: usedFiles, scope }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ida-business-plan-extraction error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
