import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/hub/Navbar";
import Hero from "@/components/hub/Hero";
import BodyAnalysis from "@/components/hub/BodyAnalysis";
import GoalsPicker from "@/components/hub/GoalsPicker";
import AICoach from "@/components/hub/AICoach";
import Pricing from "@/components/hub/Pricing";
import Footer from "@/components/hub/Footer";
import OnboardingGate from "@/components/onboarding/OnboardingGate";
import FlashDiscount, { hasSeenFlash, markFlashSeen } from "@/components/hub/FlashDiscount";
import FloatingProBadge from "@/components/hub/FloatingProBadge";
import CheatCodePanel from "@/components/hub/CheatCodePanel";
import FloatingCoachChat from "@/components/hub/FloatingCoachChat";
import { useAuth } from "@/hooks/useAuth";
import { getActiveTier } from "@/lib/storage";

const Index = () => {
  const [flashOpen, setFlashOpen] = useState(false);
  const { profile } = useAuth();

  // Tier evaluation guard — only Free-tier users see the promo. Reads both
  // the authenticated profile and the local vault mirror used by the Cheat
  // Code Panel and simulated purchases.
  const isFreeTier = useMemo(() => {
    const profileTier = profile?.membership_tier;
    if (profileTier && profileTier !== "free") return false;
    if (getActiveTier() !== "standard") return false;
    return true;
  }, [profile?.membership_tier]);

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
    <>
      <OnboardingGate />
      <main className="min-h-screen bg-background text-foreground pb-16">
        <Navbar />
        <h1 className="sr-only">Absolute Frame — AI Fitness & Cultural Hub for Tashkent</h1>
        <Hero />
        <GoalsPicker />
        <BodyAnalysis />
        <AICoach />
        <Pricing />
        <Footer />
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
    </>
  );
};

export default Index;
