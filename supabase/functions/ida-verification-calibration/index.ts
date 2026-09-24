const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIELDS: Record<string, { type: "text" | "number"; desc: string }> = {
  "sam.samVsTamExplanation": { type: "text", desc: "SAM vs TAM explanation" },
  "sam.includedIndustries": { type: "text", desc: "Included industries" },
  "sam.excludedIndustries": { type: "text", desc: "Excluded industries" },
  "sam.geographicFocus": { type: "text", desc: "Geographic focus" },
  "sam.targetGroups": { type: "text", desc: "Target groups" },
  "sam.unreachableGroups": { type: "text", desc: "Unreachable groups" },
  "sam.priceEvolution": { type: "text", desc: "Price evolution / willingness to pay" },
  "som.marketShareVsSam": { type: "text", desc: "Market share vs SAM" },
  "som.growthRate": { type: "text", desc: "Growth rate" },
  "som.salesCapacity": { type: "text", desc: "Sales capacity" },
  "som.pipeline": { type: "text", desc: "Pipeline" },
  "som.hitratePct": { type: "number", desc: "Hit rate %" },
  "som.visibilityPct": { type: "number", desc: "Visibility %" },
  "som.visibilityGrowthPct": { type: "number", desc: "Visibility growth % p.a." },
  "som.portfolioCoveragePct": { type: "number", desc: "Portfolio coverage %" },
  "som.projection.1": { type: "number", desc: "SOM year 1 value (EUR)" },
  "som.projection.2": { type: "number", desc: "SOM year 2 value (EUR)" },
  "som.projection.3": { type: "number", desc: "SOM year 3 value (EUR)" },
  "som.projection.4": { type: "number", desc: "SOM year 4 value (EUR)" },
  "som.projection.5": { type: "number", desc: "SOM year 5 value (EUR)" },
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { language = "en", evidence, current, opportunity } = body || {};
    if (!evidence || typeof evidence !== "object") return json({ error: "evidence required" }, 400);
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI not configured" }, 500);

    const lang = language === "de" ? "German" : "English";
    const fieldList = Object.entries(FIELDS).map(([k, v]) => `- ${k} (${v.type}): ${v.desc}`).join("\n");
    const system = `You are IDA, a business development analyst. Based on market verification evidence (customer, affiliate, BU interviews, pilots & leads), recommend concrete adjustments to the TAM/SAM/SOM desk-research assumptions. Only recommend changes that are supported by the evidence. Write proposed text values and rationales in ${lang}. Allowed fields:\n${fieldList}\nNumbers must be plain numbers (percent as 0-100, EUR as absolute). Return 3-10 recommendations.`;
    const user = `Opportunity: ${JSON.stringify(opportunity || {}).slice(0, 3000)}\n\nCurrent values: ${JSON.stringify(current || {}).slice(0, 12000)}\n\nVerification evidence: ${JSON.stringify(evidence).slice(0, 40000)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        tools: [{
          type: "function",
          function: {
            name: "recommend",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string", enum: Object.keys(FIELDS) },
                      proposedValue: { type: "string" },
                      rationale: { type: "string" },
                    },
                    required: ["field", "proposedValue", "rationale"],
                  },
                },
              },
              required: ["summary", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend" } },
      }),
    });
    if (resp.status === 429) return json({ error: "Rate limit reached, please retry shortly." }, 429);
    if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!resp.ok) return json({ error: `AI error ${resp.status}` }, 500);
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { summary: "", recommendations: [] };
    parsed.recommendations = (parsed.recommendations || []).filter((r: any) => FIELDS[r.field]).map((r: any) => ({
      ...r,
      type: FIELDS[r.field].type,
      label: FIELDS[r.field].desc,
    }));
    return json(parsed);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
