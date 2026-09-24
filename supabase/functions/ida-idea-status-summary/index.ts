const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { language = "en", snapshot } = await req.json();
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
    const de = language === "de";
    const system = `You are IDA, a senior business development analyst for a 7-phase / 5-gate innovation process (1 Idea, 2 Scan Pack, 3 TAM SAM SOM, 4 Market Verification, 5 Business Case, 6 Go-to-Market, 7 Implementation). Given a compact data snapshot of one idea, write a very short status summary. Be concrete and critical. Answer in ${de ? "German" : "English"}. Status max 25 words, each open step max 8 words (max 4 steps), recommendation max 25 words.

Verdict rules (apply strictly, based only on the data):
- "stop": Idea Score below 2.5, OR a gate was rejected, OR the business case is clearly negative (negative NPV or ROI).
- "not_pursue": Based on the current data, the conclusion is to not pursue the idea further. This applies when the Idea Score is between 2.5 and 3.5, OR more than 2 mandatory steps of the current phase are still open (e.g. Scan Pack under 4/6 done, no interviews), OR TAM/SAM/SOM is still empty. The evidence is too weak or too mediocre to justify continuing.
- "go": Idea Score 3.5 or higher, AND the current phase is at least 80% complete, AND no stop gate is open.`;
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(snapshot) },
        ],
        tools: [{
          type: "function",
          function: {
            name: "summarize",
            parameters: {
              type: "object",
              properties: {
                status: { type: "string" },
                openSteps: { type: "array", items: { type: "string" } },
                recommendation: { type: "string" },
                verdict: { type: "string", enum: ["go", "not_pursue", "stop"] },
              },
              required: ["status", "openSteps", "recommendation", "verdict"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "summarize" } },
      }),
    });
    if (resp.status === 429) return json({ error: "Rate limit" }, 429);
    if (resp.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!resp.ok) return json({ error: `AI error ${resp.status}` }, 500);
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return json({ error: "No result" }, 500);
    return json(JSON.parse(args));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
