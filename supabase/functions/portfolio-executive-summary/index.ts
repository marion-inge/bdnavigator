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

    const payload = await req.json();
    const digest = payload?.digest ?? payload?.body?.digest;
    const stats = payload?.stats ?? payload?.body?.stats;
    if (!digest) throw new Error("Missing portfolio digest");

    const systemPrompt =
      "You are IDA, a senior innovation portfolio analyst reporting to an executive board. " +
      "You analyse a whole portfolio of innovation opportunities and write a crisp, board-ready executive summary. " +
      "Be concrete, quantitative where data allows, and explicitly name opportunities. " +
      "Call out weak data quality where fields are empty instead of inventing numbers. " +
      "Answer in English using compact markdown.";

    const userPrompt = `Portfolio statistics:
${JSON.stringify(stats ?? {}, null, 2)}

Opportunities (one JSON object per idea):
${JSON.stringify(digest, null, 2)}

Write the executive summary with exactly these markdown sections:

## Portfolio at a Glance
3-5 sentences: size, maturity distribution, dominant industries/technologies/geographies, aggregated market potential.

## Top Opportunities
3-5 bullets, each: **Idea title** — why it stands out (score, market size, business case), and the single next action.

## Risks & Gaps
3-5 bullets on concentration risk, stalled ideas, missing data, weak business cases.

## Recommended Board Decisions
3-5 bullets, each a decision phrased as accelerate / hold / stop with the idea name and a one-line rationale.

Keep the whole summary under 450 words.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ summary, generatedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("portfolio-executive-summary error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
