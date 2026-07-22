import { defineMcp } from "@lovable.dev/mcp-js";
import listOpportunitiesTool from "./tools/list-opportunities";
import getOpportunityTool from "./tools/get-opportunity";
import searchOpportunitiesTool from "./tools/search-opportunities";
import getScanInputTool from "./tools/get-scan-input";
import getScanPackStatusTool from "./tools/get-scan-pack-status";
import submitScanResultTool from "./tools/submit-scan-result";

export default defineMcp({
  name: "novi-mcp",
  title: "NOVI Innovation Pipeline",
  version: "0.2.0",
  instructions:
    "Tools for exploring and executing the NOVI innovation opportunity pipeline. Browse with `list_opportunities` / `search_opportunities`, fetch a full record with `get_opportunity`. To run a Scan Pack: read the intake with `get_scan_input`, check current progress with `get_scan_pack_status`, and post results back with `submit_scan_result` (status + summary + key findings). Deliverable files themselves are uploaded through the app UI.",
  tools: [
    listOpportunitiesTool,
    getOpportunityTool,
    searchOpportunitiesTool,
    getScanInputTool,
    getScanPackStatusTool,
    submitScanResultTool,
  ],
});
