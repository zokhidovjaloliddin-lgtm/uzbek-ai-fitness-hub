/**
 * Demo/presentation mode.
 *
 * When enabled (Profile → "Load Sample Data") the dashboard renders a fully
 * populated set of training plans, streaks and progress rings so the app looks
 * active during client demos. Nothing is written to the database — the flag is
 * purely local and can be flipped off at any time.
 */
import type { TrainingPlanRow } from "@/lib/plans";

const KEY = "af:demo-data";
export const DEMO_EVENT = "frame:demo-changed";

export function isDemoData(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setDemoData(on: boolean) {
  try { on ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(DEMO_EVENT));
}

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

function row(p: Partial<TrainingPlanRow> & { id: string; title: string }): TrainingPlanRow {
  return {
    user_id: "demo",
    archetype: "Yujiro Hanma",
    discipline: "MMA",
    language: "en",
    plan_markdown: "",
    total_days: 60,
    completed_days: 0,
    status: "active",
    started_at: iso(30),
    completed_at: null,
    created_at: iso(30),
    updated_at: iso(1),
    ...p,
  } as TrainingPlanRow;
}

export const DEMO_STREAK = 14;

export function demoPlans(): TrainingPlanRow[] {
  return [
    row({ id: "demo-1", title: "Demon Back Conditioning", archetype: "Yujiro Hanma", discipline: "MMA", total_days: 60, completed_days: 41 }),
    row({ id: "demo-2", title: "Spartan Power Cycle", archetype: "Kratos", discipline: "Power", total_days: 45, completed_days: 18 }),
    row({ id: "demo-3", title: "Street Calisthenics Base", archetype: "Khamzat Chimaev", discipline: "Calisthenics", total_days: 30, completed_days: 30, status: "completed", completed_at: iso(4) }),
    row({ id: "demo-4", title: "Dagestan Wrestling Camp", archetype: "Khabib Nurmagomedov", discipline: "Wrestling", total_days: 28, completed_days: 28, status: "completed", completed_at: iso(21) }),
  ];
}
