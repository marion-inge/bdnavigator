import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  researchType: "pestel" | "porter" | "tam" | "competitor";
  opportunity: {
    title: string;
    description: string;
    solutionDescription?: string;
    industry: string;
    geography: string;
    technology: string;
  };
  /** Extra context, e.g. competitor names */
  extra?: Record<string, string>;
  language?: "en" | "de";
}

function buildPrompt(body: RequestBody): string {
  const { researchType, opportunity, extra, language } = body;
  const lang = language === "de" ? "German" : "English";
  const ctx = `Industry: ${opportunity.industry}\nGeography: ${opportunity.geography}\nTechnology: ${opportunity.technology}\nOpportunity: ${opportunity.title}\nDescription: ${opportunity.description}\nSolution: ${opportunity.solutionDescription || "N/A"}`;

  switch (researchType) {
    case "pestel":
      return `You are a strategic market research analyst. Conduct a PESTEL analysis for the following business opportunity. Provide specific, current, factual findings with sources for each of the 6 dimensions (Political, Economic, Social, Technological, Environmental, Legal). Focus on the specific industry and geography given.

${ctx}

Respond in ${lang}. Structure your response with clear headers for each PESTEL dimension. Include specific data points, recent legislation, market statistics, and trends. Cite sources where possible. End with a brief overall assessment.`;

    case "porter":
      return `You are a competitive strategy analyst. Conduct a Porter's Five Forces analysis for the following business opportunity. For each force, provide a rating (1-5, where 5 is highest intensity/threat) and detailed, evidence-based justification.

${ctx}

Respond in ${lang}. Cover:
1. Competitive Rivalry – number of competitors, market concentration, price competition
2. Threat of New Entrants – barriers to entry, capital requirements, regulatory hurdles
3. Threat of Substitutes – alternative solutions, switching costs, technology disruption
4. Bargaining Power of Buyers – customer concentration, price sensitivity, information availability
5. Bargaining Power of Suppliers – supplier concentration, switching costs, vertical integration

Include specific company names, market data, and recent industry developments. Cite sources.`;

    case "tam":
      return `You are a market sizing specialist. Research and provide Total Addressable Market (TAM) data for the following business opportunity. Include market size estimates, growth rates (CAGR), key industry reports, and analyst forecasts.

${ctx}

Respond in ${lang}. Provide:
- Current global market size with year and source
- Projected market size (3-5 year forecast) with CAGR
- Key market segments and their relative sizes
- Regional breakdown (focus on ${opportunity.geography})
- Key growth drivers and constraints
- Relevant industry reports and data sources (Statista, Gartner, McKinsey, etc.)
- Any available analyst consensus on market trajectory

Be specific with numbers, currencies, and time frames. Cite all sources.`;

    case "competitor":
      return `You are a competitive intelligence analyst. Research the competitive landscape for the following business opportunity. Identify key players, their market positions, strengths, weaknesses, and strategic moves.

${ctx}
${extra?.competitorNames ? `Known competitors to research: ${extra.competitorNames}` : ""}

Respond in ${lang}. For each competitor provide:
- Company overview and market position
- Estimated market share (if available)
- Key products/services and pricing strategy
- Strengths and differentiators
- Weaknesses and vulnerabilities
- Recent strategic moves (acquisitions, partnerships, product launches)

Also identify any emerging players or potential disruptors. Cite sources.`;

    default:
      return `Research the following topic in ${lang}: ${ctx}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    if (!body.researchType || !body.opportunity) {
      return new Response(JSON.stringify({ error: "Missing researchType or opportunity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are Mark, a meticulous market research agent. Provide well-structured, factual, source-backed research. Always cite your sources." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Perplexity API error [${response.status}]:`, errText);
      return new Response(JSON.stringify({ error: `Perplexity API error: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    return new Response(JSON.stringify({ content, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mark-web-research error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
