import { DEJAVU_BOLD, DEJAVU_REGULAR } from "@/assets/fonts/dejavu";
import type { TrainingPlanRow } from "@/lib/plans";

/**
 * Styled PDF export for a generated training plan.
 *
 * We render the plan's markdown ourselves (headings / bullets / tables) onto a
 * dark "Absolute Frame" branded page instead of screenshotting the DOM, so the
 * output stays crisp, selectable and printable.
 *
 * A Latin + Cyrillic DejaVu subset is embedded so EN / UZ / RU plans all render
 * with correct glyphs (jsPDF's built-in Helvetica has no Cyrillic).
 */

const CRIMSON: [number, number, number] = [220, 38, 38];
const WHITE: [number, number, number] = [245, 245, 245];
const MUTED: [number, number, number] = [160, 160, 165];
const BG: [number, number, number] = [8, 8, 10];
const CARD: [number, number, number] = [20, 20, 24];

type Block =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "li"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "hr" }
  | { kind: "table"; head: string[]; rows: string[][] };

/** Strip markdown emphasis/inline-code so the PDF text stays clean. */
function inline(s: string) {
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .trim();
}

function splitRow(line: string) {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => inline(c));
}

export function parseMarkdown(md: string): Block[] {
  const lines = (md ?? "").replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    // Table: header row followed by a separator row of dashes.
    if (line.startsWith("|") && /^\|[\s:|-]+\|?$/.test((lines[i + 1] ?? "").trim())) {
      const head = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      i--;
      blocks.push({ kind: "table", head, rows });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { blocks.push({ kind: "hr" }); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push({ kind: "h", level: h[1].length, text: inline(h[2]) }); continue; }
    if (line.startsWith(">")) { blocks.push({ kind: "quote", text: inline(line.slice(1)) }); continue; }
    if (/^([-*+]|\d+[.)])\s+/.test(line)) {
      blocks.push({ kind: "li", text: inline(line.replace(/^([-*+]|\d+[.)])\s+/, "")) });
      continue;
    }
    blocks.push({ kind: "p", text: inline(line) });
  }
  return blocks;
}

export type PdfLabels = {
  brand?: string;
  subtitle?: string;
  footer?: string;
  meta?: string;
};

export async function exportPlanPdf(plan: TrainingPlanRow, labels: PdfLabels = {}) {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "pt", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", DEJAVU_REGULAR);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", DEJAVU_BOLD);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 42;
  const CW = W - M * 2;
  let y = 0;
  let page = 0;

  const paintPage = () => {
    doc.setFillColor(...BG);
    doc.rect(0, 0, W, H, "F");
    // Top crimson rule + side accent bar.
    doc.setFillColor(...CRIMSON);
    doc.rect(0, 0, W, 4, "F");
    doc.rect(0, 0, 4, H, "F");
  };

  const footer = () => {
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(labels.footer ?? "ABSOLUTE FRAME · AI FITNESS HUB", M, H - 20);
    doc.text(String(page), W - M, H - 20, { align: "right" });
  };

  const newPage = (first = false) => {
    if (!first) { footer(); doc.addPage(); }
    page += 1;
    paintPage();
    y = first ? M : M + 8;
  };

  const need = (h: number) => { if (y + h > H - 48) newPage(); };

  newPage(true);

  // ---------- Cover header ----------
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...CRIMSON);
  doc.text((labels.brand ?? "ABSOLUTE FRAME").toUpperCase(), M, y + 6);
  y += 22;

  doc.setFontSize(24);
  doc.setTextColor(...WHITE);
  const titleLines = doc.splitTextToSize(plan.title.toUpperCase(), CW);
  doc.text(titleLines, M, y + 14);
  y += 14 + titleLines.length * 26;

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const metaLine =
    labels.meta ??
    `${plan.archetype} · ${plan.discipline} · ${plan.completed_days}/${plan.total_days} days · ${new Date(plan.created_at).toLocaleDateString()}`;
  doc.text(metaLine, M, y);
  y += 12;
  if (labels.subtitle) {
    doc.text(doc.splitTextToSize(labels.subtitle, CW), M, y + 4);
    y += 16;
  }
  doc.setDrawColor(...CRIMSON);
  doc.setLineWidth(1);
  doc.line(M, y + 6, M + CW, y + 6);
  y += 24;

  // ---------- Body ----------
  const blocks = parseMarkdown(plan.plan_markdown);

  for (const b of blocks) {
    if (b.kind === "hr") {
      need(16);
      doc.setDrawColor(60, 60, 66);
      doc.setLineWidth(0.5);
      doc.line(M, y, M + CW, y);
      y += 14;
      continue;
    }

    if (b.kind === "h") {
      const size = b.level <= 1 ? 15 : b.level === 2 ? 13 : 11;
      need(size + 20);
      doc.setFont("DejaVu", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...(b.level <= 2 ? CRIMSON : WHITE));
      const lines = doc.splitTextToSize(b.text, CW);
      doc.text(lines, M, y + size);
      y += lines.length * (size + 4) + 8;
      continue;
    }

    if (b.kind === "quote") {
      const lines = doc.splitTextToSize(b.text, CW - 14);
      need(lines.length * 13 + 12);
      doc.setFillColor(...CARD);
      doc.rect(M, y - 2, CW, lines.length * 13 + 10, "F");
      doc.setFillColor(...CRIMSON);
      doc.rect(M, y - 2, 3, lines.length * 13 + 10, "F");
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...WHITE);
      doc.text(lines, M + 12, y + 10);
      y += lines.length * 13 + 18;
      continue;
    }

    if (b.kind === "li") {
      const lines = doc.splitTextToSize(b.text, CW - 16);
      need(lines.length * 13 + 4);
      doc.setFillColor(...CRIMSON);
      doc.rect(M + 2, y + 4, 3, 3, "F");
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...WHITE);
      doc.text(lines, M + 14, y + 8);
      y += lines.length * 13 + 3;
      continue;
    }

    if (b.kind === "p") {
      const lines = doc.splitTextToSize(b.text, CW);
      need(lines.length * 13 + 6);
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...WHITE);
      doc.text(lines, M, y + 8);
      y += lines.length * 13 + 8;
      continue;
    }

    // ---------- Table ----------
    const cols = Math.max(1, b.head.length);
    const colW = CW / cols;
    const cellPad = 5;
    const drawHead = () => {
      doc.setFont("DejaVu", "bold");
      doc.setFontSize(8);
      const wrapped = b.head.map((c) => doc.splitTextToSize(c.toUpperCase(), colW - cellPad * 2));
      const rowH = Math.max(...wrapped.map((w) => w.length)) * 10 + 10;
      need(rowH + 14);
      doc.setFillColor(...CRIMSON);
      doc.rect(M, y, CW, rowH, "F");
      doc.setTextColor(255, 255, 255);
      wrapped.forEach((w, ci) => doc.text(w, M + ci * colW + cellPad, y + 12));
      y += rowH;
    };
    drawHead();

    b.rows.forEach((r, ri) => {
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(8.5);
      const wrapped = Array.from({ length: cols }, (_, ci) =>
        doc.splitTextToSize(r[ci] ?? "", colW - cellPad * 2),
      );
      const rowH = Math.max(...wrapped.map((w) => w.length)) * 10 + 8;
      if (y + rowH > H - 48) { newPage(); drawHead(); }
      doc.setFillColor(...(ri % 2 === 0 ? CARD : BG));
      doc.rect(M, y, CW, rowH, "F");
      doc.setDrawColor(45, 45, 50);
      doc.setLineWidth(0.4);
      doc.line(M, y + rowH, M + CW, y + rowH);
      doc.setTextColor(...WHITE);
      wrapped.forEach((w, ci) => doc.text(w, M + ci * colW + cellPad, y + 11));
      y += rowH;
    });
    y += 14;
  }

  footer();

  const safe = plan.title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "training-plan";
  doc.save(`${safe}.pdf`);
}
