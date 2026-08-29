import type { TrainingPlanRow } from "@/lib/plans";

/**
 * Calendar export for AI-generated training plans.
 *
 * `parseTrainingDays` pulls the individual day blocks out of the plan markdown
 * ("Day 1", "1-kun", "День 1", "Kun 1: Push" ...). Each day becomes a calendar
 * event with a reminder alarm, exported either as a downloadable .ics file
 * (Apple / Outlook / Google import) or a single Google Calendar quick-add link.
 */

export type TrainingDay = {
  index: number;
  title: string;
  details: string;
};

const DAY_RE =
  /^(?:#{1,6}\s*)?(?:\*\*)?\s*(?:(\d{1,2})\s*[-–—]?\s*(?:kun|kuni|день)|(?:day|kun|день)\s*[-–—:]?\s*(\d{1,2}))(?![\d])\s*(.*)$/i;

export function parseTrainingDays(markdown: string, fallbackCount = 5): TrainingDay[] {
  const lines = (markdown ?? "").replace(/\r/g, "").split("\n");
  const days: TrainingDay[] = [];
  let current: TrainingDay | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(DAY_RE);
    if (m) {
      const num = Number(m[1] ?? m[2]);
      if (Number.isFinite(num) && num >= 1 && num <= 60) {
        if (current) days.push(current);
        // Drop the leading separator ("Day 1 — Push", "Day 1: Push", "Day 1 - Push").
        const label = (m[3] ?? "")
          .replace(/\*+/g, "")
          .replace(/[|#]/g, "")
          .replace(/^\s*[-–—:.)]+\s*/, "")
          .trim();
        current = { index: num, title: label ? `Day ${num} — ${label}` : `Day ${num}`, details: "" };
        continue;
      }
    }
    if (current && line) {
      if (current.details.length < 900) {
        current.details += `${line.replace(/\*\*/g, "").replace(/^\|/, "").replace(/\|$/, "").replace(/\s*\|\s*/g, " · ")}\n`;
      }
    }
  }
  if (current) days.push(current);

  // De-duplicate by day number, keep first occurrence, sort ascending.
  const seen = new Map<number, TrainingDay>();
  for (const d of days) if (!seen.has(d.index)) seen.set(d.index, d);
  const out = [...seen.values()].sort((a, b) => a.index - b.index);
  if (out.length > 0) return out;

  // Fallback: no parseable day headings → build a simple N-day week.
  return Array.from({ length: fallbackCount }, (_, i) => ({
    index: i + 1,
    title: `Training Day ${i + 1}`,
    details: "",
  }));
}

function pad(n: number) { return String(n).padStart(2, "0"); }

/** Local floating time (no TZ suffix) so the event fires at the user's clock time. */
function fmtLocal(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}
function fmtUtc(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function esc(s: string) {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** RFC 5545 requires lines <= 75 octets. */
function fold(line: string) {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

export type CalendarOptions = {
  /** "HH:MM" 24h start time for each session. */
  time: string;
  /** Minutes before start for the reminder alarm. */
  reminderMinutes: number;
  /** Session length in minutes. */
  durationMinutes?: number;
  /** First session date; defaults to tomorrow. */
  startDate?: Date;
  /** Skip weekends when laying the days out. */
  skipWeekends?: boolean;
};

export function dayDate(opts: CalendarOptions, offset: number) {
  const [h, m] = opts.time.split(":").map((v) => parseInt(v, 10));
  const base = opts.startDate ? new Date(opts.startDate) : (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();
  base.setHours(Number.isFinite(h) ? h : 7, Number.isFinite(m) ? m : 0, 0, 0);

  let placed = 0;
  const cursor = new Date(base);
  while (placed < offset) {
    cursor.setDate(cursor.getDate() + 1);
    if (opts.skipWeekends && (cursor.getDay() === 0 || cursor.getDay() === 6)) continue;
    placed += 1;
  }
  if (opts.skipWeekends) {
    while (cursor.getDay() === 0 || cursor.getDay() === 6) cursor.setDate(cursor.getDate() + 1);
  }
  return cursor;
}

export function buildIcs(plan: TrainingPlanRow, days: TrainingDay[], opts: CalendarOptions) {
  const dur = opts.durationMinutes ?? 60;
  const stamp = fmtUtc(new Date());
  const out: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Absolute Frame//AI Fitness Hub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(plan.title)}`,
  ];

  days.forEach((d, i) => {
    const start = dayDate(opts, i);
    const end = new Date(start.getTime() + dur * 60000);
    out.push(
      "BEGIN:VEVENT",
      `UID:${plan.id}-d${d.index}@absolute-frame`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${fmtLocal(start)}`,
      `DTEND:${fmtLocal(end)}`,
      fold(`SUMMARY:${esc(`🔥 ${d.title} · ${plan.archetype}`)}`),
      fold(`DESCRIPTION:${esc(`${plan.title} — ${plan.discipline}\n\n${d.details.trim() || "Open the Absolute Frame AI Coach for today's session."}`)}`),
      "BEGIN:VALARM",
      `TRIGGER:-PT${Math.max(0, Math.round(opts.reminderMinutes))}M`,
      "ACTION:DISPLAY",
      fold(`DESCRIPTION:${esc(`Training in ${opts.reminderMinutes} minutes — ${d.title}`)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  });

  out.push("END:VCALENDAR");
  return out.join("\r\n");
}

export function downloadIcs(plan: TrainingPlanRow, days: TrainingDay[], opts: CalendarOptions) {
  const ics = buildIcs(plan, days, opts);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = plan.title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "training-plan";
  a.href = url;
  a.download = `${safe}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Google Calendar only accepts one event per link, so we create the first
 * session as a weekly recurring event covering all parsed days.
 */
export function googleCalendarUrl(plan: TrainingPlanRow, days: TrainingDay[], opts: CalendarOptions) {
  const dur = opts.durationMinutes ?? 60;
  const start = dayDate(opts, 0);
  const end = new Date(start.getTime() + dur * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🔥 ${plan.title} · ${plan.archetype}`,
    dates: `${fmtUtc(start)}/${fmtUtc(end)}`,
    details: `${plan.discipline}\n\n${days.map((d) => `${d.title}`).join("\n")}\n\nAbsolute Frame AI Coach`,
    recur: `RRULE:FREQ=DAILY;COUNT=${Math.max(1, days.length)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
