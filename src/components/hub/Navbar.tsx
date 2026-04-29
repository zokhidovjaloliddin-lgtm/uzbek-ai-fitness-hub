import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useLang } from "@/lib/i18n";

const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const links = [
    { href: "#analysis", label: t("nav_analysis") },
    { href: "#coach", label: t("nav_coach") },
    { href: "#pricing", label: t("nav_pricing") },
  ];
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex items-center justify-between py-4">
        <a href="#top" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center bg-crimson shadow-crimson">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display text-2xl tracking-wider">
            ABSOLUTE<span className="text-crimson">_</span>FRAME
          </div>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(l => (
            <a key={l.href} href={l.href} className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground transition hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden font-mono-tech text-xs text-muted-foreground sm:block">
            TASHKENT · UZ
          </div>
          <div className="inline-flex items-center border border-border font-mono-tech text-[11px] uppercase tracking-widest">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition ${lang === "en" ? "bg-crimson text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "en"}
            >EN</button>
            <button
              onClick={() => setLang("uz")}
              className={`px-2.5 py-1 transition ${lang === "uz" ? "bg-crimson text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={lang === "uz"}
            >UZ</button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;