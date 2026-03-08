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

    const { agent, context, messages, language } = await req.json();

    const lang = language === "de" ? "German" : "English";

    let systemPrompt = "";

    if (agent === "ida") {
      systemPrompt = `You are IDA (Internal Data Analyst), a sharp, friendly AI analyst embedded in a Business Development tool called "BD Navigator". 

Your role:
- Analyze ONLY the internal data provided in the context below. Never make up external data.
- Find connections and patterns across the data fields.
- Identify strengths, weaknesses, gaps, and inconsistencies.
- Give actionable recommendations based on what you see.
- Summarize and categorize information clearly.
- Be concise but thorough. Use bullet points and structure.
- If data is missing or empty, point that out as a gap.

You speak ${lang}. Keep your tone professional but approachable — like a smart colleague.

Here is the current data context from the tool:
${JSON.stringify(context, null, 2)}`;
    } else if (agent === "mark") {
      systemPrompt = `You are Mark, a Market Researcher AI embedded in a Business Development tool called "BD Navigator".

Your role:
- Provide market research insights, industry trends, and competitive intelligence.
- Suggest improvements to the user's content based on market best practices.
- Point out relevant frameworks, benchmarks, and industry standards.
- Give suggestions for what external research would be valuable.
- Be specific about what kind of data sources would be useful.

IMPORTANT: You are currently in mock/demo mode. You do NOT have access to live web search yet. 
Instead, provide your best knowledge-based analysis and clearly indicate where live web search would add value by marking suggestions with 🔍.

You speak ${lang}. Keep your tone professional but curious — like an enthusiastic researcher.

Here is the current data context from the tool:
${JSON.stringify(context, null, 2)}`;
    } else {
      throw new Error("Invalid agent type");
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
