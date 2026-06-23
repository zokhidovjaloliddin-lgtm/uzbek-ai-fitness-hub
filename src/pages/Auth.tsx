import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useLang } from "@/lib/i18n";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const { t } = useLang();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authed (non-anon), bounce home
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && !data.user.is_anonymous) nav("/", { replace: true });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account forged. Welcome, warrior.");
        nav("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Locked in.");
        nav("/", { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auth failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      nav("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 max-w-md border-2 border-crimson/40 bg-card p-8 shadow-crimson"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center bg-crimson">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl tracking-wider">
              {mode === "signin" ? t("auth_sign_in") : t("auth_sign_up")}
            </h1>
          </div>

          <button
            type="button"
            onClick={google}
            disabled={loading}
            className="mb-5 flex w-full items-center justify-center gap-3 border border-border bg-background px-4 py-3 font-mono-tech text-xs uppercase tracking-widest transition hover:border-foreground disabled:opacity-50"
          >
            <GoogleIcon /> {t("auth_continue_google")}
          </button>

          <div className="mb-5 flex items-center gap-3 text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono-tech text-[10px] uppercase tracking-widest">{t("auth_or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <div className="mb-1.5 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">{t("auth_email")}</div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2.5 font-mono-tech text-sm outline-none focus:border-crimson"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <div className="mb-1.5 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">{t("auth_password")}</div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2.5 font-mono-tech text-sm outline-none focus:border-crimson"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 bg-crimson px-4 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? t("auth_sign_in") : t("auth_sign_up")}
            </button>
          </form>

          <div className="mt-5 text-center font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">
            {mode === "signin" ? t("auth_no_account") : t("auth_have_account")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-crimson underline-offset-2 hover:underline"
            >
              {mode === "signin" ? t("auth_sign_up") : t("auth_sign_in")}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.2C41.9 35.9 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}