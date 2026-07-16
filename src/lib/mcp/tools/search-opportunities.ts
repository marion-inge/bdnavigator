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
  name: "search_opportunities",
  title: "Search opportunities",
  description:
    "Full-text search opportunities by title, description, industry, technology, or solution. Returns id, title, stage, industry, and a short description snippet.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search text to match across title, description, industry, technology, and solution."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum number of rows to return (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = anonClient();
    // Escape % and , in the ilike pattern; keep it simple.
    const pattern = `%${query.replace(/[%,]/g, " ")}%`;
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, title, stage, industry, technology, description, solution_description, created_at")
      .or(
        [
          `title.ilike.${pattern}`,
          `description.ilike.${pattern}`,
          `industry.ilike.${pattern}`,
          `technology.ilike.${pattern}`,
          `solution_description.ilike.${pattern}`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { opportunities: data ?? [] },
    };
  },
});
