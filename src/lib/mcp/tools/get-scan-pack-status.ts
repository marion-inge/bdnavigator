import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function anonClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

const ALL_KEYS = ["industry", "customer", "competitor", "market_potential", "buying_center", "assembler"] as const;

export default defineTool({
  name: "get_scan_pack_status",
  title: "Get scan pack status",
  description:
    "Return the current Scan Pack execution status for an opportunity: per-scan status, started/completed dates, result summaries, key findings, and uploaded file names.",
  inputSchema: {
    opportunity_id: z.string().uuid().describe("Opportunity UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ opportunity_id }) => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, title, scan_pack")
      .eq("id", opportunity_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No opportunity found with id ${opportunity_id}` }], isError: true };
    const pack: any = (data as any).scan_pack ?? {};
    const scans = ALL_KEYS.map((k) => {
      const s = pack[k] ?? {};
      return {
        scan: k,
        status: s.status ?? "not_started",
        started_at: s.startedAt ?? null,
        completed_at: s.completedAt ?? null,
        summary: s.summary ?? "",
        key_findings: s.keyFindings ?? [],
        files: (s.files ?? []).map((f: any) => ({ name: f.name, size: f.size, uploaded_at: f.uploadedAt })),
      };
    });
    const done_count = scans.filter((s) => s.status === "done").length;
    const payload = { opportunity: { id: data.id, title: data.title }, done_count, total: ALL_KEYS.length, scans };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
