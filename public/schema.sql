-- ============================================================
-- BD Navigator – Database Schema (Reference)
-- Matches the current Lovable Cloud (Supabase) schema
-- Last updated: 2026-03-11
-- ============================================================

-- 1. Opportunities (Haupttabelle)
CREATE TABLE IF NOT EXISTS opportunities (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  solution_description   TEXT NOT NULL DEFAULT '',
  industry               TEXT NOT NULL DEFAULT '',
  geography              TEXT NOT NULL DEFAULT '',
  technology             TEXT NOT NULL DEFAULT '',
  owner                  TEXT NOT NULL DEFAULT '',
  idea_bringer           TEXT NOT NULL DEFAULT '',
  stage                  TEXT NOT NULL DEFAULT 'idea',
  scoring                JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_plan          JSONB DEFAULT NULL,
  investment_case        JSONB DEFAULT NULL,
  business_case          JSONB DEFAULT NULL,
  strategic_analyses     JSONB DEFAULT NULL,
  go_to_market_plan      JSONB DEFAULT NULL,
  implement_review       JSONB DEFAULT NULL,
  rough_scoring_answers  JSONB DEFAULT NULL,
  rough_scoring_comments JSONB DEFAULT NULL,
  rough_scoring_sources  JSONB DEFAULT NULL,
  gates                  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stage values:
--   idea, rough_scoring, gate1, business_plan, gate2,
--   investment_case, gate3, business_case, go_to_market,
--   implement_review, closed

-- 2. AI Assessments (KI-Bewertungen)
CREATE TABLE IF NOT EXISTS ai_assessments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   TEXT NOT NULL,
  basis            TEXT NOT NULL DEFAULT 'idea_scoring',
  summary          TEXT NOT NULL,
  overall_rating   TEXT NOT NULL,
  strengths        JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses       JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps       JSONB NOT NULL DEFAULT '[]'::jsonb,
  pitfalls         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one assessment per opportunity + basis
-- ALTER TABLE ai_assessments ADD CONSTRAINT ai_assessments_opportunity_basis_unique
--   UNIQUE (opportunity_id, basis);

-- 3. Opportunity Files (Dateianhänge)
CREATE TABLE IF NOT EXISTS opportunity_files (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id   UUID NOT NULL,
  file_name        TEXT NOT NULL,
  file_path        TEXT NOT NULL,
  file_size        BIGINT NOT NULL DEFAULT 0,
  mime_type        TEXT NOT NULL DEFAULT '',
  comment          TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Storage bucket for file uploads:
--   Bucket: opportunity-files (public)

-- ============================================================
-- JSON Structure: scoring
-- ============================================================
-- {
--   "marketAttractiveness": { "score": 3, "comment": "" },
--   "strategicFit":         { "score": 3, "comment": "" },
--   "feasibility":          { "score": 3, "comment": "" },
--   "commercialViability":  { "score": 3, "comment": "" },
--   "risk":                 { "score": 3, "comment": "" },
--
--   "detailed": {                              -- Detailed Scoring (populated during Business Plan)
--     "strategicFit": {                        -- Strategic Fit analysis
--       "score": 3, "details": "",
--       "alignmentDimensions": [{ "key": "", "label": "", "current": 3, "required": 4 }],
--       "capabilityGaps": [{ "id": "", "capability": "", "currentLevel": 0, "requiredLevel": 0, "action": "", "priority": "high" }]
--     },
--     "feasibility": {                         -- Feasibility analysis
--       "score": 3, "details": "", "trl": 0,
--       "milestones": [{ "id": "", "name": "", "targetDate": "", "status": "planned" }]
--     },
--     "commercialViability": {                 -- Commercial viability
--       "score": 3, "details": "", "pricingModel": "", "unitPrice": 0, "grossMargin": 0,
--       "projections": [{ "year": 1, "revenue": 0, "costs": 0 }], "breakEvenUnits": 0
--     },
--     "risk": {                                -- Risk assessment
--       "score": 3, "details": "",
--       "riskItems": [{ "id": "", "name": "", "category": "market", "probability": 0, "impact": 0, "mitigation": "" }]
--     },
--     "competitorLandscape": { "score": 3, "analysis": { ... } },
--     "organisationalReadiness": { "score": 3, "culture": "", "processes": "", "skills": "", "leadership": "", "resources": "", "stakeholders": "", "details": "" },
--     "pilotCustomer": { "score": 3, "entries": [...], "notes": "" },
--     "portfolioFit": { "score": 3, "dimensions": [...], "cannibalizationRisk": "", "crossSellingPotential": "", "sharedResources": "", "notes": "" }
--   }
-- }

-- ============================================================
-- JSON Structure: gates (array)
-- ============================================================
-- [
--   {
--     "id": "uuid",
--     "gate": "gate1" | "gate2" | "gate3",
--     "decision": "go" | "hold" | "no-go",
--     "comment": "",
--     "decider": "",
--     "date": "2025-01-15",
--     "meetingNotes": ""
--   }
-- ]

-- ============================================================
-- JSON Structure: business_plan
-- Nur Marktmodellierung (TAM/SAM/SOM) + KI-Estimations.
-- Detailed Scoring Keys wurden nach scoring.detailed verschoben.
-- Typen: src/lib/businessPlanTypes.ts, src/lib/types.ts
-- ============================================================
-- {
--   "tamOverview": {                          -- TamOverviewData
--     "scopeDefinition": "",
--     "geographicCoverage": "",
--     "assumptions": "",
--     "scopeExclusions": "",
--     "fullGlobalPotential": "",
--     "marketDevelopment": "",
--     "drivers": "",
--     "sources": "",
--     "sourceAssessment": "",
--     "derivationMethod": "",
--     "supportingModelNotes": "",
--     "geographicalRegions": [
--       { "region": "", "potential": 3, "marketSize": "", "notes": "" }
--     ]
--   },
--
--   "samOverview": {                          -- SamOverviewData
--     "samVsTamExplanation": "",
--     "includedIndustries": "",
--     "excludedIndustries": "",
--     "geographicFocus": "",
--     "geographicExclusions": "",
--     "targetGroups": "",
--     "unreachableGroups": "",
--     "relevanceOutlook": "",
--     "featureAdaptations": "",
--     "priceEvolution": "",
--     "resourceScenarios": "",
--     "requiredInvestments": "",
--     "geographicalRegions": [...],
--     "salesChannelAnalysis": {               -- optional
--       "entries": [{ "id": "", "channelName": "", "channelType": "direct|indirect|digital|partner|other", "reach": "", "costLevel": "low|medium|high", "targetSegments": "", "rating": 3, "notes": "" }],
--       "channelStrategy": "",
--       "channelMix": ""
--     }
--   },
--
--   "somOverview": {                          -- SomOverviewData
--     "projections": [{ "year": 1, "value": 0 }, ...],
--     "marketShareVsSam": "", "growthRate": "", "visibilityRate": "",
--     "salesCapacity": "", "pipeline": "", "licenseToOperate": "",
--     "salesCapacityScenario": "", "marketingBudgetScenario": "", "positioningScenario": "",
--     "geographicalRegions": [...],
--     "portfolioCoveragePct": 0, "visibilityPct": 0, "visibilityGrowthPct": 0, "hitratePct": 0
--   },
--
--   "combinedInterpretation": { "overallPotential": "", "samDevelopment": "", "somDevelopment": "", "gapsAndLevers": "" },
--
--   "marketAttractiveness": {                 -- Customer/Market Landscape (bleibt in business_plan)
--     "score": 3,
--     "analysis": {                           -- DetailedMarketAnalysis
--       "tam": "", "tamDescription": "",
--       "tamProjections": [{"year":1,"value":0}],
--       "sam": "", "samDescription": "",
--       "samProjections": [{"year":1,"value":0}],
--       "marketGrowthRate": "", "targetCustomers": "", "customerRelationship": "",
--       "customerSegments": [{ "name": "", "size": 0, "description": "" }],
--       "competitors": "", "competitivePosition": "",
--       "competitorEntries": [{ "name": "", "marketShare": 0, "threatLevel": 3, "dimensionRatings": [...] }],
--       "geographicalRegions": [...]
--     }
--   },
--
--   "tamEstimation": { ... },                 -- IDA KI-Schätzung (persistiert)
--   "samEstimation": { ... },                 -- IDA KI-Schätzung (persistiert)
--   "somEstimation": { ... }                  -- IDA KI-Schätzung (persistiert)
-- }

-- ============================================================
-- JSON Structure: strategic_analyses
-- ============================================================
-- {
--   "ideaScoring": {
--     "ansoff":    { "position":"", "description":"", "rationale":"" },
--     "bcg":       { "position":"", "description":"", "rationale":"" },
--     "mckinsey":  { "position":"", "description":"", "rationale":"" },
--     "swot":      { "strengths":"", "weaknesses":"", "opportunities":"", "threats":"", ... },
--     "pestel":    { "political":"", "economic":"", "social":"", "technological":"", "environmental":"", "legal":"", ... },
--     "porter":    { "competitiveRivalry": {"intensity":3,"description":""}, ... }
--   },
--   "tam": { ... },
--   "sam": { ... },
--   "som": { ... }
-- }

-- ============================================================
-- RLS Policies (all tables: public read/write)
-- ============================================================
-- All tables use permissive ALL policy with (true) for public access.
-- No authentication is currently required.
