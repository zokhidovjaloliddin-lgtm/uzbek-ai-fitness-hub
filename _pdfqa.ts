import { exportPlanPdf } from "@/lib/planPdf";
import { parseTrainingDays, buildIcs } from "@/lib/ics";
const md = `# 5-Day Elite Plan\n\nWelcome, athlete. This cycle builds раздельная сила and o'zbek chidamlilik.\n\n## Day 1 — Push & Combat Conditioning\n\n| Exercise | Sets | Reps | Rest |\n| --- | --- | --- | --- |\n| Weighted Dips | 5 | 6 | 120s |\n| Archer Push-ups | 4 | 10 each | 90s |\n| Shadow Boxing | 5 | 3 min | 60s |\n\n- Warm up 10 minutes of rope skipping\n- Finish with 200 crunches\n\n## Day 2 — Pull Domination\n\n1. Muscle-ups 6x3\n2. Weighted pull-ups 5x5\n\n> Discipline is the price of power.\n\n## Day 3 — Legs\n\n| Exercise | Sets | Reps |\n| --- | --- | --- |\n| Bulgarian Split Squat | 4 | 12 |\n\n## Day 4 — Wrestling Cardio\n\nLong text paragraph repeated to test wrapping. ${"Endurance under fatigue is the true measure of a warrior. ".repeat(12)}\n\n## Day 5 — Full Body Forge\n\n| Блок | Подходы | Повторы |\n| --- | --- | --- |\n| Приседания | 5 | 10 |\n`;
const plan: any = { id: "p1", user_id: "u", title: "Ogre Ascension — 5 Day Cycle", archetype: "Yujiro Hanma", discipline: "Calisthenics · MMA", language: "en", plan_markdown: md, total_days: 60, completed_days: 12, status: "active", started_at: new Date().toISOString(), completed_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
const days = parseTrainingDays(md, 5);
console.log("DAYS:", days.map(d=>d.title));
console.log(buildIcs(plan, days, { time: "07:30", reminderMinutes: 30, durationMinutes: 60 }).split("\r\n").slice(0,20).join("\n"));
// shim browser bits jsPDF save() needs
(globalThis as any).window = globalThis;
const fs = await import("node:fs");
const { default: JsPDF } = await import("jspdf");
JsPDF.prototype.save = function (name: string) { fs.writeFileSync(`/tmp/${name}`, Buffer.from(this.output("arraybuffer") as ArrayBuffer)); return this; } as any;
const doc: any = await exportPlanPdf(plan, { brand: "ABSOLUTE FRAME · AI FITNESS HUB", subtitle: "Offline copy of your AI-generated training plan.", footer: "ABSOLUTE FRAME · Jaloliddin Zoxidov · 250040" });
console.log("ok");
fs.writeFileSync("/tmp/qa.pdf", Buffer.from(doc.output("arraybuffer")));
console.log("saved /tmp/qa.pdf");
