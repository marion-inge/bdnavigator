import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Framework = "ansoff" | "bcg" | "mckinsey" | "three_horizons";

const FRAMEWORK_SCHEMA: Record<Framework, {
  positions: string[];
  positionDesc: string;
  positionField: "position" | "horizon";
  name: string;
}> = {
  ansoff: {
    positions: ["market_penetration", "product_development", "market_development", "diversification"],
    positionDesc: "Ansoff matrix quadrant",
    positionField: "position",
    name: "Ansoff Matrix",
  },
  bcg: {
    positions: ["question_mark", "star", "cash_cow", "dog"],
    positionDesc: "BCG matrix quadrant (relative market share x market growth)",
    positionField: "position",
    name: "BCG Matrix",
  },
  mckinsey: {
    positions: [
      "high_high", "high_medium", "high_low",
      "medium_high", "medium_medium", "medium_low",
      "low_high", "low_medium", "low_low",
    ],
    positionDesc: "McKinsey/GE 3x3 cell encoded as `${industryAttractiveness}_${competitiveStrength}` where each axis is low|medium|high",
    positionField: "position",
    name: "McKinsey GE Matrix",
  },
  three_horizons: {
    positions: ["horizon1", "horizon2", "horizon3"],
    positionDesc: "McKinsey 3 Horizons of Growth",
    positionField: "horizon",
    name: "3 Horizons of Growth",
  },
};

// File-category mapping (UI uses sa_ansoff, sa_bcg, sa_mckinsey, sa_three_horizons)
function categoryFor(fw: Framework): string {
  return fw === "three_horizons" ? "sa_three_horizons" : `sa_${fw}`;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB hard cap per file to avoid OOM

function classify(mime: string, name: string): "text" | "image" | "pdf" | "unsupported" {
  const lower = name.toLowerCase();
  if (mime.startsWith("text/") || mime === "application/json" || /\.(txt|md|csv|json|log|html|xml)$/i.test(lower)) return "text";
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lower)) return "image";
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  return "unsupported";
}

function bufToBase64(buf: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK) as any);
  }
  return btoa(bin);
}

async function fileToContentBlock(supabase: any, bucket: string, path: string, mime: string, name: string, size: number): Promise<any | null> {
  const kind = classify(mime, name);
  if (kind === "unsupported") {
    return { type: "text", text: `[Attachment "${name}" (${mime || "binary"}) cannot be read directly by the AI. Please convert to PDF, plain text, or image.]` };
  }
  if (size && size > MAX_BYTES) {
    return { type: "text", text: `[Attachment "${name}" is too large (${Math.round(size / 1024 / 1024)} MB, limit 8 MB) and was skipped.]` };
  }
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) return null;
    const buf = new Uint8Array(await data.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      return { type: "text", text: `[Attachment "${name}" exceeded the 8 MB cap and was skipped.]` };
    }
    if (kind === "text") {
      const text = new TextDecoder().decode(buf).slice(0, 80_000);
      return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End of ${name} ---` };
    }
    const b64 = bufToBase64(buf);
    if (kind === "image") {
      return { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${b64}` } };
    }
    return { type: "file", file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } };
  } catch (e) {
    console.error("file download error", name, e);
    return { type: "text", text: `[Attachment "${name}" could not be loaded.]` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { opportunityId, framework, language, context, fileIds } = await req.json() as {
      opportunityId: string;
      framework: Framework;
      language?: "en" | "de";
      context?: Record<string, any>;
      fileIds?: string[];
    };

    if (!opportunityId || !FRAMEWORK_SCHEMA[framework]) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!fileIds || fileIds.length === 0) {
      return new Response(JSON.stringify({ error: "no_files", message: "Please select at least one attachment for IDA to analyze." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fw = FRAMEWORK_SCHEMA[framework];
    const lang = language === "de" ? "German" : "English";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the selected files
    const { data: files, error: filesErr } = await supabase
      .from("opportunity_files")
      .select("id, file_name, file_path, mime_type, file_size, comment")
      .eq("opportunity_id", opportunityId)
      .in("id", fileIds);

    if (filesErr) console.error("files query error", filesErr);

    const fileList = files ?? [];

    if (fileList.length === 0) {
      return new Response(JSON.stringify({ error: "no_files", message: "Selected files not found." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build multimodal content blocks
    const contentBlocks: any[] = [];
    const usedFiles: string[] = [];
    for (const f of fileList) {
      const block = await fileToContentBlock(supabase, "opportunity-files", f.file_path, f.mime_type || "", f.file_name, f.file_size || 0);
      if (block) {
        if (f.comment) contentBlocks.push({ type: "text", text: `User note on "${f.file_name}": ${f.comment}` });
        contentBlocks.push(block);
        if (classify(f.mime_type || "", f.file_name) !== "unsupported") usedFiles.push(f.file_name);
      }
    }


    const ctx = context || {};
    const anchorParts = [
      ctx.title ? `Title (manual): ${ctx.title}` : "",
      ctx.description ? `Problem description: ${ctx.description}` : "",
      ctx.solutionDescription ? `Solution idea & differentiator: ${ctx.solutionDescription}` : "",
    ].filter(Boolean).join("\n");
    const extraParts = [
      ctx.industry ? `Industry: ${ctx.industry}` : "",
      ctx.geography ? `Geography: ${ctx.geography}` : "",
      ctx.technology ? `Technology: ${ctx.technology}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are IDA (Internal Document Analyst), a senior strategy analyst. Read the attached documents carefully and combine their content with the user-provided opportunity context (title, problem description, solution idea & differentiator). The title, problem, and solution are the ANCHOR of the analysis — every conclusion must be consistent with them. Use ONLY information grounded in the documents and the provided context; if something is not covered, mark it as an assumption in the rationale. Never hallucinate. Answer in ${lang}.`;

    const userIntro = `Analyze this innovation opportunity for the ${fw.name} framework.

== Opportunity anchor (manually entered by the user — treat as primary truth) ==
${anchorParts || "(no anchor provided)"}

== Additional context ==
${extraParts || "(none)"}

== Source documents ==
The attached file(s) below contain supporting evidence. Read them and ground your reasoning in them.

Task:
1. Select the best ${fw.positionDesc} value from this exact list: [${fw.positions.join(", ")}]. The choice must fit the anchor (title + problem + solution) interpreted in light of the attached documents.
2. description: 2-4 sentences describing the opportunity in the context of the ${fw.name}, explicitly relating to the title and the solution idea.
3. rationale: 3-6 sentences explaining WHY this position fits, citing concrete facts/data from the attachments (mention the source document name when relevant) and tying back to the problem & solution.

Use the fill_framework tool to return the result.`;

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
          { role: "user", content: [{ type: "text", text: userIntro }, ...contentBlocks] },
        ],
        tools: [{
          type: "function",
          function: {
            name: "fill_framework",
            description: `Fill the ${fw.name} fields based on the attached documents.`,
            parameters: {
              type: "object",
              properties: {
                position: { type: "string", enum: fw.positions, description: fw.positionDesc },
                description: { type: "string" },
                rationale: { type: "string" },
              },
              required: ["position", "description", "rationale"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "fill_framework" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI gateway error", details: text }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      console.error("No tool call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = JSON.parse(args);
    // Normalize field name for three horizons
    if (framework === "three_horizons") {
      result.horizon = result.position;
      delete result.position;
    }
    result.framework = framework;
    result.filesUsed = usedFiles;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ida-framework-analysis error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
