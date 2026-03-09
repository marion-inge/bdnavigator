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

    const { kpis, parameters, yearData, title, description, industry, technology, language } = await req.json();

    const lang = language === "de" ? "German" : "English";

    const systemPrompt = `You are IDA, a senior financial analyst and business case evaluator with deep expertise in investment analysis, corporate finance, and technology commercialization. You analyze investment cases by evaluating KPIs like ROCE, NPV, Payback Period, EBIT margins, cash flow trajectories, and working capital efficiency. You provide structured, actionable assessments with clear recommendations. Always respond in ${lang}.`;

    // Build KPI summary
    const kpiLines = [
      `Total ROCE (avg): ${(kpis.totalROCE * 100).toFixed(1)}%`,
      `NPV: €${(kpis.npv / 1000).toFixed(0)}k`,
      `Payback Period: ${kpis.paybackPeriod !== null ? `${kpis.paybackPeriod.toFixed(1)} years` : "Not reached"}`,
      `Total EBIT: €${(kpis.totalEbit / 1000).toFixed(0)}k`,
      `Total Sales: €${(kpis.totalSales / 1000).toFixed(0)}k`,
      `WACC: ${parameters.wacc}%`,
      `Project Duration: ${parameters.projectDuration} years`,
      `R&D Depreciation: ${parameters.rdDepreciationYears} years`,
      `Invest Depreciation: ${parameters.investDepreciationYears} years`,
    ].join("\n");

    // Build yearly breakdown
    const yearLines = yearData.map((y: any) => {
      return `${y.year}: Sales €${(y.sales / 1000).toFixed(0)}k | EBIT €${(y.ebit / 1000).toFixed(0)}k (${(y.ebitPct * 100).toFixed(1)}%) | ROCE ${(y.roce * 100).toFixed(1)}% | CF €${(y.annualCashFlow / 1000).toFixed(0)}k | CE €${(y.capitalEmployed / 1000).toFixed(0)}k | WC €${(y.workingCapital / 1000).toFixed(0)}k`;
    }).join("\n");

    // Build investment summary
    const totalInvest = yearData.reduce((s: number, y: any) => s + y.totalInvestment, 0);
    const totalRD = yearData.reduce((s: number, y: any) => s + y.totalRD, 0);

    const paramLines = [
      `Market Size: €${(parameters.marketSize / 1000).toFixed(0)}k`,
      `Market Growth Rate: ${parameters.marketGrowthRate}%`,
      `Portfolio Coverage: ${parameters.portfolioCoverage}%`,
      `Selling Expenses: ${parameters.sellingExpensesPct}% of sales`,
      `G&A Expenses: ${parameters.gaExpensesPct}% of sales`,
      `Inventory Days: ${parameters.inventoryDays}`,
      `Receivable Days: ${parameters.receivableDays}`,
      `Payable Days: ${parameters.payableDays}`,
      `Total Investment: €${(totalInvest / 1000).toFixed(0)}k`,
      `Total R&D: €${(totalRD / 1000).toFixed(0)}k`,
    ].join("\n");

    const contextLines = [
      title ? `Project: ${title}` : "",
      description ? `Description: ${description}` : "",
      industry ? `Industry: ${industry}` : "",
      technology ? `Technology: ${technology}` : "",
    ].filter(Boolean).join("\n");

    const userPrompt = `Analyze this investment case / business case and provide a structured financial assessment.

${contextLines}

Key Performance Indicators:
${kpiLines}

Parameters & Assumptions:
${paramLines}

Year-by-Year Breakdown:
${yearLines}

Evaluate the financial viability of this business case. Consider:
1. Is the ROCE attractive relative to the WACC hurdle rate?
2. Is the NPV positive and significant given the investment?
3. Is the payback period acceptable for this type of investment?
4. How do EBIT margins develop — is the business scaling efficiently?
5. Are the cash flow dynamics healthy? Is working capital managed well?
6. Are the assumptions (growth rates, margins, costs) realistic?
7. What are the key financial risks and sensitivities?

Provide your assessment using the suggest_assessment tool.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_assessment",
              description: "Return a structured business case assessment with summary, strengths, weaknesses, next steps, pitfalls, and overall rating.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A 3-4 sentence executive summary of the business case assessment, referencing key KPIs.",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 3-5 financial strengths with specific numbers (e.g. 'ROCE of 25% significantly exceeds the 10% WACC hurdle rate').",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-4 financial weaknesses or concerns with specific numbers.",
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 3-5 concrete recommended actions to strengthen the business case.",
                  },
                  pitfalls: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 key financial risks or sensitivities that could impact the business case.",
                  },
                  overallRating: {
                    type: "string",
                    enum: ["very_promising", "promising", "moderate", "challenging", "critical"],
                    description: "Overall financial rating: very_promising (excellent KPIs, clear value creation), promising (solid KPIs with minor concerns), moderate (acceptable but needs improvement), challenging (significant financial concerns), critical (business case not viable).",
                  },
                },
                required: ["summary", "strengths", "weaknesses", "nextSteps", "pitfalls", "overallRating"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_assessment" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assessment = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("business-case-assessment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
