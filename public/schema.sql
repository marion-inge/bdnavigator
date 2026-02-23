-- ============================================================
-- BD Navigator – Database Schema
-- Compatible with: SQLite, PostgreSQL, Supabase
-- ============================================================

-- 1. Opportunities (Haupttabelle)
CREATE TABLE IF NOT EXISTS opportunities (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  industry         TEXT DEFAULT '',
  geography        TEXT DEFAULT '',
  technology       TEXT DEFAULT '',
  owner            TEXT DEFAULT '',
  stage            TEXT NOT NULL DEFAULT 'idea'
                     CHECK (stage IN (
                       'idea','rough_scoring','gate1','detailed_scoring',
                       'gate2','business_case','gate3','go_to_market','closed'
                     )),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),

  -- Rough Scoring (5 Kriterien, je Score 1-5 + Kommentar)
  scoring_market_attractiveness_score    INTEGER DEFAULT 3 CHECK (scoring_market_attractiveness_score BETWEEN 1 AND 5),
  scoring_market_attractiveness_comment  TEXT DEFAULT '',
  scoring_strategic_fit_score            INTEGER DEFAULT 3 CHECK (scoring_strategic_fit_score BETWEEN 1 AND 5),
  scoring_strategic_fit_comment          TEXT DEFAULT '',
  scoring_feasibility_score              INTEGER DEFAULT 3 CHECK (scoring_feasibility_score BETWEEN 1 AND 5),
  scoring_feasibility_comment            TEXT DEFAULT '',
  scoring_commercial_viability_score     INTEGER DEFAULT 3 CHECK (scoring_commercial_viability_score BETWEEN 1 AND 5),
  scoring_commercial_viability_comment   TEXT DEFAULT '',
  scoring_risk_score                     INTEGER DEFAULT 3 CHECK (scoring_risk_score BETWEEN 1 AND 5),
  scoring_risk_comment                   TEXT DEFAULT '',

  -- Rough Scoring Wizard Answers (JSON map: questionId -> answerId)
  rough_scoring_answers                  TEXT DEFAULT NULL,  -- JSON

  -- Detailed Scoring (JSONB-artig als TEXT/JSON gespeichert)
  detailed_scoring                       TEXT DEFAULT NULL,  -- JSON, see structure below

  -- Business Case
  bc_investment_cost     REAL DEFAULT 0,
  bc_expected_revenue    REAL DEFAULT 0,
  bc_roi                 REAL DEFAULT 0,
  bc_break_even_months   REAL DEFAULT 0,
  bc_payback_period      REAL DEFAULT 0,
  bc_npv                 REAL DEFAULT 0,
  bc_notes               TEXT DEFAULT '',

  -- Strategic Analyses (JSONB-artig)
  strategic_analyses     TEXT DEFAULT NULL   -- JSON, see structure below
);

-- 2. Gate Decisions (1:N Beziehung zu Opportunities)
CREATE TABLE IF NOT EXISTS gate_decisions (
  id           TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  gate         TEXT NOT NULL CHECK (gate IN ('gate1','gate2','gate3')),
  decision     TEXT NOT NULL CHECK (decision IN ('go','hold','no-go')),
  comment      TEXT DEFAULT '',
  decider      TEXT DEFAULT '',
  date         TEXT NOT NULL DEFAULT (date('now')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gate_decisions_opp ON gate_decisions(opportunity_id);

-- ============================================================
-- JSON Structure Reference (for detailed_scoring column)
-- ============================================================
--
-- {
--   "marketAttractiveness": {
--     "score": 3,
--     "analysis": {
--       "tam": "", "tamDescription": "",
--       "tamProjections": [{"year":1,"value":0}, ...],   -- 5 entries, value in M€
--       "sam": "", "samDescription": "",
--       "samProjections": [{"year":1,"value":0}, ...],
--       "marketGrowthRate": "",
--       "targetCustomers": "", "customerRelationship": "",
--       "customerSegments": [{"name":"","size":0,"description":""}],
--       "competitors": "", "competitivePosition": "",
--       "competitorEntries": [{"name":"","marketShare":0,"threatLevel":3}],
--       "geographicalRegions": [{"region":"","potential":3,"marketSize":"","notes":""}]
--     }
--   },
--   "strategicFit": {
--     "score": 3, "details": "",
--     "alignmentDimensions": [{"key":"","label":"","current":3,"required":3}],
--     "capabilityGaps": [{"id":"","capability":"","currentLevel":3,"requiredLevel":3,"action":"","priority":"medium"}]
--   },
--   "feasibility": {
--     "score": 3, "details": "",
--     "trl": 1,
--     "milestones": [{"id":"","name":"","targetDate":"","status":"planned"}]
--   },
--   "commercialViability": {
--     "score": 3, "details": "",
--     "pricingModel": "", "unitPrice": 0, "grossMargin": 0,
--     "projections": [{"year":1,"revenue":0,"costs":0}],
--     "breakEvenUnits": 0
--   },
--   "risk": {
--     "score": 3, "details": "",
--     "riskItems": [{"id":"","name":"","category":"market","probability":3,"impact":3,"mitigation":""}]
--   }
-- }
--
-- ============================================================
-- JSON Structure Reference (for strategic_analyses column)
-- ============================================================
--
-- {
--   "ansoff":  {"position":"","description":"","rationale":""},
--   "bcg":     {"position":"","description":"","rationale":""},
--   "mckinsey":{"position":"","description":"","rationale":""},
--   "swot": {
--     "strengths":"","weaknesses":"","opportunities":"","threats":"",
--     "description":"","rationale":""
--   },
--   "pestel": {
--     "political":"","economic":"","social":"","technological":"",
--     "environmental":"","legal":"","description":"","rationale":""
--   },
--   "porter": {
--     "competitiveRivalry":    {"intensity":3,"description":""},
--     "threatOfNewEntrants":   {"intensity":3,"description":""},
--     "threatOfSubstitutes":   {"intensity":3,"description":""},
--     "bargainingPowerBuyers": {"intensity":3,"description":""},
--     "bargainingPowerSuppliers":{"intensity":3,"description":""},
--     "description":"","rationale":""
--   }
-- }
--
-- ============================================================
-- Example: Insert a new opportunity
-- ============================================================
--
-- INSERT INTO opportunities (id, title, industry, geography, technology, owner)
-- VALUES ('opp-001', 'Hydrogen Rail Retrofit', 'Rail & Mobility', 'DACH', 'Hydrogen Fuel Cells', 'M. Schmidt');
--
-- INSERT INTO gate_decisions (id, opportunity_id, gate, decision, decider, comment)
-- VALUES ('gd-001', 'opp-001', 'gate1', 'go', 'Dr. Weber', 'Strong market potential');
