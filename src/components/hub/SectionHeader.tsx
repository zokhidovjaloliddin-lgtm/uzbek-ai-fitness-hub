import { ReactNode } from "react";

const SectionHeader = ({ tag, title, subtitle }: { tag: string; title: ReactNode; subtitle?: string }) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 font-mono-tech text-xs uppercase tracking-[0.3em] text-crimson">
      <span className="h-px w-8 bg-crimson" /> {tag}
    </div>
    <h2 className="mt-4 font-display text-5xl md:text-7xl">{title}</h2>
    {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
  </div>
);

export default SectionHeader;