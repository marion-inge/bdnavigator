import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_BYTES = 20 * 1024 * 1024;

type Kind = "text" | "image" | "pdf" | "docx" | "xlsx" | "pptx" | "unsupported";

function classify(mime: string, name: string): Kind {
  const lower = (name || "").toLowerCase();
  if (lower.endsWith(".docx") || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (lower.endsWith(".xlsx") || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "xlsx";
  if (lower.endsWith(".pptx") || mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
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

function stripXml(xml: string): string {
  return xml
    .replace(/<w:p[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/a:p>/g, "\n")
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

async function extractDocx(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const doc = zip.file("word/document.xml");
  if (!doc) return "";
  return stripXml(await doc.async("string"));
}

async function extractPptx(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const slideFiles = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort();
  const parts: string[] = [];
  for (const name of slideFiles) {
    const f = zip.file(name);
    if (!f) continue;
    parts.push(`[${name.split("/").pop()}]\n${stripXml(await f.async("string"))}`);
  }
  return parts.join("\n\n");
}

async function extractXlsx(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  // shared strings
  const shared: string[] = [];
  const ss = zip.file("xl/sharedStrings.xml");
  if (ss) {
    const xml = await ss.async("string");
    const re = /<si[^>]*>([\s\S]*?)<\/si>/g;
    let m;
    while ((m = re.exec(xml)) !== null) shared.push(stripXml(m[1]).replace(/\n/g, " ").trim());
  }
  const sheetFiles = Object.keys(zip.files).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort();
  const parts: string[] = [];
  for (const name of sheetFiles) {
    const f = zip.file(name);
    if (!f) continue;
    const xml = await f.async("string");
    const rows: string[] = [];
    const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
    let rm;
    while ((rm = rowRe.exec(xml)) !== null) {
      const cells: string[] = [];
      const cellRe = /<c[^>]*(?:\s+t="([^"]+)")?[^>]*>([\s\S]*?)<\/c>/g;
      let cm;
      while ((cm = cellRe.exec(rm[1])) !== null) {
        const t = cm[1];
        const inner = cm[2];
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
        const isMatch = /<is>([\s\S]*?)<\/is>/.exec(inner);
        let val = "";
        if (isMatch) val = stripXml(isMatch[1]).trim();
        else if (vMatch) {
          if (t === "s") { const idx = parseInt(vMatch[1], 10); val = shared[idx] ?? ""; }
          else val = vMatch[1];
        }
        if (val) cells.push(val);
      }
      if (cells.length) rows.push(cells.join(" | "));
    }
    if (rows.length) parts.push(`[${name.split("/").pop()}]\n${rows.join("\n")}`);
  }
  return parts.join("\n\n");
}

async function toContentBlock(name: string, mime: string, buf: Uint8Array): Promise<any> {
  const kind = classify(mime, name);
  if (kind === "unsupported") {
    return { type: "text", text: `[Attachment "${name}" (${mime || "binary"}) cannot be read. Please convert to PDF, plain text, or image.]` };
  }
  if (buf.byteLength > MAX_BYTES) {
    return { type: "text", text: `[Attachment "${name}" exceeded 20 MB and was skipped.]` };
  }
  if (kind === "text") {
    const text = new TextDecoder().decode(buf).slice(0, 80_000);
    return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End ---` };
  }
  if (kind === "docx" || kind === "xlsx" || kind === "pptx") {
    try {
      const text = (kind === "docx" ? await extractDocx(buf) : kind === "xlsx" ? await extractXlsx(buf) : await extractPptx(buf)).slice(0, 120_000);
      if (!text.trim()) return { type: "text", text: `[Attachment "${name}": no readable text found.]` };
      return { type: "text", text: `--- File: ${name} (${kind}) ---\n${text}\n--- End ---` };
    } catch (e) {
      console.error("office extract failed", name, e);
      return { type: "text", text: `[Attachment "${name}": failed to extract text.]` };
    }
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
