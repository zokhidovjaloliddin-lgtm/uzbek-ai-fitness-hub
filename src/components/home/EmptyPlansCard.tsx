import { Dumbbell, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";

/** Modern CTA card shown when the athlete has no active training plans. */
export default function EmptyPlansCard({ onCreate }: { onCreate: () => void }) {
  const { t } = useLang();
  return (
    <div className="mb-6 border-frame corner-frame bg-card/70 p-6 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-crimson/50 bg-crimson/10">
        <Dumbbell className="h-5 w-5 text-crimson" />
      </div>
      <div className="font-display text-xl tracking-wider">{t("home_cta_title")}</div>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("home_cta_desc")}</p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 bg-crimson px-5 py-2.5 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground shadow-crimson transition hover:bg-primary-glow"
      >
        <Plus className="h-4 w-4" /> {t("plans_new")}
      </button>
    </div>
  );
}
