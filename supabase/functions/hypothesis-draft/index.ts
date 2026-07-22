import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ScanKey =
  | "industry"
  | "customer"
  | "competitor"
  | "market_potential"
  | "buying_center";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = (await req.json()) as {
      opportunityId: string;
      selectedScans: ScanKey[];
      language?: "en" | "de";
    };

    const lang = body.language === "de" ? "German" : "English";
    const scans = body.selectedScans?.length
      ? body.selectedScans
      : (["industry", "customer", "competitor", "market_potential", "buying_center"] as ScanKey[]);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: opp, error } = await supabase
      .from("opportunities")
      .select(
        "title, description, solution_description, industry, geography, technology, owner, idea_bringer, scoring, rough_scoring_answers, rough_scoring_comments, rough_scoring_sources",
      )
      .eq("id", body.opportunityId)
      .maybeSingle();
    if (error) throw error;
    if (!opp) throw new Error("Idea not found");

    const answers = (opp.rough_scoring_answers || {}) as Record<string, number>;
    const comments = (opp.rough_scoring_comments || {}) as Record<string, string>;

    const briefLines: string[] = [
      `Title: ${opp.title || ""}`,
      `Problem Description: ${opp.description || ""}`,
      `Solution Idea & Differentiator: ${opp.solution_description || ""}`,
      `Industry: ${opp.industry || ""}`,
      `Target Geography: ${opp.geography || ""}`,
      `Business Field / Technology: ${opp.technology || ""}`,
      `Owner: ${opp.owner || ""}`,
      `Idea Bringer: ${opp.idea_bringer || ""}`,
      "",
      "Rough Scoring answers (1–5) with comments:",
    ];
    for (const [qid, score] of Object.entries(answers)) {
      const c = comments[qid];
      briefLines.push(`- ${qid}: ${score}${c ? ` — ${c}` : ""}`);
    }
    const brief = briefLines.join("\n");

    const scanGuide: Record<ScanKey, string> = {
      industry:
        "Industry Scan: infer studyPurpose, segmentsInDepth (array of short industry segment names), depth, geography (primary/baseline/light arrays of country/region names), outputs (four booleans).",
      customer:
        "Customer Scan: fill products, reportMode, useCases, businessModel, targetMarket, customerTypes, preferences, tierCriteria, additionalComments as short text.",
      competitor:
        "Competitor Scan: fill client (company name), offering.name, offering.description, offering.specAnchors (5–10), targetMarkets (segment+region), knownCompetitors (name + clientBelief), benchmarkCriteria (short list of criteria names), depthCap (integer, default 12 if unknown), criteriaWeights (map criterion→weight number), targetCosting.{targetMargin,currentCost,wtpAnchors}, frameworks (5 booleans: vpc, cba, threeCircle, positioning, targetCosting), preferences, additionalComments.",
      market_potential:
        "Market Potential Scan: fill pricePerUnitOrSeat, unitsPerCustomerType (array of {customerType, units}), recurringOrOneTime ('recurring'|'one_time'|''), baseYear, currency, winRateAssumption, adoptionAssumption, addressableShareAssumption, scenarios.{conservative,realistic,aggressive} as assumption sets.",
      buying_center:
        "Buying Center Scan: fill offeringDescription (3–5 sentences), seedInputType ('customer_scan_db'|'crm_export'|'lead_list'|'manual_account_list'|''), shortlistRule, depth ('full_mapping_50'|'contact_coverage_400'|''), deliveryNotes.",
    };

    const systemPrompt =
      `You are IDA, a senior innovation analyst. Draft a "Hypothesis Builder" input sheet for a research team. Use ONLY the idea brief provided. If a specific field cannot be reasonably inferred from the brief, return an empty string / empty array / null — DO NOT invent facts, numbers, company names or specifications. Prefer leaving fields empty over hallucinating. Respond in ${lang}.`;

    const userPrompt =
      `Draft the CORE hypothesis section and ONLY the following scan sections: ${scans.join(", ")}.

Core section: hypothesisStatement (1–2 sentence testable statement anchored on the title), client.company (from Owner if it clearly names a company), client.businessUnit (leave empty unless obvious), offering.name (from title), offering.description (3–5 sentences from problem + solution), offering.specAnchors (5–10 short bullets — leave empty array if not clearly present in brief), offering.businessModel ('one-time'|'recurring'|'service'|''), targetMarkets (array of {segment, region} derived from industry + geography).

Then fill each requested scan per this guide:
${scans.map((s) => `- ${scanGuide[s]}`).join("\n")}

--- Idea Brief ---
${brief}
--- End Brief ---`;

    const properties: Record<string, any> = {
      core: {
        type: "object",
        properties: {
          hypothesisStatement: { type: "string" },
          client: {
            type: "object",
            properties: {
              company: { type: "string" },
              businessUnit: { type: "string" },
            },
            required: ["company", "businessUnit"],
            additionalProperties: false,
          },
          offering: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              specAnchors: { type: "array", items: { type: "string" } },
              businessModel: { type: "string" },
            },
            required: ["name", "description", "specAnchors", "businessModel"],
            additionalProperties: false,
          },
          targetMarkets: {
            type: "array",
            items: {
              type: "object",
              properties: { segment: { type: "string" }, region: { type: "string" } },
              required: ["segment", "region"],
              additionalProperties: false,
            },
          },
        },
        required: ["hypothesisStatement", "client", "offering", "targetMarkets"],
        additionalProperties: false,
      },
    };

    if (scans.includes("industry")) {
      properties.industry = {
        type: "object",
        properties: {
          studyPurpose: { type: "string" },
          segmentsInDepth: { type: "array", items: { type: "string" } },
          depth: { type: "string" },
          geography: {
            type: "object",
            properties: {
              primary: { type: "array", items: { type: "string" } },
              baseline: { type: "array", items: { type: "string" } },
              light: { type: "array", items: { type: "string" } },
            },
            required: ["primary", "baseline", "light"],
            additionalProperties: false,
          },
          outputs: {
            type: "object",
            properties: {
              valueChainMap: { type: "boolean" },
              wordStudy: { type: "boolean" },
              excelPlayerDb: { type: "boolean" },
              slideDeck: { type: "boolean" },
            },
            required: ["valueChainMap", "wordStudy", "excelPlayerDb", "slideDeck"],
            additionalProperties: false,
          },
        },
        required: ["studyPurpose", "segmentsInDepth", "depth", "geography", "outputs"],
        additionalProperties: false,
      };
    }
    if (scans.includes("customer")) {
      properties.customer = {
        type: "object",
        properties: {
          products: { type: "string" },
          reportMode: { type: "string" },
          useCases: { type: "string" },
          businessModel: { type: "string" },
          targetMarket: { type: "string" },
          customerTypes: { type: "string" },
          preferences: { type: "string" },
          tierCriteria: { type: "string" },
          additionalComments: { type: "string" },
        },
        required: [
          "products", "reportMode", "useCases", "businessModel", "targetMarket",
          "customerTypes", "preferences", "tierCriteria", "additionalComments",
        ],
        additionalProperties: false,
      };
    }
    if (scans.includes("competitor")) {
      properties.competitor = {
        type: "object",
        properties: {
          client: { type: "string" },
          offering: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              specAnchors: { type: "array", items: { type: "string" } },
            },
            required: ["name", "description", "specAnchors"],
            additionalProperties: false,
          },
          targetMarkets: {
            type: "array",
            items: {
              type: "object",
              properties: { segment: { type: "string" }, region: { type: "string" } },
              required: ["segment", "region"],
              additionalProperties: false,
            },
          },
          knownCompetitors: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, clientBelief: { type: "string" } },
              required: ["name", "clientBelief"],
              additionalProperties: false,
            },
          },
          benchmarkCriteria: { type: "array", items: { type: "string" } },
          depthCap: { type: "number" },
          targetCosting: {
            type: "object",
            properties: {
              targetMargin: { type: "string" },
              currentCost: { type: "string" },
              wtpAnchors: { type: "string" },
            },
            required: ["targetMargin", "currentCost", "wtpAnchors"],
            additionalProperties: false,
          },
          frameworks: {
            type: "object",
            properties: {
              vpc: { type: "boolean" },
              cba: { type: "boolean" },
              threeCircle: { type: "boolean" },
              positioning: { type: "boolean" },
              targetCosting: { type: "boolean" },
            },
            required: ["vpc", "cba", "threeCircle", "positioning", "targetCosting"],
            additionalProperties: false,
          },
          preferences: { type: "string" },
          additionalComments: { type: "string" },
        },
        required: [
          "client", "offering", "targetMarkets", "knownCompetitors", "benchmarkCriteria",
          "depthCap", "targetCosting", "frameworks", "preferences", "additionalComments",
        ],
        additionalProperties: false,
      };
    }
    if (scans.includes("market_potential")) {
      properties.marketPotential = {
        type: "object",
        properties: {
          pricePerUnitOrSeat: { type: "string" },
          unitsPerCustomerType: {
            type: "array",
            items: {
              type: "object",
              properties: { customerType: { type: "string" }, units: { type: "string" } },
              required: ["customerType", "units"],
              additionalProperties: false,
            },
          },
          recurringOrOneTime: { type: "string" },
          baseYear: { type: "string" },
          currency: { type: "string" },
          winRateAssumption: { type: "string" },
          adoptionAssumption: { type: "string" },
          addressableShareAssumption: { type: "string" },
          scenarios: {
            type: "object",
            properties: {
              conservative: { type: "string" },
              realistic: { type: "string" },
              aggressive: { type: "string" },
            },
            required: ["conservative", "realistic", "aggressive"],
            additionalProperties: false,
          },
        },
        required: [
          "pricePerUnitOrSeat", "unitsPerCustomerType", "recurringOrOneTime", "baseYear",
          "currency", "winRateAssumption", "adoptionAssumption", "addressableShareAssumption",
          "scenarios",
        ],
        additionalProperties: false,
      };
    }
    if (scans.includes("buying_center")) {
      properties.buyingCenter = {
        type: "object",
        properties: {
          offeringDescription: { type: "string" },
          seedInputType: { type: "string" },
          shortlistRule: { type: "string" },
          depth: { type: "string" },
          deliveryNotes: { type: "string" },
        },
        required: ["offeringDescription", "seedInputType", "shortlistRule", "depth", "deliveryNotes"],
        additionalProperties: false,
      };
    }

    const required = ["core", ...Object.keys(properties).filter((k) => k !== "core")];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "draft_hypothesis",
              description: "Return structured hypothesis input-sheet fields.",
              parameters: {
                type: "object",
                properties,
                required,
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "draft_hypothesis" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      return new Response(
        JSON.stringify({ error: "AI gateway error", details: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args)
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const result = JSON.parse(args);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("hypothesis-draft error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
