import { Lock, Crown } from "lucide-react";

/**
 * Frosted-glass shield overlay shown over content that requires a higher tier.
 * Renders as an absolutely positioned layer; parent must be `relative`.
 */
export default function TierLock({
  message = "Weakness Detected. Upgrade to PRO or ULTRA to unlock the Council.",
  onUpgrade,
}: {
  message?: string;
  onUpgrade?: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/55 p-6 text-center backdrop-blur-md">
      <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-crimson bg-black/80 shadow-crimson">
        <Lock className="h-6 w-6 text-crimson" />
      </div>
      <p className="max-w-md font-display text-2xl tracking-wider text-white">
        {message}
      </p>
      <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
      >
        <Crown className="h-4 w-4" /> Unlock PRO / ULTRA
      </button>
    </div>
  );
}