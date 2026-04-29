import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const Navbar = () => {
  const links = [
    { href: "#analysis", label: "Body Analysis" },
    { href: "#coach", label: "AI Coach" },
    { href: "#pricing", label: "Pricing" },
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
        <div className="font-mono-tech text-xs text-muted-foreground">
          TASHKENT · UZ
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;