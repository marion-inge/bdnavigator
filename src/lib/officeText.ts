import JSZip from "jszip";
import * as XLSX from "xlsx";

const MAX_CHARS = 220_000;

export type OfficeKind = "docx" | "xlsx" | "pptx";

export function officeKind(name: string, mime = ""): OfficeKind | null {
  const l = name.toLowerCase();
  if (l.endsWith(".docx") || mime.includes("wordprocessingml")) return "docx";
  if (/\.(xlsx|xls)$/.test(l) || mime.includes("spreadsheetml") || mime === "application/vnd.ms-excel") return "xlsx";
  if (l.endsWith(".pptx") || mime.includes("presentationml")) return "pptx";
  return null;
}

function stripXml(xml: string): string {
  return xml
    .replace(/<w:tab\s*\/?>/g, "\t")
    .replace(/<w:br\s*\/?>/g, "\n")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<a:p[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n").replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Read Word/Excel/PowerPoint text in the browser so the server stays within its CPU budget. */
export async function extractOfficeTextFromUrl(url: string, kind: OfficeKind): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const chunks: string[] = [];
  if (kind === "xlsx") {
    const wb = XLSX.read(buf, { type: "array", cellDates: true });
    for (const n of wb.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(wb.Sheets[n], { blankrows: false }).trim();
      if (csv) chunks.push(`--- Sheet: ${n} ---\n${csv}`);
    }
  } else {
    const zip = await JSZip.loadAsync(buf);
    const re = kind === "docx"
      ? /^word\/(document|footnotes|endnotes|comments|header\d+|footer\d+)\.xml$/i
      : /^ppt\/slides\/slide\d+\.xml$/i;
    const num = (s: string) => Number(s.match(/(\d+)\.xml$/)?.[1] || 0);
    const parts = Object.keys(zip.files).filter((n) => re.test(n)).sort((a, b) =>
      kind === "docx"
        ? (a.includes("document.xml") ? -1 : b.includes("document.xml") ? 1 : a.localeCompare(b))
        : num(a) - num(b));
    for (const p of parts) {
      const t = stripXml(await zip.files[p].async("text"));
      if (t) chunks.push(`--- ${p} ---\n${t}`);
    }
  }
  return chunks.join("\n\n").slice(0, MAX_CHARS);
}
