import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import JSZip from "npm:jszip@3.10.1";
import * as XLSX from "npm:xlsx@0.18.5";

const MAX_BYTES = 10 * 1024 * 1024;
// PDFs are converted to text server-side, so much larger files are fine.
const MAX_PDF_BYTES = 40 * 1024 * 1024;
const MAX_PDF_CHARS = 600_000;
const isPdf = (mime: string, name: string) => mime === "application/pdf" || name.toLowerCase().endsWith(".pdf");
const sizeCap = (mime: string, name: string) => (isPdf(mime, name) ? MAX_PDF_BYTES : MAX_BYTES);
// Total budget for binary (PDF/image) payloads sent inline as base64, to stay under the function memory limit.
const MAX_TOTAL_BINARY_BYTES = 12 * 1024 * 1024;
let binaryBudgetUsed = 0;
const MAX_EXTRACTED_CHARS_PER_FILE = 220_000;

function classify(mime: string, name: string): "text" | "image" | "pdf" | "docx" | "xlsx" | "pptx" | "unsupported" {
  const lower = (name || "").toLowerCase();
  if ((mime || "").startsWith("text/") || mime === "application/json" || /\.(txt|md|csv|json|log|html|xml)$/i.test(lower)) return "text";
  if ((mime || "").startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(lower)) return "image";
  if (mime === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (/\.(docx)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  if (/\.(xlsx|xls)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mime === "application/vnd.ms-excel") return "xlsx";
  if (/\.(pptx)$/i.test(lower) || mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "pptx";
  return "unsupported";
}

function bufToBase64(buf: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK) as any);
  return btoa(bin);
}

function stripXml(xml: string): string {
  return xml
    .replace(/<w:tab\s*\/?>/g, "\t")
    .replace(/<w:br\s*\/?>/g, "\n")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<a:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractDocxText(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const parts = Object.keys(zip.files)
    .filter((name) => /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i.test(name))
    .sort((a, b) => (a.includes("document.xml") ? -1 : b.includes("document.xml") ? 1 : a.localeCompare(b)));

  const chunks: string[] = [];
  for (const part of parts) {
    const xml = await zip.files[part].async("text");
    const text = stripXml(xml);
    if (text) chunks.push(`--- ${part} ---\n${text}`);
  }
  return chunks.join("\n\n");
}

function extractWorkbookText(buf: Uint8Array): string {
  const workbook = XLSX.read(buf, { type: "array", cellDates: true });
  const chunks: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false }).trim();
    if (csv) chunks.push(`--- Sheet: ${sheetName} ---\n${csv}`);
  }
  return chunks.join("\n\n");
}

async function extractPptxText(buf: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const slideParts = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const an = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const bn = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return an - bn;
    });

  const chunks: string[] = [];
  for (const part of slideParts) {
    const xml = await zip.files[part].async("text");
    const text = stripXml(xml);
    if (text) chunks.push(`--- ${part} ---\n${text}`);
  }
  return chunks.join("\n\n");
}

async function toContentBlock(name: string, mime: string, buf: Uint8Array): Promise<any> {
  const kind = classify(mime, name);
  if (kind === "unsupported") return { type: "text", text: `[Attachment "${name}" cannot be read.]` };
  if (buf.byteLength > MAX_BYTES) return { type: "text", text: `[Attachment "${name}" exceeded size cap and was skipped.]` };
  if (kind === "text") {
    const text = new TextDecoder().decode(buf).slice(0, MAX_EXTRACTED_CHARS_PER_FILE);
    return { type: "text", text: `--- File: ${name} ---\n${text}\n--- End of ${name} ---` };
  }
  if (kind === "docx" || kind === "xlsx" || kind === "pptx") {
    try {
      const text = kind === "docx"
        ? await extractDocxText(buf)
        : kind === "xlsx"
        ? extractWorkbookText(buf)
        : await extractPptxText(buf);
      const trimmed = text.slice(0, MAX_EXTRACTED_CHARS_PER_FILE).trim();
      return {
        type: "text",
        text: trimmed
          ? `--- File: ${name} (extracted ${kind.toUpperCase()} content) ---\n${trimmed}\n--- End of ${name} ---`
          : `[Attachment "${name}" was opened as ${kind.toUpperCase()}, but no readable text or table content was found.]`,
      };
    } catch (e) {
      console.error(`Office extraction failed for ${name}`, e);
      return { type: "text", text: `[Attachment "${name}" could not be extracted. Please convert it to PDF, TXT, CSV or XLSX and try again.]` };
    }
  }
  if (binaryBudgetUsed + buf.byteLength > MAX_TOTAL_BINARY_BYTES) {
    return { type: "text", text: `[Attachment "${name}" skipped: total attachment size limit reached. Select fewer or smaller files.]` };
  }
  binaryBudgetUsed += buf.byteLength;
  const b64 = bufToBase64(buf);
  if (kind === "image") return { type: "image_url", image_url: { url: `data:${mime || "image/png"};base64,${b64}` } };
  return { type: "file", file: { filename: name, file_data: `data:application/pdf;base64,${b64}` } };
}

// ─── schema groups ─────────────────────────────────────────────────────────
const strProps = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, { type: "string" }]));

const TAM_OVERVIEW_KEYS = ["scopeDefinition","geographicCoverage","assumptions","scopeExclusions","fullGlobalPotential","marketDevelopment","drivers","sources","sourceAssessment","derivationMethod","supportingModelNotes"];
const SAM_OVERVIEW_KEYS = ["samVsTamExplanation","includedIndustries","excludedIndustries","geographicFocus","geographicExclusions","targetGroups","unreachableGroups","relevanceOutlook","featureAdaptations","priceEvolution","resourceScenarios","requiredInvestments"];
const SOM_OVERVIEW_KEYS = ["marketShareVsSam","growthRate","visibilityRate","salesCapacity","pipeline","licenseToOperate","salesCapacityScenario","marketingBudgetScenario","positioningScenario"];

// 5-year projection array schema {year:1..5, value:number in M€}
const projectionsSchema = {
  type: "array",
  description: "Five-year market-size projection. Year is 1..5 (year 1 = current year). Value is in millions of EUR (M€). Provide your best estimate based on the documents; CAGR is auto-calculated from these.",
  items: {
    type: "object",
    properties: {
      year: { type: "integer", minimum: 1, maximum: 5 },
      value: { type: "number" },
    },
    required: ["year", "value"],
    additionalProperties: false,
  },
  minItems: 5,
  maxItems: 5,
};

const geographicalRegionsSchema = {
  type: "array",
  description: "Geographic breakdown table. Extract every visible region/country/cluster and its TAM/SAM/SOM value from the documents. Market size must preserve units exactly as supported by the source, preferably in M€ where available. Potential is a 1-5 rating based on the document evidence. Notes must include source context, assumptions and what the value represents.",
  items: {
    type: "object",
    properties: {
      region: { type: "string", description: "Region, country or market cluster name exactly as shown or clearly implied in the source." },
      marketSize: { type: "string", description: "Regional market size / potential with unit and year, e.g. '120 M€ in 2027' or 'approx. 35 customers × 0.8 M€/year'." },
      potential: { type: "integer", minimum: 1, maximum: 5, description: "Regional attractiveness / potential rating: 1 = very low, 5 = very high." },
      notes: { type: "string", description: "Short factual explanation and source reference/context from the document." },
    },
    required: ["region", "marketSize", "potential", "notes"],
    additionalProperties: false,
  },
};

const MARKET_RESEARCH_KEYS = ["secondaryResearch","primaryResearch","keyFigures","methodology","centralInsights","description","rationale"];
const PESTEL_KEYS = ["political","economic","social","technological","environmental","legal","description","rationale"];
const SWOT_KEYS = ["strengths","weaknesses","opportunities","threats","description","rationale"];
const VALUECHAIN_KEYS = ["description","rationale"];

const valueChainStagesSchema = {
  type: "array",
  description: "Industry value chain stages in order (e.g. raw materials, components, manufacturing, integration, distribution, service). Extract every stage described or implied in the documents.",
  items: {
    type: "object",
    properties: {
      name: { type: "string", description: "Stage name." },
      isOurPosition: { type: "boolean", description: "True if our company/offering is positioned in this stage." },
      marginAttractiveness: { type: "integer", minimum: 1, maximum: 5, description: "Margin attractiveness of this stage: 1 = very low, 5 = very high." },
      differentiators: { type: "string", description: "Key differentiators / success factors in this stage." },
      dynamics: { type: "string", description: "Market dynamics, players, trends or shifts in this stage." },
    },
    required: ["name", "isOurPosition", "marginAttractiveness", "differentiators", "dynamics"],
    additionalProperties: false,
  },
};
const PORTER_FORCES = ["competitiveRivalry","threatOfNewEntrants","threatOfSubstitutes","bargainingPowerBuyers","bargainingPowerSuppliers"];

const BMC_KEYS = ["valueProposition","customerSegments","channels","customerRelationships","revenueStreams","keyResources","keyActivities","keyPartners","costStructure","description","rationale"];
const LEAN_KEYS = ["problem","solution","uniqueValueProposition","unfairAdvantage","customerSegments","keyMetrics","channels","costStructure","revenueStreams","description","rationale"];

const VPC_KEYS = ["customerJobs","customerPains","customerGains","productsServices","painRelievers","gainCreators","description","rationale"];
const CBA_KEYS = ["functionalBenefits","emotionalBenefits","socialBenefits","selfExpressiveBenefits","description","rationale"];
const THREE_KEYS = ["ourValue","competitorValue","customerNeeds","ourUnique","theirUnique","commonValue","unmetNeeds","description","rationale"];
const POS_KEYS = ["targetAudience","category","keyBenefit","reasonToBelieve","competitiveAlternative","differentiator","statement","description","rationale"];
const TC_KEYS = ["marketPriceRationale","marginRationale","gapAnalysis","actionPlan","overallAssessment"];

type SectionScope = "overview" | "tam" | "sam" | "sam_customers" | "som" | "som_models";

function buildSchema(scope: SectionScope) {
  const props: Record<string, any> = {};
  if (scope === "overview") {
    props.overview = {
      type: "object",
      properties: {
        tam: {
          type: "object",
          properties: {
            ...strProps(TAM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
            marketGrowthRate: { type: "string", description: "Narrative growth-rate statement, e.g. '15% CAGR through 2030'." },
          },
          required: ["projections", "marketGrowthRate"],
          additionalProperties: false,
        },
        sam: {
          type: "object",
          properties: {
            ...strProps(SAM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
          },
          required: ["projections"],
          additionalProperties: false,
        },
        som: {
          type: "object",
          properties: {
            ...strProps(SOM_OVERVIEW_KEYS),
            projections: projectionsSchema,
            geographicalRegions: geographicalRegionsSchema,
          },
          required: ["projections"],
          additionalProperties: false,
        },
      },
      required: ["tam", "sam", "som"],
      additionalProperties: false,
    };
  }
  if (scope === "tam") {
    props.tam = {
      type: "object",
      properties: {
        marketResearch: { type: "object", properties: strProps(MARKET_RESEARCH_KEYS), additionalProperties: false },
        pestel: { type: "object", properties: strProps(PESTEL_KEYS), additionalProperties: false },
        valueChain: { type: "object", properties: { ...strProps(VALUECHAIN_KEYS), stages: valueChainStagesSchema }, additionalProperties: false },
        porter: {
          type: "object",
          properties: {
            ...Object.fromEntries(PORTER_FORCES.map((f) => [f, {
              type: "object",
              properties: {
                intensity: { type: "number", description: "Force intensity rating 1-5 (1 = very low, 5 = very high)." },
                description: { type: "string" },
              },
              required: ["intensity", "description"],
              additionalProperties: false,
            }])),
            description: { type: "string" },
            rationale: { type: "string" },
          },
          additionalProperties: false,
        },
        swot: { type: "object", properties: strProps(SWOT_KEYS), additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (scope === "sam") {
    props.sam = {
      type: "object",
      properties: {
        customerSegmentation: {
          type: "object",
          properties: {
            description: { type: "string" },
            rationale: { type: "string" },
            entries: {
              type: "array",
              description: "Every customer segment mentioned in the documents. Extract each as a separate row.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Segment name exactly as shown." },
                  size: { type: "string", description: "Segment size with unit if available (e.g. '12k accounts', '€45M') or 'n/a'." },
                  needs: { type: "string", description: "Key needs / pain points of this segment (2-4 concrete points)." },
                  willingnessToPay: { type: "string", description: "Willingness / ability to pay (price range, budget signals) or 'n/a'." },
                  priority: { type: "string", enum: ["high", "medium", "low"], description: "Strategic priority for this segment." },
                },
                required: ["name", "size", "needs", "willingnessToPay", "priority"],
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
        businessModelling: { type: "object", properties: strProps(BMC_KEYS), additionalProperties: false },
        leanCanvas: { type: "object", properties: strProps(LEAN_KEYS), additionalProperties: false },
        risk: { type: "object", properties: { details: { type: "string" } }, additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (scope === "som") {
    props.som = {
      type: "object",
      properties: {
        competitorAnalysis: {
          type: "object",
          properties: {
            description: { type: "string" },
            rationale: { type: "string" },
            entries: {
              type: "array",
              description: "Every competitor mentioned in the documents. Extract each as a separate row.",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Competitor company / product name exactly as shown." },
                  strengths: { type: "string", description: "Key strengths / advantages (2-4 concrete points)." },
                  weaknesses: { type: "string", description: "Key weaknesses / gaps (2-4 concrete points)." },
                  marketShare: { type: "string", description: "Market share with unit if available, e.g. '18%' or 'n/a'." },
                  strategy: { type: "string", description: "Strategic positioning / go-to-market approach in 1-2 sentences." },
                  threatLevel: { type: "integer", minimum: 1, maximum: 5, description: "Threat level 1 (low) to 5 (high)." },
                },
                required: ["name", "strengths", "weaknesses", "marketShare", "strategy", "threatLevel"],
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    };
  }
  if (scope === "som_models") {
    props.som = {
      type: "object",
      properties: {
        valuePropositionCanvas: { type: "object", properties: strProps(VPC_KEYS), additionalProperties: false },
        customerBenefitAnalysis: { type: "object", properties: strProps(CBA_KEYS), additionalProperties: false },
        threeCircleModel: { type: "object", properties: strProps(THREE_KEYS), additionalProperties: false },
        positioningStatement: { type: "object", properties: strProps(POS_KEYS), additionalProperties: false },
        targetCosting: { type: "object", properties: strProps(TC_KEYS), additionalProperties: false },
      },
      additionalProperties: false,
    };
  }
  if (scope === "sam_customers") {
    props.sam = {
      type: "object",
      properties: {
        customersFound: {
          type: "object",
          description: "Detailed database of concrete customer accounts discovered/verified in the documents (mirrors the Customer Scan output).",
          properties: {
            description: { type: "string" },
            researchScope: { type: "string", description: "What was searched (geographies, segments, sources) to build this customer list." },
            bottomUpAssumptions: { type: "string", description: "Assumptions used to translate the list into a bottom-up market size (e.g. price × variant × repeat rate)." },
            averageValuePerCustomer: { type: "number", description: "Average annual value per customer in M€, used when individual entries lack a value." },
            entries: {
              type: "array",
              description: "Every concrete company/account mentioned. Extract each as a separate row — do not summarize into a paragraph.",
              items: {
                type: "object",
                properties: {
                  company: { type: "string", description: "Company / account name exactly as shown." },
                  country: { type: "string", description: "ISO country name or code (e.g. 'Germany', 'US')." },
                  geography: { type: "string", description: "Broader region cluster (e.g. 'EU', 'North America', 'APAC')." },
                  tier: { type: "string", description: "Priority tier: A = top target, E = de-prioritized." },
                  customerType: { type: "string", description: "OEM / Tier-1 / Integrator / Distributor / End user, etc." },
                  segment: { type: "string", description: "Industry / product segment this account belongs to." },
                  parentGroup: { type: "string", description: "Parent group or holding company, if the account is a subsidiary." },
                  variantCount: { type: "string", description: "Number of variants / projects / units per year (e.g. '25' or '60-80')." },
                  estimatedValue: { type: "number", description: "Estimated annual value of this account in M€." },
                  status: { type: "string", description: "active / prospect / on hold / disqualified." },
                  rationale: { type: "string", description: "Why this account is a fit (needs, decision drivers, timing)." },
                  sources: { type: "string", description: "Sources / documents / URLs that support this entry." },
                  notes: { type: "string", description: "Any additional relevant notes." },
                },
                required: ["company", "country", "geography", "tier", "customerType", "segment", "parentGroup", "variantCount", "estimatedValue", "status", "rationale", "sources", "notes"],
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    };
  }
  return { type: "object", properties: props, additionalProperties: false };
}

const SECTION_DESCRIPTIONS: Record<SectionScope, string> = {
  overview: "the TAM / SAM / SOM Overview text fields (scope, geography, assumptions, drivers, sources, methodology, market-share, growth-rate, sales capacity, etc.)",
  tam: "the TAM strategic models: Market Research, PESTEL (Political/Economic/Social/Technological/Environmental/Legal), Value Chain, Porter's Five Forces (all 5 forces), and SWOT (Strengths/Weaknesses/Opportunities/Threats)",
  sam: "the SAM section: Customer Landscape narrative, Business Model Canvas (all 9 blocks), Lean Canvas (all 9 blocks), and the Risk narrative",
  sam_customers: "the SAM 'Customers Found' account database only (a detailed table of concrete customer accounts, mirroring the Customer Scan output)",
  som: "the SOM Competitor Analysis only (narrative plus a detailed competitor table)",
  som_models: "the SOM strategic models only: Value Proposition Canvas, Customer Benefit Analysis, Three Circles, Positioning statement and Target Costing narrative",
};

const FIELD_GUIDE: Record<SectionScope, string> = {
  overview: `Fill every field you can support. Examples:
- tam.scopeDefinition, tam.geographicCoverage, tam.assumptions, tam.scopeExclusions, tam.fullGlobalPotential, tam.marketDevelopment, tam.drivers, tam.sources, tam.sourceAssessment, tam.derivationMethod, tam.supportingModelNotes
- tam.projections (5 years, M€) and tam.marketGrowthRate (narrative CAGR statement) — derive from market-size figures, growth rates, segment sizings, customer counts × price, or any other quantitative anchors present in the documents. ALWAYS attempt projections; clearly state assumptions in tam.assumptions / tam.derivationMethod.
- tam.geographicalRegions — IMPORTANT: extract the geographic breakdown table/chart for TAM. Include every visible region/country/cluster, the exact regional market size/potential with units/year, a 1-5 potential rating, and factual notes/source context. Do not collapse regional rows into one text paragraph.
- sam.samVsTamExplanation, sam.includedIndustries, sam.excludedIndustries, sam.geographicFocus, sam.geographicExclusions, sam.targetGroups, sam.unreachableGroups, sam.relevanceOutlook, sam.featureAdaptations, sam.priceEvolution, sam.resourceScenarios, sam.requiredInvestments
- sam.projections (5 years, M€) — derived as the addressable share of TAM based on industries, geography and target-group filters in the documents.
- sam.geographicalRegions — IMPORTANT: extract the regional SAM breakdown, reflecting only serviceable/accessibly addressable regions. Use source values directly where shown; otherwise derive only when the document provides enough regional TAM/filter evidence.
- som.marketShareVsSam, som.growthRate, som.visibilityRate, som.salesCapacity, som.pipeline, som.licenseToOperate, som.salesCapacityScenario, som.marketingBudgetScenario, som.positioningScenario
- som.projections (5 years, M€) — the realistically obtainable share given sales capacity, pipeline coverage and competitive position.
- som.geographicalRegions — IMPORTANT: extract the regional SOM breakdown, reflecting obtainable market by region based on pipeline, sales reach, visibility, market share or document-supported regional prioritization.`,
  tam: `Fill every field you can support across these models:
- marketResearch: secondaryResearch, primaryResearch, keyFigures, methodology, centralInsights, description, rationale
- pestel: political, economic, social, technological, environmental, legal, description, rationale
- valueChain: description, rationale, stages[] — IMPORTANT: extract the full industry value chain as separate stages in order, each with name, isOurPosition, marginAttractiveness (1-5), differentiators and dynamics. Do not merge the chain into one paragraph.
- porter: competitiveRivalry, threatOfNewEntrants, threatOfSubstitutes, bargainingPowerBuyers, bargainingPowerSuppliers, description, rationale — IMPORTANT: each force is an object with intensity (number 1-5, 1 = very low / 5 = very high) and description. ALWAYS provide a numeric intensity rating per force, justified by the evidence in the documents.
- swot: strengths, weaknesses, opportunities, threats, description, rationale`,
  sam: `Fill every field you can support across these models:
- customerSegmentation: description, rationale, entries[] — IMPORTANT: extract every customer segment mentioned as a separate row with name, size, needs, willingnessToPay and priority (high/medium/low). Do not merge segments into one paragraph.
- businessModelling (BMC): valueProposition, customerSegments, channels, customerRelationships, revenueStreams, keyResources, keyActivities, keyPartners, costStructure, description, rationale
- leanCanvas: problem, solution, uniqueValueProposition, unfairAdvantage, customerSegments, keyMetrics, channels, costStructure, revenueStreams, description, rationale
- risk: details`,
  sam_customers: `Extract ONLY the Customers Found account database:
- customersFound: description, researchScope, bottomUpAssumptions, averageValuePerCustomer (M€), entries[]
- entries[]: one row per concrete company/account named in the documents (company, country, geography, tier A-E, customerType, segment, parentGroup, variantCount, estimatedValue in M€, status, rationale, sources, notes).
- Leave a field as "" or 0 when the documents do not support it. Never invent accounts. If no concrete companies are named, return an empty entries array.`,
  som: `Extract ONLY the Competitor Analysis:
- competitorAnalysis: description, rationale, entries[] — IMPORTANT: extract every competitor mentioned in the documents as a separate row with name, strengths, weaknesses, marketShare, strategy and threatLevel (1-5). Do not merge competitors into a single paragraph.`,
  som_models: `Fill EVERY field of EVERY model below — none may be left out. Where the documents give only partial evidence, reason from the opportunity context and the evidence you do have, and state the assumption inside the text.
- valuePropositionCanvas (VPC): customerJobs, customerPains, customerGains, productsServices, painRelievers, gainCreators, description, rationale
- customerBenefitAnalysis (CBA): functionalBenefits, emotionalBenefits, socialBenefits, selfExpressiveBenefits, description, rationale
- threeCircleModel (MANDATORY, all nine): ourValue (what WE deliver of value to the customer), competitorValue (what competitors deliver), customerNeeds (what the customer actually wants), ourUnique (value only we provide), theirUnique (value only competitors provide), commonValue (value both provide), unmetNeeds (needs nobody serves yet), description, rationale
- positioningStatement: targetAudience, category, keyBenefit, reasonToBelieve, competitiveAlternative, differentiator, statement, description, rationale
- targetCosting: marketPriceRationale, marginRationale, gapAnalysis, actionPlan, overallAssessment`,
};

async function runSection(
  scope: SectionScope,
  blocks: any[],
  anchor: string,
  lang: string,
  apiKey: string,
  model = "google/gemini-2.5-flash",
): Promise<any> {
  const schema = buildSchema(scope);

  const systemPrompt = `You are IDA (Internal Document Analyst), a senior business strategist embedded in NOVI. You will receive one or more source documents (PDFs, images, text). READ EVERY DOCUMENT END-TO-END before writing anything — do not skim, do not stop at the first page. Many of the documents contain tables, charts and small print that you MUST consider.

Your task: propose values for ${SECTION_DESCRIPTIONS[scope]} for an innovation opportunity.

Ground rules:
1. Use ALL the attached documents as evidence. Cross-reference between them.
2. Fill as many of the listed fields as the evidence reasonably supports — be generous but never invent.
3. Each value: 2-5 dense, factual sentences in ${lang}. Concrete numbers, names, regions, dates wherever the documents support them. No fluff.
4. If a number, study title, regulation or competitor name appears in a document, prefer to surface it (you may briefly note the source filename in parentheses).
5. Omit a field ONLY if zero evidence exists in the documents AND the opportunity anchor.
6. Output exclusively through the fill_business_plan tool.

Field guide:
${FIELD_GUIDE[scope]}`;

  const userIntro = `Opportunity anchor:\n${anchor || "(none provided)"}\n\nSource documents follow. Read them completely.\n\nReturn the proposal via the fill_business_plan tool — populate as many fields as the evidence supports.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Flash is dramatically faster than Pro on multi-document calls
      // and avoids the upstream idle timeouts we were seeing with Pro.
      model,
      max_tokens: 16000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [{ type: "text", text: userIntro }, ...blocks] },
      ],
      tools: [{
        type: "function",
        function: {
          name: "fill_business_plan",
          description: "Return proposed values for the Business Plan fields you can support from the attached documents. Populate every field for which the documents contain relevant evidence.",
          parameters: schema,
        },
      }],
      tool_choice: { type: "function", function: { name: "fill_business_plan" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`AI gateway error (${scope})`, response.status, text);
    const err: any = new Error(`gateway_${response.status}`);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const finish = choice?.finish_reason;
  if (finish && finish !== "stop" && finish !== "tool_calls") {
    console.warn(`Section ${scope} finish_reason=${finish}`);
  }
  const args = choice?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    console.error(`No tool call for ${scope}`, JSON.stringify(data).slice(0, 2000));
    return {};
  }
  try {
    return JSON.parse(args);
  } catch (e) {
    console.error(`Bad JSON for ${scope}`, e, args?.slice?.(0, 500));
    return {};
  }
}

/** Pass 1: read every document completely ONCE and write a dense, structured
 *  evidence digest. Long documents lose detail when the field-filling calls
 *  have to read them and fill a big schema at the same time; the digest gives
 *  every section focused, pre-extracted facts instead. */
function toResponsesContent(blocks: any[]): any[] {
  return blocks.map((b) => {
    if (b.type === "text") return { type: "input_text", text: b.text };
    if (b.type === "image_url") return { type: "input_image", image_url: b.image_url.url };
    if (b.type === "file") return { type: "input_file", filename: b.file.filename, file_data: b.file.file_data };
    return { type: "input_text", text: String(b.text ?? "") };
  });
}

async function digestPart(blocks: any[], anchor: string, lang: string, apiKey: string): Promise<string> {
  const instructions = `You are IDA, a meticulous market analyst. Read EVERY attached document completely, page by page, including tables, charts, footnotes and appendices. Do not summarise loosely — EXTRACT.

Write an evidence digest in ${lang}, organised under these headings:
1. Market size & growth (TAM/SAM/SOM figures, CAGR, years, currencies, regions, methodology, sources)
2. Segments, industries & geographies (included/excluded, shares, sizes)
3. Customers & buying behaviour (target groups, named customers, pains, needs, buying center, willingness to pay, procurement cycles)
4. Competitors (names, offerings, prices, market shares, strengths/weaknesses, positioning)
5. Pricing, costs & business model (prices, margins, cost structure, target costs)
6. Value chain & industry structure (stages, players, margins, supplier/buyer power, substitutes, entry barriers)
7. PESTEL factors (regulations, standards, policies, economic/social/technological/environmental trends)
8. Technology & product (features, differentiation, maturity)
9. Sales, go-to-market & pipeline (channels, capacity, hit rates, pilots, leads)
10. Risks, assumptions & open questions
11. Strengths / weaknesses / opportunities / threats evident from the documents

Rules: bullet points; keep EVERY concrete number, unit, year, name and table value; add the source file and page/section in brackets, e.g. [report.pdf, p.12]; never invent; write "no evidence" under a heading with nothing. Be dense: this is one part of a larger set, keep it under ~1,500 words, prioritise numbers, names and tables over prose.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions,
      stream: true,
      reasoning: { effort: "low" },
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: `Opportunity anchor:\n${anchor || "(none)"}\n\nDocuments follow. Read them completely and write the digest.` },
          ...toResponsesContent(blocks),
        ],
      }],
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    console.error("Digest gateway error", res.status, t.slice(0, 1000));
    const err: any = new Error(`digest_${res.status}`);
    err.status = res.status;
    throw err;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "", completed = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "response.output_text.delta") out += ev.delta || "";
        else if (ev.type === "response.completed") completed = ev.response?.output_text || "";
        else if (ev.type === "error" || ev.type === "response.failed") console.error("Digest stream error", payload.slice(0, 500));
      } catch { /* partial */ }
    }
  }
  return (out || completed).trim();
}

/** Split long sources into parts and digest them in parallel — one pass over a
 *  300-page report would take longer than the function is allowed to run. */
const DIGEST_CHUNK_CHARS = 90_000;
async function buildEvidenceDigestParallel(blocks: any[], anchor: string, lang: string, apiKey: string): Promise<string> {
  const groups: any[][] = [[]];
  let cur = 0;
  for (const b of blocks) {
    if (b.type === "text" && String(b.text).length > DIGEST_CHUNK_CHARS) {
      const t = String(b.text);
      const head = t.slice(0, t.indexOf("\n") + 1);
      for (let i = 0; i < t.length; i += DIGEST_CHUNK_CHARS) {
        const part = i === 0 ? t.slice(0, DIGEST_CHUNK_CHARS) : head + "[continued]\n" + t.slice(i, i + DIGEST_CHUNK_CHARS);
        groups.push([{ type: "text", text: part }]);
      }
    } else if (b.type !== "text") {
      groups.push([b]);
    } else {
      if (cur + String(b.text).length > DIGEST_CHUNK_CHARS) { groups.push([]); cur = 0; }
      groups[groups.length - 1].push(b);
      cur += String(b.text).length;
    }
  }
  const work = groups.filter((g) => g.length > 0);
  const settled = await Promise.allSettled(work.map((g, i) =>
    new Promise((r) => setTimeout(r, i * 300)).then(() => digestPart(g, anchor, lang, apiKey))));
  const ok = settled.filter((r) => r.status === "fulfilled").map((r: any) => r.value as string).filter(Boolean);
  const denied: any = settled.find((r: any) => r.status === "rejected" && r.reason?.status === 402);
  if (denied) throw denied.reason;
  return ok.map((d, i) => `### Digest part ${i + 1}/${ok.length}\n${d}`).join("\n\n");
}

/** The upstream gateway intermittently returns 429/5xx, and Gemini occasionally
 *  returns MALFORMED_FUNCTION_CALL on the larger schemas. Retry with exponential
 *  backoff and fall back to a second model before giving up on a section. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runSectionWithRetry(
  scope: SectionScope,
  blocks: any[],
  anchor: string,
  lang: string,
  apiKey: string,
): Promise<any> {
  const models = [
    "google/gemini-2.5-flash",
    "google/gemini-2.5-flash",
    "google/gemini-2.5-flash-lite",
    "google/gemini-2.5-pro",
  ];
  let lastError: any;

  for (let attempt = 0; attempt < models.length; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(8000, 1000 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 400);
      console.warn(`Section ${scope} retry ${attempt} with ${models[attempt]} after ${wait}ms`);
      await sleep(wait);
    }
    try {
      const result = await runSection(scope, blocks, anchor, lang, apiKey, models[attempt]);
      if (result && Object.keys(result).length > 0) return result;
      lastError = new Error(`empty_result_${scope}`);
    } catch (e: any) {
      lastError = e;
      // Don't burn retries on non-transient failures.
      if (e?.status === 402) throw e;
      if (e?.status && e.status !== 429 && e.status < 500) throw e;
    }
  }
  throw lastError ?? new Error(`section_failed_${scope}`);
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json() as {
      opportunityId: string;
      fileIds?: string[];
      scanKeys?: string[];
      scope?: "all" | "overview" | "tam" | "sam" | "som";
      language?: "en" | "de";
      context?: Record<string, any>;
      extractedTexts?: { fileId: string; name?: string; text: string; pages?: number }[];
    };

    const fileIds = body.fileIds ?? [];
    const scanKeys = body.scanKeys ?? [];
    if (!body.opportunityId || (fileIds.length === 0 && scanKeys.length === 0)) {
      return new Response(JSON.stringify({ error: "no_files", message: "Please select at least one attachment or scan pack output." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scope = body.scope || "all";
    const lang = body.language === "de" ? "German" : "English";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    binaryBudgetUsed = 0;
    const blocks: any[] = [];
    const usedFiles: string[] = [];

    if (fileIds.length > 0) {
      const { data: files } = await supabase
        .from("opportunity_files")
        .select("id, file_name, file_path, mime_type, file_size, comment")
        .eq("opportunity_id", body.opportunityId)
        .in("id", fileIds);

      const provided = new Map<string, { name: string; text: string; pages: number }>();
      for (const t of (body.extractedTexts ?? [])) {
        if (t && typeof t.fileId === "string" && typeof t.text === "string") {
          provided.set(t.fileId, { name: String(t.name || ""), text: t.text.slice(0, MAX_PDF_CHARS), pages: Number(t.pages) || 0 });
        }
      }
      for (const f of files ?? []) {
        const pre = provided.get((f as any).id);
        if (pre) {
          if (f.comment) blocks.push({ type: "text", text: `User note on "${f.file_name}": ${f.comment}` });
          const label = pre.pages > 0 ? `PDF, ${pre.pages} pages, full text` : "extracted content";
          blocks.push({ type: "text", text: `--- File: ${f.file_name} (${label}) ---\n${pre.text}\n--- End of ${f.file_name} ---` });
          usedFiles.push(f.file_name);
          continue;
        }
        if ((f.file_size || 0) > MAX_BYTES) {
          blocks.push({ type: "text", text: `[Attachment "${f.file_name}" too large, skipped.]` });
          continue;
        }
        const { data, error } = await supabase.storage.from("opportunity-files").download(f.file_path);
        if (error || !data) continue;
        const buf = new Uint8Array(await data.arrayBuffer());
        if (f.comment) blocks.push({ type: "text", text: `User note on "${f.file_name}": ${f.comment}` });
        const block = await toContentBlock(f.file_name, f.mime_type || "", buf);
        blocks.push(block);
        if (classify(f.mime_type || "", f.file_name) !== "unsupported") usedFiles.push(f.file_name);
      }
    }

    // Scan Pack outputs (summaries, key findings, uploaded deliverables)
    if (scanKeys.length > 0) {
      const { data: oppRow } = await supabase
        .from("opportunities")
        .select("scan_pack")
        .eq("id", body.opportunityId)
        .maybeSingle();
      const pack: any = (oppRow as any)?.scan_pack ?? {};
      const SCAN_LABELS: Record<string, string> = {
        industry: "Industry Study",
        customer: "Customer Scan",
        competitor: "Competitor Scan",
        market_potential: "Market Potential Scan",
        buying_center: "Buying Center Scan",
        assembler: "Scan Pack Assembler",
      };
      for (const k of scanKeys) {
        const card = pack?.[k];
        if (!card) continue;
        const label = SCAN_LABELS[k] || k;
        const parts: string[] = [`=== Scan Pack — ${label} ===`, `Status: ${card.status || "unknown"}`];
        if (card.summary) parts.push(`Summary:\n${card.summary}`);
        if (Array.isArray(card.keyFindings) && card.keyFindings.length) {
          parts.push(`Key findings:\n- ${card.keyFindings.join("\n- ")}`);
        }
        blocks.push({ type: "text", text: parts.join("\n\n") });

        for (const meta of (card.files ?? []) as any[]) {
          if ((meta.size || 0) > MAX_BYTES) {
            blocks.push({ type: "text", text: `[Scan deliverable "${meta.name}" too large, skipped.]` });
            continue;
          }
          const { data, error } = await supabase.storage.from("scan-deliverables").download(meta.path);
          if (error || !data) continue;
          const buf = new Uint8Array(await data.arrayBuffer());
          const displayName = `[${label}] ${meta.name}`;
          const block = await toContentBlock(displayName, meta.mime || "", buf);
          blocks.push(block);
          if (classify(meta.mime || "", meta.name) !== "unsupported") usedFiles.push(displayName);
        }
      }
    }

    if (blocks.length === 0) {
      return new Response(JSON.stringify({ error: "no_files", message: "Selected sources could not be loaded." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = body.context || {};
    const anchor = [
      ctx.title ? `Title: ${ctx.title}` : "",
      ctx.description ? `Problem: ${ctx.description}` : "",
      ctx.solutionDescription ? `Solution & differentiator: ${ctx.solutionDescription}` : "",
      ctx.industry ? `Industry: ${ctx.industry}` : "",
      ctx.geography ? `Geography: ${ctx.geography}` : "",
      ctx.technology ? `Technology: ${ctx.technology}` : "",
    ].filter(Boolean).join("\n");

    // For a single-area scope (tam/sam/som), also run the "overview" section so
    // the TAM/SAM/SOM Overview text fields get proposed alongside the models.
    const sections: SectionScope[] = scope === "all"
      ? ["overview", "tam", "sam", "sam_customers", "som", "som_models"]
      : scope === "overview"
      ? ["overview"]
      : scope === "sam"
      ? ["sam", "sam_customers", "overview"]
      : scope === "tam"
      ? ["tam", "sam_customers", "overview"]
      : scope === "som"
      ? ["som", "som_models", "sam_customers", "overview"]
      : [scope, "overview"];


    // The whole extraction can take several minutes. The platform kills any
    // request that sends no bytes for 150s (IDLE_TIMEOUT), so we stream the
    // response: harmless whitespace keepalives while we work, then the JSON
    // payload (leading whitespace is valid JSON, so the client parses it).
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let done = false;
        const keepAlive = setInterval(() => {
          if (!done) {
            try { controller.enqueue(encoder.encode(" ")); } catch { /* closed */ }
          }
        }, 10_000);

        const finish = (payload: unknown) => {
          done = true;
          clearInterval(keepAlive);
          try { controller.enqueue(encoder.encode(JSON.stringify(payload))); } catch { /* closed */ }
          controller.close();
        };

        try {
          // Run sections in parallel, staggered by 400ms so we don't hit the
          // gateway with N identical multi-document calls in the same instant.
          // Run sections sequentially: each request serializes all attachments,
          // so parallel calls multiplied memory usage and crashed the function.
          // Pass 1: full-read evidence digest. On success, sections work from
          // the digest (plus light text sources) instead of re-reading PDFs.
          let sectionBlocks = blocks;
          try {
            const digest = await buildEvidenceDigestParallel(blocks, anchor, lang, LOVABLE_API_KEY);
            if (digest.length > 500) {
              const textBlocks = blocks.filter((b) => b.type === "text" && String(b.text).length < 20_000);
              sectionBlocks = [
                { type: "text", text: `=== EVIDENCE DIGEST (complete extraction from all source documents; primary evidence) ===\n${digest}\n=== END DIGEST ===` },
                ...textBlocks,
              ];
            }
          } catch (e: any) {
            if (e?.status === 402) throw e;
            console.warn("Digest failed, falling back to raw documents", e);
          }

          const results: PromiseSettledResult<any>[] = [];
          for (const s of sections) {
            try {
              results.push({ status: "fulfilled", value: await runSectionWithRetry(s, sectionBlocks, anchor, lang, LOVABLE_API_KEY) });
            } catch (reason) {
              results.push({ status: "rejected", reason });
            }
          }

          const proposal: any = {};
          const failures: string[] = [];
          results.forEach((r, i) => {
            const s = sections[i];
            if (r.status === "fulfilled") {
              let value: any = r.value || {};
              // When "overview" is run as a companion to a single-area scope,
              // keep only that area's overview.* to avoid unrelated fields.
              if (s === "overview" && scope !== "all" && scope !== "overview" && value?.overview) {
                value = { overview: { [scope]: value.overview[scope] } };
              }
              for (const k of Object.keys(value)) {
                proposal[k] = { ...(proposal[k] || {}), ...(value[k] || {}) };
              }
            } else {
              console.error(`Section ${s} failed`, r.reason);
              failures.push(s);
            }
          });

          if (Object.keys(proposal).length === 0) {
            const firstErr: any = results.find((r) => r.status === "rejected") as any;
            const st = firstErr?.reason?.status;
            const message = st === 429
              ? "Rate limit exceeded — please wait a moment and try again."
              : st === 402
              ? "AI credits exhausted."
              : st === 503
              ? "The AI service is temporarily overloaded. Please try again in a minute."
              : "IDA could not extract any fields. Try again or select different documents.";
            finish({ error: message });
            return;
          }

          finish({ proposal, filesUsed: usedFiles, scope, failedSections: failures });
        } catch (e) {
          console.error("ida-business-plan-extraction stream error", e);
          finish({ error: e instanceof Error ? e.message : "Unknown" });
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("ida-business-plan-extraction error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
