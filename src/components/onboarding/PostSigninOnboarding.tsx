import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Scale, Swords, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Focus = "mma" | "boxing" | "bodybuilding" | "calisthenics" | "other" | "skip";

const FOCUS_OPTIONS: { id: Focus; label: string; emoji: string }[] = [
  { id: "mma", label: "MMA", emoji: "🥋" },
  { id: "boxing", label: "Boxing", emoji: "🥊" },
  { id: "bodybuilding", label: "Bodybuilding", emoji: "💪" },
  { id: "calisthenics", label: "Calisthenics", emoji: "🤸" },
  { id: "other", label: "Other", emoji: "✨" },
  { id: "skip", label: "Skip for now", emoji: "→" },
];

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export default function PostSigninOnboarding({
  onDone,
}: {
  onDone: () => void;
}) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<"bmi" | "focus">("bmi");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [otherText, setOtherText] = useState<string>("");
  const [selected, setSelected] = useState<Focus | null>(null);
  const [saving, setSaving] = useState(false);

  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmi = h > 0 && w > 0 ? +(w / Math.pow(h / 100, 2)).toFixed(1) : null;

  async function saveAndFinish() {
    if (!user || !selected) return;
    setSaving(true);
    try {
      const focusGoal =
        selected === "other" && otherText.trim()
          ? `other:${otherText.trim().slice(0, 60)}`
          : selected;
      const update: {
        goals: string[];
        height_cm?: number;
        weight_kg?: number;
        bmi?: number;
        bmi_category?: string;
      } = { goals: [focusGoal] };
      if (bmi) {
        update.height_cm = h;
        update.weight_kg = w;
        update.bmi = bmi;
        update.bmi_category = bmiCategory(bmi);
      }
      const { error } = await supabase
        .from("profiles")
        .update(update)
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile locked in. Meet your coach.");
      onDone();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md border-2 border-crimson/50 bg-background p-6 shadow-crimson"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-crimson">
            {step === "bmi" ? (
              <Scale className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Swords className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider">
              {step === "bmi" ? "Your Body Stats" : "Pick Your Discipline"}
            </h2>
            <p className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
              Step {step === "bmi" ? "1" : "2"} of 2
            </p>
          </div>
        </div>

        {step === "bmi" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                  Height (cm)
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson"
                />
              </label>
              <label className="block">
                <div className="mb-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                  Weight (kg)
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="72"
                  className="w-full border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson"
                />
              </label>
            </div>
            {bmi && (
              <div className="mt-4 border border-crimson/40 bg-crimson/5 p-3">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                  Your BMI
                </div>
                <div className="mt-0.5 font-display text-2xl tracking-wider">
                  {bmi}{" "}
                  <span className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    · {bmiCategory(bmi)}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setStep("focus")}
              disabled={!bmi}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-40"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStep("focus")}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Skip body stats
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              What do you want to train for? The coach will build your plan around it.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  className={`flex items-center justify-between border px-3 py-3 font-mono-tech text-xs uppercase tracking-widest transition ${
                    selected === f.id
                      ? "border-crimson bg-crimson/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-crimson hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{f.emoji}</span>
                    {f.label}
                  </span>
                  {selected === f.id && <Check className="h-3.5 w-3.5 text-crimson" />}
                </button>
              ))}
            </div>
            {selected === "other" && (
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="e.g. Powerlifting, Muay Thai, Climbing…"
                className="mt-3 w-full border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson"
                maxLength={60}
              />
            )}
            <button
              onClick={saveAndFinish}
              disabled={!selected || saving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  Meet the Coach <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              onClick={() => setStep("bmi")}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}