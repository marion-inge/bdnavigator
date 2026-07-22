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

const SCAN_KEYS = ["industry", "customer", "competitor", "market_potential", "buying_center", "assembler"] as const;
const STATUSES = ["not_started", "intake_ready", "running", "done"] as const;

export default defineTool({
  name: "submit_scan_result",
  title: "Submit scan result",
  description:
    "Update one scan card on an opportunity's Scan Pack. Sets status, result summary, and structured key findings; auto-fills completion date when status becomes 'done'. Files themselves must be uploaded via the UI.",
  inputSchema: {
    opportunity_id: z.string().uuid().describe("Opportunity UUID."),
    scan: z.enum(SCAN_KEYS).describe("Scan key: industry, customer, competitor, market_potential, buying_center, or assembler."),
    status: z.enum(STATUSES).describe("New status: not_started, intake_ready, running, or done."),
    summary: z.string().describe("Result summary text (may be empty when just flipping status)."),
    key_findings: z.array(z.string()).optional().describe("Optional list of structured key findings."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ opportunity_id, scan, status, summary, key_findings }) => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, title, scan_pack")
      .eq("id", opportunity_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No opportunity found with id ${opportunity_id}` }], isError: true };

    const now = new Date().toISOString();
    const pack: any = { ...((data as any).scan_pack ?? {}) };
    const existing = pack[scan] ?? { status: "not_started", summary: "", keyFindings: [], files: [] };
    const next = {
      status,
      summary,
      keyFindings: key_findings ?? existing.keyFindings ?? [],
      files: existing.files ?? [],
      startedAt: existing.startedAt ?? (status === "running" || status === "done" ? now : undefined),
      completedAt: status === "done" ? (existing.completedAt ?? now) : undefined,
      updatedAt: now,
    };
    pack[scan] = next;

    const { error: upErr } = await supabase
      .from("opportunities")
      .update({ scan_pack: pack })
      .eq("id", opportunity_id);
    if (upErr) return { content: [{ type: "text", text: upErr.message }], isError: true };

    return {
      content: [{ type: "text", text: `Updated ${scan} on "${data.title}" → ${status}.` }],
      structuredContent: { scan, state: next },
    };
  },
});
