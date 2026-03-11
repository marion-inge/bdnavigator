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
--   "risk":                 { "score": 3, "comment": "" }
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
-- JSON Structure: business_plan (vollständig)
-- Typen definiert in: src/lib/businessPlanTypes.ts, src/lib/types.ts
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
--     "geographicalRegions": [               -- GeographicalRegion[]
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
--     "salesChannelAnalysis": {               -- SalesChannelAnalysis (optional)
--       "entries": [{                         -- SalesChannelEntry[]
--         "id": "uuid",
--         "channelName": "",
--         "channelType": "direct|indirect|digital|partner|other",
--         "reach": "",
--         "costLevel": "low|medium|high",
--         "targetSegments": "",
--         "rating": 3,                        -- 1-5
--         "notes": ""
--       }],
--       "channelStrategy": "",
--       "channelMix": ""
--     }
--   },
--
--   "somOverview": {                          -- SomOverviewData
--     "projections": [                        -- MarketYearValue[] (5 Jahre)
--       { "year": 1, "value": 0 },
--       { "year": 2, "value": 0 },
--       { "year": 3, "value": 0 },
--       { "year": 4, "value": 0 },
--       { "year": 5, "value": 0 }
--     ],
--     "marketShareVsSam": "",
--     "growthRate": "",
--     "visibilityRate": "",
--     "salesCapacity": "",
--     "pipeline": "",
--     "licenseToOperate": "",
--     "salesCapacityScenario": "",
--     "marketingBudgetScenario": "",
--     "positioningScenario": "",
--     "geographicalRegions": [...],
--     "portfolioCoveragePct": 0,              -- optional, für Business Case Bridge
--     "visibilityPct": 0,                     -- optional
--     "visibilityGrowthPct": 0,               -- optional
--     "hitratePct": 0                         -- optional
--   },
--
--   "combinedInterpretation": {               -- CombinedInterpretation
--     "overallPotential": "",
--     "samDevelopment": "",
--     "somDevelopment": "",
--     "gapsAndLevers": ""
--   },
--
--   "marketAttractiveness": {                 -- Detailed Scoring
--     "score": 3,
--     "analysis": {                           -- DetailedMarketAnalysis
--       "tam": "", "tamDescription": "",
--       "tamProjections": [{"year":1,"value":0}],
--       "sam": "", "samDescription": "",
--       "samProjections": [{"year":1,"value":0}],
--       "marketGrowthRate": "",
--       "targetCustomers": "",
--       "customerRelationship": "",
--       "customerSegments": [                 -- CustomerSegment[]
--         { "name": "", "size": 0, "description": "" }
--       ],
--       "competitors": "",
--       "competitivePosition": "",
--       "competitorEntries": [                -- CompetitorEntry[]
--         { "name": "", "marketShare": 0, "threatLevel": 3,
--           "dimensionRatings": [             -- CompetitorDimensionRating[] (optional)
--             { "dimension": "", "score": 3, "comment": "" }
--           ]
--         }
--       ],
--       "geographicalRegions": [...]
--     }
--   }
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
