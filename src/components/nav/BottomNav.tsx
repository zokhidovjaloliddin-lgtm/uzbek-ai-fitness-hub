import { Home, ClipboardList, Flame, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

export type Tab = "home" | "plans" | "coach" | "location" | "profile";

type Props = {
  active: Tab;
  onChange: (t: Tab) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  const { t } = useLang();
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: t("tab_home"), icon: <Home className="h-4 w-4" /> },
    { id: "plans", label: t("tab_plans"), icon: <ClipboardList className="h-4 w-4" /> },
    { id: "coach", label: t("tab_coach"), icon: <Flame className="h-5 w-5" /> },
    { id: "location", label: t("tab_location"), icon: <MapPin className="h-4 w-4" /> },
    { id: "profile", label: t("tab_profile"), icon: <User className="h-4 w-4" /> },
  ];
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-crimson/40 bg-black/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-1.5 py-2">
        {items.map((it) => {
          const on = active === it.id;
          const isCoach = it.id === "coach";
          return (
            <li key={it.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(it.id)}
                aria-current={on ? "page" : undefined}
                aria-label={it.label}
                className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-md px-0.5 py-1 transition ${
                  isCoach
                    ? on
                      ? "text-crimson"
                      : "text-crimson/80"
                    : on
                      ? "text-crimson"
                      : "text-zinc-400 hover:text-foreground"
                }`}
              >
                {isCoach ? (
                  <span className={`grid h-11 w-11 -translate-y-3 place-items-center rounded-full border-2 border-crimson bg-black shadow-crimson ${on ? "scale-110" : ""} transition-transform`}>
                    {it.icon}
                  </span>
                ) : (
                  <span>{it.icon}</span>
                )}
                <span className={`font-mono-tech text-[10px] leading-tight uppercase tracking-[0.06em] ${isCoach ? "-mt-2" : ""}`}>
                  {it.label}
                </span>
                {on && !isCoach && (
                  <motion.span
                    layoutId="bottom-nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] bg-crimson shadow-[0_0_8px_hsl(var(--primary))]"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}