import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ProfileRow = {
  user_id: string;
  email: string | null;
  preferred_language: "en" | "uz";
  goals: string[];
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  bmi_category: string | null;
  membership_tier: "free" | "pro" | "ultra";
  display_name: string | null;
  chosen_character: string | null;
  intensity_level: string | null;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) {
      console.error("profile load", error);
      return;
    }
    setProfile((data as ProfileRow | null) ?? null);
  };

  useEffect(() => {
    // Listener first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      const u = sess?.user ?? null;
      setUser(u);
      // Only load profile for non-anonymous, email-bearing users
      if (u && !u.is_anonymous) {
        setTimeout(() => loadProfile(u.id), 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const u = data.session?.user ?? null;
      setUser(u);
      if (u && !u.is_anonymous) loadProfile(u.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user && !user.is_anonymous) await loadProfile(user.id);
  };

  const isAuthed = !!user && !user.is_anonymous;

  return { session, user, profile, loading, isAuthed, refreshProfile, setProfile };
}