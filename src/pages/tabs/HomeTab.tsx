import { useEffect, useState } from "react";
import { Flame, Pencil, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { listPlans, markTodayDone, getStreak, type TrainingPlanRow } from "@/lib/plans";
import AvatarPicker from "@/components/home/AvatarPicker";
import PlanCard from "@/components/home/PlanCard";
import EmptyPlansCard from "@/components/home/EmptyPlansCard";
import { toast } from "sonner";

export default function HomeTab({ onOpenCoach }: { onOpenCoach: () => void }) {
  const { user, profile, isAuthed, refreshProfile } = useAuth();
  const { t } = useLang();
  const [plans, setPlans] = useState<TrainingPlanRow[]>([]);
  const [streak, setStreak] = useState(0);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");

  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);

  useEffect(() => {
    if (!isAuthed) { setPlans([]); setStreak(0); return; }
    listPlans().then(setPlans).catch(console.error);
    getStreak().then(setStreak).catch(console.error);
  }, [isAuthed, user?.id]);

  async function saveName() {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    setEditing(false);
    toast.success(t("prof_saved"));
  }

  async function saveAvatar(url: string) {
    if (!user) return;
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    await refreshProfile();
  }

  async function onMarkToday(p: TrainingPlanRow) {
    const updated = await markTodayDone(p);
    if (updated) {
      setPlans((cur) => cur.map((x) => (x.id === p.id ? updated : x)));
      getStreak().then(setStreak).catch(() => {});
      toast.success(t("home_marked_today"));
    }
  }

  /** Keep the header compact on mobile: first name only, max 12 chars. */
  function shortName(v: string) {
    const base = v.includes("@") ? v.split("@")[0] : v;
    const first = base.trim().split(/[\s._-]+/)[0] || base;
    return first.length > 12 ? `${first.slice(0, 12)}…` : first;
  }
  const displayName = shortName(profile?.display_name || profile?.email || "Athlete");

  const active = plans.filter((p) => p.status === "active");
  const done = plans.filter((p) => p.status === "completed");

  return (
    <section className="container mx-auto max-w-2xl px-4 pt-6 pb-8">
      <div className="mb-6 flex items-start gap-4 border-frame corner-frame bg-card p-4">
        <div className="flex-1 min-w-0">
          <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">{t("home_greeting")}</div>
          {editing ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-noir px-2 py-1 font-display text-lg tracking-wider text-foreground"
                autoFocus
              />
              <button onClick={saveName} className="grid h-8 w-8 place-items-center border border-crimson bg-crimson text-primary-foreground"><Check className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => isAuthed && setEditing(true)} className="mt-1 inline-flex items-center gap-2 font-display text-2xl tracking-wider hover:text-crimson">
              <span className="max-w-[9rem] truncate sm:max-w-[14rem]">{displayName}</span>
              {isAuthed && <Pencil className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
          <div className="mt-2 inline-flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
            <Flame className="h-3 w-3" /> {streak} · {t("home_streak")}
          </div>
        </div>
        <AvatarPicker userId={user?.id ?? null} avatarUrl={profile?.avatar_url ?? null} onChange={saveAvatar} />
      </div>

      {!isAuthed && (
        <div className="mb-4 border border-yellow-500/40 bg-yellow-500/5 p-3 font-mono-tech text-[11px] text-yellow-200/90">
          {t("prof_not_signed_in")}
        </div>
      )}

      <div className="mb-3 font-mono-tech text-[11px] uppercase tracking-widest text-crimson">
        {t("home_active_plans")} · {active.length}
      </div>
      {active.length === 0 && <EmptyPlansCard onCreate={onOpenCoach} />}
      <div className="grid gap-3">
        {active.map((p) => (
          <PlanCard key={p.id} plan={p} onMarkToday={() => onMarkToday(p)} onContinue={onOpenCoach} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <div className="mt-8 mb-3 font-mono-tech text-[11px] uppercase tracking-widest text-gauge-normal">
            {t("home_completed_plans")} · {done.length}
          </div>
          <div className="grid gap-3">
            {done.map((p) => <PlanCard key={p.id} plan={p} />)}
          </div>
        </>
      )}
    </section>
  );
}