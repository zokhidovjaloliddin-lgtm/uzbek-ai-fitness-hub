import { useEffect, useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import AvatarPicker from "@/components/home/AvatarPicker";

export default function ProfileTab() {
  const { user, profile, isAuthed, refreshProfile } = useAuth();
  const { t, lang, setLang } = useLang();
  const [name, setName] = useState("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  useEffect(() => {
    setName(profile?.display_name ?? "");
    setHeight(profile?.height_cm ? String(profile.height_cm) : "");
    setWeight(profile?.weight_kg ? String(profile.weight_kg) : "");
  }, [profile]);

  async function save() {
    if (!user) return;
    const h = parseFloat(height); const w = parseFloat(weight);
    const bmi = h > 0 && w > 0 ? +(w / ((h/100)**2)).toFixed(1) : null;
    const category = bmi == null ? null : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    const { error } = await supabase.from("profiles").update({
      display_name: name || null,
      height_cm: Number.isFinite(h) ? h : null,
      weight_kg: Number.isFinite(w) ? w : null,
      bmi, bmi_category: category,
      preferred_language: lang,
    }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success(t("prof_saved"));
  }

  async function signInGoogle() {
    try { await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Sign-in failed"); }
  }
  async function signOut() { await supabase.auth.signOut(); }

  return (
    <section className="container mx-auto max-w-2xl px-4 pt-6 pb-8">
      <h2 className="font-display text-3xl tracking-wider">{t("prof_title")}</h2>

      {!isAuthed && (
        <div className="mt-4 border-frame bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("prof_not_signed_in")}</p>
          <button onClick={signInGoogle} className="mt-3 inline-flex items-center gap-2 bg-crimson px-4 py-2.5 font-mono-tech text-[11px] uppercase tracking-widest text-primary-foreground">
            Sign in with Google
          </button>
        </div>
      )}

      {isAuthed && (
        <>
          <div className="mt-5 flex items-center gap-4 border-frame bg-card p-4">
            <AvatarPicker userId={user?.id ?? null} avatarUrl={profile?.avatar_url ?? null} onChange={async (url) => {
              if (!user) return;
              await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
              await refreshProfile();
            }} />
            <div className="min-w-0">
              <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">{t("prof_signed_in_as")}</div>
              <div className="truncate font-display text-xl">{profile?.email ?? user?.email}</div>
              <div className="mt-1 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                {t("prof_tier")}: {(profile?.membership_tier ?? "free").toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-frame bg-card p-4">
            <Field label={t("prof_display_name")}><input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-border bg-noir px-3 py-2 text-sm" /></Field>
            <Field label={t("prof_language")}>
              <div className="flex gap-1.5">
                {(["en","uz","ru"] as Lang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`flex-1 border px-3 py-2 font-mono-tech text-[10px] uppercase tracking-widest transition ${lang === l ? "border-crimson bg-crimson text-primary-foreground" : "border-border text-muted-foreground"}`}>
                    {l === "en" ? "English" : l === "uz" ? "O'zbek" : "Русский"}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("prof_height")}><input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full border border-border bg-noir px-3 py-2 text-sm" /></Field>
              <Field label={t("prof_weight")}><input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border border-border bg-noir px-3 py-2 text-sm" /></Field>
            </div>
            {profile?.bmi != null && (
              <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("prof_bmi")}: <span className="text-crimson">{profile.bmi}</span> · {profile.bmi_category}
              </div>
            )}
            <button onClick={save} className="mt-2 inline-flex items-center justify-center gap-2 bg-crimson px-4 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground">
              <Save className="h-4 w-4" /> {t("prof_save")}
            </button>
          </div>

          <button onClick={signOut}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 border border-border px-4 py-3 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson">
            <LogOut className="h-3.5 w-3.5" /> {t("auth_sign_out")}
          </button>
        </>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">{label}</div>
      {children}
    </label>
  );
}