import Navbar from "@/components/hub/Navbar";
import Hero from "@/components/hub/Hero";
import BodyAnalysis from "@/components/hub/BodyAnalysis";
import GoalsPicker from "@/components/hub/GoalsPicker";
import AICoach from "@/components/hub/AICoach";
import Pricing from "@/components/hub/Pricing";
import Footer from "@/components/hub/Footer";
import { LanguageProvider } from "@/lib/i18n";
import OnboardingGate from "@/components/onboarding/OnboardingGate";

const Index = () => {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
};

export default Index;
