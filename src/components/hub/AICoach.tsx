import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Loader2, Settings, Sparkles, Trash2, Copy, AlertTriangle, RotateCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";
import { useLang } from "@/lib/i18n";

const ARCHETYPES = [
  {
    id: "kratos",
    name: "Kratos",
    tag: "God of War",
    desc: "Brutal strength, no mercy.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp2683901.jpg&f=1&ipt=1e1140cde3162f8e8c5ff047f8cdbb22d14011c36a499f035d4fb8d2f6061f22",
  },
  {
    id: "yujiro",
    name: "Yujiro Hanma",
    tag: "The Ogre",
    desc: "Raw primal violence.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperbat.com%2Fimg%2F803104-yujiro-hanma-wallpaper-discover-more-anime-baki-the-grappler-grappler-baki-manga-yujiro-wallpaper-anime-artwork-wallpaper-western-anime-sky-anime.jpg&f=1&ipt=67233f8845dcd1907b78f74b66e2c78d05c72f45fea8949f23d63930aa90f5eb",
  },
  {
    id: "khabib",
    name: "Khabib Nurmagomedov",
    tag: "The Eagle",
    desc: "Dagestani grappling, unbreakable will.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmrwallpaper.com%2Fimages%2Fhd%2Fkhabib-nurmagomedov-grappling-ar25l6ya1tq8f7rf.jpg&f=1&ipt=41db277f3f63eea0df018480d6a0f7874a5eb0a8856a64042f2ce0d56b48282b",
  },
  {
    id: "khamzat",
    name: "Khamzat Chimaev",
    tag: "Borz",
    desc: "Smesh mode. Relentless pressure.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fheavy.com%2Fwp-content%2Fuploads%2F2023%2F01%2FGettyImages-1390588421-e1672814533816.jpg%3Fquality%3D65%26strip%3Dall%26w%3D780&f=1&ipt=ea4faed572ebc64d36800da11c453fcffcffa05afa6648adea6a1d33b7c825db",
  },
];

const GOALS = ["Strength", "Hypertrophy", "Calisthenics Mastery", "Fat Loss", "Endurance"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * AICoach
 * ------------------------------------------------------------------
 * Front-End Development Project — Jaloliddin Zoxidov (ID: 250040)
 *
 * - useState: holds the form configuration (archetype, goal, level),
 *   the loading flag, and the generated plan markdown.
 * - useEffect: rehydrates the last generated plan from localStorage
 *   so the user keeps their workout after refreshing.
 * - API fetching: `supabase.functions.invoke()` calls a serverless
 *   Edge Function that proxies Google Gemini via the Lovable AI
 *   Gateway. All errors are caught with try/catch and surfaced to the
 *   user through `sonner` toasts.
 */
const AICoach = () => {
  const { t } = useLang();
  // --- React state -------------------------------------------------
  const [archetype, setArchetype] = useState("kratos");
  const [goal, setGoal] = useState("Calisthenics Mastery");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Restore the last generated plan on mount so refresh doesn't wipe it.
  useEffect(() => {
    const saved = storage.getPlan();
    if (saved) {
      setPlan(saved.plan);
      setArchetype(saved.archetype);
      setGoal(saved.goal);
    }
  }, []);

  // Fetch the AI workout protocol from our Edge Function.
  // try/catch covers both network failures and AI gateway errors.
  const generate = async () => {
    setLoading(true);
    setPlan("");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: { archetype: ARCHETYPES.find(a => a.id === archetype)?.name, goal, level },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const text: string = data?.plan ?? "";
      setPlan(text);
      storage.setPlan({
        archetype, goal, plan: text,
        savedAt: new Date().toISOString(),
      });
      toast.success("Protocol forged. Moshshniy!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setErrorMsg(msg);
      toast.error(`Coach offline: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const clearPlan = () => {
    setPlan("");
    localStorage.removeItem("absolute_frame_plan");
    toast.message("Vault cleared.");
  };

  // Copy the generated protocol to the user's clipboard.
  const copyPlan = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      toast.success("Protocol copied to clipboard.");
    } catch {
      toast.error("Clipboard unavailable on this device.");
    }
  };

  return (
    <section id="coach" className="border-b border-border py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag={t("co_tag")}
          title={<>{t("co_title_1")} <span className="text-crimson">{t("co_title_2")}</span></>}
          subtitle={t("co_sub")}
        />

        <div className="grid gap-px border-frame bg-border lg:grid-cols-[380px_1fr]">
          {/* Config */}
          <div className="bg-card p-8">
            <div className="mb-6 flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
              <Settings className="h-3.5 w-3.5" /> Configuration
            </div>

            <div className="space-y-3">
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">Warrior Archetype</div>
              <div className="grid grid-cols-2 gap-2">
                {ARCHETYPES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setArchetype(a.id)}
                    className={`group overflow-hidden border-2 text-left transition ${archetype === a.id ? "border-primary shadow-crimson" : "border-border hover:border-primary/60"}`}
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
                    <div className="p-2.5">
                      <div className="font-display text-base leading-tight">{a.name}</div>
                      <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">{a.tag}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">Goal</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`border px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest transition ${goal === g ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">Level</div>
              <div className="mt-2 flex gap-1.5">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`flex-1 border px-3 py-2 font-mono-tech text-[11px] uppercase tracking-widest transition ${level === l ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Forging...</> : <><Sparkles className="h-4 w-4" /> {t("co_generate")}</>}
            </button>

            {plan && (
              <button onClick={clearPlan} className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-3 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:text-crimson hover:border-primary">
                <Trash2 className="h-3.5 w-3.5" /> Clear Vault
              </button>
            )}
          </div>

          {/* Output */}
          <div className="relative min-h-[500px] bg-card p-8 md:p-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-crimson" /> Protocol Output
              </div>
              <div className="flex items-center gap-3">
                {plan && (
                  <button
                    onClick={copyPlan}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-crimson"
                  >
                    <Copy className="h-3 w-3" /> Copy Protocol
                  </button>
                )}
                {plan && <span className="font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">● Saved</span>}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-crimson" />
                  <div className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    Channeling primordial energy...
                  </div>
                </motion.div>
              )}

              {!loading && errorMsg && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center">
                  <div className="w-full max-w-md border-2 border-primary bg-primary/10 p-6 shadow-crimson">
                    <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-crimson">
                      <AlertTriangle className="h-4 w-4" /> System Failure
                    </div>
                    <div className="mt-3 font-display text-2xl text-foreground">
                      Xatolik: Coach Offline.
                    </div>
                    <div className="mt-1 font-mono-tech text-sm text-muted-foreground">
                      Aka, internetni tekshiring!
                    </div>
                    <div className="mt-3 break-words border-t border-primary/40 pt-3 font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                      {errorMsg}
                    </div>
                    <button
                      onClick={generate}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
                    >
                      <RotateCw className="h-4 w-4" /> {t("co_try_again")}
                    </button>
                  </div>
                </motion.div>
              )}

              {!loading && !errorMsg && !plan && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-3 text-center">
                  <div className="font-display text-4xl text-stroke">AWAITING SUMMON</div>
                  <div className="max-w-sm font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    Configure your archetype and forge the protocol. Aka, ready bo'l.
                  </div>
                </motion.div>
              )}

              {!loading && !errorMsg && plan && (
                <motion.article key="plan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:tracking-wide prose-h1:text-4xl prose-h1:text-crimson prose-h2:text-2xl prose-h2:mt-8 prose-h2:border-l-2 prose-h2:border-primary prose-h2:pl-3 prose-strong:text-crimson prose-table:font-mono-tech prose-table:text-xs prose-th:bg-muted prose-th:text-foreground prose-td:border-border prose-blockquote:border-l-primary prose-blockquote:not-italic prose-blockquote:text-foreground"
                >
                  <ReactMarkdown>{plan}</ReactMarkdown>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AICoach;