import { motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 gradient-blood opacity-80" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/0.25),transparent_60%)]" />

      <div className="container relative mx-auto py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 font-mono-tech text-xs uppercase tracking-[0.3em] text-crimson"
        >
          <span className="h-px w-10 bg-crimson" />
          <Zap className="h-3.5 w-3.5" /> Primordial Protocol · v1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 font-display text-5xl leading-[0.95] sm:text-6xl md:text-[9rem]"
        >
          FORGE THE <br />
          <span className="text-stroke">BODY OF A</span> <span className="text-crimson">WARRIOR.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 max-w-xl text-lg text-muted-foreground"
        >
          AI-driven calisthenics protocols built for Tashkent streets. Track your stats, unleash your archetype, train with savage Uzbek-English slang.
          <span className="block mt-2 font-mono-tech text-sm text-foreground">Boriku, brat. Beast mode aktivatsiya.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a href="#analysis" className="group relative inline-flex items-center gap-3 bg-crimson px-8 py-4 font-mono-tech text-sm uppercase tracking-widest text-primary-foreground shadow-crimson transition hover:bg-primary-glow">
            Begin Analysis <ArrowDown className="h-4 w-4 transition group-hover:translate-y-1" />
          </a>
          <a href="#coach" className="inline-flex items-center gap-3 border border-border px-8 py-4 font-mono-tech text-sm uppercase tracking-widest text-foreground transition hover:border-primary hover:text-crimson">
            Summon Coach
          </a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 grid grid-cols-2 gap-px border-frame bg-border md:grid-cols-4"
        >
          {[
            ["05", "Day Protocol"],
            ["08", "Warrior Archetypes"],
            ["12+", "Tashkent Parks"],
            ["∞", "Mind Reps"],
          ].map(([n, l]) => (
            <div key={l} className="bg-background p-6">
              <div className="font-display text-5xl text-crimson">{n}</div>
              <div className="mt-1 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;