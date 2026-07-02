import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/hub/Navbar";
import FlashDiscount, { hasSeenFlash, markFlashSeen } from "@/components/hub/FlashDiscount";
import FloatingProBadge from "@/components/hub/FloatingProBadge";
import CheatCodePanel from "@/components/hub/CheatCodePanel";
import FloatingCoachChat from "@/components/hub/FloatingCoachChat";
import UltraBanner from "@/components/hub/UltraBanner";
import Funnel from "@/components/funnel/Funnel";
import { useAuth } from "@/hooks/useAuth";
import { getActiveTier } from "@/lib/storage";
import { celebrate } from "@/lib/feedback";

const Index = () => {
  const [flashOpen, setFlashOpen] = useState(false);
  const { profile } = useAuth();
  // Bump on local tier mutations so useMemo re-evaluates.
  const [tierTick, setTierTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTierTick((n) => n + 1);
    window.addEventListener("frame:tier-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("frame:tier-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  // Tier evaluation guard — only Free-tier users see the promo. Reads both
  // the authenticated profile and the local vault mirror used by the Cheat
  // Code Panel and simulated purchases.
  const isFreeTier = useMemo(() => {
    const profileTier = profile?.membership_tier;
    if (profileTier && profileTier !== "free") return false;
    if (getActiveTier() !== "standard") return false;
    return true;
  }, [profile?.membership_tier, tierTick]);

  // Ultra tier activates the Yujiro Hanma / Demon Back aesthetic globally.
  const isUltraTier = useMemo(() => {
    if (profile?.membership_tier === "ultra") return true;
    return getActiveTier() === "ultra";
  }, [profile?.membership_tier, tierTick]);

  // Fire a one-shot screen-shake + audio confirmation the moment the user
  // transitions INTO Ultra (never on initial hydration).
  const ultraRef = useRef(isUltraTier);
  useEffect(() => {
    if (!ultraRef.current && isUltraTier) celebrate();
    ultraRef.current = isUltraTier;
  }, [isUltraTier]);

  // Auto-open the discount modal 3s after first onboarding pass.
  useEffect(() => {
    if (hasSeenFlash()) return;
    if (!isFreeTier) return; // Never auto-show to paid users.
    const tm = window.setTimeout(() => {
      setFlashOpen(true);
      markFlashSeen();
    }, 3000);
    return () => window.clearTimeout(tm);
  }, [isFreeTier]);

  // Vanish the discount modal the instant the user is no longer Free tier.
  useEffect(() => {
    if (!isFreeTier && flashOpen) setFlashOpen(false);
  }, [isFreeTier, flashOpen]);

  return (
    <div className={isUltraTier ? "ultra-mode" : ""}>
      {isUltraTier && <UltraBanner />}
      <main className="min-h-screen bg-background text-foreground pb-16">
        <Navbar />
        <h1 className="sr-only">Absolute Frame — AI Fitness & Cultural Hub for Tashkent</h1>
        <Funnel />
      </main>
      {isFreeTier && (
        <FlashDiscount
          open={flashOpen}
          onClose={() => setFlashOpen(false)}
          onPurchased={() => setFlashOpen(false)}
        />
      )}
      <FloatingProBadge visible={isFreeTier} onClick={() => setFlashOpen(true)} />
      <CheatCodePanel />
      <FloatingCoachChat />
    </div>
  );
};

export default Index;
