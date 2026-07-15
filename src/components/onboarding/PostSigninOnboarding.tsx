import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Scale, Swords, Loader2, Check, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import AvatarPicker from "@/components/home/AvatarPicker";

type Focus = "mma" | "boxing" | "bodybuilding" | "calisthenics" | "other" | "skip";
type Step = "name" | "bmi" | "focus";

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
  const { user, profile } = useAuth();
  const { t, lang } = useLang();
  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState<string>(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [otherText, setOtherText] = useState<string>("");
  const [selected, setSelected] = useState<Focus | null>(null);
  const [saving, setSaving] = useState(false);

  const h = parseFloat(height);
  const w = parseFloat(weight);
  const bmi = h > 0 && w > 0 ? +(w / Math.pow(h / 100, 2)).toFixed(1) : null;

  const FOCUS_OPTIONS: { id: Focus; labelKey: Parameters<typeof t>[0]; emoji: string }[] = [
    { id: "mma", labelKey: "onb_focus_mma", emoji: "🥋" },
    { id: "boxing", labelKey: "onb_focus_boxing", emoji: "🥊" },
    { id: "bodybuilding", labelKey: "onb_focus_bb", emoji: "💪" },
    { id: "calisthenics", labelKey: "onb_focus_cali", emoji: "🤸" },
    { id: "other", labelKey: "onb_focus_other", emoji: "✨" },
    { id: "skip", labelKey: "onb_focus_skip", emoji: "→" },
  ];

  const stepNum = step === "name" ? 1 : step === "bmi" ? 2 : 3;

  async function finish(finalSelected: Focus | null) {
    if (!user) return;
    setSaving(true);
    try {
      const goal = finalSelected
        ? finalSelected === "other" && otherText.trim()
          ? `other:${otherText.trim().slice(0, 60)}`
          : finalSelected
        : "skip";
      const update: {
        goals: string[];
        display_name?: string | null;
        avatar_url?: string | null;
        preferred_language?: string;
        height_cm?: number;
        weight_kg?: number;
        bmi?: number;
        bmi_category?: string;
      } = { goals: [goal], preferred_language: lang };
      if (displayName.trim()) update.display_name = displayName.trim().slice(0, 60);
      if (avatarUrl) update.avatar_url = avatarUrl;
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
      toast.success(t("onb_profile_locked"));
      onDone();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("auth_failed");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const StepIcon =
    step === "name" ? User2 : step === "bmi" ? Scale : Swords;
  const stepTitle =
    step === "name" ? t("onb_name_title") : step === "bmi" ? t("onb_bmi_title") : t("onb_focus_title");

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md border-2 border-crimson/50 bg-background p-6 shadow-crimson"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-crimson">
            <StepIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider">{stepTitle}</h2>
            <p className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("onb_step_of").replace("{n}", String(stepNum))}
            </p>
          </div>
        </div>

        {step === "name" ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{t("onb_name_sub")}</p>

            <div className="mb-4 flex items-center gap-4 border border-border bg-card p-3">
              <AvatarPicker
                userId={user?.id ?? null}
                avatarUrl={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
              />
              <div className="min-w-0">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                  {t("onb_photo_label")}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t("onb_photo_upload")}
                </div>
              </div>
            </div>

            <label className="block">
              <div className="mb-1 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                {t("onb_name_label")}
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("onb_name_placeholder")}
                maxLength={60}
                className="w-full border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson"
              />
            </label>

            <button
              onClick={() => setStep("bmi")}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
            >
              {t("onb_continue")} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStep("bmi")}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("onb_skip_later")}
            </button>
          </>
        ) : step === "bmi" ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">{t("onb_bmi_sub")}</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("onb_height")}
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
                  {t("onb_weight")}
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
                  {t("onb_your_bmi")}
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
              {t("onb_continue")} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStep("focus")}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("onb_skip_later")}
            </button>
            <button
              onClick={() => setStep("name")}
              className="mt-1 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("onb_back")}
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">{t("onb_focus_sub")}</p>
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
                    {t(f.labelKey)}
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
                placeholder={t("onb_focus_other_ph")}
                className="mt-3 w-full border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson"
                maxLength={60}
              />
            )}
            <button
              onClick={() => finish(selected)}
              disabled={!selected || saving}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("onb_saving")}
                </>
              ) : (
                <>
                  {t("onb_meet_coach")} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              onClick={() => finish("skip")}
              disabled={saving}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("onb_skip_later")}
            </button>
            <button
              onClick={() => setStep("bmi")}
              disabled={saving}
              className="mt-2 w-full text-center font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("onb_back")}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}