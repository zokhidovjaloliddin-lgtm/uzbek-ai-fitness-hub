import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Download, ExternalLink, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import type { TrainingPlanRow } from "@/lib/plans";
import { downloadIcs, googleCalendarUrl, parseTrainingDays, type CalendarOptions } from "@/lib/ics";

/**
 * Offline / calendar export actions for a single training plan.
 * - PDF: lazily imports the jsPDF renderer so the heavy font payload only
 *   downloads when the athlete actually exports.
 * - Calendar: parses the AI plan into day events with reminder alarms.
 */
export default function PlanExportActions({ plan }: { plan: TrainingPlanRow }) {
  const { t } = useLang();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [time, setTime] = useState("07:00");
  const [reminder, setReminder] = useState(30);
  const [duration, setDuration] = useState(60);
  const [skipWeekends, setSkipWeekends] = useState(false);

  const days = useMemo(() => parseTrainingDays(plan.plan_markdown, 5), [plan.plan_markdown]);
  const opts: CalendarOptions = { time, reminderMinutes: reminder, durationMinutes: duration, skipWeekends };

  async function onPdf() {
    if (pdfBusy) return;
    setPdfBusy(true);
    const id = toast.loading(t("exp_pdf_working"));
    try {
      const { exportPlanPdf } = await import("@/lib/planPdf");
      await exportPlanPdf(plan, {
        brand: "ABSOLUTE FRAME · AI FITNESS HUB",
        subtitle: t("exp_pdf_sub"),
        footer: "ABSOLUTE FRAME · Jaloliddin Zoxidov · 250040",
      });
      toast.success(t("exp_pdf_done"), { id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed", { id });
    } finally {
      setPdfBusy(false);
    }
  }

  function onIcs() {
    try {
      downloadIcs(plan, days, opts);
      toast.success(t("exp_cal_saved"));
      setCalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Calendar export failed");
    }
  }

  const btn =
    "inline-flex items-center gap-1 border border-border px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground transition hover:border-crimson hover:text-crimson";

  return (
    <>
      <button onClick={onPdf} disabled={pdfBusy} className={`${btn} disabled:opacity-50`} aria-label={t("exp_pdf")}>
        {pdfBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        {t("exp_pdf")}
      </button>
      <button onClick={() => setCalOpen((v) => !v)} className={btn} aria-label={t("exp_calendar")}>
        <CalendarPlus className="h-3 w-3" /> {t("exp_calendar")}
      </button>

      <AnimatePresence>
        {calOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="mt-2 border border-crimson/40 bg-black/60 p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">
                  {t("exp_cal_title")}
                </div>
                <button onClick={() => setCalOpen(false)} aria-label={t("exp_close")} className="text-muted-foreground hover:text-crimson">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                {days.length} {t("exp_cal_days_found")}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="block">
                  <span className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp_cal_time")}</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full border border-border bg-background px-2 py-1.5 font-mono-tech text-xs outline-none focus:border-crimson"
                  />
                </label>
                <label className="block">
                  <span className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp_cal_reminder")}</span>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(Number(e.target.value))}
                    className="mt-1 w-full border border-border bg-background px-2 py-1.5 font-mono-tech text-xs outline-none focus:border-crimson"
                  >
                    {[10, 15, 30, 60, 120].map((v) => (
                      <option key={v} value={v}>{v} {t("exp_minutes")}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="font-mono-tech text-[9px] uppercase tracking-widest text-muted-foreground">{t("exp_cal_duration")}</span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-1 w-full border border-border bg-background px-2 py-1.5 font-mono-tech text-xs outline-none focus:border-crimson"
                  >
                    {[45, 60, 75, 90, 120].map((v) => (
                      <option key={v} value={v}>{v} {t("exp_minutes")}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                <input
                  type="checkbox"
                  checked={skipWeekends}
                  onChange={(e) => setSkipWeekends(e.target.checked)}
                  className="h-3.5 w-3.5 accent-crimson"
                />
                {t("exp_cal_skip_weekends")}
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={onIcs}
                  className="inline-flex items-center gap-1 bg-crimson px-3 py-1.5 font-mono-tech text-[10px] uppercase tracking-widest text-primary-foreground shadow-crimson transition hover:bg-primary-glow"
                >
                  <Download className="h-3 w-3" /> {t("exp_cal_ics")}
                </button>
                <a
                  href={googleCalendarUrl(plan, days, opts)}
                  target="_blank"
                  rel="noreferrer"
                  className={btn}
                >
                  <ExternalLink className="h-3 w-3" /> {t("exp_cal_google")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
