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

    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, tamData, samData, scoringData, strategicData } = await req.json();

    const lang = language === "de" ? "German" : "English";
    const sections: string[] = [];

    // TAM data
    if (tamData) {
      sections.push(`## TAM (Total Addressable Market)
- TAM Projections (M€): ${JSON.stringify(tamData.tamProjections || [])}
- TAM Overview: ${tamData.tamOverview?.scopeDefinition || "N/A"}
- Geographic Coverage: ${tamData.tamOverview?.geographicCoverage || "N/A"}
- Market Drivers: ${tamData.tamOverview?.drivers || "N/A"}
- Market Development: ${tamData.tamOverview?.marketDevelopment || "N/A"}`);
    }

    // SAM data
    if (samData) {
      sections.push(`## SAM (Serviceable Addressable Market)
- SAM Projections (M€): ${JSON.stringify(samData.samProjections || [])}
- SAM Description: ${samData.samDescription || "N/A"}
- SAM vs TAM Explanation: ${samData.samVsTamExplanation || "N/A"}
- Target Groups: ${samData.targetGroups || "N/A"}
- Geographic Focus: ${samData.geographicFocus || "N/A"}`);
    }

    // Scoring data
    if (scoringData) {
      const formatCriteria = (criteria: any) => {
        if (!criteria) return "N/A";
        return Object.entries(criteria)
          .map(([k, v]: [string, any]) => `  - ${k}: Score ${v?.score ?? "?"}/5, Comment: ${v?.comment || "none"}`)
          .join("\n");
      };
      if (scoringData.customerLandscape) sections.push(`## Customer Landscape\n${formatCriteria(scoringData.customerLandscape)}`);
      if (scoringData.strategicFit) sections.push(`## Strategic Fit\n${formatCriteria(scoringData.strategicFit)}`);
      if (scoringData.portfolioFit) sections.push(`## Portfolio Fit\n${formatCriteria(scoringData.portfolioFit)}`);
      if (scoringData.feasibility) sections.push(`## Feasibility\n${formatCriteria(scoringData.feasibility)}`);
      if (scoringData.organisationalReadiness) sections.push(`## Organisational Readiness\n${formatCriteria(scoringData.organisationalReadiness)}`);
      if (scoringData.risk) sections.push(`## Risk Assessment\n${formatCriteria(scoringData.risk)}`);
      if (scoringData.competitorLandscape) sections.push(`## Competitor Landscape\n${formatCriteria(scoringData.competitorLandscape)}`);
      if (scoringData.pilotCustomer) sections.push(`## Pilot Customer & Leads\n${formatCriteria(scoringData.pilotCustomer)}`);
    }

    // TAM strategic models
    if (strategicData?.tam) {
      const t = strategicData.tam;
      if (t.marketResearch) sections.push(`## Market Research\n- Sources: ${t.marketResearch.sources || "N/A"}\n- Key Findings: ${t.marketResearch.keyFindings || "N/A"}\n- Description: ${t.marketResearch.description || "N/A"}`);
      if (t.pestel) sections.push(`## PESTEL Analysis\n- Political: ${t.pestel.political || "N/A"}\n- Economic: ${t.pestel.economic || "N/A"}\n- Social: ${t.pestel.social || "N/A"}\n- Technological: ${t.pestel.technological || "N/A"}\n- Environmental: ${t.pestel.environmental || "N/A"}\n- Legal: ${t.pestel.legal || "N/A"}`);
      if (t.valueChain) sections.push(`## Industry Value Chain\n- Description: ${t.valueChain.description || "N/A"}\n- Steps: ${JSON.stringify(t.valueChain.steps || [])}`);
      if (t.porter) sections.push(`## Porter's Five Forces\n- Rivalry: ${t.porter.rivalry || "N/A"}\n- New Entrants: ${t.porter.newEntrants || "N/A"}\n- Substitutes: ${t.porter.substitutes || "N/A"}\n- Buyer Power: ${t.porter.buyerPower || "N/A"}\n- Supplier Power: ${t.porter.supplierPower || "N/A"}`);
      if (t.swot) sections.push(`## SWOT Analysis\n- Strengths: ${t.swot.strengths || "N/A"}\n- Weaknesses: ${t.swot.weaknesses || "N/A"}\n- Opportunities: ${t.swot.opportunities || "N/A"}\n- Threats: ${t.swot.threats || "N/A"}`);
    }

    // SAM strategic models
    if (strategicData?.sam) {
      const s = strategicData.sam;
      if (s.customerInterviewing?.entries?.length) {
        sections.push(`## Customer Interviews\n${s.customerInterviewing.entries.map((e: any) => `- ${e.customerName} (${e.role}): ${e.keyInsights}. Pain points: ${e.painPoints}`).join("\n")}`);
      }
      if (s.internalAffiliateInterviews?.entries?.length) {
        sections.push(`## Internal Affiliate Interviews\n${s.internalAffiliateInterviews.entries.map((e: any) => `- ${e.intervieweeName} (${e.role}, ${e.department}): ${e.keyInsights}`).join("\n")}`);
      }
      if (s.internalBUInterviews?.entries?.length) {
        sections.push(`## Internal BU Interviews\n${s.internalBUInterviews.entries.map((e: any) => `- ${e.intervieweeName} (${e.role}, ${e.department}): ${e.keyInsights}`).join("\n")}`);
      }
      if (s.businessModelling) {
        const bm = s.businessModelling;
        sections.push(`## Business Model Canvas\n- Value Proposition: ${bm.valueProposition || "N/A"}\n- Customer Segments: ${bm.customerSegments || "N/A"}\n- Channels: ${bm.channels || "N/A"}\n- Revenue Streams: ${bm.revenueStreams || "N/A"}\n- Key Resources: ${bm.keyResources || "N/A"}\n- Cost Structure: ${bm.costStructure || "N/A"}`);
      }
      if (s.leanCanvas) {
        const lc = s.leanCanvas;
        sections.push(`## Lean Canvas\n- Problem: ${lc.problem || "N/A"}\n- Solution: ${lc.solution || "N/A"}\n- UVP: ${lc.uniqueValueProposition || "N/A"}\n- Customer Segments: ${lc.customerSegments || "N/A"}\n- Revenue Streams: ${lc.revenueStreams || "N/A"}\n- Unfair Advantage: ${lc.unfairAdvantage || "N/A"}`);
      }
    }

    // SOM strategic models
    if (strategicData?.som) {
      const so = strategicData.som;
      if (so.valuePropositionCanvas) {
        const vpc = so.valuePropositionCanvas;
        sections.push(`## Value Proposition Canvas\n- Customer Jobs: ${vpc.customerJobs || "N/A"}\n- Customer Pains: ${vpc.customerPains || "N/A"}\n- Customer Gains: ${vpc.customerGains || "N/A"}\n- Products & Services: ${vpc.productsServices || "N/A"}\n- Pain Relievers: ${vpc.painRelievers || "N/A"}\n- Gain Creators: ${vpc.gainCreators || "N/A"}`);
      }
      if (so.customerBenefitAnalysis) {
        const cba = so.customerBenefitAnalysis;
        sections.push(`## Customer Benefit Analysis\n- Functional: ${cba.functionalBenefits || "N/A"}\n- Emotional: ${cba.emotionalBenefits || "N/A"}\n- Social: ${cba.socialBenefits || "N/A"}\n- Self-Expressive: ${cba.selfExpressiveBenefits || "N/A"}`);
      }
      if (so.threeCircleModel) {
        const tcm = so.threeCircleModel;
        sections.push(`## Three Circle Model\n- Our Value: ${tcm.ourValue || "N/A"}\n- Competitor Value: ${tcm.competitorValue || "N/A"}\n- Customer Needs: ${tcm.customerNeeds || "N/A"}\n- Our Unique: ${tcm.ourUnique || "N/A"}\n- Their Unique: ${tcm.theirUnique || "N/A"}\n- Unmet Needs: ${tcm.unmetNeeds || "N/A"}`);
      }
      if (so.positioningStatement) {
        const pos = so.positioningStatement;
        sections.push(`## Positioning Statement\n- Target: ${pos.targetAudience || "N/A"}\n- Category: ${pos.category || "N/A"}\n- Key Benefit: ${pos.keyBenefit || "N/A"}\n- Differentiator: ${pos.differentiator || "N/A"}\n- Statement: ${pos.statement || "N/A"}`);
      }
      if (so.positioningLandscape?.entries?.length) {
        sections.push(`## Positioning Landscape\n${so.positioningLandscape.entries.map((e: any) => `- ${e.name}${e.isOurs ? " (Us)" : ""}: X=${e.xValue}, Y=${e.yValue}`).join("\n")}`);
      }
      if (so.targetCosting) {
        const tc = so.targetCosting;
        sections.push(`## Target Costing\n- Market Price: ${tc.marketPrice || "N/A"}\n- Target Margin: ${tc.targetMarginPct || "N/A"}%\n- Allowable Cost: ${tc.allowableCost || "N/A"}\n- Components: ${JSON.stringify(tc.components || [])}`);
      }
      if (so.competitorAnalysis?.entries?.length) {
        sections.push(`## Competitor Analysis\n${so.competitorAnalysis.entries.map((e: any) => `- ${e.name}: Market Share ${e.marketShare}, Threat ${e.threatLevel}/5. Strengths: ${e.strengths}. Weaknesses: ${e.weaknesses}`).join("\n")}`);
      }
    }

    const systemPrompt = `You are IDA (Internal Data Analyst), a specialized AI for business development market analysis.
Your task is to estimate the SOM (Serviceable Obtainable Market) based on the TAM, SAM, and all available strategic analyses.

You MUST respond in ${lang}.

The SOM represents what the company can REALISTICALLY WIN in terms of market share over 5 years, considering sales capacity, competitive positioning, product readiness, and go-to-market capabilities.

You will provide THREE scenarios:
1. **Conservative** — Minimum realistic market capture with current resources
2. **Base** — Balanced scenario with planned growth investments
3. **Optimistic** — Best-case with strong execution and favorable market conditions

For each scenario, provide:
- 5-year SOM projections in M€ (Year 1 through Year 5)
- A CAGR percentage
- Key assumptions that drive this scenario (2-3 bullet points)
- A brief rationale (2-3 sentences)

Also provide:
- A methodology section explaining how you derived the SOM from the SAM
- Key factors that differentiate the scenarios

IMPORTANT: 
- SOM must always be SMALLER than SAM
- SOM typically represents 1-20% of SAM depending on competitive position, sales capacity, and market entry timing
- Consider pilot customers, competitive landscape, positioning, target costing, and VPC data
- Factor in portfolio coverage, visibility rates, and hit rates if available

Use the tool "som_estimation" to return your structured response.`;

    const userPrompt = `# Opportunity: ${opportunityTitle}
## Description: ${opportunityDescription || "N/A"}
## Solution: ${solutionDescription || "N/A"}
## Industry: ${industry || "N/A"}
## Geography: ${geography || "N/A"}
## Technology: ${technology || "N/A"}

${sections.length > 0 ? sections.join("\n\n") : "No data available yet."}

Based on ALL the above data, estimate the SOM (Serviceable Obtainable Market) in three scenarios.`;

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
            name: "som_estimation",
            description: "Return SOM estimation with 3 scenarios",
            parameters: {
              type: "object",
              properties: {
                methodology: { type: "string", description: "How SOM was derived from SAM (2-4 sentences)" },
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
        tool_choice: { type: "function", function: { name: "som_estimation" } },
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
    console.error("SOM estimation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
