import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Loader2, Settings, Sparkles, Trash2, Copy, AlertTriangle, RotateCw, Lock, Play, ChevronDown, ChevronUp, Video, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";
import { useLang, T } from "@/lib/i18n";

const ARCHETYPES = [
  {
    id: "kratos",
    name: "Kratos",
    tag: "God of War",
    desc: "Brutal strength, no mercy.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp2683901.jpg&f=1&ipt=1e1140cde3162f8e8c5ff047f8cdbb22d14011c36a499f035d4fb8d2f6061f22",
    primary: "aPxjmVY8mQg",
    gallery: ["DoLknLWDpwY", "e4NK6lc5mDA"],
  },
  {
    id: "yujiro",
    name: "Yujiro Hanma",
    tag: "The Ogre",
    desc: "Raw primal violence.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperbat.com%2Fimg%2F803104-yujiro-hanma-wallpaper-discover-more-anime-baki-the-grappler-grappler-baki-manga-yujiro-wallpaper-anime-artwork-wallpaper-western-anime-sky-anime.jpg&f=1&ipt=67233f8845dcd1907b78f74b66e2c78d05c72f45fea8949f23d63930aa90f5eb",
    primary: "iGo6MiBrHGg",
    gallery: ["nmin3eOO_DA", "XfWnc97PQW4"],
  },
  {
    id: "khabib",
    name: "Khabib Nurmagomedov",
    tag: "The Eagle",
    desc: "Dagestani grappling, unbreakable will.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmrwallpaper.com%2Fimages%2Fhd%2Fkhabib-nurmagomedov-grappling-ar25l6ya1tq8f7rf.jpg&f=1&ipt=41db277f3f63eea0df018480d6a0f7874a5eb0a8856a64042f2ce0d56b48282b",
    primary: "wPonsvTJNnU",
    gallery: ["ViJC105vG-s", "qijolcTZoCs"],
  },
  {
    id: "khamzat",
    name: "Khamzat Chimaev",
    tag: "Borz",
    desc: "Smesh mode. Relentless pressure.",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fheavy.com%2Fwp-content%2Fuploads%2F2023%2F01%2FGettyImages-1390588421-e1672814533816.jpg%3Fquality%3D65%26strip%3Dall%26w%3D780&f=1&ipt=ea4faed572ebc64d36800da11c453fcffcffa05afa6648adea6a1d33b7c825db",
    primary: "3oSQDXXnXAs",
    gallery: ["7GKN1U0ZVd4", "oKn8reI-ojk"],
  },
];

const DISCIPLINES = [
  { id: "mma", key: "d_mma" as const },
  { id: "boxing", key: "d_box" as const },
  { id: "kurash", key: "d_wre" as const },
  { id: "muay", key: "d_muay" as const },
  { id: "street", key: "d_street" as const },
  { id: "calisthenics", key: "d_cali" as const },
];

const GOALS = ["Strength", "Hypertrophy", "Calisthenics Mastery", "Fat Loss", "Endurance"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/**
 * AICoach
 * ------------------------------------------------------------------
 * Front-End Development Project — Jaloliddin Zoxidov (ID: 250040)
 *
 * - useState: form config (archetype, multi-select disciplines up to 5,
 *   goal, level), the loading/error flags, the generated plan markdown,
 *   the "briefing watched" gate, and the gallery modal.
 * - useEffect: rehydrates the last generated plan from localStorage so
 *   the user keeps their workout after refreshing.
 * - API fetching: `supabase.functions.invoke()` calls a serverless
 *   Edge Function that proxies Google Gemini via the Lovable AI
 *   Gateway. All errors are caught with try/catch and surfaced to the
 *   user through `sonner` toasts and the Coach Offline error card.
 */
const AICoach = () => {
  const { t, lang } = useLang();
  // --- React state -------------------------------------------------
  const [archetype, setArchetype] = useState("kratos");
  const [disciplines, setDisciplines] = useState<string[]>(["calisthenics", "boxing"]);
  const [goal, setGoal] = useState("Calisthenics Mastery");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [briefingWatched, setBriefingWatched] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const selectedArchetype = useMemo(
    () => ARCHETYPES.find(a => a.id === archetype) ?? ARCHETYPES[0],
    [archetype]
  );

  // Reset briefing & gallery when archetype changes — user must re-watch.
  useEffect(() => {
    setBriefingWatched(false);
    setGalleryOpen(false);
  }, [archetype, selectedArchetype.primary]);

  // Restore the last generated plan on mount.
  useEffect(() => {
    const saved = storage.getPlan();
    if (saved) {
      setPlan(saved.plan);
      setArchetype(saved.archetype);
      setGoal(saved.goal);
    }
  }, []);

  const toggleDiscipline = (id: string) => {
    setDisciplines((cur) => {
      if (cur.includes(id)) return cur.filter(x => x !== id);
      if (cur.length >= 5) {
        toast.error("Max 5 disciplines.");
        return cur;
      }
      return [...cur, id];
    });
  };

  const generate = async () => {
    if (!briefingWatched) {
      toast.error(t("co_locked"));
      return;
    }
    setLoading(true);
    setPlan("");
    setErrorMsg("");
    try {
      const disciplineNames = disciplines
        .map(d => DISCIPLINES.find(x => x.id === d))
        .filter(Boolean)
        .map(d => T[d!.key].en);
      const { data, error } = await supabase.functions.invoke("generate-workout", {
        body: {
          archetype: selectedArchetype.name,
          goal,
          level,
          disciplines: disciplineNames,
          lang,
        },
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

  const copyPlan = async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      toast.success("Protocol copied to clipboard.");
    } catch {
      toast.error("Clipboard unavailable on this device.");
    }
  };

  // Need to import T inside component for prompt label translations
  // (we re-import below to keep the i18n module the single source).
  return (
    <section id="coach" className="border-b border-border bg-noir py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag={t("co_tag")}
          title={<>{t("co_title_1")} <span className="text-crimson">{t("co_title_2")}</span></>}
          subtitle={t("co_sub")}
        />

        {/* MISSION BRIEFING — full-width hero video */}
        <div className="mb-10 border-2 border-primary bg-noir p-5 shadow-crimson md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-crimson">
              <Video className="h-3.5 w-3.5" /> {t("co_briefing")} · {selectedArchetype.name}
            </div>
            {briefingWatched && (
              <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">
                <CheckCircle2 className="h-3.5 w-3.5" /> {t("co_unlocked")}
              </div>
            )}
          </div>
          <div className="mb-4 font-mono-tech text-[11px] text-muted-foreground">{t("co_briefing_sub")}</div>

          <div className="mx-auto w-full max-w-4xl">
            <div className="relative aspect-video w-full overflow-hidden border-crimson-glow">
              <iframe
                key={selectedArchetype.primary}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${selectedArchetype.primary}?rel=0&modestbranding=1`}
                title={`${selectedArchetype.name} briefing`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <button
              onClick={() => setBriefingWatched(true)}
              disabled={briefingWatched}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 px-6 py-4 font-mono-tech text-xs uppercase tracking-widest transition ${
                briefingWatched
                  ? "border-2 border-gauge-normal bg-transparent text-gauge-normal cursor-default"
                  : "bg-crimson text-primary-foreground hover:bg-primary-glow shadow-crimson"
              }`}
            >
              {briefingWatched ? <><CheckCircle2 className="h-4 w-4" /> {t("co_unlocked")}</> : <><Sparkles className="h-4 w-4" /> {t("co_ready")}</>}
            </button>

            {selectedArchetype.gallery.length > 0 && (
              <button
                onClick={() => setGalleryOpen(o => !o)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-primary px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-crimson transition hover:bg-primary hover:text-primary-foreground"
              >
                {galleryOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {galleryOpen ? t("co_hide_edits") : t("co_more_edits")} · {selectedArchetype.name}
              </button>
            )}

            <AnimatePresence initial={false}>
              {galleryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {selectedArchetype.gallery.map((id) => (
                      <div key={id} className="aspect-video w-full overflow-hidden border-crimson-glow">
                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
                          title={`${selectedArchetype.name} edit ${id}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid gap-px border-frame bg-border lg:grid-cols-[380px_1fr]">
          {/* Config */}
          <div className="bg-card p-8">
            <div className="mb-6 flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
              <Settings className="h-3.5 w-3.5" /> {t("co_config")}
            </div>

            <div className="space-y-3">
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">{t("co_archetype")}</div>
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
              <div className="flex items-center justify-between">
                <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">{t("co_disciplines")}</div>
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">{disciplines.length}/5</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DISCIPLINES.map(d => {
                  const on = disciplines.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => toggleDiscipline(d.id)}
                      className={`border px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                      {t(d.key)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">{t("co_goal")}</div>
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
              <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">{t("co_level")}</div>
              <div className="mt-2 flex gap-1.5">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`flex-1 border px-3 py-2 font-mono-tech text-[11px] uppercase tracking-widest transition ${level === l ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* MISSION BRIEFING GATE */}
            <button
              onClick={generate}
              disabled={loading || !briefingWatched}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("co_forging")}</>
                : !briefingWatched ? <><Lock className="h-4 w-4" /> {t("co_locked")}</>
                : <><Sparkles className="h-4 w-4" /> {t("co_generate")}</>}
            </button>

            {plan && (
              <button onClick={clearPlan} className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-3 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:text-crimson hover:border-primary">
                <Trash2 className="h-3.5 w-3.5" /> {t("co_clear")}
              </button>
            )}
          </div>

          {/* Output */}
          <div className="relative min-h-[500px] bg-card p-8 md:p-10 border-crimson-glow">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-crimson" /> {t("co_output")}
              </div>
              <div className="flex items-center gap-3">
                {plan && (
                  <button
                    onClick={copyPlan}
                    className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-crimson"
                  >
                    <Copy className="h-3 w-3" /> {t("co_copy")}
                  </button>
                )}
                {plan && <span className="font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">● {t("co_saved")}</span>}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-crimson" />
                  <div className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    {t("co_loading")}
                  </div>
                </motion.div>
              )}

              {!loading && errorMsg && (
                <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center">
                  <div className="w-full max-w-md border-2 border-primary bg-primary/10 p-6 shadow-crimson">
                    <div className="flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-widest text-crimson">
                      <AlertTriangle className="h-4 w-4" /> {t("co_err_tag")}
                    </div>
                    <div className="mt-3 font-display text-2xl text-foreground">
                      {t("co_err_title")}
                    </div>
                    <div className="mt-1 font-mono-tech text-sm text-muted-foreground">
                      {t("co_err_sub")}
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
                  <div className="font-display text-4xl text-stroke">{t("co_empty_title")}</div>
                  <div className="max-w-sm font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    {t("co_empty_sub")}
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

      {/* WATCH MORE EDITS gallery modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4"
            onClick={() => setGalleryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl border-2 border-primary bg-card shadow-crimson"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="font-display text-2xl">{selectedArchetype.name} · Edits</div>
                <button onClick={() => setGalleryOpen(false)} className="text-muted-foreground hover:text-crimson">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {selectedArchetype.gallery.map((id) => (
                  <div key={id} className="aspect-video w-full overflow-hidden border-crimson-glow">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
                      title={`${selectedArchetype.name} edit ${id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-4 text-right">
                <button onClick={() => setGalleryOpen(false)} className="border border-border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest hover:border-primary hover:text-crimson">
                  {t("co_close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AICoach;
