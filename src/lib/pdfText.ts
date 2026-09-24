import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_CHARS = 600_000;

/** Extract the text layer of a PDF page by page in the browser.
 *  Large reports are too heavy to parse on the server. */
export async function extractPdfTextFromUrl(url: string): Promise<{ text: string; pages: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download_${res.status}`);
  const data = new Uint8Array(await res.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const parts: string[] = [];
  let len = 0;
  for (let i = 1; i <= pdf.numPages && len < MAX_CHARS; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const t = (tc.items as any[])
      .map((it) => (it.str ?? "") + (it.hasEOL ? "\n" : " "))
      .join("")
      .replace(/[ \t]+/g, " ")
      .trim();
    page.cleanup();
    parts.push(`[p.${i}]\n${t}`);
    len += t.length;
  }
  const pages = pdf.numPages;
  await pdf.destroy();
  return { text: parts.join("\n\n").slice(0, MAX_CHARS), pages };
}
