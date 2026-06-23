import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Dumbbell, Paperclip, Send, User2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import coachBg from "@/assets/coach-bg.jpeg.asset.json";

type Msg = { id: string; role: "user" | "assistant"; text: string; pending?: boolean };

const SUGGESTIONS = [
  "Build me a 5-day push/pull/legs split",
  "High-protein meal plan for muscle-up training",
  "Progression to my first one-arm pull-up",
];

export default function CoachChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Anonymous sign-in + initial history
  useEffect(() => {
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }
        const { data, error } = await supabase
          .from("chat_history")
          .select("id, message_role, message_text, created_at")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setMessages(
          (data ?? []).map((r: { id: string; message_role: string; message_text: string }) => ({
            id: r.id,
            role: r.message_role as "user" | "assistant",
            text: r.message_text,
          })),
        );
      } catch (e) {
        console.error(e);
        toast.error("Couldn't load chat history.");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: content };
    const placeholder: Msg = { id: crypto.randomUUID(), role: "assistant", text: "", pending: true };
    setMessages((m) => [...m, userMsg, placeholder]);
    setInput("");
    setAttachment(null);

    try {
      const { data, error } = await supabase.functions.invoke("chat-coach", {
        body: { message: content },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? "(no response)";
      setMessages((m) =>
        m.map((msg) => (msg.id === placeholder.id ? { ...msg, text: reply, pending: false } : msg)),
      );
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Coach offline.";
      toast.error(errMsg);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === placeholder.id
            ? { ...msg, text: "⚠️ Coach offline. Try again, soldier.", pending: false }
            : msg,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function handleAttachClick() {
    fileRef.current?.click();
  }
  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files for now.");
      return;
    }
    setAttachment(f);
    toast.success("Image attached (preview only — analysis coming soon).");
  }

  return (
    <main
      className="relative min-h-screen w-full bg-black bg-center bg-cover"
      style={{ backgroundImage: `url(${coachBg.url})` }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-3 py-4 sm:px-6">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between border border-emerald-500/30 bg-black/60 px-4 py-3 backdrop-blur-md">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 transition hover:text-emerald-400">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-emerald-400 bg-black shadow-[0_0_18px_rgba(16,185,129,0.55)]">
              <Dumbbell className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg tracking-wider text-white">AI COACH</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">online · zero excuses</div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto rounded-sm border border-emerald-500/20 bg-black/55 p-3 sm:p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        >
          {!ready && <div className="py-10 text-center text-sm text-zinc-500">Loading history…</div>}

          {ready && messages.length === 0 && (
            <div className="mx-auto max-w-md py-10 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400 bg-black shadow-[0_0_24px_rgba(16,185,129,0.6)]">
                <Dumbbell className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl tracking-wider text-white">Ready to train.</h2>
              <p className="mt-1 text-sm text-zinc-400">Ask for a split, a meal plan, or a progression. No excuses.</p>
              <div className="mt-5 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-left text-xs text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="space-y-4">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
          </ul>
        </div>

        {/* Composer */}
        <div className="mt-3 border border-emerald-500/30 bg-black/75 p-2 backdrop-blur-md">
          {attachment && (
            <div className="mb-2 flex items-center justify-between rounded-sm border border-emerald-500/20 bg-black/60 px-2 py-1.5 text-xs text-emerald-200">
              <span className="truncate">📎 {attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <button
              type="button"
              onClick={handleAttachClick}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-zinc-700 bg-black/60 text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-400"
              aria-label="Attach image"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Demand your routine…"
              rows={1}
              className="max-h-40 min-h-[2.5rem] flex-1 resize-none rounded-sm border border-zinc-700 bg-black/70 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
              disabled={!ready || sending}
            />
            <button
              type="submit"
              disabled={!ready || sending || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-emerald-500 text-black shadow-[0_0_18px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${
          isUser
            ? "border-zinc-500 bg-zinc-800 text-zinc-200"
            : "border-emerald-400 bg-black text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]"
        }`}
      >
        {isUser ? <User2 className="h-4 w-4" /> : <span className="font-mono text-[10px] font-bold">AI</span>}
      </div>
      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`text-[10px] font-mono uppercase tracking-[0.2em] ${isUser ? "text-zinc-500" : "text-emerald-400"}`}>
          {isUser ? "You" : "AI Coach"}
        </div>
        <div
          className={`rounded-sm border px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "border-zinc-700 bg-zinc-900/90 text-zinc-100"
              : "border-emerald-500/40 bg-black/80 text-zinc-100 shadow-[0_0_18px_rgba(16,185,129,0.15)]"
          }`}
        >
          {msg.pending ? (
            <span className="inline-flex gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "120ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "240ms" }} />
            </span>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:tracking-wider prose-strong:text-emerald-300 prose-a:text-emerald-400 prose-li:my-0.5 prose-p:my-1.5 prose-table:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );
}