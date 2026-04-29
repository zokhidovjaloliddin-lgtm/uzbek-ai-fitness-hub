import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, CreditCard, Loader2, ShieldCheck, Crown } from "lucide-react";
import { storage } from "@/lib/storage";
import { toast } from "sonner";
import SectionHeader from "./SectionHeader";

type Tier = {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  tagline: string;
  features: { ok: boolean; text: string }[];
  highlighted?: boolean;
  free?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "standard",
    name: "Standard",
    price: "0",
    priceLabel: "Free",
    tagline: "For those just stepping into the arena.",
    free: true,
    features: [
      { ok: true, text: "Basic BMI Analysis" },
      { ok: true, text: "1 AI Workout Plan" },
      { ok: false, text: "Uzbek Slang Coach" },
      { ok: false, text: "Posture Analysis" },
      { ok: false, text: "Unlimited uploads" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "10,000",
    priceLabel: "UZS / month",
    tagline: "Aka, ready to go beast mode.",
    highlighted: true,
    features: [
      { ok: true, text: "Everything in Standard" },
      { ok: true, text: "Custom Uzbek Slang Coach" },
      { ok: true, text: "Unlimited AI Plans" },
      { ok: true, text: "Tashkent Park Routes" },
      { ok: false, text: "AI Posture Analysis" },
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "30,000",
    priceLabel: "UZS / month",
    tagline: "For the chosen few. Yujiro tier.",
    features: [
      { ok: true, text: "Everything in Premium" },
      { ok: true, text: "AI Posture Analysis" },
      { ok: true, text: "Unlimited File Uploads" },
      { ok: true, text: "Priority Coach Response" },
      { ok: true, text: "Live Tashkent Events" },
    ],
  },
];

/**
 * Pricing
 * ------------------------------------------------------------------
 * Front-End Development Project — Jaloliddin Zoxidov (ID: 250040)
 *
 * - useState: drives the active subscription tier, the modal target,
 *   the multi-step payment status, and the chosen payment method.
 * - useEffect: reads the persisted tier from localStorage on mount so
 *   the "PREMIUM" badge survives page refreshes.
 * - The Payme/Click confirmation flow is fully client-side: when the
 *   user clicks "Confirm Payment", React state transitions
 *   idle → processing → done, and the Account Status pill updates
 *   live without any page reload.
 */
const Pricing = () => {
  // --- React state -------------------------------------------------
  const [activeTier, setActiveTier] = useState("standard");
  const [payTier, setPayTier] = useState<Tier | null>(null);
  const [paying, setPaying] = useState<"idle" | "processing" | "done">("idle");
  const [method, setMethod] = useState<"payme" | "click">("payme");

  // Restore last subscription tier from localStorage on first render.
  useEffect(() => { setActiveTier(storage.getTier()); }, []);

  // Friendly label for the live Account Status pill.
  const accountLabel = (activeTier ?? "standard").toUpperCase();

  const choose = (t: Tier) => {
    if (t.free) {
      storage.setTier(t.id);
      setActiveTier(t.id);
      toast.success(`${t.name} activated.`);
      return;
    }
    setPayTier(t);
    setPaying("idle");
  };

  // Simulated Payme/Click checkout. Updates React state in place so
  // the UI reflects the new "PREMIUM" status without a page refresh.
  const confirmPay = () => {
    setPaying("processing");
    setTimeout(() => {
      if (payTier) {
        storage.setTier(payTier.id);
        setActiveTier(payTier.id); // ← live UI update, no reload
        toast.success(`Account Status: ${payTier.id.toUpperCase()}`);
      }
      setPaying("done");
    }, 1600);
  };

  const closeModal = () => {
    setPayTier(null);
    setPaying("idle");
  };

  return (
    <section id="pricing" className="border-b border-border py-24">
      <div className="container mx-auto">
        <SectionHeader
          tag="03 / Pricing"
          title={<>CHOOSE YOUR <span className="text-crimson">TIER.</span></>}
          subtitle="Three paths. One destination — total dominion over the frame."
        />

        {/* Live account status — driven by React state, no refresh needed */}
        <div className="mb-8 flex justify-center">
          <div className={`inline-flex items-center gap-2 border px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest ${
            activeTier === "standard"
              ? "border-border text-muted-foreground"
              : "border-primary text-crimson shadow-crimson"
          }`}>
            <Crown className="h-3.5 w-3.5" /> Account Status: <span className="text-foreground">{accountLabel}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col border bg-card p-8 ${t.highlighted ? "border-primary shadow-deep" : "border-border"}`}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-8 bg-crimson px-3 py-1 font-mono-tech text-[10px] uppercase tracking-widest text-primary-foreground">
                  Most Chosen
                </div>
              )}
              {activeTier === t.id && (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 border border-gauge-normal px-2 py-0.5 font-mono-tech text-[10px] uppercase tracking-widest text-gauge-normal">
                  <ShieldCheck className="h-3 w-3" /> Active
                </div>
              )}
              <div className="font-display text-3xl">{t.name}</div>
              <div className="mt-1 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">{t.tagline}</div>

              <div className="mt-6 flex items-baseline gap-2">
                <div className="font-display text-6xl text-crimson">{t.price}</div>
                <div className="font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">{t.priceLabel}</div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {t.features.map(f => (
                  <li key={f.text} className="flex items-start gap-3 text-sm">
                    {f.ok
                      ? <Check className="mt-0.5 h-4 w-4 text-crimson" />
                      : <X className="mt-0.5 h-4 w-4 text-muted-foreground/50" />}
                    <span className={f.ok ? "text-foreground" : "text-muted-foreground/50 line-through"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(t)}
                className={`mt-8 w-full px-6 py-4 font-mono-tech text-xs uppercase tracking-widest transition ${
                  t.highlighted
                    ? "bg-crimson text-primary-foreground hover:bg-primary-glow"
                    : "border border-border hover:border-primary hover:text-crimson"
                }`}
              >
                {t.free ? "Activate Free" : `Subscribe — ${t.price} UZS`}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {payTier && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md border border-primary bg-card shadow-crimson"
            >
              <div className="border-b border-border bg-background/50 p-6">
                <div className="font-mono-tech text-[10px] uppercase tracking-widest text-crimson">Secure Checkout</div>
                <div className="mt-2 font-display text-3xl">{payTier.name} Tier</div>
                <div className="mt-1 font-mono-tech text-sm text-muted-foreground">{payTier.price} UZS / month</div>
              </div>

              {paying !== "done" && (
                <div className="p-6">
                  <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Payment Method</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["payme", "click"] as const).map(m => (
                      <button key={m} onClick={() => setMethod(m)}
                        className={`border p-4 text-left transition ${method === m ? "border-primary bg-primary/10" : "border-border"}`}>
                        <div className="font-display text-xl uppercase">{m}</div>
                        <div className="font-mono-tech text-[10px] uppercase tracking-widest text-muted-foreground">Uzbekistan</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 space-y-2 font-mono-tech text-xs">
                    <Row k="Amount" v={`${payTier.price} UZS`} />
                    <Row k="Method" v={method.toUpperCase()} />
                    <Row k="Provider" v="Sandbox simulation" />
                  </div>

                  <button
                    onClick={confirmPay}
                    disabled={paying === "processing"}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-crimson px-6 py-4 font-mono-tech text-xs uppercase tracking-widest text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
                  >
                    {paying === "processing"
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                      : <><CreditCard className="h-4 w-4" /> Confirm Payment</>}
                  </button>

                  <button onClick={closeModal} className="mt-2 w-full font-mono-tech text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              )}

              {paying === "done" && (
                <div className="p-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-crimson shadow-crimson">
                    <Check className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  <div className="mt-4 font-display text-3xl">Payment Complete</div>
                  <div className="mt-1 font-mono-tech text-xs uppercase tracking-widest text-muted-foreground">
                    {payTier.name} tier activated. Boriku, brat!
                  </div>
                  <button onClick={closeModal} className="mt-6 w-full bg-foreground px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-background hover:opacity-90">
                    Enter the Arena
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between border-b border-border pb-1.5">
    <span className="uppercase tracking-widest text-muted-foreground">{k}</span>
    <span className="text-foreground">{v}</span>
  </div>
);

export default Pricing;