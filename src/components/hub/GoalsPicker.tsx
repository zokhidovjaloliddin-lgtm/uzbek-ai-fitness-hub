import { useEffect, useState } from "react";
import { Sword, Skull, Save, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const STRONG = "get_insanely_strong";
const FIGHT = "street_fighting_mma";

export default function GoalsPicker() {
  const { t } = useLang();
  const { isAuthed, profile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.goals?.length) setSelected(profile.goals);
  }, [profile?.user_id, profile?.goals]);

  function toggle(g: string) {
    setSelected((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  }

  async function save() {
    if (!isAuthed) {
      toast.error(t("goals_login_required"));
      return;
    }
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ goals: selected })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Mission locked.");
      refreshProfile();
    }
  }

  const cards = [
    { id: STRONG, icon: <Sword className="h-6 w-6" />, label: t("goal_strong"), sub: t("goal_strong_sub") },
    { id: FIGHT, icon: <Skull className="h-6 w-6" />, label: t("goal_fight"), sub: t("goal_fight_sub") },
  ];

  return (
    <section id="goals" className="border-b border-border py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag={t("goals_tag")}
          title={<>{t("goals_title_1")} <span className="text-crimson">{t("goals_title_2")}</span></>}
          subtitle={t("goals_sub")}
        />

        <div className="grid gap-px border-frame bg-border md:grid-cols-2">
          {cards.map((c) => {
            const on = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`group relative flex items-start gap-4 bg-card p-8 text-left transition ${on ? "ring-2 ring-crimson" : "hover:bg-card/70"}`}
              >
                <div className={`grid h-12 w-12 place-items-center border ${on ? "border-crimson bg-crimson text-primary-foreground" : "border-border"}`}>
                  {c.icon}
                </div>
                <div className="flex-1">
                  <div className="font-display text-2xl tracking-wider">{c.label}</div>
                  <div className="mt-1 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">{c.sub}</div>
                </div>
                <div className={`font-mono-tech text-[10px] uppercase tracking-widest ${on ? "text-crimson" : "text-muted-foreground"}`}>
                  {on ? "Selected" : "Tap"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">
            {isAuthed ? `${selected.length} selected` : (
              <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> {t("goals_login_required")}</span>
            )}
          </div>
          {isAuthed ? (
            <button
              onClick={save}
              disabled={saving || selected.length === 0}
              className="inline-flex items-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-30"
            >
              <Save className="h-4 w-4" /> {t("goals_save")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 border border-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-crimson transition hover:bg-crimson hover:text-primary-foreground"
            >
              {t("auth_sign_in")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}