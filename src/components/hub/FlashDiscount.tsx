import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

const STORAGE_KEY = "absolute_frame_flash_seen";
const DEADLINE_KEY = "absolute_frame_flash_deadline";
const TIMER_SECONDS = 5 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export default function FlashDiscount({
  open,
  onClose,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  // Use an absolute deadline stored in localStorage so the timer NEVER resets
  // across remounts, re-opens, or clicks. It only starts once on first display.
  const [secs, setSecs] = useState<number>(() => readRemaining());
  const ivRef = useRef<number | null>(null);

  useEffect(() => {
    // Lazily initialize the deadline the very first time the timer is shown.
    if (!localStorage.getItem(DEADLINE_KEY)) {
      localStorage.setItem(DEADLINE_KEY, String(Date.now() + TIMER_SECONDS * 1000));
    }
    const tick = () => setSecs(readRemaining());
    tick();
    ivRef.current = window.setInterval(tick, 1000);
    return () => {
      if (ivRef.current !== null) window.clearInterval(ivRef.current);
    };
  }, []);

  const claim = () => {
    storage.setTier("premium");
    storage.addSub("premium");
    localStorage.setItem(STORAGE_KEY, "1");
    toast.success("Pro membership activated.");
    onPurchased?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] grid place-items-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden border-2 border-crimson bg-card shadow-crimson"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center border border-border bg-black/60 text-zinc-300 transition hover:border-crimson hover:text-crimson"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="bg-gradient-to-br from-crimson via-crimson to-primary-glow p-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-black/40 shadow-crimson"
              >
                <Zap className="h-7 w-7 text-yellow-300" fill="currentColor" />
              </motion.div>
              <div className="font-display text-3xl tracking-wider text-white">
                STRATEGIC ADVANTAGE ACTIVATED
              </div>
              <div className="mt-1 font-mono-tech text-[11px] uppercase tracking-widest text-white/90">
                EXCLUSIVE 70% TIER UNLOCKED
              </div>
            </div>
            <div className="p-6">
              <div className="text-center font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground">
                PRO Membership
              </div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="font-display text-2xl text-muted-foreground line-through">
                  100,000
                </span>
                <span className="font-display text-5xl text-crimson">30,000</span>
                <span className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                  UZS
                </span>
              </div>
              <div className="mt-5 border-2 border-crimson/40 bg-black/60 p-3 text-center">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                  Offer expires in
                </div>
                <div className="font-display text-4xl tracking-widest text-crimson">
                  {fmt(secs)}
                </div>
              </div>
              <button
                onClick={claim}
                disabled={secs === 0}
                className="mt-5 w-full bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-40"
              >
                {secs === 0 ? "Offer Expired" : "Activate Pro — 70% Tier"}
              </button>
              <button
                onClick={onClose}
                className="mt-2 w-full font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function hasSeenFlash() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}
export function markFlashSeen() {
  localStorage.setItem(STORAGE_KEY, "1");
}