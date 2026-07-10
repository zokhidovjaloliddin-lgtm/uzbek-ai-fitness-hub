import Funnel from "@/components/funnel/Funnel";
import { useLang } from "@/lib/i18n";

const RECS: (keyof any)[] = ["rec_nutrition","rec_avoid","rec_recovery","rec_scale_up","rec_halal","rec_sleep"];

export default function CoachTab() {
  const { t } = useLang();
  return (
    <div className="pb-2">
      <div className="border-b border-crimson/40 bg-noir/60">
        <div className="container mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
            {t("rec_prompts_title")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RECS.map((k) => (
              <button
                key={k as string}
                onClick={() => window.dispatchEvent(new CustomEvent("frame:coach-prompt", { detail: { text: t(k as any) } }))}
                className="border border-border bg-card px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
              >
                {t(k as any)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Funnel />
    </div>
  );
}