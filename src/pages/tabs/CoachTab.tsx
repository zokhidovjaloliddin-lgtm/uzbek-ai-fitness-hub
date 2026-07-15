import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Send, Loader2, Sparkles, LogIn, CheckCircle2, Crown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { getActiveTier } from "@/lib/storage";
import { celebrate } from "@/lib/feedback";
import { toast } from "sonner";

type Msg = { id: string; role: "user" | "assistant"; text: string; pending?: boolean };

const RECS = ["rec_nutrition","rec_avoid","rec_recovery","rec_scale_up","rec_halal","rec_sleep"] as const;

export default function CoachTab() {
  const { t, lang } = useLang();
  const { profile, isAuthed, user } = useAuth();
  const nav = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const tier = useMemo(() => getActiveTier(), []);
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const proCap = 3;
  const proLocked = tier === "premium" && userMsgCount >= proCap;
  const isGuest = !isAuthed;

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => { composerRef.current?.focus(); }, []);

  // Load past history for signed-in users.
  useEffect(() => {
    if (!user || !isAuthed) { setMessages([]); return; }
    setLoadingHistory(true);
    supabase.from("chat_history")
      .select("id,message_role,message_text,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(80)
      .then(({ data }) => {
        const rows = (data ?? []).map((r) => ({
          id: r.id as string,
          role: r.message_role as "user" | "assistant",
          text: r.message_text as string,
        }));
        setMessages(rows);
      })
      .then(() => setLoadingHistory(false));
  }, [user?.id, isAuthed]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    if (proLocked) { toast.error("Pro chat cap reached. Upgrade to Ultra."); return; }
    const uMsg: Msg = { id: crypto.randomUUID(), role: "user", text: clean };
    const pending: Msg = { id: crypto.randomUUID(), role: "assistant", text: "", pending: true };
    setMessages((m) => [...m, uMsg, pending]);
    setInput("");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-coach", {
        body: {
          message: clean,
          context: {
            display_name: profile?.display_name ?? null,
            language: lang,
            bmi: profile?.bmi ?? null,
            bmi_category: profile?.bmi_category ?? null,
            chosen_character: profile?.chosen_character ?? null,
            tier: profile?.membership_tier ?? "free",
            intensity: profile?.intensity_level ?? "hard",
            weight_kg: profile?.weight_kg ?? null,
            height_cm: profile?.height_cm ?? null,
            training_focus: profile?.goals?.[0] ?? null,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply: string = data?.reply ?? "";
      setMessages((m) => m.map((x) => x.id === pending.id ? { ...x, text: reply, pending: false } : x));

      if (data?.plan_created) {
        celebrate();
        toast.success(`Plan saved: ${data.plan_created.title}`);
        setMessages((m) => [...m, {
          id: crypto.randomUUID(), role: "assistant",
          text: `> ✅ **Plan saved to your account.** View it any time from the Home or Plans tab.`,
        }]);
      }
      if (data?.level_up) {
        celebrate();
        toast.success(`Level ${data.level_up.new_level}! ${data.level_up.unlocked_title ?? ""}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Coach unreachable";
      setMessages((m) => m.map((x) => x.id === pending.id ? { ...x, text: `⚠️ ${msg}`, pending: false } : x));
      toast.error(msg);
    } finally {
      setSending(false);
      composerRef.current?.focus();
    }
  }

  function useRec(key: string) {
    if (isGuest) { nav("/auth"); return; }
    send(t(key as any));
  }

  return (
    <section className="flex min-h-[calc(100vh-64px-90px)] flex-col">
      {/* Header */}
      <header className="border-b border-crimson/40 bg-noir/70">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-crimson shadow-crimson">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg leading-none tracking-wider">AI COACH</div>
              <div className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground">
                {isAuthed ? profile?.chosen_character ?? "Elite" : "Guest preview"}
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 border border-border px-2 py-1 font-mono-tech text-[9px] uppercase tracking-widest">
            <Crown className={`h-3 w-3 ${tier === "ultra" ? "text-yellow-400" : tier === "premium" ? "text-crimson" : "text-muted-foreground"}`} />
            {tier === "ultra" ? "ULTRA" : tier === "premium" ? "PRO" : "FREE"}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          {loadingHistory && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading history…
            </div>
          )}
          {messages.length === 0 && !loadingHistory && (
            <EmptyState
              isGuest={isGuest}
              name={profile?.display_name ?? null}
              focus={profile?.goals?.[0] ?? null}
              bmi={profile?.bmi ?? null}
              bmiCategory={profile?.bmi_category ?? null}
              lang={lang}
              tGreetHi={t("coach_greet_hi")}
              tGreetIntro={t("coach_greet_intro")}
              tFocus={t("coach_your_focus")}
              tBmi={t("coach_your_bmi")}
              tGenerate={t("coach_generate_plan")}
              tSignIn={t("coach_signin_to_start")}
              onSignIn={() => nav("/auth")}
              onKick={() => send(kickoffFor(lang, profile?.display_name, profile?.goals?.[0], profile?.bmi, profile?.bmi_category, t("coach_focus_prompt_prefix")))}
            />
          )}
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={
                  m.role === "user"
                    ? "max-w-[85%] border border-crimson/60 bg-crimson/10 px-3 py-2 text-sm text-foreground"
                    : "max-w-[92%] border border-border bg-card px-3 py-2 text-sm text-foreground"
                }>
                  {m.pending ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended prompts */}
      <div className="border-t border-border bg-noir/60">
        <div className="container mx-auto max-w-3xl px-4 py-2">
          <div className="mb-1.5 font-mono-tech text-[9px] uppercase tracking-widest text-crimson">
            {t("rec_prompts_title")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RECS.map((k) => (
              <button
                key={k}
                onClick={() => useRec(k)}
                disabled={sending}
                className="border border-border bg-card px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson disabled:opacity-50"
              >
                {t(k as any)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-crimson/40 bg-black/70 backdrop-blur"
      >
        <div className="container mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            ref={composerRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            rows={1}
            placeholder={isGuest ? "Sign in to chat with the coach…" : proLocked ? "Pro limit reached — upgrade to Ultra." : "Ask the coach…"}
            disabled={isGuest || proLocked || sending}
            className="min-h-[44px] max-h-40 flex-1 resize-none border border-border bg-background px-3 py-2 font-mono-tech text-sm outline-none focus:border-crimson disabled:opacity-50"
          />
          {isGuest ? (
            <button type="button" onClick={() => nav("/auth")} className="inline-flex items-center gap-1.5 bg-crimson px-4 py-2.5 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground">
              <LogIn className="h-4 w-4" /> Sign in
            </button>
          ) : (
            <button
              type="submit"
              disabled={sending || proLocked || !input.trim()}
              className="inline-flex items-center justify-center gap-1.5 bg-crimson px-4 py-2.5 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function kickoffFor(
  lang: string,
  name?: string | null,
  focus?: string | null,
  bmi?: number | null,
  bmiCategory?: string | null,
  prefix?: string,
) {
  const parts: string[] = [];
  if (prefix) parts.push(prefix);
  if (name) parts.push(`Name: ${name}.`);
  if (focus) parts.push(`Training focus: ${focus}.`);
  if (bmi) parts.push(`BMI: ${bmi}${bmiCategory ? ` (${bmiCategory})` : ""}.`);
  parts.push("Please respond in my chosen language and address me by name.");
  return parts.join(" ");
}

function EmptyState(props: {
  isGuest: boolean;
  name: string | null;
  focus: string | null;
  bmi: number | null;
  bmiCategory: string | null;
  lang: string;
  tGreetHi: string;
  tGreetIntro: string;
  tFocus: string;
  tBmi: string;
  tGenerate: string;
  tSignIn: string;
  onSignIn: () => void;
  onKick: () => void;
}) {
  const { isGuest, name, focus, bmi, bmiCategory, tGreetHi, tGreetIntro, tFocus, tBmi, tGenerate, tSignIn, onSignIn, onKick } = props;
  return (
    <div className="border-frame corner-frame bg-card/60 p-5 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-crimson shadow-crimson">
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="font-display text-2xl tracking-wider">
        {tGreetHi}{name ? `, ${name}` : ""}!
      </div>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{tGreetIntro}</p>
      {(focus || bmi) && (
        <div className="mx-auto mt-3 flex max-w-md flex-wrap justify-center gap-2 font-mono-tech text-[10px] uppercase tracking-widest">
          {focus && (
            <span className="border border-crimson/40 bg-crimson/10 px-2 py-1 text-crimson">
              {tFocus}: {focus}
            </span>
          )}
          {bmi && (
            <span className="border border-border bg-card px-2 py-1 text-muted-foreground">
              {tBmi}: {bmi}{bmiCategory ? ` · ${bmiCategory}` : ""}
            </span>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {isGuest ? (
          <button onClick={onSignIn} className="inline-flex items-center gap-2 bg-crimson px-4 py-2 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground">
            <LogIn className="h-4 w-4" /> {tSignIn}
          </button>
        ) : (
          <button onClick={onKick} className="inline-flex items-center gap-2 bg-crimson px-4 py-2 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground">
            <CheckCircle2 className="h-4 w-4" /> {tGenerate}
          </button>
        )}
      </div>
    </div>
  );
}