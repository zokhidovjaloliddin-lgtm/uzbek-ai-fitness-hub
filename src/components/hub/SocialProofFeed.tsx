import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Live-activity social proof.
 * A small dark card slides in bottom-left every 20 seconds showing realistic
 * community activity. Purely presentational (demo credibility for client
 * walkthroughs) — no data is read or written.
 */
type Item = { icon: string; en: string; uz: string; ru: string };

const FEED: Item[] = [
  { icon: "🔥", en: "Aziz (Tashkent) just upgraded to PRO", uz: "Aziz (Toshkent) hozir PRO'ga o'tdi", ru: "Азиз (Ташкент) только что перешёл на PRO" },
  { icon: "⚡", en: "Timur completed Day 5 of the Calisthenics plan", uz: "Timur kalistenika rejasining 5-kunini yakunladi", ru: "Тимур завершил 5-й день плана по калистенике" },
  { icon: "🥋", en: "Jasur started an MMA training plan", uz: "Jasur MMA mashg'ulot rejasini boshladi", ru: "Жасур начал план тренировок по MMA" },
  { icon: "🏆", en: "Dilshod reached a 21-day streak", uz: "Dilshod 21 kunlik seriyaga yetdi", ru: "Дильшод достиг серии в 21 день" },
  { icon: "💪", en: "Sardor unlocked ULTRA access", uz: "Sardor ULTRA darajasini ochdi", ru: "Сардор открыл доступ ULTRA" },
  { icon: "📈", en: "Kamola finished her wrestling camp plan", uz: "Kamola kurash rejasini yakunladi", ru: "Камола завершила план по борьбе" },
  { icon: "🕒", en: "Bekzod trained 4 days in a row in Chilonzor", uz: "Bekzod Chilonzorda 4 kun ketma-ket mashq qildi", ru: "Бекзод тренировался 4 дня подряд в Чиланзаре" },
  { icon: "🔥", en: "Ulugbek just upgraded to PRO", uz: "Ulug'bek hozir PRO'ga o'tdi", ru: "Улугбек только что перешёл на PRO" },
];

export default function SocialProofFeed() {
  const { lang } = useLang();
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;
    const show = () => {
      setShown(true);
      hideTimer = window.setTimeout(() => setShown(false), 6000);
    };
    const first = window.setTimeout(show, 6000);
    const loop = window.setInterval(() => {
      setIdx((n) => (n + 1) % FEED.length);
      show();
    }, 20000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hideTimer);
      window.clearInterval(loop);
    };
  }, []);

  const item = FEED[idx];
  const text = lang === "uz" ? item.uz : lang === "ru" ? item.ru : item.en;

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-24 left-3 z-[90] sm:left-4">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={`${idx}-${lang}`}
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-[16rem] border border-crimson/50 bg-black/85 px-3 py-2 shadow-[0_0_20px_rgba(220,38,38,0.28)] backdrop-blur-md sm:max-w-xs"
          >
            <div className="font-mono-tech text-[8px] uppercase tracking-[0.2em] text-crimson">
              {lang === "uz" ? "Jonli faollik" : lang === "ru" ? "Живая активность" : "Live activity"}
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-[11px] leading-snug text-foreground">
              <span aria-hidden>{item.icon}</span>
              <span>{text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
