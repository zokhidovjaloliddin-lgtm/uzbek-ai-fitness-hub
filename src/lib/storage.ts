const KEY_BMI = "absolute_frame_bmi";
const KEY_PLAN = "absolute_frame_plan";
const KEY_TIER = "absolute_frame_tier";
const KEY_SUBS = "absolute_frame_subs";

export type BmiRecord = {
  height: number;
  weight: number;
  bmi: number;
  category: string;
  savedAt: string;
};

export type PlanRecord = {
  archetype: string;
  goal: string;
  plan: string;
  savedAt: string;
};

export const storage = {
  getBmi(): BmiRecord | null {
    try { const raw = localStorage.getItem(KEY_BMI); return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setBmi(r: BmiRecord) { localStorage.setItem(KEY_BMI, JSON.stringify(r)); },

  getPlan(): PlanRecord | null {
    try { const raw = localStorage.getItem(KEY_PLAN); return raw ? JSON.parse(raw) : null; } catch { return null; }
  },
  setPlan(r: PlanRecord) { localStorage.setItem(KEY_PLAN, JSON.stringify(r)); },

  getTier(): string {
    return localStorage.getItem(KEY_TIER) ?? "standard";
  },
  setTier(t: string) {
    localStorage.setItem(KEY_TIER, t);
    try { window.dispatchEvent(new CustomEvent("frame:tier-changed")); } catch { /* ignore */ }
  },

  /** Set of tier ids the user has actively subscribed to (paid). */
  getSubs(): string[] {
    try { const raw = localStorage.getItem(KEY_SUBS); return raw ? JSON.parse(raw) : []; } catch { return []; }
  },
  addSub(id: string) {
    const cur = storage.getSubs();
    if (!cur.includes(id)) {
      cur.push(id);
      localStorage.setItem(KEY_SUBS, JSON.stringify(cur));
      try { window.dispatchEvent(new CustomEvent("frame:tier-changed")); } catch { /* ignore */ }
    }
  },
};

/**
 * Return the highest active tier the user owns: "ultra" > "premium" > "standard".
 * Pricing tiers map: standard = FREE, premium = PRO, ultra = ULTRA.
 */
export function getActiveTier(): "standard" | "premium" | "ultra" {
  const subs = storage.getSubs();
  if (subs.includes("ultra")) return "ultra";
  if (subs.includes("premium")) return "premium";
  return "standard";
}

export function classifyBmi(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "gauge-under", pos: 12 };
  if (bmi < 25) return { label: "Normal", color: "gauge-normal", pos: 37 };
  if (bmi < 30) return { label: "Overweight", color: "gauge-over", pos: 62 };
  return { label: "Obese", color: "gauge-obese", pos: 87 };
}
