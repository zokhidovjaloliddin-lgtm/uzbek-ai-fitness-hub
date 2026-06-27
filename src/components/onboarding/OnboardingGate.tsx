import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Two-step onboarding shown only until the user picks a language.
 * Step 1: Language selection (locks the rest of the app).
 * Step 2: Welcome splash with "Let's Get Started".
 */
export default function OnboardingGate() {
  const { hasChosen, setLang, t } = useLang();
  const [step, setStep] = useState<"lang" | "welcome">("lang");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // If language is already chosen from a previous session, do not block.
  if (hasChosen && step === "lang") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      >
        {step === "lang" ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md border-2 border-crimson/50 bg-background p-8 shadow-crimson"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center bg-crimson">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl tracking-wider">{t("onb_pick_language")}</h2>
            </div>
            <div className="grid gap-3">
              <button
                onClick={() => { setLang("en"); setStep("welcome"); }}
                className="group flex items-center justify-between border border-border bg-card px-5 py-4 font-mono-tech uppercase tracking-widest transition hover:border-crimson hover:bg-crimson/10"
              >
                <span>{t("onb_english")}</span>
                <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </button>
              <button
                onClick={() => { setLang("uz"); setStep("welcome"); }}
                className="group flex items-center justify-between border border-border bg-card px-5 py-4 font-mono-tech uppercase tracking-widest transition hover:border-crimson hover:bg-crimson/10"
              >
                <span>{t("onb_uzbek")}</span>
                <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </button>
              <button
                onClick={() => { setLang("ru"); setStep("welcome"); }}
                className="group flex items-center justify-between border border-border bg-card px-5 py-4 font-mono-tech uppercase tracking-widest transition hover:border-crimson hover:bg-crimson/10"
              >
                <span>{t("onb_russian")}</span>
                <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg border-2 border-crimson/50 bg-background p-8 text-center shadow-crimson"
          >
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center bg-crimson shadow-crimson">
              <Flame className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-4xl tracking-wider">{t("onb_welcome_title")}</h2>
            <p className="mx-auto mt-3 max-w-sm font-mono-tech text-sm uppercase tracking-widest text-muted-foreground">
              {t("onb_welcome_sub")}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="mt-8 inline-flex items-center gap-2 bg-crimson px-8 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
            >
              {t("onb_get_started")} <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}