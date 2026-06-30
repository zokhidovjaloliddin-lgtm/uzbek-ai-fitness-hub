import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

/**
 * Live "Real AI Coach" chatbot pinned to the bottom of the viewport.
 * - Trigger bar fixed at `bottom-0 left-0 right-0 z-50`, always visible.
 * - Tap to expand a chat panel above the bar.
 * - Streams messages from the `chat-coach` Supabase Edge Function which
 *   injects the authenticated user's live profile (BMI, archetype, tier,
 *   intensity, weight, height, language) into a Gemini system prompt.
 */

type Msg = { id: string; role: "user" | "assistant"; text: string; pending?: boolean };

const STATUS_LINE: Record<string, string> = {
  en: "⚡ AI Coach is analyzing your biometrics, calculated BMI status, and chosen Mentor Archetype to engineer your training split...",
  uz: "⚡ AI Murabbiy biometrik ko'rsatkichlaringizni, BMI holatingizni va tanlangan arxetipingizni tahlil qilmoqda...",
  ru: "⚡ AI Тренер анализирует ваши биометрические данные, статус BMI и выбранный архетип, чтобы построить план...",
};

export default function FloatingCoachChat() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Build the live context payload from the authenticated profile + local vault.
  const contextPayload = useMemo(() => {
    const bmiRec = storage.getBmi();
    return {
      display_name: profile?.display_name ?? profile?.email?.split("@")[0] ?? "Athlete",
      language: lang,
      bmi: profile?.bmi ?? bmiRec?.bmi ?? null,
      bmi_category: profile?.bmi_category ?? bmiRec?.category ?? null,
      weight_kg: profile?.weight_kg ?? bmiRec?.weight ?? null,
      height_cm: profile?.height_cm ?? bmiRec?.height ?? null,
      chosen_character: profile?.chosen_character ?? "Kratos",
      tier: profile?.membership_tier ?? "free",
      intensity: profile?.intensity_level ?? "hard",
    };
  }, [profile, lang]);

  async function send(content: string) {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    const placeholder: Msg = { id: crypto.randomUUID(), role: "assistant", text: "", pending: true };
    setMessages((m) => [...m, userMsg, placeholder]);
    setInput("");

    try {
      const { data, error } = await supabase.functions.invoke("chat-coach", {
        body: { message: text, context: contextPayload },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? "(no response)";
      setMessages((m) =>
        m.map((msg) => (msg.id === placeholder.id ? { ...msg, text: reply, pending: false } : msg)),
      );
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Coach offline.";
      toast.error(errMsg);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholder.id
            ? { ...msg, text: "⚠️ Coach offline. Please try again.", pending: false }
            : msg,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  const statusLine = STATUS_LINE[lang] ?? STATUS_LINE.en;

  return (
    <>
      {/* Floating chat panel above the bar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="fixed bottom-16 right-4 z-[60] flex h-[70vh] max-h-[640px] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden border-2 border-red-900/60 bg-black/95 shadow-[0_0_40px_rgba(220,38,38,0.35)] backdrop-blur-xl"
          >
            <header className="flex items-center justify-between border-b border-red-900/50 bg-gradient-to-r from-black via-red-950/40 to-black px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-crimson bg-black shadow-[0_0_14px_rgba(220,38,38,0.6)]">
                  <Sparkles className="h-3.5 w-3.5 text-crimson" />
                </div>
                <div className="leading-tight">
                  <div className="font-display text-base tracking-wider text-white">AI COACH</div>
                  <div className="font-mono-tech text-[9px] uppercase tracking-widest text-crimson">
                    {contextPayload.chosen_character} · {String(contextPayload.tier).toUpperCase()} ·{" "}
                    {String(contextPayload.intensity).toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center border border-zinc-700 text-zinc-400 transition hover:border-crimson hover:text-crimson"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div
              ref={scrollerRef}
              className="flex-1 space-y-3 overflow-y-auto bg-black/60 p-3"
            >
              {messages.length === 0 && (
                <div className="grid place-items-center gap-2 py-10 text-center text-xs text-zinc-400">
                  <Sparkles className="h-6 w-6 text-crimson" />
                  <div className="font-mono-tech uppercase tracking-widest">
                    Ask for a training split, meal plan, or progression.
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
              {sending && (
                <div className="border border-crimson/40 bg-crimson/10 p-2.5 text-[11px] leading-snug text-crimson">
                  {statusLine}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-red-900/50 bg-black/90 p-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask the AI Coach..."
                disabled={sending}
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-sm border border-zinc-700 bg-black/70 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-crimson focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center bg-crimson text-white shadow-[0_0_18px_rgba(220,38,38,0.55)] transition hover:bg-primary-glow disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent trigger bar at the very bottom of the viewport */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-red-900/50 bg-black/90 backdrop-blur-md">
        <button
          onClick={() => setOpen((o) => !o)}
          className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2.5 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-crimson bg-black shadow-[0_0_16px_rgba(220,38,38,0.6)]">
              <MessageSquare className="h-4 w-4 text-crimson" />
            </div>
            <div className="leading-tight">
              <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                Live AI Coach
              </div>
              <div className="text-xs text-zinc-300">
                {open ? "Tap to close chat" : "Ask anything — biometrics injected live"}
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-mono-tech text-[10px] uppercase tracking-widest text-zinc-400">
            {open ? <X className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-crimson" />}
            {open ? "Close" : "Open Chat"}
          </span>
        </button>
      </div>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[88%] border px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "border-zinc-700 bg-zinc-900/90 text-zinc-100"
            : "border-crimson/40 bg-black/80 text-zinc-100"
        }`}
      >
        {msg.pending ? (
          <span className="inline-flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson" style={{ animationDelay: "120ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson" style={{ animationDelay: "240ms" }} />
          </span>
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{msg.text}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-strong:text-crimson prose-table:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}