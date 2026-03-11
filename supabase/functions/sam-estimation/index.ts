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

    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, tamData, scoringData, strategicData, salesChannelAnalysis } = await req.json();

    const lang = language === "de" ? "German" : "English";

    // Build context from all available data sources
    const sections: string[] = [];

    // TAM data
    if (tamData) {
      sections.push(`## TAM (Total Addressable Market)
- TAM Projections (M€): ${JSON.stringify(tamData.tamProjections || [])}
- TAM Overview: ${tamData.tamOverview?.scopeDefinition || "N/A"}
- Geographic Coverage: ${tamData.tamOverview?.geographicCoverage || "N/A"}
- Market Drivers: ${tamData.tamOverview?.drivers || "N/A"}
- Market Development: ${tamData.tamOverview?.marketDevelopment || "N/A"}
- Full Global Potential: ${tamData.tamOverview?.fullGlobalPotential || "N/A"}
- Scope Exclusions: ${tamData.tamOverview?.scopeExclusions || "N/A"}
- Geographical Regions: ${JSON.stringify(tamData.tamOverview?.geographicalRegions || [])}`);
    }

    // Scoring data (Strategic Fit, Portfolio Fit, Feasibility, Org Readiness, Risk)
    if (scoringData) {
      const s = scoringData;
      const formatCriteria = (criteria: any) => {
        if (!criteria) return "N/A";
        return Object.entries(criteria)
          .map(([k, v]: [string, any]) => `  - ${k}: Score ${v?.score ?? "?"}/5, Comment: ${v?.comment || "none"}`)
          .join("\n");
      };

      if (s.strategicFit) sections.push(`## Strategic Fit\n${formatCriteria(s.strategicFit)}`);
      if (s.portfolioFit) sections.push(`## Portfolio Fit\n${formatCriteria(s.portfolioFit)}`);
      if (s.feasibility) sections.push(`## Feasibility\n${formatCriteria(s.feasibility)}`);
      if (s.organisationalReadiness) sections.push(`## Organisational Readiness\n${formatCriteria(s.organisationalReadiness)}`);
      if (s.risk) sections.push(`## Risk Assessment\n${formatCriteria(s.risk)}`);
      if (s.customerLandscape) sections.push(`## Customer Landscape\n${formatCriteria(s.customerLandscape)}`);
    }

    // Strategic analyses (interviews, BMC, Lean Canvas, TAM models, etc.)
    if (strategicData) {
      const sd = strategicData;

      // TAM supporting models
      if (sd.marketResearch) {
        const mr = sd.marketResearch;
        sections.push(`## Market Research (TAM)
- Sources: ${mr.sources || "N/A"}
- Key Findings: ${mr.keyFindings || "N/A"}
- Description: ${mr.description || "N/A"}`);
      }
      if (sd.pestel) {
        const p = sd.pestel;
        sections.push(`## PESTEL Analysis (TAM)
- Political: ${p.political || "N/A"}
- Economic: ${p.economic || "N/A"}
- Social: ${p.social || "N/A"}
- Technological: ${p.technological || "N/A"}
- Environmental: ${p.environmental || "N/A"}
- Legal: ${p.legal || "N/A"}`);
      }
      if (sd.valueChain) {
        const vc = sd.valueChain;
        sections.push(`## Industry Value Chain (TAM)
- Description: ${vc.description || "N/A"}
- Rationale: ${vc.rationale || "N/A"}
- Steps: ${JSON.stringify(vc.steps || [])}`);
      }
      if (sd.porter) {
        const po = sd.porter;
        sections.push(`## Porter's Five Forces (TAM)
- Rivalry: ${po.rivalry || "N/A"}
- New Entrants: ${po.newEntrants || "N/A"}
- Substitutes: ${po.substitutes || "N/A"}
- Buyer Power: ${po.buyerPower || "N/A"}
- Supplier Power: ${po.supplierPower || "N/A"}`);
      }
      if (sd.swot) {
        const sw = sd.swot;
        sections.push(`## SWOT Analysis (TAM)
- Strengths: ${sw.strengths || "N/A"}
- Weaknesses: ${sw.weaknesses || "N/A"}
- Opportunities: ${sw.opportunities || "N/A"}
- Threats: ${sw.threats || "N/A"}`);
      }

      // SAM supporting models
      if (sd.customerInterviewing?.entries?.length) {
        sections.push(`## Customer Interviews\n${sd.customerInterviewing.entries.map((e: any) =>
          `- ${e.customerName} (${e.role}): ${e.keyInsights}. Pain points: ${e.painPoints}`
        ).join("\n")}`);
      }
      if (sd.internalAffiliateInterviews?.entries?.length) {
        sections.push(`## Internal Affiliate Interviews\n${sd.internalAffiliateInterviews.entries.map((e: any) =>
          `- ${e.intervieweeName} (${e.role}, ${e.department}): ${e.keyInsights}. Recommendations: ${e.recommendations}`
        ).join("\n")}`);
      }
      if (sd.internalBUInterviews?.entries?.length) {
        sections.push(`## Internal BU Interviews\n${sd.internalBUInterviews.entries.map((e: any) =>
          `- ${e.intervieweeName} (${e.role}, ${e.department}): ${e.keyInsights}. Recommendations: ${e.recommendations}`
        ).join("\n")}`);
      }
      if (sd.businessModelling) {
        const bm = sd.businessModelling;
        sections.push(`## Business Model Canvas
- Value Proposition: ${bm.valueProposition || "N/A"}
- Customer Segments: ${bm.customerSegments || "N/A"}
- Channels: ${bm.channels || "N/A"}
- Revenue Streams: ${bm.revenueStreams || "N/A"}
- Key Resources: ${bm.keyResources || "N/A"}
- Cost Structure: ${bm.costStructure || "N/A"}`);
      }
      if (sd.leanCanvas) {
        const lc = sd.leanCanvas;
        sections.push(`## Lean Canvas
- Problem: ${lc.problem || "N/A"}
- Solution: ${lc.solution || "N/A"}
- UVP: ${lc.uniqueValueProposition || "N/A"}
- Customer Segments: ${lc.customerSegments || "N/A"}
- Revenue Streams: ${lc.revenueStreams || "N/A"}
- Unfair Advantage: ${lc.unfairAdvantage || "N/A"}`);
      }
      if (sd.customerSegmentation?.entries?.length) {
        sections.push(`## Customer Segmentation\n${sd.customerSegmentation.entries.map((e: any) =>
          `- ${e.name}: Size ${e.size}, WTP: ${e.willingnessToPay}, Priority: ${e.priority}`
        ).join("\n")}`);
      }
      if (sd.competitorAnalysis?.entries?.length) {
        sections.push(`## Competitor Landscape\n${sd.competitorAnalysis.entries.map((e: any) =>
          `- ${e.name}: Market Share ${e.marketShare}, Threat ${e.threatLevel}/5. Strengths: ${e.strengths}. Weaknesses: ${e.weaknesses}`
        ).join("\n")}`);
      }
    }

    const systemPrompt = `You are IDA (Internal Data Analyst), a specialized AI for business development market analysis.
Your task is to estimate the SAM (Serviceable Addressable Market) based on the provided TAM and qualitative business data.

You MUST respond in ${lang}.

You will provide THREE scenarios:
1. **Conservative** — Most restrictive assumptions about market access, geographic reach, and product fit
2. **Base** — Balanced, realistic assumptions
3. **Optimistic** — Best-case with favorable market conditions and strong execution

For each scenario, provide:
- 5-year SAM projections in M€ (Year 1 through Year 5)
- A CAGR percentage
- Key assumptions that drive this scenario (2-3 bullet points)
- A brief rationale (2-3 sentences)

Also provide:
- A methodology section explaining how you derived the SAM from the TAM
- Key factors that differentiate the scenarios

IMPORTANT: The SAM must always be SMALLER than the TAM. SAM typically represents 10-40% of TAM depending on industry focus, geographic constraints, and customer segment accessibility.

Use the tool "sam_estimation" to return your structured response.`;

    const userPrompt = `# Opportunity: ${opportunityTitle}
## Description: ${opportunityDescription || "N/A"}
## Solution: ${solutionDescription || "N/A"}
## Industry: ${industry || "N/A"}
## Geography: ${geography || "N/A"}  
## Technology: ${technology || "N/A"}

${sections.join("\n\n")}

Based on ALL the above data, estimate the SAM (Serviceable Addressable Market) in three scenarios.`;

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
            name: "sam_estimation",
            description: "Return SAM estimation with 3 scenarios",
            parameters: {
              type: "object",
              properties: {
                methodology: { type: "string", description: "How SAM was derived from TAM (2-4 sentences)" },
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
        tool_choice: { type: "function", function: { name: "sam_estimation" } },
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
    console.error("SAM estimation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
