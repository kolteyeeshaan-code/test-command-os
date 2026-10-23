/**
 * Export pipeline — one place for every way a session leaves the app.
 *
 *  - buildDocument()  → a self-contained, print-optimised HTML document (also the PDF source)
 *  - openPrintView()  → browser print dialog (native "Save as PDF")
 *  - downloadPdf()    → a real .pdf file rendered client-side (html2canvas → jsPDF)
 *  - downloadHtml()   → a self-contained .html file
 *  - markdown helpers + copyMarkdown() → paste-into-docs export
 *  - dlJSON()         → structured data backup
 */
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { APP_CATALOG, getApp } from "./data";
import { renderAppMarkdown } from "./apps/markdownRenderers";

export function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function docHeader(appName: string, project?: { clientName: string; projectName: string } | null, sessionTitle?: string): string {
  const parts = [
    '<div class="doc-header">',
    '<div class="doc-eyebrow">' + escapeHtml(appName) + "</div>",
    '<h1 class="doc-title">' + escapeHtml(sessionTitle || appName) + "</h1>",
    '<div class="doc-meta">',
  ];
  if (project) {
    parts.push("<span>" + escapeHtml(project.clientName) + "</span>");
    parts.push("<span>" + escapeHtml(project.projectName) + "</span>");
  }
  parts.push("<span>" + new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + "</span>");
  parts.push("</div></div>");
  return parts.join("");
}

const DOC_CSS = [
  "*{box-sizing:border-box}",
  "body{font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:48px 56px;max-width:960px;margin:0 auto;color:#15190d;font-size:13px;line-height:1.55;background:#fff}",
  ".doc-header{border-bottom:1px solid #e9eaeb;padding-bottom:20px;margin-bottom:28px}",
  ".doc-eyebrow{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#535862;margin-bottom:8px}",
  ".doc-title{font-size:30px;font-weight:400;letter-spacing:-0.04em;line-height:1.1;margin:0}",
  ".doc-meta{color:#535862;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-top:12px;display:flex;gap:14px;flex-wrap:wrap}",
  ".doc-meta span+span:before{content:'·';margin-right:14px;color:#b3b3b3}",
  "h2{font-size:15px;font-weight:700;margin:34px 0 10px;text-transform:uppercase;letter-spacing:0.04em;color:#15190d}",
  "h3{font-size:13px;font-weight:700;margin:18px 0 6px;color:#15190d}",
  "h4{font-size:12px;font-weight:700;margin:14px 0 5px;text-transform:uppercase;letter-spacing:0.04em;color:#15190d}",
  "p{margin:0 0 8px}",
  "table{width:100%;border-collapse:collapse;margin:10px 0 16px}",
  "th,td{border:1px solid #e2e4e7;padding:8px 10px;text-align:left;font-size:12px;vertical-align:top;line-height:1.4}",
  "th{background:#f2f2f2;font-weight:600;text-transform:uppercase;font-size:9.5px;letter-spacing:0.06em;color:#535862}",
  ".field{border:1px solid #e9eaeb;border-radius:8px;padding:14px 16px;margin-bottom:10px;background:#fafafa}",
  ".field-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#535862;margin-bottom:5px}",
  ".field-value{font-size:13px;color:#15190d;white-space:pre-wrap;line-height:1.5}",
  ".chip{display:inline-block;padding:1px 8px;border-radius:4px;font-size:10.5px;font-weight:600;background:#f2f2f2;margin-right:4px}",
  ".chip-green{background:rgba(52,199,89,0.3)}",
  ".chip-orange{background:rgba(255,149,0,0.3)}",
  ".rank{display:inline-block;min-width:20px;height:20px;line-height:20px;text-align:center;background:#15190d;color:#fff;border-radius:50%;font-weight:600;font-size:10.5px;margin-right:7px}",
  ".grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}",
  ".footer{margin-top:48px;padding-top:16px;border-top:1px solid #e9eaeb;color:#9a9a9a;font-size:10px;text-transform:uppercase;letter-spacing:0.06em}",
  "tr,.field,.grid-2{break-inside:avoid;page-break-inside:avoid}",
  "h2,h3,h4{break-after:avoid;page-break-after:avoid}",
  "@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{padding:16mm;font-size:11pt;max-width:none}@page{size:A4 portrait;margin:12mm}.no-print{display:none}}",
].join("");

/**
 * Landscape "sheet" documents.
 *
 * A renderer can emit a block carrying SHEET_OPEN … SHEET_CLOSE (the Business Model Canvas does) to say
 * "I am a single-page landscape blueprint". When that block is the only content besides the document
 * header, the whole document is switched to A4 landscape so the header shares the sheet. When it sits
 * among other sections (e.g. the project context pack) the document stays portrait and the block
 * requests its own landscape page through a named @page rule instead.
 */
export const SHEET_OPEN = 'data-print-sheet="landscape"';
export const SHEET_CLOSE = "<!--/print-sheet-->";

export function isLandscapeSheetDoc(bodyHtml: string): boolean {
  const start = bodyHtml.indexOf(SHEET_OPEN);
  if (start < 0 || bodyHtml.indexOf(SHEET_OPEN, start + 1) >= 0) return false;
  const end = bodyHtml.indexOf(SHEET_CLOSE, start);
  if (end < 0) return false;
  const before = bodyHtml.slice(0, start);
  const after = bodyHtml.slice(end + SHEET_CLOSE.length);
  // Only the doc header may precede the sheet; nothing may follow it.
  return !/<(h[2-4]|table|p)[ >]|class="field"/.test(before) && after.trim() === "";
}

/* Printable artboards, at 96dpi css px with the shared 8mm page margin.
 * A sheet always prints landscape; when the content is more than an A4 sheet holds legibly the
 * document escalates to the bigger A3 artboard (and the layout re-flows to the wider tracks). */
export type SheetSize = "a4" | "a3";

// Full sheet widths in css px (96dpi): A4 landscape 297x210mm, A3 landscape 420x297mm.
const SHEET_CSS_PX: Record<SheetSize, { sheet: number; printableW: number; printableH: number }> = {
  a4: { sheet: 1123, printableW: 1062, printableH: 733 }, // 281 x 194mm printable
  a3: { sheet: 1587, printableW: 1527, printableH: 1063 }, // 404 x 281mm printable
};

// A sheet is comfortable down to this scale; below it the bigger artboard is used instead.
const A4_MIN_SCALE = 0.7;
// Legibility floor on the biggest artboard: past it the sheet continues onto a second page.
const A3_MIN_ZOOM = 0.4;

/** The `@page` rule for a solo sheet document, in its own style element so print scripts can rewrite it. */
function pageSizeRule(size: SheetSize): string {
  return `<style id="cs-page-size">@page{size:${size.toUpperCase()} landscape;margin:8mm}</style>`;
}

/** Screen + print overrides that turn a solo sheet document into a single landscape artboard. */
function landscapeSheetCss(size: SheetSize, sheetWidth = SHEET_CSS_PX[size].sheet): string {
  return [
    `body{max-width:${sheetWidth}px;padding:20px 24px}`,
    ".doc-header{padding-bottom:10px;margin-bottom:12px}",
    ".doc-title{font-size:22px}",
    ".doc-meta{margin-top:6px}",
    ".footer{margin-top:12px;padding-top:8px}",
    // The whole document is one landscape sheet, so the canvas must not also request a named page.
    "body .bmc-sheet{page:auto}",
    "@media print{body{padding:0;max-width:none;font-size:10.5pt}}",
  ].join("");
}

// Registered on `beforeprint` for solo sheet documents. Chooses the artboard and the zoom:
//   1. A4 landscape at zoom 1; if it overflows, shrink — but not below A4_MIN_SCALE.
//   2. A3 landscape at zoom 1; if it overflows, shrink — but not below A3_MIN_ZOOM (then it may
//      continue onto a second A3 page rather than become unreadable).
// Each candidate is measured at the exact printable width with the real reflowed layout, because text
// re-wraps as the sheet widens or the zoom shrinks, so a linear estimate would over- or under-shoot.
// `zoom` (not `transform`) is used because print fragmentation honours it.
const FIT_SHEET_SCRIPT = [
  "function fitSheet(){",
  "var b=document.body,f=document.querySelector('.footer'),rule=document.getElementById('cs-page-size'),prev=b.style.cssText;",
  "var S=[{n:'A4',w:"+SHEET_CSS_PX.a4.printableW+",h:"+SHEET_CSS_PX.a4.printableH+",z:"+A4_MIN_SCALE+"},{n:'A3',w:"+SHEET_CSS_PX.a3.printableW+",h:"+SHEET_CSS_PX.a3.printableH+",z:"+A3_MIN_ZOOM+"}];",
  "function apply(s,k){if(rule)rule.textContent='@page{size:'+s.n+' landscape;margin:8mm}';",
  "b.style.cssText='margin:0;padding:0;max-width:none;zoom:'+k+';width:'+(s.w/k)+'px';",
  "return f.getBoundingClientRect().bottom-b.getBoundingClientRect().top;}",
  "function fit(s){if(apply(s,1)<=s.h*0.98)return 1;var lo=s.z,hi=1;if(apply(s,lo)>s.h*0.98)return lo;",
  "for(var i=0;i<7;i++){var m=(lo+hi)/2;if(apply(s,m)<=s.h*0.98)lo=m;else hi=m;}apply(s,lo);return lo;}",
  "var s=S[0],k=fit(s);if(apply(s,1)>s.h&&k<=s.z){s=S[1];k=fit(s);}else{apply(s,k);}",
  "window.__csSheetPrev=prev;}",
  "function restoreSheet(){var p=window.__csSheetPrev;if(p!==undefined){document.body.style.cssText=p;window.__csSheetPrev=undefined;}}",
].join("");

// Registered on `beforeprint` for documents that contain a canvas among other (portrait) sections,
// e.g. the project context pack. The canvas keeps its own named landscape page; this only escalates
// that page from A4 to A3 landscape when a canvas is taller than an A4 sheet can hold, so the print
// is always a landscape A4/A3 sheet. Other sections are untouched and no zoom is applied.
const FIT_PACK_SCRIPT = [
  "function fitPackSheet(){",
  "var st=document.getElementById('cs-bmc-sheet-css');if(!st)return;",
  "var ss=document.querySelectorAll('.bmc-sheet');if(!ss.length)return;",
  "var A4={w:"+SHEET_CSS_PX.a4.printableW+",h:"+SHEET_CSS_PX.a4.printableH+",z:"+A4_MIN_SCALE+"},",
  "A3={w:"+SHEET_CSS_PX.a3.printableW+",h:"+SHEET_CSS_PX.a3.printableH+",z:"+A3_MIN_ZOOM+"};",
  "function fitOne(el,s){",
  "function apply(k){el.style.cssText='width:'+(s.w/k)+'px;max-width:none;zoom:'+k;return el.getBoundingClientRect().height;}",
  "var k=1;if(apply(1)<=s.h)return 1;var lo=s.z,hi=1;if(apply(lo)>s.h*0.98)return 0;",
  "for(var i=0;i<7;i++){var m=(lo+hi)/2;if(apply(m)<=s.h*0.98)lo=m;else hi=m;}k=lo;apply(k);return k;}",
  "var prev=[];",
  "for(var i=0;i<ss.length;i++){var el=ss[i];prev[i]=el.style.cssText;",
  "var k=fitOne(el,A4);",
  "if(k===0){if(st.textContent.indexOf('A3 landscape')<0)st.textContent=st.textContent.replace('size:A4 landscape','size:A3 landscape');",
  "fitOne(el,A3);}",
  "}",
  "window.__csPackPrev=prev;}",
  "function restorePackSheet(){var ss=document.querySelectorAll('.bmc-sheet'),p=window.__csPackPrev||[];",
  "for(var i=0;i<ss.length;i++)ss[i].style.cssText=p[i]||'';window.__csPackPrev=undefined;}",
].join("");

export function buildDocument(title: string, bodyHtml: string, opts: { autoPrint?: boolean; sheetSize?: SheetSize; sheetWidth?: number } = {}): string {
  const landscape = isLandscapeSheetDoc(bodyHtml);
  const size: SheetSize = opts.sheetSize ?? "a4";
  // A canvas nested among other sections still needs its named-page size auto-selected on print.
  const packedSheet = !landscape && bodyHtml.indexOf('class="bmc-sheet"') >= 0;
  // The export documents render with the Inter webfont. Until it has loaded (or 2.5s elapse) the body
  // stays hidden, so no export path — print dialog, PDF rasteriser, downloaded HTML — can capture or
  // print fallback-font metrics. Print always shows the body, even if the font never arrives.
  const fontGate =
    "<style>body{visibility:hidden}body.cs-fonts-ready{visibility:visible}@media print{body{visibility:visible!important}}</style>" +
    "<script>function csFontsReady(){document.body.classList.add('cs-fonts-ready')}" +
    "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(csFontsReady)}setTimeout(csFontsReady,2500);</script>";
  // autoPrint waits for the same font gate before calling print, so the fit scripts measure real metrics.
  const boot = opts.autoPrint
    ? "window.onload=function(){var d=false;function go(){if(d)return;d=true;setTimeout(function(){window.focus();window.print()},100)}" +
      "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(go)}setTimeout(go,2500)};"
    : "";
  let scripts = "";
  if (landscape) {
    scripts = "<script>" + FIT_SHEET_SCRIPT + "window.addEventListener('beforeprint',fitSheet);window.addEventListener('afterprint',restoreSheet);" + boot + "</script>";
  } else if (packedSheet) {
    scripts = "<script>" + FIT_PACK_SCRIPT + "window.addEventListener('beforeprint',fitPackSheet);window.addEventListener('afterprint',restorePackSheet);" + boot + "</script>";
  } else if (opts.autoPrint) {
    scripts = "<script>" + boot + "</script>";
  }
  return [
    "<!DOCTYPE html><html><head>",
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "<title>" + escapeHtml(title) + "</title>",
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
    "<style>" + DOC_CSS + (landscape ? landscapeSheetCss(size, opts.sheetWidth) : "") + "</style>",
    landscape ? pageSizeRule(size) : "",
    "</head><body>",
    bodyHtml,
    '<div class="footer">EKC OS · ' + escapeHtml(title) + " · " + new Date().toLocaleString() + "</div>",
    fontGate,
    scripts,
    "</body></html>",
  ].join("");
}

export function openPrintView(title: string, bodyHtml: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildDocument(title, bodyHtml, { autoPrint: true }));
  w.document.close();
}

export function makeFilename(...parts: (string | null | undefined)[]): string {
  const joined = parts.filter(Boolean).join(" — ");
  const cleaned = joined
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90)
    .replace(/[.\s]+$/, "");
  return cleaned || "consultancy-suite";
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadHtml(filename: string, title: string, bodyHtml: string) {
  triggerDownload(filename + ".html", new Blob([buildDocument(title, bodyHtml)], { type: "text/html;charset=utf-8" }));
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  triggerDownload(filename, new Blob([text], { type: mime + ";charset=utf-8" }));
}

function renderDocToCanvas(html: string, maxWidth = 960): Promise<{ canvas: HTMLCanvasElement; cssW: number; cssH: number }> {
  return new Promise(async (resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    // Keep it rendered but far off-screen. `visibility:hidden` makes some html2canvas builds
    // capture a blank document.
    iframe.style.cssText = "position:fixed;left:-100000px;top:0;width:" + maxWidth + "px;height:1px;border:0;z-index:-1;pointer-events:none;";
    document.body.appendChild(iframe);
    const idoc = iframe.contentDocument!;
    idoc.open();
    idoc.write(html);
    idoc.close();

    // Wait for the document's own font gate (cs-fonts-ready) before rasterising, so the capture uses
    // the real webfont metrics rather than a fallback.
    const gate = await new Promise<void>(res => {
      const t0 = Date.now();
      (function poll() {
        if (idoc.body.classList.contains("cs-fonts-ready") || Date.now() - t0 > 3000) return res();
        setTimeout(poll, 50);
      })();
    });
    void gate;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const el = idoc.body;
      const width = Math.min(maxWidth, el.scrollWidth || maxWidth);
      const height = el.scrollHeight || el.offsetHeight || 1200;
      html2canvas(el, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", width, height, windowWidth: width, logging: false })
        .then(canvas => { iframe.remove(); resolve({ canvas, cssW: width, cssH: height }); })
        .catch(err => { iframe.remove(); reject(err); });
    };

    // Wait for images in the document, then a beat for fonts to settle.
    const imgs = Array.from(idoc.images);
    let pending = imgs.length;
    if (pending === 0) { window.setTimeout(finish, 80); return; }
    const onOne = () => { pending--; if (pending <= 0) window.setTimeout(finish, 80); };
    imgs.forEach(img => {
      if (img.complete) { onOne(); return; }
      img.onload = onOne;
      img.onerror = onOne;
    });
    // Failsafe in case an image never fires.
    window.setTimeout(finish, 4000);
  });
}

export async function downloadPdf(filename: string, title: string, bodyHtml: string): Promise<void> {
  const landscape = isLandscapeSheetDoc(bodyHtml);
  const M = 30; // 8mm page margin, in css px (jsPDF's "px" unit is 1/96in)

  if (landscape) {
    // The sheet is always a landscape A4 or A3; the bigger artboard is selected automatically when the
    // content is more than the smaller one holds legibly. Each candidate is rendered at its printable
    // width; content taller than the sheet is re-rendered at a wider virtual layout width (the print
    // path's "zoom"), which lets the canvas tracks re-flow wider and the content shorter, so the sheet
    // fills the page instead of shrinking or leaving side margins. A re-flowed render always fits: the
    // layout is strictly shorter at the wider width, so the placement scale is width-bound and never clips.
    const sheets = [
      { format: "a4" as const, printableW: SHEET_CSS_PX.a4.printableW, printableH: SHEET_CSS_PX.a4.printableH, floor: A4_MIN_SCALE },
      { format: "a3" as const, printableW: SHEET_CSS_PX.a3.printableW, printableH: SHEET_CSS_PX.a3.printableH, floor: A3_MIN_ZOOM },
    ];
    let chosen: { format: "a4" | "a3"; canvas: HTMLCanvasElement } | null = null;
    for (const sh of sheets) {
      let render = await renderDocToCanvas(buildDocument(title, bodyHtml, { sheetWidth: sh.printableW }), sh.printableW);
      if (render.cssH > sh.printableH) {
        // Too tall for this sheet at full width. Below the legibility floor even re-flowed, an A4 sheet
        // is skipped for the bigger A3; otherwise re-render at an aspect-matched virtual layout width.
        if (sh.format === "a4" && sh.printableH / render.cssH < sh.floor) continue;
        const wv = Math.round((sh.printableW * render.cssH) / sh.printableH);
        render = await renderDocToCanvas(buildDocument(title, bodyHtml, { sheetWidth: wv }), wv);
      }
      chosen = { format: sh.format, canvas: render.canvas };
      break;
    }
    // The loop always selects a sheet: A4 is either accepted or skipped for A3, and A3 always breaks.
    const sel = chosen!;
    const pdf = new jsPDF({ unit: "px", format: sel.format, orientation: "landscape", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgData = sel.canvas.toDataURL("image/jpeg", 0.92);
    // A sheet is one page by definition: scale it to fit inside the margins instead of slicing it across pages.
    const k = Math.min((pageW - 2 * M) / sel.canvas.width, (pageH - 2 * M) / sel.canvas.height);
    const w = sel.canvas.width * k, h = sel.canvas.height * k;
    pdf.addImage(imgData, "JPEG", (pageW - w) / 2, M, w, h, undefined, "FAST");
    pdf.setProperties({ title, subject: "EKC OS export", creator: "EKC OS" });
    pdf.save(filename + ".pdf");
    return;
  }

  const { canvas } = await renderDocToCanvas(buildDocument(title, bodyHtml), 960);
  const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const imgH = (canvas.height * pageW) / canvas.width;
  let position = 0;
  let remaining = imgH;
  pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH, undefined, "FAST");
  remaining -= pageH;
  while (remaining > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH, undefined, "FAST");
    remaining -= pageH;
  }
  pdf.setProperties({ title, subject: "EKC OS export", creator: "EKC OS" });
  pdf.save(filename + ".pdf");
}

/* ───────────── Markdown ───────────── */

export interface MarkdownProjectContext {
  clientName: string;
  projectName: string;
  status?: string;
  startDate?: string;
  targetEndDate?: string;
  scopeSummary?: string;
  goals?: string[];
}

export function markdownDocument(appName: string, project: MarkdownProjectContext | null | undefined, sessionTitle: string, data: unknown): string {
  const meta: string[] = [appName];
  if (project) meta.push(project.clientName + " — " + project.projectName);
  meta.push(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  const projectContext = project ? [
    "## Project Context",
    "",
    "**Client:** " + project.clientName,
    "",
    "**Project:** " + (project.projectName || "Untitled Project"),
    project.status ? "\n**Status:** " + project.status + "\n" : "",
    project.startDate || project.targetEndDate ? "**Timeline:** " + (project.startDate || "—") + " → " + (project.targetEndDate || "—") + "\n" : "",
    project.scopeSummary ? "**Scope:** " + project.scopeSummary + "\n" : "",
    project.goals?.length ? "### Goals / Success Criteria\n\n" + project.goals.map(g => "- " + g).join("\n") + "\n" : "",
  ].filter(Boolean).join("\n") + "\n" : "";
  return "# " + (sessionTitle || appName) + "\n" +
    "> " + meta.join(" · ") + "\n\n" +
    projectContext +
    // AppSession passes the human app name; older callers may still pass an id.
    renderAppMarkdown(getApp(appName)?.id ?? APP_CATALOG.find(a => a.name === appName)?.id ?? "", data) +
    "\n\n---\n*Generated with EKC OS · " + new Date().toLocaleString() + "*\n";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-100000px;top:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

/* ───────────── JSON ───────────── */

export function dlJSON(name: string, data: unknown) {
  triggerDownload(name + ".json", new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}
