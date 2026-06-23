import { Link } from "react-router-dom";
import { LogIn, LogOut, User2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

export default function AuthBar() {
  const { isAuthed, user, profile, refreshProfile } = useAuth();
  const { t } = useLang();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Logged out.");
  }

  async function changeTier(tier: "free" | "pro" | "ultra") {
    if (!user || user.is_anonymous) return;
    const { error } = await supabase
      .from("profiles")
      .update({ membership_tier: tier })
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Tier → ${tier.toUpperCase()}`);
      refreshProfile();
    }
  }

  if (!isAuthed) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 border border-foreground px-3 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest transition hover:bg-foreground hover:text-background"
      >
        <LogIn className="h-3.5 w-3.5" /> {t("auth_sign_in")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Temporary tier selector for testing */}
      <div className="hidden items-center gap-1 border border-border bg-card px-2 py-1 md:flex">
        <Crown className="h-3 w-3 text-crimson" />
        <select
          value={profile?.membership_tier ?? "free"}
          onChange={(e) => changeTier(e.target.value as "free" | "pro" | "ultra")}
          className="bg-transparent font-mono-tech text-[10px] uppercase tracking-widest outline-none"
          aria-label={t("tier_label")}
        >
          <option value="free">{t("tier_free")}</option>
          <option value="pro">{t("tier_pro")}</option>
          <option value="ultra">{t("tier_ultra")}</option>
        </select>
      </div>
      <div className="hidden items-center gap-1.5 border border-border px-2 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground md:flex">
        <User2 className="h-3 w-3" />
        <span className="max-w-[140px] truncate">{user?.email}</span>
      </div>
      <button
        onClick={signOut}
        className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
      >
        <LogOut className="h-3.5 w-3.5" /> {t("auth_sign_out")}
      </button>
    </div>
  );
}