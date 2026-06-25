import { Flame } from "lucide-react";

export default function FloatingProBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Unlock 70% off PRO"
      className="group fixed bottom-5 left-5 z-[90] inline-flex items-center gap-2 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-crimson to-primary-glow px-4 py-2.5 font-mono-tech text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(220,38,38,0.7)] transition hover:scale-105 hover:shadow-[0_0_36px_rgba(252,211,77,0.7)]"
    >
      <span className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-yellow-400 via-crimson to-yellow-400 opacity-70 blur-md animate-pulse" />
      <Flame className="h-4 w-4 animate-pulse text-yellow-300" fill="currentColor" />
      PRO 70% OFF 🔥
    </button>
  );
}