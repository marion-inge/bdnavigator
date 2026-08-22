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

export default defineTool({
  name: "list_opportunities",
  title: "List opportunities",
  description:
    "List innovation opportunities in the NEVO pipeline. Returns id, title, stage, industry, geography, owner, and creation date. Use `stage` to filter by pipeline stage and `limit` to cap results (default 25, max 200).",
  inputSchema: {
    stage: z
      .string()
      .optional()
      .describe("Optional pipeline stage filter, e.g. 'idea', 'assess', 'business_plan'."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Maximum number of rows to return (default 25, max 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ stage, limit }) => {
    const supabase = anonClient();
    let q = supabase
      .from("opportunities")
      .select("id, title, stage, industry, geography, owner, idea_bringer, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (stage) q = q.eq("stage", stage);
    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { opportunities: data ?? [] },
    };
  },
});
