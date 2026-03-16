import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, strategicData, tamPageData } = await req.json();

    const lang = language === "de" ? "German" : "English";

    const sections: string[] = [];

    // TAM page user-entered data
    if (tamPageData) {
      const tp = tamPageData;
      const tamFields: string[] = [];
      if (tp.scopeDefinition) tamFields.push(`- TAM Scope & Definition: ${tp.scopeDefinition}`);
      if (tp.scopeExclusions) tamFields.push(`- Scope Exclusions: ${tp.scopeExclusions}`);
      if (tp.fullGlobalPotential) tamFields.push(`- Full Global Potential: ${tp.fullGlobalPotential}`);
      if (tp.assumptions) tamFields.push(`- Market Assumptions: ${tp.assumptions}`);
      if (tp.marketDevelopment) tamFields.push(`- Market Development: ${tp.marketDevelopment}`);
      if (tp.drivers) tamFields.push(`- Drivers & Trends: ${tp.drivers}`);
      if (tp.geographicCoverage) tamFields.push(`- Geographic Coverage: ${tp.geographicCoverage}`);
      if (tp.tamDescription) tamFields.push(`- TAM Description: ${tp.tamDescription}`);
      if (tp.marketGrowthRate) tamFields.push(`- Market Growth Rate: ${tp.marketGrowthRate}`);
      if (tp.sources) tamFields.push(`- Sources: ${tp.sources}`);
      if (tp.sourceAssessment) tamFields.push(`- Source Assessment: ${tp.sourceAssessment}`);
      if (tp.derivationMethod) tamFields.push(`- Derivation Method: ${tp.derivationMethod}`);
      if (tp.geographicalRegions?.length) {
        tamFields.push(`- Geographic Breakdown:\n${tp.geographicalRegions.map((r: any) => `  • ${r.region}: ${r.marketSize || "N/A"} (Potential: ${r.potential}/5) ${r.notes ? `— ${r.notes}` : ""}`).join("\n")}`);
      }
      if (tp.manualProjections?.length) {
        const projStr = tp.manualProjections.map((p: any) => `Year ${p.year}: ${p.value} M€`).join(", ");
        tamFields.push(`- User's Manual TAM Projections: ${projStr}`);
      }
      if (tamFields.length > 0) {
        sections.push(`## User-Entered TAM Data\n${tamFields.join("\n")}`);
      }
    }

    // TAM supporting models
    if (strategicData) {
      const sd = strategicData;
      if (sd.marketResearch) {
        const mr = sd.marketResearch;
        sections.push(`## Market Research
- Sources: ${mr.sources || "N/A"}
- Key Findings: ${mr.keyFindings || "N/A"}
- Market Size Data: ${mr.marketSizeData || "N/A"}
- Description: ${mr.description || "N/A"}
- Rationale: ${mr.rationale || "N/A"}`);
      }
      if (sd.pestel) {
        const p = sd.pestel;
        sections.push(`## PESTEL Analysis
- Political: ${p.political || "N/A"}
- Economic: ${p.economic || "N/A"}
- Social: ${p.social || "N/A"}
- Technological: ${p.technological || "N/A"}
- Environmental: ${p.environmental || "N/A"}
- Legal: ${p.legal || "N/A"}
- Description: ${p.description || "N/A"}`);
      }
      if (sd.valueChain) {
        const vc = sd.valueChain;
        sections.push(`## Industry Value Chain
- Description: ${vc.description || "N/A"}
- Rationale: ${vc.rationale || "N/A"}
- Steps: ${JSON.stringify(vc.steps || [])}`);
      }
      if (sd.porter) {
        const po = sd.porter;
        sections.push(`## Porter's Five Forces
- Rivalry: ${po.rivalry || "N/A"}
- New Entrants: ${po.newEntrants || "N/A"}
- Substitutes: ${po.substitutes || "N/A"}
- Buyer Power: ${po.buyerPower || "N/A"}
- Supplier Power: ${po.supplierPower || "N/A"}
- Description: ${po.description || "N/A"}`);
      }
      if (sd.swot) {
        const sw = sd.swot;
        sections.push(`## SWOT Analysis
- Strengths: ${sw.strengths || "N/A"}
- Weaknesses: ${sw.weaknesses || "N/A"}
- Opportunities: ${sw.opportunities || "N/A"}
- Threats: ${sw.threats || "N/A"}
- Description: ${sw.description || "N/A"}`);
      }
    }

    const systemPrompt = `You are IDA (Internal Data Analyst), a specialized AI for business development market analysis.
Your task is to estimate the TAM (Total Addressable Market) based on the provided opportunity description and strategic analyses.

You MUST respond in ${lang}.

You will provide THREE scenarios:
1. **Conservative** — Most restrictive market definition, narrowest scope
2. **Base** — Balanced, realistic market sizing
3. **Optimistic** — Broadest reasonable market definition with favorable conditions

For each scenario, provide:
- 5-year TAM projections in M€ (Year 1 through Year 5)
- A CAGR percentage
- Key assumptions that drive this scenario (2-3 bullet points)
- A brief rationale (2-3 sentences)

Also provide:
- A methodology section explaining how you derived the TAM
- Key factors that differentiate the scenarios

IMPORTANT: Base your estimation on ALL available data — including the user's own TAM definitions (scope, exclusions, assumptions, geographic breakdown, drivers & trends, manual projections), industry context, geographic scope, technology area, and strategic analyses (Market Research, PESTEL, Porter's Five Forces, SWOT, Value Chain). The user-entered TAM data represents their domain knowledge and should be respected and built upon, not contradicted without strong reasoning. If data is sparse, make reasonable assumptions and note them clearly.

Use the tool "tam_estimation" to return your structured response.`;

    const userPrompt = `# Opportunity: ${opportunityTitle}
## Description: ${opportunityDescription || "N/A"}
## Solution: ${solutionDescription || "N/A"}
## Industry: ${industry || "N/A"}
## Geography: ${geography || "N/A"}
## Technology: ${technology || "N/A"}

${sections.length > 0 ? sections.join("\n\n") : "No strategic analyses available yet."}

Based on ALL the above data, estimate the TAM (Total Addressable Market) in three scenarios.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "tam_estimation",
            description: "Return TAM estimation with 3 scenarios",
            parameters: {
              type: "object",
              properties: {
                methodology: { type: "string", description: "How TAM was derived (2-4 sentences)" },
                keyDifferentiators: { type: "string", description: "What differentiates the 3 scenarios (2-3 sentences)" },
                conservative: {
                  type: "object",
                  properties: {
                    projections: { type: "array", items: { type: "object", properties: { year: { type: "number" }, value: { type: "number" } }, required: ["year", "value"] } },
                    cagr: { type: "string" },
                    assumptions: { type: "array", items: { type: "string" } },
                    rationale: { type: "string" },
                  },
                  required: ["projections", "cagr", "assumptions", "rationale"],
                },
                base: {
                  type: "object",
                  properties: {
                    projections: { type: "array", items: { type: "object", properties: { year: { type: "number" }, value: { type: "number" } }, required: ["year", "value"] } },
                    cagr: { type: "string" },
                    assumptions: { type: "array", items: { type: "string" } },
                    rationale: { type: "string" },
                  },
                  required: ["projections", "cagr", "assumptions", "rationale"],
                },
                optimistic: {
                  type: "object",
                  properties: {
                    projections: { type: "array", items: { type: "object", properties: { year: { type: "number" }, value: { type: "number" } }, required: ["year", "value"] } },
                    cagr: { type: "string" },
                    assumptions: { type: "array", items: { type: "string" } },
                    rationale: { type: "string" },
                  },
                  required: ["projections", "cagr", "assumptions", "rationale"],
                },
              },
              required: ["methodology", "keyDifferentiators", "conservative", "base", "optimistic"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "tam_estimation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const estimation = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(estimation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("TAM estimation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
