import { motion } from "framer-motion";
import { Flame, Check } from "lucide-react";
import { useState } from "react";
import { useLang, type Lang } from "@/lib/i18n";

const OPTIONS: { id: Lang; native: string; latin: string }[] = [
  { id: "en", native: "English", latin: "English" },
  { id: "uz", native: "O'zbekcha", latin: "Uzbek" },
  { id: "ru", native: "Русский", latin: "Russian" },
];

export default function LanguageGate() {
  const { setLang, t } = useLang();
  const [picked, setPicked] = useState<Lang>("en");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-4 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border-2 border-crimson/50 bg-card p-6 shadow-crimson"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-crimson">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wider">{t("lg_title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("lg_sub")}</p>
          </div>
        </div>

        <div className="space-y-2">
          {OPTIONS.map((o) => {
            const active = picked === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setPicked(o.id)}
                className={`flex w-full items-center justify-between border px-4 py-3 text-left transition ${
                  active
                    ? "border-crimson bg-crimson/15"
                    : "border-border bg-noir hover:border-crimson/60"
                }`}
              >
                <div>
                  <div className="font-display text-lg tracking-wider">{o.native}</div>
                  <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">
                    {o.latin}
                  </div>
                </div>
                {active && <Check className="h-4 w-4 text-crimson" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setLang(picked)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow"
        >
          {t("lg_continue")}
        </button>
      </motion.div>
    </div>
  );
}