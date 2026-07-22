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

const SCAN_KEYS = ["industry", "customer", "competitor", "market_potential", "buying_center"] as const;
type ScanKey = typeof SCAN_KEYS[number];

function sectionFor(h: any, scan: ScanKey) {
  switch (scan) {
    case "industry": return h?.industry ?? null;
    case "customer": return h?.customer ?? null;
    case "competitor": return h?.competitor ?? null;
    case "market_potential": return h?.marketPotential ?? null;
    case "buying_center": return h?.buyingCenter ?? null;
  }
}

export default defineTool({
  name: "get_scan_input",
  title: "Get scan input",
  description:
    "Return the saved hypothesis intake for an opportunity: the core hypothesis plus one scan's section (or all sections if `scan` is omitted). Errors if no hypothesis exists.",
  inputSchema: {
    opportunity_id: z.string().uuid().describe("Opportunity UUID."),
    scan: z
      .enum(SCAN_KEYS)
      .optional()
      .describe("Optional scan key: industry, customer, competitor, market_potential, buying_center. Omit to return all sections."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ opportunity_id, scan }) => {
    const supabase = anonClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, title, hypothesis")
      .eq("id", opportunity_id)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No opportunity found with id ${opportunity_id}` }], isError: true };
    const h: any = (data as any).hypothesis;
    if (!h) {
      return {
        content: [{ type: "text", text: `No hypothesis has been drafted for opportunity "${data.title}". Draft one first in the Hypothesis tab.` }],
        isError: true,
      };
    }
    const sections = scan
      ? { [scan]: sectionFor(h, scan) }
      : Object.fromEntries(SCAN_KEYS.map((k) => [k, sectionFor(h, k)]));
    const payload = {
      opportunity: { id: data.id, title: data.title },
      hypothesis_status: h.status ?? "draft",
      core: h.core ?? null,
      sections,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
