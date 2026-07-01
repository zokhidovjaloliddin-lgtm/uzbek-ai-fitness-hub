// Funnel state machine helpers — persists per-step selections so the final
// AI Coach step can dynamically incorporate everything the user picked.

const K_STEP = "absolute_frame_funnel_step";
const K_DISC = "absolute_frame_funnel_discipline";
const K_ARCH = "absolute_frame_funnel_archetype";

export type FunnelDisciplinePreset =
  | "mma"
  | "calisthenics"
  | "mixed"
  | "power";

// Map the 4 user-facing presets to the discipline ids AICoach understands.
export const DISCIPLINE_PRESET_MAP: Record<FunnelDisciplinePreset, string[]> = {
  mma: ["mma"],
  calisthenics: ["calisthenics"],
  mixed: ["mma", "boxing", "muay"],
  power: ["mma", "boxing", "kurash", "muay", "calisthenics"],
};

export const funnelStorage = {
  getStep(): number {
    const raw = localStorage.getItem(K_STEP);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
  },
  setStep(n: number) {
    localStorage.setItem(K_STEP, String(n));
  },
  getDiscipline(): FunnelDisciplinePreset | null {
    const raw = localStorage.getItem(K_DISC);
    if (raw === "mma" || raw === "calisthenics" || raw === "mixed" || raw === "power") return raw;
    return null;
  },
  setDiscipline(d: FunnelDisciplinePreset) {
    localStorage.setItem(K_DISC, d);
  },
  getArchetype(): string | null {
    return localStorage.getItem(K_ARCH);
  },
  setArchetype(a: string) {
    localStorage.setItem(K_ARCH, a);
  },
  getDisciplineIds(): string[] | null {
    const preset = funnelStorage.getDiscipline();
    return preset ? DISCIPLINE_PRESET_MAP[preset] : null;
  },
};