import { useEffect, useState } from "react";
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

const Index = () => {
  const [flashOpen, setFlashOpen] = useState(false);

  // Auto-open the discount modal 3s after first onboarding pass.
  useEffect(() => {
    if (hasSeenFlash()) return;
    const tm = window.setTimeout(() => {
      setFlashOpen(true);
      markFlashSeen();
    }, 3000);
    return () => window.clearTimeout(tm);
  }, []);

  return (
    <>
      <OnboardingGate />
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <h1 className="sr-only">Absolute Frame — AI Fitness & Cultural Hub for Tashkent</h1>
        <Hero />
        <GoalsPicker />
        <BodyAnalysis />
        <AICoach />
        <Pricing />
        <Footer />
      </main>
      <FlashDiscount open={flashOpen} onClose={() => setFlashOpen(false)} />
      <FloatingProBadge onClick={() => setFlashOpen(true)} />
      <CheatCodePanel />
    </>
  );
};

export default Index;
