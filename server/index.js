/**
 * BD Navigator – Express API Server (iisnode-compatible)
 * Serves REST endpoints for SQLite-backed data.
 */
const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- Database ---
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "BDNavigator.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Ensure tables exist
db.exec(`
CREATE TABLE IF NOT EXISTS opportunities (
  id                     TEXT PRIMARY KEY,
  title                  TEXT NOT NULL,
  description            TEXT NOT NULL DEFAULT '',
  solution_description   TEXT NOT NULL DEFAULT '',
  industry               TEXT NOT NULL DEFAULT '',
  geography              TEXT NOT NULL DEFAULT '',
  technology             TEXT NOT NULL DEFAULT '',
  owner                  TEXT NOT NULL DEFAULT '',
  idea_bringer           TEXT NOT NULL DEFAULT '',
  stage                  TEXT NOT NULL DEFAULT 'idea',
  scoring                TEXT NOT NULL DEFAULT '{}',
  business_plan          TEXT DEFAULT NULL,
  investment_case        TEXT DEFAULT NULL,
  business_case          TEXT DEFAULT NULL,
  strategic_analyses     TEXT DEFAULT NULL,
  go_to_market_plan      TEXT DEFAULT NULL,
  implement_review       TEXT DEFAULT NULL,
  rough_scoring_answers  TEXT DEFAULT NULL,
  rough_scoring_comments TEXT DEFAULT NULL,
  rough_scoring_sources  TEXT DEFAULT NULL,
  gates                  TEXT NOT NULL DEFAULT '[]',
  created_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_assessments (
  id               TEXT PRIMARY KEY,
  opportunity_id   TEXT NOT NULL,
  basis            TEXT NOT NULL DEFAULT 'idea_scoring',
  summary          TEXT NOT NULL,
  overall_rating   TEXT NOT NULL,
  strengths        TEXT NOT NULL DEFAULT '[]',
  weaknesses       TEXT NOT NULL DEFAULT '[]',
  next_steps       TEXT NOT NULL DEFAULT '[]',
  pitfalls         TEXT NOT NULL DEFAULT '[]',
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS opportunity_files (
  id               TEXT PRIMARY KEY,
  opportunity_id   TEXT NOT NULL,
  file_name        TEXT NOT NULL,
  file_path        TEXT NOT NULL,
  file_size        INTEGER NOT NULL DEFAULT 0,
  mime_type        TEXT NOT NULL DEFAULT '',
  comment          TEXT NOT NULL DEFAULT '',
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
`);

// --- Helpers ---
const JSONB_COLS = [
  "scoring", "business_plan", "investment_case", "business_case",
  "strategic_analyses", "go_to_market_plan", "implement_review",
  "rough_scoring_answers", "rough_scoring_comments", "rough_scoring_sources",
  "gates", "strengths", "weaknesses", "next_steps", "pitfalls",
];

function parseRow(row) {
  if (!row) return null;
  const out = { ...row };
  for (const col of JSONB_COLS) {
    if (col in out && typeof out[col] === "string") {
      try { out[col] = JSON.parse(out[col]); } catch { /* keep string */ }
    }
  }
  return out;
}

function stringifyJsonCols(obj) {
  const out = { ...obj };
  for (const col of JSONB_COLS) {
    if (col in out && typeof out[col] === "object" && out[col] !== null) {
      out[col] = JSON.stringify(out[col]);
    }
  }
  return out;
}

// ========================
// OPPORTUNITIES
// ========================

// GET all
app.get("/api/opportunities", (req, res) => {
  const rows = db.prepare("SELECT * FROM opportunities ORDER BY created_at DESC").all();
  res.json(rows.map(parseRow));
});

// GET one
app.get("/api/opportunities/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(parseRow(row));
});

// POST create
app.post("/api/opportunities", (req, res) => {
  const data = stringifyJsonCols({ id: uuidv4(), ...req.body });
  if (!data.created_at) data.created_at = new Date().toISOString();

  const cols = Object.keys(data);
  const placeholders = cols.map(() => "?").join(", ");
  const stmt = db.prepare(`INSERT INTO opportunities (${cols.join(", ")}) VALUES (${placeholders})`);
  stmt.run(...cols.map((c) => data[c] ?? null));

  const row = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(data.id);
  res.status(201).json(parseRow(row));
});

// PUT upsert
app.put("/api/opportunities/:id", (req, res) => {
  const data = stringifyJsonCols({ ...req.body, id: req.params.id });
  const existing = db.prepare("SELECT id FROM opportunities WHERE id = ?").get(req.params.id);

  if (existing) {
    const updates = Object.keys(data).filter((k) => k !== "id");
    const setClause = updates.map((k) => `${k} = ?`).join(", ");
    db.prepare(`UPDATE opportunities SET ${setClause} WHERE id = ?`)
      .run(...updates.map((k) => data[k] ?? null), req.params.id);
  } else {
    if (!data.created_at) data.created_at = new Date().toISOString();
    const cols = Object.keys(data);
    const placeholders = cols.map(() => "?").join(", ");
    db.prepare(`INSERT INTO opportunities (${cols.join(", ")}) VALUES (${placeholders})`)
      .run(...cols.map((c) => data[c] ?? null));
  }

  const row = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(req.params.id);
  res.json(parseRow(row));
});

// DELETE
app.delete("/api/opportunities/:id", (req, res) => {
  db.prepare("DELETE FROM opportunities WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ========================
// AI ASSESSMENTS
// ========================

app.get("/api/ai-assessments", (req, res) => {
  const { opportunity_id, basis } = req.query;
  let sql = "SELECT * FROM ai_assessments";
  const params = [];
  const conditions = [];
  if (opportunity_id) { conditions.push("opportunity_id = ?"); params.push(opportunity_id); }
  if (basis) { conditions.push("basis = ?"); params.push(basis); }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY created_at DESC";
  res.json(db.prepare(sql).all(...params).map(parseRow));
});

app.post("/api/ai-assessments", (req, res) => {
  const data = stringifyJsonCols({ id: uuidv4(), ...req.body });
  if (!data.created_at) data.created_at = new Date().toISOString();
  const cols = Object.keys(data);
  const placeholders = cols.map(() => "?").join(", ");
  db.prepare(`INSERT INTO ai_assessments (${cols.join(", ")}) VALUES (${placeholders})`)
    .run(...cols.map((c) => data[c] ?? null));
  const row = db.prepare("SELECT * FROM ai_assessments WHERE id = ?").get(data.id);
  res.status(201).json(parseRow(row));
});

app.put("/api/ai-assessments/:id", (req, res) => {
  const data = stringifyJsonCols({ ...req.body, id: req.params.id });
  const existing = db.prepare("SELECT id FROM ai_assessments WHERE id = ?").get(req.params.id);
  if (existing) {
    const updates = Object.keys(data).filter((k) => k !== "id");
    const setClause = updates.map((k) => `${k} = ?`).join(", ");
    db.prepare(`UPDATE ai_assessments SET ${setClause} WHERE id = ?`)
      .run(...updates.map((k) => data[k] ?? null), req.params.id);
  } else {
    if (!data.created_at) data.created_at = new Date().toISOString();
    const cols = Object.keys(data);
    db.prepare(`INSERT INTO ai_assessments (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
      .run(...cols.map((c) => data[c] ?? null));
  }
  const row = db.prepare("SELECT * FROM ai_assessments WHERE id = ?").get(req.params.id);
  res.json(parseRow(row));
});

app.delete("/api/ai-assessments/:id", (req, res) => {
  db.prepare("DELETE FROM ai_assessments WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ========================
// OPPORTUNITY FILES
// ========================

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

app.get("/api/opportunity-files", (req, res) => {
  const { opportunity_id } = req.query;
  let sql = "SELECT * FROM opportunity_files";
  const params = [];
  if (opportunity_id) { sql += " WHERE opportunity_id = ?"; params.push(opportunity_id); }
  sql += " ORDER BY created_at DESC";
  res.json(db.prepare(sql).all(...params).map(parseRow));
});

app.post("/api/opportunity-files", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const data = {
    id: uuidv4(),
    opportunity_id: req.body.opportunity_id,
    file_name: file.originalname,
    file_path: file.filename,
    file_size: file.size,
    mime_type: file.mimetype,
    comment: req.body.comment || "",
    created_at: new Date().toISOString(),
  };

  const cols = Object.keys(data);
  db.prepare(`INSERT INTO opportunity_files (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`)
    .run(...cols.map((c) => data[c]));

  const row = db.prepare("SELECT * FROM opportunity_files WHERE id = ?").get(data.id);
  res.status(201).json(parseRow(row));
});

// PATCH update comment
app.patch("/api/opportunity-files/:id", (req, res) => {
  const { comment } = req.body;
  db.prepare("UPDATE opportunity_files SET comment = ? WHERE id = ?").run(comment ?? "", req.params.id);
  const row = db.prepare("SELECT * FROM opportunity_files WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(parseRow(row));
});

app.delete("/api/opportunity-files/:id", (req, res) => {
  const row = db.prepare("SELECT file_path FROM opportunity_files WHERE id = ?").get(req.params.id);
  if (row) {
    const filePath = path.join(UPLOAD_DIR, row.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.prepare("DELETE FROM opportunity_files WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// Serve uploaded files
app.use("/api/uploads", express.static(UPLOAD_DIR));

// ========================
// AI Proxy (Edge Function replacements)
// ========================
const aiProxy = require("./ai-proxy");
app.use("/api", aiProxy);

// ========================
// Health check
// ========================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ========================
// Start server (ignored by iisnode – it uses named pipes)
// ========================
app.listen(PORT, () => {
  console.log(`BD Navigator API running on port ${PORT}`);
});
