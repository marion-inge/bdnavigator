import * as XLSX from "xlsx";

/** Normalise a header/sheet label: lowercase, alphanumeric only. */
export const norm = (s: any) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const str = (v: any) => (v === null || v === undefined ? "" : String(v).trim());

export const num = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.,+-eE]/g, "").replace(/,(?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** Find a sheet by fuzzy name match: any of the given patterns (regex or keyword). */
export function findSheetName(wb: XLSX.WorkBook, patterns: RegExp[]): string | undefined {
  for (const rx of patterns) {
    const hit = wb.SheetNames.find((n) => rx.test(n));
    if (hit) return hit;
  }
  return undefined;
}

export function sheetRows(wb: XLSX.WorkBook, name?: string): any[][] {
  if (!name) return [];
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: false }) as any[][];
}

/**
 * Detect the header row within the first `scanDepth` rows: the row that matches
 * the most of the expected normalized keywords (partial match allowed).
 * Returns -1 when nothing plausible is found.
 */
export function findHeaderRow(rows: any[][], keywords: string[], scanDepth = 20): number {
  const keys = keywords.map(norm).filter(Boolean);
  let best = -1;
  let bestScore = 0;
  const depth = Math.min(rows.length, scanDepth);
  for (let i = 0; i < depth; i++) {
    const cells = (rows[i] || []).map(norm).filter(Boolean);
    if (cells.length < 2) continue;
    let score = 0;
    for (const k of keys) {
      if (cells.some((c) => c === k || c.includes(k) || k.includes(c))) score++;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return bestScore >= 1 ? best : -1;
}

export type ColMap = Record<string, number>;

/** Build a name→column-index map from a header row. */
export function buildColMap(headerRow: any[]): ColMap {
  const map: ColMap = {};
  (headerRow || []).forEach((h, i) => {
    const k = norm(h);
    if (k && !(k in map)) map[k] = i;
  });
  return map;
}

/**
 * Resolve a column index by trying exact normalized keys first, then substring
 * matches in either direction. Returns -1 when unresolved.
 */
export function colIndex(map: ColMap, aliases: string[]): number {
  const keys = Object.keys(map);
  for (const a of aliases) {
    const n = norm(a);
    if (n && n in map) return map[n];
  }
  for (const a of aliases) {
    const n = norm(a);
    if (!n) continue;
    const hit = keys.find((k) => k.includes(n) || n.includes(k));
    if (hit) return map[hit];
  }
  return -1;
}

/** Exact-only column resolution (no fuzzy fallback). */
export function exactIndex(map: ColMap, aliases: string[]): number {
  for (const a of aliases) {
    const n = norm(a);
    if (n && n in map) return map[n];
  }
  return -1;
}

/** Read a cell from a row by column aliases. */
export function cell(row: any[], map: ColMap, aliases: string[], strict = false): string {
  const i = strict ? exactIndex(map, aliases) : colIndex(map, aliases);
  return i >= 0 ? str(row[i]) : "";
}

export function cellNum(row: any[], map: ColMap, aliases: string[]): number | null {
  const i = colIndex(map, aliases);
  return i >= 0 ? num(row[i]) : null;
}

/** Rows below the header that carry actual data (first non-empty cell wins). */
export function dataRows(rows: any[][], headerIdx: number): any[][] {
  if (headerIdx < 0) return [];
  return rows.slice(headerIdx + 1).filter((r) => (r || []).some((c) => str(c) !== ""));
}
