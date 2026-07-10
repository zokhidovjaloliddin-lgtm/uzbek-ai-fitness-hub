import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { deletePlan, listPlans, markTodayDone, type TrainingPlanRow } from "@/lib/plans";
import PlanCard from "@/components/home/PlanCard";
import { toast } from "sonner";

type Filter = "all" | "active" | "completed";

export default function PlansTab({ onOpenCoach }: { onOpenCoach: () => void }) {
  const { t } = useLang();
  const { isAuthed, user } = useAuth();
  const [plans, setPlans] = useState<TrainingPlanRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!isAuthed) { setPlans([]); return; }
    listPlans().then(setPlans).catch(console.error);
  }, [isAuthed, user?.id]);

  async function onDelete(p: TrainingPlanRow) {
    await deletePlan(p.id);
    setPlans((cur) => cur.filter((x) => x.id !== p.id));
    toast.success("Deleted");
  }
  async function onMarkToday(p: TrainingPlanRow) {
    const up = await markTodayDone(p);
    if (up) setPlans((cur) => cur.map((x) => x.id === p.id ? up : x));
  }

  const filtered = plans.filter((p) =>
    filter === "all" ? true : filter === "active" ? p.status === "active" : p.status === "completed",
  );

  return (
    <section className="container mx-auto max-w-2xl px-4 pt-6 pb-8">
      <h2 className="font-display text-3xl tracking-wider">{t("plans_title")}</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["all","active","completed"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`border px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest transition ${filter === f ? "border-crimson bg-crimson text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {t(`plans_filter_${f}` as any)}
          </button>
        ))}
      </div>
      {!isAuthed && (
        <div className="mt-6 border border-yellow-500/40 bg-yellow-500/5 p-3 font-mono-tech text-[11px] text-yellow-200/90">
          {t("prof_not_signed_in")}
        </div>
      )}
      <div className="mt-5 grid gap-3">
        {filtered.map((p) => (
          <PlanCard key={p.id} plan={p} onDelete={() => onDelete(p)} onMarkToday={() => onMarkToday(p)} onContinue={onOpenCoach} />
        ))}
        {filtered.length === 0 && isAuthed && (
          <div className="border-frame bg-card p-4 text-sm text-muted-foreground">{t("home_no_plans")}</div>
        )}
      </div>
      <button
        onClick={onOpenCoach}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-crimson px-4 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground shadow-crimson transition hover:bg-primary-glow"
      >
        <Plus className="h-4 w-4" /> {t("plans_new")}
      </button>
    </section>
  );
}