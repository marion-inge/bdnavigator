/**
 * AI Proxy – Local replacements for Supabase Edge Functions.
 *
 * Environment variables:
 *   OPENAI_API_KEY     – OpenAI-compatible API key (for IDA assessments & estimations)
 *   AI_BASE_URL        – Override AI endpoint (default: https://api.openai.com/v1/chat/completions)
 *   AI_MODEL           – Override model name (default: gpt-4o-mini)
 *   PERPLEXITY_API_KEY – Perplexity API key (for Mark web research)
 *
 * All routes are mounted under /api/ and mirror the Edge Function request/response format.
 */

const express = require("express");
const router = express.Router();

// --- Config ---
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function getAIKey() {
  return process.env.OPENAI_API_KEY || "";
}
function getPerplexityKey() {
  return process.env.PERPLEXITY_API_KEY || "";
}

// --- Shared: call AI with tool calling ---
async function callAI({ systemPrompt, userPrompt, tools, toolChoice }) {
  const apiKey = getAIKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Set it in the server environment.");

  const body = {
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  if (tools) body.tools = tools;
  if (toolChoice) body.tool_choice = toolChoice;

  const res = await fetch(AI_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`AI API error [${res.status}]:`, text);
    const error = new Error(`AI API error: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data;
}

function extractToolArgs(data) {
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error("No structured response from AI");
  }
  return JSON.parse(toolCall.function.arguments);
}

// ============================================================
// 1) ai-assessment  (IDA – Idea Scoring Assessment)
// ============================================================
router.post("/ai-assessment", async (req, res) => {
  try {
    const { scoring, answers, comments, questionTexts, title, description, solutionDescription, industry, geography, technology, ideaBringer, owner, language } = req.body;

    const lang = language === "de" ? "German" : "English";
    const langKey = language === "de" ? "de" : "en";

    const scoringInfo = Object.entries(scoring || {})
      .map(([key, val]) => `- ${key}: Score ${val.score}/5 (Confidence: ${val.confidence})`)
      .join("\n");

    const answersInfo = Object.entries(answers || {})
      .map(([key, val]) => {
        const qText = questionTexts?.[key]?.[langKey] || key;
        const comment = comments?.[key];
        let line = `- ${qText}: ${val}/5`;
        if (comment) line += `\n  User comment: "${comment}"`;
        return line;
      })
      .join("\n");

    const metadataLines = [
      title ? `Title: ${title}` : "",
      description ? `Problem Description: ${description}` : "",
      solutionDescription ? `Solution Idea & Differentiator: ${solutionDescription}` : "",
      industry ? `Industry: ${industry}` : "",
      geography ? `Target Geography: ${geography}` : "",
      technology ? `Technology: ${technology}` : "",
      ideaBringer ? `Initiator: ${ideaBringer}` : "",
      owner ? `BD Team Owner: ${owner}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are a senior business innovation analyst with deep expertise in technology commercialization, market analysis, and corporate strategy. Analyze innovation opportunities thoroughly and provide structured, actionable assessments. Pay special attention to the user's own comments and rationale on each criterion – they contain valuable domain knowledge and context. Always respond in ${lang}.`;

    const userPrompt = `Analyze this innovation opportunity and provide a structured assessment.\n\n${metadataLines}\n\nCategory Scores (weighted averages):\n${scoringInfo}\n\nDetailed Criterion Ratings and User Comments:\n${answersInfo}\n\nBased on the scores, the opportunity context, AND the user's own comments, provide your assessment using the suggest_assessment tool. Reference specific criteria, user comments, and the opportunity metadata (industry, geography, technology, solution approach) in your analysis where relevant.`;

    const tools = [{
      type: "function",
      function: {
        name: "suggest_assessment",
        description: "Return a structured innovation assessment.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-3 sentence overall summary." },
            strengths: { type: "array", items: { type: "string" }, description: "2-4 key strengths." },
            weaknesses: { type: "array", items: { type: "string" }, description: "2-4 key weaknesses." },
            nextSteps: { type: "array", items: { type: "string" }, description: "3-5 concrete recommended next steps." },
            pitfalls: { type: "array", items: { type: "string" }, description: "5-6 potential pitfalls." },
            overallRating: { type: "string", enum: ["very_promising", "promising", "moderate", "challenging", "critical"] },
          },
          required: ["summary", "strengths", "weaknesses", "nextSteps", "pitfalls", "overallRating"],
          additionalProperties: false,
        },
      },
    }];

    const data = await callAI({ systemPrompt, userPrompt, tools, toolChoice: { type: "function", function: { name: "suggest_assessment" } } });
    res.json(extractToolArgs(data));
  } catch (e) {
    console.error("ai-assessment error:", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ============================================================
// 2) business-case-assessment  (IDA – Financial Assessment)
// ============================================================
router.post("/business-case-assessment", async (req, res) => {
  try {
    const { kpis, parameters, yearData, title, description, industry, technology, language } = req.body;
    const lang = language === "de" ? "German" : "English";

    const systemPrompt = `You are IDA, a senior financial analyst and business case evaluator with deep expertise in investment analysis, corporate finance, and technology commercialization. You analyze investment cases by evaluating KPIs like ROCE, NPV, Payback Period, EBIT margins, cash flow trajectories, and working capital efficiency. You provide structured, actionable assessments with clear recommendations. Always respond in ${lang}.`;

    const kpiLines = [
      `Total ROCE (avg): ${(kpis.totalROCE * 100).toFixed(1)}%`,
      `NPV: €${(kpis.npv / 1000).toFixed(0)}k`,
      `Payback Period: ${kpis.paybackPeriod !== null ? `${kpis.paybackPeriod.toFixed(1)} years` : "Not reached"}`,
      `Total EBIT: €${(kpis.totalEbit / 1000).toFixed(0)}k`,
      `Total Sales: €${(kpis.totalSales / 1000).toFixed(0)}k`,
      `WACC: ${parameters.wacc}%`,
      `Project Duration: ${parameters.projectDuration} years`,
    ].join("\n");

    const yearLines = yearData.map((y) =>
      `${y.year}: Sales €${(y.sales / 1000).toFixed(0)}k | EBIT €${(y.ebit / 1000).toFixed(0)}k (${(y.ebitPct * 100).toFixed(1)}%) | ROCE ${(y.roce * 100).toFixed(1)}% | CF €${(y.annualCashFlow / 1000).toFixed(0)}k`
    ).join("\n");

    const totalInvest = yearData.reduce((s, y) => s + y.totalInvestment, 0);
    const totalRD = yearData.reduce((s, y) => s + y.totalRD, 0);
    const paramLines = [
      `Market Size: €${(parameters.marketSize / 1000).toFixed(0)}k`,
      `Market Growth Rate: ${parameters.marketGrowthRate}%`,
      `Portfolio Coverage: ${parameters.portfolioCoverage}%`,
      `Total Investment: €${(totalInvest / 1000).toFixed(0)}k`,
      `Total R&D: €${(totalRD / 1000).toFixed(0)}k`,
    ].join("\n");

    const contextLines = [
      title ? `Project: ${title}` : "",
      description ? `Description: ${description}` : "",
      industry ? `Industry: ${industry}` : "",
      technology ? `Technology: ${technology}` : "",
    ].filter(Boolean).join("\n");

    const userPrompt = `Analyze this investment case / business case and provide a structured financial assessment.\n\n${contextLines}\n\nKey Performance Indicators:\n${kpiLines}\n\nParameters & Assumptions:\n${paramLines}\n\nYear-by-Year Breakdown:\n${yearLines}\n\nProvide your assessment using the suggest_assessment tool.`;

    const tools = [{
      type: "function",
      function: {
        name: "suggest_assessment",
        description: "Return a structured business case assessment.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            pitfalls: { type: "array", items: { type: "string" } },
            overallRating: { type: "string", enum: ["very_promising", "promising", "moderate", "challenging", "critical"] },
          },
          required: ["summary", "strengths", "weaknesses", "nextSteps", "pitfalls", "overallRating"],
          additionalProperties: false,
        },
      },
    }];

    const data = await callAI({ systemPrompt, userPrompt, tools, toolChoice: { type: "function", function: { name: "suggest_assessment" } } });
    res.json(extractToolArgs(data));
  } catch (e) {
    console.error("business-case-assessment error:", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ============================================================
// 3) mark-web-research  (Mark – Perplexity Web Research)
// ============================================================
function buildMarkPrompt(body) {
  const { researchType, opportunity, extra, language } = body;
  const lang = language === "de" ? "German" : "English";
  const ctx = `Industry: ${opportunity.industry}\nGeography: ${opportunity.geography}\nTechnology: ${opportunity.technology}\nOpportunity: ${opportunity.title}\nDescription: ${opportunity.description}\nSolution: ${opportunity.solutionDescription || "N/A"}`;

  const prompts = {
    pestel: `You are a strategic market research analyst. Conduct a PESTEL analysis for the following business opportunity. Provide specific, current, factual findings with sources for each of the 6 dimensions (Political, Economic, Social, Technological, Environmental, Legal).\n\n${ctx}\n\nRespond in ${lang}. Include specific data points, recent legislation, market statistics, and trends. Cite sources where possible. End with a brief overall assessment.`,
    porter: `You are a competitive strategy analyst. Conduct a Porter's Five Forces analysis for the following business opportunity.\n\n${ctx}\n\nRespond in ${lang}. Cover all 5 forces with specific company names, market data. Cite sources.`,
    tam: `You are a market sizing specialist. Research and provide Total Addressable Market (TAM) data for the following business opportunity.\n\n${ctx}\n\nRespond in ${lang}. Provide current global market size, projected size with CAGR, key segments, regional breakdown for ${opportunity.geography}. Cite all sources.`,
    competitor: `You are a competitive intelligence analyst. Research the competitive landscape for the following business opportunity.\n\n${ctx}\n${extra?.competitorNames ? `Known competitors to research: ${extra.competitorNames}` : ""}\n\nRespond in ${lang}. For each competitor provide overview, market share, products, strengths, weaknesses, recent moves. Cite sources.`,
  };
  return prompts[researchType] || `Research the following topic in ${lang}: ${ctx}`;
}

router.post("/mark-web-research", async (req, res) => {
  try {
    const apiKey = getPerplexityKey();
    if (!apiKey) {
      return res.status(500).json({ error: "PERPLEXITY_API_KEY is not configured. Set it in the server environment." });
    }

    const body = req.body;
    if (!body.researchType || !body.opportunity) {
      return res.status(400).json({ error: "Missing researchType or opportunity" });
    }

    const prompt = buildMarkPrompt(body);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are Mark, a meticulous market research agent. Provide well-structured, factual, source-backed research. Always cite your sources." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Perplexity API error [${response.status}]:`, errText);
      return res.status(502).json({ error: `Perplexity API error: ${response.status}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];
    res.json({ content, citations });
  } catch (e) {
    console.error("mark-web-research error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// 4-6) TAM / SAM / SOM Estimation  (IDA – Market Sizing)
// ============================================================

// Shared scenario tool schema
function scenarioProperties() {
  return {
    projections: { type: "array", items: { type: "object", properties: { year: { type: "number" }, value: { type: "number" } }, required: ["year", "value"] } },
    cagr: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    rationale: { type: "string" },
  };
}

function estimationTool(name) {
  return [{
    type: "function",
    function: {
      name,
      description: `Return ${name.replace("_", " ")} with 3 scenarios`,
      parameters: {
        type: "object",
        properties: {
          methodology: { type: "string" },
          keyDifferentiators: { type: "string" },
          conservative: { type: "object", properties: scenarioProperties(), required: ["projections", "cagr", "assumptions", "rationale"] },
          base: { type: "object", properties: scenarioProperties(), required: ["projections", "cagr", "assumptions", "rationale"] },
          optimistic: { type: "object", properties: scenarioProperties(), required: ["projections", "cagr", "assumptions", "rationale"] },
        },
        required: ["methodology", "keyDifferentiators", "conservative", "base", "optimistic"],
        additionalProperties: false,
      },
    },
  }];
}

// --- TAM ---
router.post("/tam-estimation", async (req, res) => {
  try {
    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, strategicData, tamPageData } = req.body;
    const lang = language === "de" ? "German" : "English";

    const sections = [];

    if (tamPageData) {
      const tp = tamPageData;
      const tamFields = [];
      if (tp.scopeDefinition) tamFields.push(`- TAM Scope & Definition: ${tp.scopeDefinition}`);
      if (tp.scopeExclusions) tamFields.push(`- Scope Exclusions: ${tp.scopeExclusions}`);
      if (tp.fullGlobalPotential) tamFields.push(`- Full Global Potential: ${tp.fullGlobalPotential}`);
      if (tp.assumptions) tamFields.push(`- Market Assumptions: ${tp.assumptions}`);
      if (tp.marketDevelopment) tamFields.push(`- Market Development: ${tp.marketDevelopment}`);
      if (tp.drivers) tamFields.push(`- Drivers & Trends: ${tp.drivers}`);
      if (tp.geographicCoverage) tamFields.push(`- Geographic Coverage: ${tp.geographicCoverage}`);
      if (tp.manualProjections?.length) {
        tamFields.push(`- User's Manual TAM Projections: ${tp.manualProjections.map((p) => `Year ${p.year}: ${p.value} M€`).join(", ")}`);
      }
      if (tamFields.length) sections.push(`## User-Entered TAM Data\n${tamFields.join("\n")}`);
    }

    if (strategicData) {
      const sd = strategicData;
      if (sd.marketResearch) sections.push(`## Market Research\n- Sources: ${sd.marketResearch.sources || "N/A"}\n- Key Findings: ${sd.marketResearch.keyFindings || "N/A"}`);
      if (sd.pestel) sections.push(`## PESTEL\n- Political: ${sd.pestel.political || "N/A"}\n- Economic: ${sd.pestel.economic || "N/A"}\n- Social: ${sd.pestel.social || "N/A"}\n- Technological: ${sd.pestel.technological || "N/A"}\n- Environmental: ${sd.pestel.environmental || "N/A"}\n- Legal: ${sd.pestel.legal || "N/A"}`);
      if (sd.porter) sections.push(`## Porter's Five Forces\n- Rivalry: ${sd.porter.rivalry || "N/A"}\n- New Entrants: ${sd.porter.newEntrants || "N/A"}\n- Substitutes: ${sd.porter.substitutes || "N/A"}\n- Buyer Power: ${sd.porter.buyerPower || "N/A"}\n- Supplier Power: ${sd.porter.supplierPower || "N/A"}`);
      if (sd.swot) sections.push(`## SWOT\n- Strengths: ${sd.swot.strengths || "N/A"}\n- Weaknesses: ${sd.swot.weaknesses || "N/A"}\n- Opportunities: ${sd.swot.opportunities || "N/A"}\n- Threats: ${sd.swot.threats || "N/A"}`);
    }

    const systemPrompt = `You are IDA (Internal Data Analyst), a specialized AI for business development market analysis.\nYour task is to estimate the TAM (Total Addressable Market). You MUST respond in ${lang}.\n\nProvide THREE scenarios (Conservative, Base, Optimistic) with 5-year projections in M€, CAGR, assumptions, rationale, methodology, and key differentiators.\n\nUse the tool "tam_estimation" to return your structured response.`;

    const userPrompt = `# Opportunity: ${opportunityTitle}\n## Description: ${opportunityDescription || "N/A"}\n## Solution: ${solutionDescription || "N/A"}\n## Industry: ${industry || "N/A"}\n## Geography: ${geography || "N/A"}\n## Technology: ${technology || "N/A"}\n\n${sections.length ? sections.join("\n\n") : "No strategic analyses available."}\n\nEstimate the TAM in three scenarios.`;

    const data = await callAI({
      systemPrompt, userPrompt,
      tools: estimationTool("tam_estimation"),
      toolChoice: { type: "function", function: { name: "tam_estimation" } },
    });
    res.json(extractToolArgs(data));
  } catch (e) {
    console.error("tam-estimation error:", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

// --- SAM ---
router.post("/sam-estimation", async (req, res) => {
  try {
    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, tamData, scoringData, strategicData, salesChannelAnalysis } = req.body;
    const lang = language === "de" ? "German" : "English";

    const sections = [];
    if (tamData) sections.push(`## TAM\n- Projections: ${JSON.stringify(tamData.tamProjections || [])}\n- Scope: ${tamData.tamOverview?.scopeDefinition || "N/A"}`);
    if (scoringData) {
      const fmt = (c) => c ? Object.entries(c).map(([k, v]) => `  - ${k}: ${v?.score ?? "?"}/5`).join("\n") : "N/A";
      if (scoringData.strategicFit) sections.push(`## Strategic Fit\n${fmt(scoringData.strategicFit)}`);
      if (scoringData.customerLandscape) sections.push(`## Customer Landscape\n${fmt(scoringData.customerLandscape)}`);
    }
    if (salesChannelAnalysis?.entries?.length) {
      sections.push(`## Sales Channels\n${salesChannelAnalysis.entries.map((e) => `- ${e.channelName} (${e.channelType}, Rating: ${e.rating}/5)`).join("\n")}`);
    }

    const systemPrompt = `You are IDA (Internal Data Analyst). Estimate the SAM (Serviceable Addressable Market). Respond in ${lang}.\n\nSAM must be SMALLER than TAM (typically 10-40%). Provide THREE scenarios with 5-year projections in M€.\n\nUse the tool "sam_estimation".`;

    const userPrompt = `# Opportunity: ${opportunityTitle}\n## Description: ${opportunityDescription || "N/A"}\n## Solution: ${solutionDescription || "N/A"}\n## Industry: ${industry || "N/A"}\n## Geography: ${geography || "N/A"}\n## Technology: ${technology || "N/A"}\n\n${sections.join("\n\n") || "No data."}\n\nEstimate the SAM in three scenarios.`;

    const data = await callAI({
      systemPrompt, userPrompt,
      tools: estimationTool("sam_estimation"),
      toolChoice: { type: "function", function: { name: "sam_estimation" } },
    });
    res.json(extractToolArgs(data));
  } catch (e) {
    console.error("sam-estimation error:", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

// --- SOM ---
router.post("/som-estimation", async (req, res) => {
  try {
    const { opportunityTitle, opportunityDescription, solutionDescription, industry, geography, technology, language, tamData, samData, scoringData, strategicData } = req.body;
    const lang = language === "de" ? "German" : "English";

    const sections = [];
    if (tamData) sections.push(`## TAM\n- Projections: ${JSON.stringify(tamData.tamProjections || [])}`);
    if (samData) sections.push(`## SAM\n- Projections: ${JSON.stringify(samData.samProjections || [])}\n- Target Groups: ${samData.targetGroups || "N/A"}`);
    if (scoringData?.competitorLandscape) {
      const fmt = Object.entries(scoringData.competitorLandscape).map(([k, v]) => `  - ${k}: ${v?.score ?? "?"}/5`).join("\n");
      sections.push(`## Competitor Landscape\n${fmt}`);
    }

    const systemPrompt = `You are IDA (Internal Data Analyst). Estimate the SOM (Serviceable Obtainable Market). Respond in ${lang}.\n\nSOM must be SMALLER than SAM (typically 1-20%). Provide THREE scenarios with 5-year projections in M€.\n\nUse the tool "som_estimation".`;

    const userPrompt = `# Opportunity: ${opportunityTitle}\n## Description: ${opportunityDescription || "N/A"}\n## Solution: ${solutionDescription || "N/A"}\n## Industry: ${industry || "N/A"}\n## Geography: ${geography || "N/A"}\n## Technology: ${technology || "N/A"}\n\n${sections.join("\n\n") || "No data."}\n\nEstimate the SOM in three scenarios.`;

    const data = await callAI({
      systemPrompt, userPrompt,
      tools: estimationTool("som_estimation"),
      toolChoice: { type: "function", function: { name: "som_estimation" } },
    });
    res.json(extractToolArgs(data));
  } catch (e) {
    console.error("som-estimation error:", e);
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
