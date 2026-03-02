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

    const { scoring, answers, comments, questionTexts, title, description, language } = await req.json();

    // Build a detailed prompt with all scoring data
    const scoringInfo = Object.entries(scoring as Record<string, { score: number; confidence: string }>)
      .map(([key, val]) => `- ${key}: Score ${val.score}/5 (Confidence: ${val.confidence})`)
      .join("\n");

    // Build rich answers section with question texts and user comments
    const lang = language === "de" ? "German" : "English";
    const langKey = language === "de" ? "de" : "en";

    const answersInfo = Object.entries(answers as Record<string, number>)
      .map(([key, val]) => {
        const qText = questionTexts?.[key]?.[langKey] || key;
        const comment = comments?.[key];
        let line = `- ${qText}: ${val}/5`;
        if (comment) {
          line += `\n  User comment: "${comment}"`;
        }
        return line;
      })
      .join("\n");

    const systemPrompt = `You are a senior business innovation analyst with deep expertise in technology commercialization, market analysis, and corporate strategy. Analyze innovation opportunities thoroughly and provide structured, actionable assessments. Pay special attention to the user's own comments and rationale on each criterion – they contain valuable domain knowledge and context. Always respond in ${lang}.`;

    const userPrompt = `Analyze this innovation opportunity and provide a structured assessment.

${title ? `Title: ${title}` : ""}
${description ? `Description: ${description}` : ""}

Category Scores (weighted averages):
${scoringInfo}

Detailed Criterion Ratings and User Comments:
${answersInfo}

Based on the scores AND the user's own comments, provide your assessment using the suggest_assessment tool. Reference specific criteria and user comments in your analysis where relevant.`;

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
              description: "Return a structured innovation assessment with summary, strengths, weaknesses, next steps, pitfalls, and overall rating.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A 2-3 sentence overall summary of the opportunity assessment.",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-4 key strengths identified.",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-4 key weaknesses or areas for improvement.",
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 3-5 concrete recommended next steps.",
                  },
                  pitfalls: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of 2-3 potential pitfalls or risks to watch out for.",
                  },
                  overallRating: {
                    type: "string",
                    enum: ["very_promising", "promising", "moderate", "challenging", "critical"],
                    description: "Overall rating based on the scoring data. very_promising (>=4.5), promising (>=3.5), moderate (>=2.5), challenging (>=1.5), critical (<1.5).",
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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assessment = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assessment error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
