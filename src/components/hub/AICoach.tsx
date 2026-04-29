import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Loader2, Settings, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";

const ARCHETYPES = [
  { id: "kratos", name: "Kratos", tag: "God of War", desc: "Brutal strength, no mercy." },
  { id: "yujiro", name: "Yujiro Hanma", tag: "The Ogre", desc: "Raw primal violence." },
  { id: "wukong", name: "Sun Wukong", tag: "Monkey King", desc: "Agility, mischief, infinite stamina." },
  { id: "spartan", name: "Spartan", tag: "300", desc: "Phalanx discipline." },
  { id: "musashi", name: "Miyamoto Musashi", tag: "Sword Saint", desc: "Calm mind, lethal body." },
  { id: "alpamish", name: "Alpamish", tag: "Uzbek Bahodir", desc: "Steppe warrior endurance." },
];

const GOALS = ["Strength", "Hypertrophy", "Calisthenics Mastery", "Fat Loss", "Endurance"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const AICoach = () => {
  const [archetype, setArchetype] = useState("kratos");
  const [goal, setGoal] = useState("Calisthenics Mastery");
  const [level, setLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    const saved = storage.getPlan();
    if (saved) {
      setPlan(saved.plan);
      setArchetype(saved.archetype);
      setGoal(saved.goal);
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setPlan("");
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

  return (
    <section id="coach" className="border-b border-border py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag="02 / Primordial AI Coach"
          title={<>SUMMON YOUR <span className="text-crimson">ARCHETYPE.</span></>}
          subtitle="Gemini-powered protocol generator. Speaks Uzbek-English slang. Knows the Tashkent calisthenics circuit."
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
                    className={`border p-3 text-left transition ${archetype === a.id ? "border-primary bg-primary/10 shadow-crimson" : "border-border hover:border-muted-foreground"}`}
                  >
                    <div className="font-display text-lg">{a.name}</div>
                    <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">{a.tag}</div>
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
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Forging...</> : <><Sparkles className="h-4 w-4" /> Generate Protocol</>}
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
              {plan && <span className="font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">● Saved to vault</span>}
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

              {!loading && !plan && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-[400px] flex-col items-center justify-center gap-3 text-center">
                  <div className="font-display text-4xl text-stroke">AWAITING SUMMON</div>
                  <div className="max-w-sm font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    Configure your archetype and forge the protocol. Aka, ready bo'l.
                  </div>
                </motion.div>
              )}

              {!loading && plan && (
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