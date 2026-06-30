import { motion } from "framer-motion";
import { Flame, Skull } from "lucide-react";

/**
 * Ultra-tier "Demon Mode" hero banner. Renders only when the active tier is
 * `ultra`. Aggressive Yujiro Hanma copy, pulsating crimson, deep obsidian.
 */
export default function UltraBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="demon-banner sticky top-0 z-40 w-full"
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-red-500">
          <Skull className="h-3.5 w-3.5 animate-pulse" />
          DEMON MODE UNLOCKED
        </div>
        <div className="hidden md:block font-display text-sm tracking-widest text-white">
          BREAK YOUR LIMITS · SURPASS HUMANITY · BECOME THE OGRE
        </div>
        <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-red-500">
          <Flame className="h-3.5 w-3.5 animate-pulse" fill="currentColor" />
          ULTRA · YUJIRO TIER
        </div>
      </div>
    </motion.div>
  );
}