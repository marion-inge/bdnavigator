import { defineMcp } from "@lovable.dev/mcp-js";
import listOpportunitiesTool from "./tools/list-opportunities";
import getOpportunityTool from "./tools/get-opportunity";
import searchOpportunitiesTool from "./tools/search-opportunities";

export default defineMcp({
  name: "novi-mcp",
  title: "NOVI Innovation Pipeline",
  version: "0.1.0",
  instructions:
    "Tools for exploring the NOVI innovation opportunity pipeline. Use `list_opportunities` to browse (optionally by stage), `search_opportunities` for keyword search across title/description/industry/technology, and `get_opportunity` to fetch the full record (scoring, business plan, business case, strategic analyses) by id.",
  tools: [listOpportunitiesTool, getOpportunityTool, searchOpportunitiesTool],
});
