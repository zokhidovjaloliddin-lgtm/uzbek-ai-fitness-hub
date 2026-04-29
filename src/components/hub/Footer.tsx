import { Flame, GraduationCap, Code2 } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container mx-auto py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center bg-crimson"><Flame className="h-5 w-5 text-primary-foreground" /></div>
            <div className="font-display text-2xl tracking-wider">ABSOLUTE<span className="text-crimson">_</span>FRAME</div>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            AI-powered fitness & cultural hub built for the Tashkent generation. Train hard. Stay hungry. Boriku.
          </p>
        </div>

        <div>
          <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">Credits</div>
          <div className="mt-3 inline-flex items-start gap-3 border border-border p-4">
            <GraduationCap className="h-5 w-5 text-crimson" />
            <div>
              <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Front-End Development Project by</div>
              <div className="mt-1 font-display text-xl">Jaloliddin Zoxidov</div>
              <div className="font-mono-tech text-xs text-muted-foreground">ID: <span className="text-foreground">250040</span></div>
            </div>
          </div>
        </div>

        <div>
          <div className="font-mono-tech text-[11px] uppercase tracking-widest text-crimson">Stack</div>
          <ul className="mt-3 space-y-1 font-mono-tech text-xs text-muted-foreground">
            <li>· React 18 + TypeScript</li>
            <li>· Tailwind CSS · Framer Motion</li>
            <li>· Lucide Icons</li>
            <li>· Google Gemini API (Edge Function)</li>
            <li>· LocalStorage persistence</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row md:items-center">
        <div>© 2026 Absolute_Frame · Front-End Development Project | Jaloliddin Zoxidov | ID: 250040</div>
        <div className="flex items-center gap-2"><Code2 className="h-3.5 w-3.5" /> React · Tailwind · Framer Motion</div>
      </div>
    </div>
  </footer>
);

export default Footer;