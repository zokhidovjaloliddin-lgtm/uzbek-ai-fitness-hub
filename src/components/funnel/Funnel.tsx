import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Globe, Sword, Dumbbell, Layers, Zap, Play, CheckCircle2, SkipForward, User2 } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";
import { funnelStorage, type FunnelDisciplinePreset, DISCIPLINE_PRESET_MAP } from "@/lib/funnel";
import BodyAnalysis from "@/components/hub/BodyAnalysis";
import AICoach from "@/components/hub/AICoach";
import Pricing from "@/components/hub/Pricing";
import Footer from "@/components/hub/Footer";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ARCHETYPES = [
  { id: "yujiro", name: "Yujiro Hanma", tag: "The Ogre", primary: "iGo6MiBrHGg",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperbat.com%2Fimg%2F803104-yujiro-hanma-wallpaper-discover-more-anime-baki-the-grappler-grappler-baki-manga-yujiro-wallpaper-anime-artwork-wallpaper-western-anime-sky-anime.jpg&f=1&ipt=67233f8845dcd1907b78f74b66e2c78d05c72f45fea8949f23d63930aa90f5eb" },
  { id: "kratos", name: "Kratos", tag: "God of War", primary: "aPxjmVY8mQg",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp2683901.jpg&f=1&ipt=1e1140cde3162f8e8c5ff047f8cdbb22d14011c36a499f035d4fb8d2f6061f22" },
  { id: "khamzat", name: "Khamzat Chimaev", tag: "Borz", primary: "3oSQDXXnXAs",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fheavy.com%2Fwp-content%2Fuploads%2F2023%2F01%2FGettyImages-1390588421-e1672814533816.jpg%3Fquality%3D65%26strip%3Dall%26w%3D780&f=1&ipt=ea4faed572ebc64d36800da11c453fcffcffa05afa6648adea6a1d33b7c825db" },
  { id: "khabib", name: "Khabib Nurmagomedov", tag: "The Eagle", primary: "wPonsvTJNnU",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmrwallpaper.com%2Fimages%2Fhd%2Fkhabib-nurmagomedov-grappling-ar25l6ya1tq8f7rf.jpg&f=1&ipt=41db277f3f63eea0df018480d6a0f7874a5eb0a8856a64042f2ce0d56b48282b" },
] as const;

const TOTAL_STEPS = 6;

export default function Funnel() {
  const { t, lang, setLang, hasChosen } = useLang();
  const [step, setStep] = useState<number>(() => {
    // If user has a language chosen from a prior session, jump ahead to at
    // least step 2 so they don't have to re-pick it every reload.
    const saved = funnelStorage.getStep();
    return saved;
  });

  useEffect(() => {
    funnelStorage.setStep(step);
  }, [step]);

  const goNext = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
          {step === 1 && (
            <Step1Language
              lang={lang}
              onPick={(l) => { setLang(l); goNext(); }}
            />
          )}
          {step === 2 && <Step2Discipline onBack={goBack} onNext={goNext} />}
          {step === 3 && <Step3Body onBack={goBack} onNext={goNext} />}
          {step === 4 && <Step4Archetype onBack={goBack} onNext={goNext} />}
          {step === 5 && <Step5Briefing onBack={goBack} onNext={goNext} />}
          {step === 6 && <Step6Coach onBack={goBack} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* -------------------- Shared UI -------------------- */

function StepShell({
  step,
  title,
  subtitle,
  onBack,
  children,
  hideBack,
}: {
  step: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  hideBack?: boolean;
}) {
  const { t } = useLang();
  return (
    <section className="min-h-[calc(100vh-72px)] py-12 md:py-20">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          {!hideBack && onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("fn_back")}
            </button>
          ) : <span />}
          <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("fn_step")} {step} {t("fn_of")} {TOTAL_STEPS}
          </div>
        </div>
        <div className="mb-8 h-[2px] w-full bg-border">
          <div
            className="h-full bg-crimson transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="mb-8">
          <h2 className="font-display text-4xl tracking-wider md:text-6xl">{title}</h2>
          {subtitle && (
            <p className="mt-3 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* -------------------- Step 1: Language -------------------- */

function Step1Language({ lang, onPick }: { lang: Lang; onPick: (l: Lang) => void }) {
  const { t } = useLang();
  const opts: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "uz", label: "O'zbek" },
    { code: "ru", label: "Русский" },
  ];
  return (
    <StepShell step={1} title={t("fn_s1_title")} subtitle={t("fn_s1_sub")} hideBack>
      <div className="grid gap-3 md:grid-cols-3">
        {opts.map((o) => (
          <button
            key={o.code}
            onClick={() => onPick(o.code)}
            className={`group flex items-center justify-between border-2 bg-card px-6 py-6 text-left transition ${lang === o.code ? "border-crimson shadow-crimson" : "border-border hover:border-crimson"}`}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center bg-crimson">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display text-2xl tracking-wider">{o.label}</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">{o.code.toUpperCase()}</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </StepShell>
  );
}

/* -------------------- Step 2: Discipline -------------------- */

function Step2Discipline({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { t } = useLang();
  const [sel, setSel] = useState<FunnelDisciplinePreset | null>(() => funnelStorage.getDiscipline());
  const options: { id: FunnelDisciplinePreset; label: string; icon: React.ReactNode }[] = [
    { id: "mma", label: t("fn_d_mma"), icon: <Sword className="h-5 w-5" /> },
    { id: "calisthenics", label: t("fn_d_cali"), icon: <Dumbbell className="h-5 w-5" /> },
    { id: "mixed", label: t("fn_d_mixed"), icon: <Layers className="h-5 w-5" /> },
    { id: "power", label: t("fn_d_power"), icon: <Zap className="h-5 w-5" /> },
  ];
  const choose = (id: FunnelDisciplinePreset) => {
    setSel(id);
    funnelStorage.setDiscipline(id);
    setTimeout(onNext, 220);
  };
  return (
    <StepShell step={2} title={t("fn_s2_title")} subtitle={t("fn_s2_sub")} onBack={onBack}>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((o) => {
          const on = sel === o.id;
          return (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              className={`group flex items-center gap-4 border-2 bg-card p-6 text-left transition ${on ? "border-crimson shadow-crimson" : "border-border hover:border-crimson/60"}`}
            >
              <div className={`grid h-12 w-12 place-items-center border ${on ? "border-crimson bg-crimson text-primary-foreground" : "border-border"}`}>
                {o.icon}
              </div>
              <div className="flex-1">
                <div className="font-display text-2xl tracking-wider">{o.label}</div>
                <div className="mt-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                  {DISCIPLINE_PRESET_MAP[o.id].join(" · ").toUpperCase()}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

/* -------------------- Step 3: Body & optional sign-in -------------------- */

function Step3Body({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { t } = useLang();
  const { isAuthed, user } = useAuth();

  async function signInGoogle() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    }
  }

  return (
    <StepShell step={3} title={t("fn_s3_title")} subtitle={t("fn_s3_sub")} onBack={onBack}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
        <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">
          <User2 className="h-3.5 w-3.5" />
          {isAuthed && user?.email
            ? <span className="text-foreground">{user.email}</span>
            : <span>{t("fn_s3_optional")}</span>}
        </div>
        {!isAuthed && (
          <button
            onClick={signInGoogle}
            className="inline-flex items-center gap-2 border border-foreground px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest transition hover:bg-foreground hover:text-background"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.23 1.4-1.66 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.09.79 3.8 1.47l2.6-2.5C16.85 3.7 14.65 2.7 12 2.7 6.98 2.7 2.9 6.78 2.9 11.8s4.08 9.1 9.1 9.1c5.26 0 8.74-3.7 8.74-8.9 0-.6-.07-1.06-.15-1.5H12z"/>
            </svg>
            {t("fn_s3_google")}
          </button>
        )}
      </div>
      {/* Reuse the existing BodyAnalysis component to preserve all copy/logic. */}
      <div className="-mx-4 md:-mx-0">
        <BodyAnalysis />
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 border border-border px-5 py-3 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
        >
          <SkipForward className="h-3.5 w-3.5" /> {t("fn_skip")}
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
        >
          {t("fn_next")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </StepShell>
  );
}

/* -------------------- Step 4: Architect -------------------- */

function Step4Archetype({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { t } = useLang();
  const [sel, setSel] = useState<string | null>(() => funnelStorage.getArchetype());
  const choose = (id: string) => {
    setSel(id);
    funnelStorage.setArchetype(id);
    setTimeout(onNext, 220);
  };
  return (
    <StepShell step={4} title={t("fn_s4_title")} subtitle={t("fn_s4_sub")} onBack={onBack}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ARCHETYPES.map((a) => {
          const on = sel === a.id;
          return (
            <button
              key={a.id}
              onClick={() => choose(a.id)}
              className={`group overflow-hidden border-2 text-left transition ${on ? "border-crimson shadow-crimson" : "border-border hover:border-crimson/60"}`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <img
                  src={a.image}
                  alt={`${a.name} — ${a.tag}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
              <div className="p-3">
                <div className="font-display text-xl leading-tight">{a.name}</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">{a.tag}</div>
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

/* -------------------- Step 5: Briefing -------------------- */

function Step5Briefing({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { t } = useLang();
  const archId = funnelStorage.getArchetype() ?? "kratos";
  const arch = ARCHETYPES.find((a) => a.id === archId) ?? ARCHETYPES[1];
  const [watched, setWatched] = useState(false);
  return (
    <StepShell step={5} title={t("fn_s5_title")} subtitle={t("fn_s5_sub")} onBack={onBack}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">
          {arch.name} · {arch.tag}
        </div>
        {watched && (
          <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">
            <CheckCircle2 className="h-3.5 w-3.5" /> UNLOCKED
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative aspect-video w-full overflow-hidden border-crimson-glow">
          <iframe
            key={arch.primary}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${arch.primary}?rel=0&modestbranding=1`}
            title={`${arch.name} briefing`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {!watched ? (
          <button
            onClick={() => setWatched(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow shadow-crimson"
          >
            <Play className="h-4 w-4" /> {t("co_ready")}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-5 font-display text-lg uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow shadow-crimson"
          >
            {t("fn_s5_enter")} <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </StepShell>
  );
}

/* -------------------- Step 6: Final AI Coach hub -------------------- */

function Step6Coach({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  return (
    <div>
      <div className="container mx-auto max-w-6xl pt-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t("fn_back")}
          </button>
          <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("fn_step")} 6 {t("fn_of")} {TOTAL_STEPS}
          </div>
        </div>
      </div>
      <AICoach />
      <Pricing />
      <Footer />
    </div>
  );
}