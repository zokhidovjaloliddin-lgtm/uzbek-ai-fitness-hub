import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Crown, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

type Tier = "free" | "pro" | "ultra";

export default function CheatCodePanel() {
  const { isAuthed, user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);

  async function setTier(tier: Tier) {
    // Local mirror so non-authed users (and AICoach which reads storage) react.
    // Rebuild subs from scratch so DOWNGRADES (ultra → free, ultra → pro) actually
    // take effect — addSub-only would leave the previous tier active forever.
    const tierKey = tier === "pro" ? "premium" : tier === "ultra" ? "ultra" : "standard";
    storage.setTier(tierKey);
    if (tier === "ultra") storage.setSubs(["premium", "ultra"]);
    else if (tier === "pro") storage.setSubs(["premium"]);
    else storage.setSubs([]);

    if (isAuthed && user && profile) {
      const { error } = await supabase
        .from("profiles")
        .update({ membership_tier: tier })
        .eq("user_id", user.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      await refreshProfile();
    }
    toast.success(`Tier override → ${tier.toUpperCase()}`, {
      description: "RBAC re-evaluating UI now.",
    });
  }

  const current: Tier = (profile?.membership_tier as Tier) ?? "free";

  return (
    <div className="fixed top-20 right-3 sm:right-4 z-[95]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            className="absolute right-0 top-11 w-60 rounded-xl border border-yellow-400/60 bg-black/95 p-3 shadow-[0_0_24px_rgba(252,211,77,0.35)] backdrop-blur-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-yellow-300">
                <Code2 className="h-3 w-3" /> Recruiter Cheat Code
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-zinc-500 hover:text-yellow-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="mb-2 text-[10px] font-mono-tech uppercase tracking-widest text-zinc-500">
              Current: <span className="text-yellow-300">{current}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["free", "pro", "ultra"] as Tier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`rounded-md border px-2 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest transition ${
                    current === t
                      ? "border-yellow-400 bg-yellow-400/15 text-yellow-300"
                      : "border-zinc-700 text-zinc-300 hover:border-yellow-400 hover:text-yellow-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[9px] font-mono-tech text-zinc-500">
              Demo-only RBAC override.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Cheat code menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/70 bg-black/70 px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.15em] text-yellow-300 shadow-[0_0_14px_rgba(252,211,77,0.35)] backdrop-blur-md transition hover:bg-yellow-400/10"
      >
        <Crown className="h-3 w-3" />
        <span>Cheat</span>
      </button>
    </div>
  );
}