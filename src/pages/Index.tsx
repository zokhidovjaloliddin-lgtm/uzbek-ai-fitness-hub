import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/hub/Navbar";
import FlashDiscount, { hasSeenFlash, markFlashSeen } from "@/components/hub/FlashDiscount";
import FloatingProBadge from "@/components/hub/FloatingProBadge";
import CheatCodePanel from "@/components/hub/CheatCodePanel";
import UltraBanner from "@/components/hub/UltraBanner";
import BottomNav, { type Tab } from "@/components/nav/BottomNav";
import HomeTab from "@/pages/tabs/HomeTab";
import PlansTab from "@/pages/tabs/PlansTab";
import CoachTab from "@/pages/tabs/CoachTab";
import LocationTab from "@/pages/tabs/LocationTab";
import ProfileTab from "@/pages/tabs/ProfileTab";
import { useAuth } from "@/hooks/useAuth";
import { getActiveTier } from "@/lib/storage";
import { celebrate } from "@/lib/feedback";

const Index = () => {
  const [flashOpen, setFlashOpen] = useState(false);
  const { profile, isAuthed, loading } = useAuth();
  const isGuest = typeof window !== "undefined" && sessionStorage.getItem("guest") === "1";
  const initialTab: Tab = (() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    if (["home","plans","coach","location","profile"].includes(p ?? "")) return p as Tab;
    // First-time users (no active plan yet) land on the Coach tab so the
    // AI Coach can walk them through their first plan.
    return "home";
  })();
  const [tab, setTab] = useState<Tab>(initialTab);

  // Auto-route new users into the coach on first authenticated load.
  useEffect(() => {
    if (!isAuthed || !profile) return;
    if (profile.onboarded_at) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("tab")) return;
    setTab("coach");
  }, [isAuthed, profile?.onboarded_at]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }, [tab]);
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

  // Auth gate — placed AFTER every hook so hook order stays stable across
  // renders. Returning early above any hook triggers React's
  // "Rendered fewer hooks than expected" crash → black screen.
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <div className="font-mono-tech text-xs uppercase tracking-widest text-crimson/80 animate-pulse">
          Loading…
        </div>
      </div>
    );
  }
  if (!isAuthed && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={isUltraTier ? "ultra-mode" : ""}>
      {isUltraTier && <UltraBanner />}
      <main className="min-h-screen bg-background text-foreground pb-24">
        <Navbar />
        <h1 className="sr-only">Absolute Frame — AI Fitness & Cultural Hub for Tashkent</h1>
        {tab === "home" && <HomeTab onOpenCoach={() => setTab("coach")} />}
        {tab === "plans" && <PlansTab onOpenCoach={() => setTab("coach")} />}
        {tab === "coach" && <CoachTab />}
        {tab === "location" && <LocationTab />}
        {tab === "profile" && <ProfileTab />}
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
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
