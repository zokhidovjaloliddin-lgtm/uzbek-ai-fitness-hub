import { Loader2 } from "lucide-react";

/**
 * Shimmering placeholder shown while the coach composes a reply / plan.
 * Mirrors the shape of a real answer (heading + rows) so the layout is stable.
 */
export default function CoachSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full" aria-busy="true" aria-live="polite">
      <div className="mb-2 flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> {label}
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-2/5 animate-pulse bg-crimson/25" />
        <div className="h-3 w-full animate-pulse bg-muted" />
        <div className="h-3 w-11/12 animate-pulse bg-muted" />
        <div className="h-3 w-4/6 animate-pulse bg-muted" />
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-3 animate-pulse bg-muted" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
