import { CheckCircle2, Trash2, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { progressPct, type TrainingPlanRow } from "@/lib/plans";
import { useLang } from "@/lib/i18n";

type Props = {
  plan: TrainingPlanRow;
  onMarkToday?: () => void;
  onDelete?: () => void;
  onContinue?: () => void;
  markedToday?: boolean;
};

export default function PlanCard({ plan, onMarkToday, onDelete, onContinue, markedToday }: Props) {
  const { t } = useLang();
  const pct = progressPct(plan);
  const statusKey =
    plan.status === "completed" ? "plans_status_completed"
    : plan.status === "abandoned" ? "plans_status_abandoned"
    : "plans_status_active";
  const statusColor =
    plan.status === "completed" ? "text-gauge-normal border-gauge-normal/60"
    : plan.status === "abandoned" ? "text-muted-foreground border-border"
    : "text-crimson border-crimson/60";
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-frame corner-frame relative bg-card p-4"
    >
      <div className="flex gap-4">
        <ProgressRing value={pct} size={68} stroke={7} label={t("home_progress")} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-display text-lg leading-tight tracking-wider">{plan.title}</div>
              <div className="mt-0.5 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                {plan.archetype} · {plan.discipline}
              </div>
            </div>
            <span className={`shrink-0 border px-2 py-0.5 font-mono-tech text-[9px] uppercase tracking-widest ${statusColor}`}>
              {t(statusKey as any)}
            </span>
          </div>
          <div className="mt-2 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
            {plan.completed_days} / {plan.total_days} {t("home_days_done")}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.status === "active" && (
              <button
                onClick={onMarkToday}
                disabled={markedToday}
                className="inline-flex items-center gap-1 border border-crimson bg-crimson/10 px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-crimson transition hover:bg-crimson hover:text-primary-foreground disabled:opacity-50"
              >
                <CheckCircle2 className="h-3 w-3" />
                {markedToday ? t("home_marked_today") : t("home_mark_today")}
              </button>
            )}
            {onContinue && plan.status === "active" && (
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-1 border border-border px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
              >
                <PlayCircle className="h-3 w-3" /> {t("home_view_details")}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="ml-auto inline-flex items-center gap-1 border border-border px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson"
                aria-label={t("plans_delete")}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}