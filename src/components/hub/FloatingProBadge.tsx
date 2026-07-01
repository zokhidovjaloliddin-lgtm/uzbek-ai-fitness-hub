import { Flame } from "lucide-react";

/**
 * Compact floating pill that mirrors the CHEAT CODE pill design/size but
 * in a crimson palette. Positioned bottom-right so it never collides with
 * the Cheat Code pill (top-right) or the floating coach chat.
 */
export default function FloatingProBadge({
  onClick,
  visible = true,
}: {
  onClick: () => void;
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      aria-label="Unlock 70% off PRO"
      className="fixed bottom-5 right-3 sm:right-4 z-[95] inline-flex items-center gap-1.5 rounded-full border border-crimson/80 bg-black/70 px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-[0.15em] text-crimson shadow-[0_0_14px_rgba(220,38,38,0.45)] backdrop-blur-md transition hover:bg-crimson/10"
    >
      <Flame className="h-3 w-3 animate-pulse" fill="currentColor" />
      <span>70% OFF</span>
    </button>
  );
}