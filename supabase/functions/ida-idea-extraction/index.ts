import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_BYTES = 8 * 1024 * 1024;

function classify(mime: string, name: string): "text" | "image" | "pdf" | "unsupported" {
  const lower = (name || "").toLowerCase();
  if ((mime || "").startsWith("text/") || mime === "application/json" || /\.(txt|md|csv|json|log|html|xml)$/i.test(lower)) return "text";
  if ((mime || "").startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lower)) return "image";
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

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function toContentBlock(name: string, mime: string, buf: Uint8Array): Promise<any> {
  const kind = classify(mime, name);
  if (kind === "unsupported") {
    return { type: "text", text: `[Attachment "${name}" (${mime || "binary"}) cannot be read. Please convert to PDF, plain text, or image.]` };
  }
  if (buf.byteLength > MAX_BYTES) {
    return { type: "text", text: `[Attachment "${name}" exceeded 8 MB and was skipped.]` };
  }
  if (kind === "text") {
    const text = new TextDecoder().decode(buf).slice(0, 80_000);
    return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End ---` };
  }
  const b64 = bufToBase64(buf);
  if (kind === "image") {
    return { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${b64}` } };
  }
  return { type: "file", file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json() as {
      language?: "en" | "de";
      opportunityId?: string;
      fileIds?: string[];
      contextTitle?: string;
      // inline files for pre-creation extraction
      files?: Array<{ name: string; mime: string; dataBase64: string }>;
    };

    const lang = body.language === "de" ? "German" : "English";
    const manualTitle = (body.contextTitle || "").trim();

    const blocks: any[] = [];
    const usedFiles: string[] = [];

    if (body.files && body.files.length > 0) {
      for (const f of body.files) {
        try {
          const buf = b64ToBuf(f.dataBase64);
          const block = await toContentBlock(f.name, f.mime || "", buf);
          if (block) {
            blocks.push(block);
            if (classify(f.mime || "", f.name) !== "unsupported") usedFiles.push(f.name);
          }
        } catch (e) {
          console.error("inline file error", f.name, e);
        }
      }
    } else if (body.opportunityId && body.fileIds && body.fileIds.length > 0) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: files, error } = await supabase
        .from("opportunity_files")
        .select("file_name, file_path, mime_type, file_size, comment")
        .eq("opportunity_id", body.opportunityId)
        .in("id", body.fileIds);
      if (error) console.error(error);
      for (const f of files ?? []) {
        if ((f.file_size || 0) > MAX_BYTES) {
          blocks.push({ type: "text", text: `[Attachment "${f.file_name}" too large, skipped.]` });
          continue;
        }
        const { data, error: dErr } = await supabase.storage.from("opportunity-files").download(f.file_path);
        if (dErr || !data) continue;
        const buf = new Uint8Array(await data.arrayBuffer());
        if (f.comment) blocks.push({ type: "text", text: `User note on "${f.file_name}": ${f.comment}` });
        const block = await toContentBlock(f.file_name, f.mime_type || "", buf);
        if (block) {
          blocks.push(block);
          if (classify(f.mime_type || "", f.file_name) !== "unsupported") usedFiles.push(f.file_name);
        }
      }
    }

    if (blocks.length === 0) {
      return new Response(JSON.stringify({ error: "no_files", message: "No attachments provided." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const titleClause = manualTitle
      ? ` The user has already given this opportunity the title "${manualTitle}". Treat this title as the anchor of the analysis: the PROBLEM description and the SOLUTION idea & differentiator MUST be framed around and directly relate to this title. If the documents cover multiple themes, focus on the parts that relate to "${manualTitle}".`
      : "";

    const systemPrompt = `You are IDA (Internal Document Analyst), a senior innovation analyst. Read the attached documents carefully and extract a concise structured summary for a new innovation opportunity. Use ONLY information grounded in the documents. If a field cannot be inferred, leave it as an empty string. Answer all fields in ${lang}.${titleClause}`;

    const titleFieldInstruction = manualTitle
      ? `- title: keep "${manualTitle}" exactly as given (do not rewrite it).`
      : `- title: short title (max ~80 chars), in ${lang}.`;

    const userIntro = `Extract the following fields about the innovation idea from the attached documents${manualTitle ? `, all centered on the given title "${manualTitle}"` : ""}:

${titleFieldInstruction}
- description: the PROBLEM description${manualTitle ? ` that "${manualTitle}" addresses` : ""} — what customer/market pain is being addressed (2-5 sentences).
- solutionDescription: the SOLUTION idea AND key differentiator${manualTitle ? ` of "${manualTitle}"` : ""} — what is proposed and why it is unique (2-5 sentences).
- industry: target industry / sector (e.g. "Marine", "Aviation", "Healthcare"). Single short value.
- geography: target geography (e.g. "Europe", "Global", "APAC"). Single short value.
- technology: business field / technology domain (e.g. "Automotive", "Energy", "Digital"). Single short value.

Return the result via the extract_idea tool.`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: [{ type: "text", text: userIntro }, ...blocks] },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_idea",
            description: "Return structured idea fields extracted from the attached documents.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                solutionDescription: { type: "string" },
                industry: { type: "string" },
                geography: { type: "string" },
                technology: { type: "string" },
              },
              required: ["title", "description", "solutionDescription", "industry", "geography", "technology"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_idea" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI gateway error", details: text }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      console.error("No tool call", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = JSON.parse(args);
    result.filesUsed = usedFiles;
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ida-idea-extraction error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
