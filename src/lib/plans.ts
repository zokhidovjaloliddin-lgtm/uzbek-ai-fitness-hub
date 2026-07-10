import { supabase } from "@/integrations/supabase/client";

export type TrainingPlanRow = {
  id: string;
  user_id: string;
  title: string;
  archetype: string;
  discipline: string;
  language: string;
  plan_markdown: string;
  total_days: number;
  completed_days: number;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanInsert = {
  title: string;
  archetype: string;
  discipline: string;
  language: string;
  plan_markdown: string;
  total_days?: number;
};

/**
 * Persist a freshly generated training plan for the authenticated user.
 * Silently no-ops for guest users (no user id → nothing to save).
 */
export async function savePlanToCloud(input: PlanInsert): Promise<TrainingPlanRow | null> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("training_plans")
    .insert({
      user_id: uid,
      title: input.title,
      archetype: input.archetype,
      discipline: input.discipline,
      language: input.language,
      plan_markdown: input.plan_markdown,
      total_days: input.total_days ?? 60,
      status: "active",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as TrainingPlanRow;
}

export async function listPlans(): Promise<TrainingPlanRow[]> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("training_plans")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainingPlanRow[];
}

export async function deletePlan(id: string): Promise<void> {
  const { error } = await supabase.from("training_plans").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Mark today as complete for the plan. Uses the UNIQUE(plan_id, completed_on)
 * constraint so repeated presses within the same day are idempotent.
 * Increments the plan's `completed_days` and auto-completes when it hits total.
 */
export async function markTodayDone(plan: TrainingPlanRow): Promise<TrainingPlanRow | null> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { error: cErr } = await supabase.from("plan_day_completions").insert({
    user_id: uid,
    plan_id: plan.id,
    completed_on: today,
  });
  // 23505 = unique violation → already marked today
  if (cErr && !`${cErr.message}`.toLowerCase().includes("duplicate")) throw cErr;
  if (cErr) return plan; // no-op if already marked

  const nextDays = Math.min(plan.total_days, plan.completed_days + 1);
  const done = nextDays >= plan.total_days;
  const { data, error } = await supabase
    .from("training_plans")
    .update({
      completed_days: nextDays,
      status: done ? "completed" : plan.status,
      completed_at: done ? new Date().toISOString() : null,
    })
    .eq("id", plan.id)
    .select("*")
    .single();
  if (error) throw error;
  return data as TrainingPlanRow;
}

export async function getCompletionCalendar(plan_id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("plan_day_completions")
    .select("completed_on")
    .eq("plan_id", plan_id)
    .order("completed_on", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.completed_on as string);
}

export async function getStreak(): Promise<number> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return 0;
  const { data, error } = await supabase
    .from("plan_day_completions")
    .select("completed_on")
    .eq("user_id", uid)
    .order("completed_on", { ascending: false })
    .limit(120);
  if (error) throw error;
  const days = new Set<string>((data ?? []).map((r) => r.completed_on as string));
  let streak = 0;
  const cursor = new Date();
  // If no entry today, start from yesterday so users don't lose the streak.
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function progressPct(plan: Pick<TrainingPlanRow, "completed_days" | "total_days">) {
  if (plan.total_days <= 0) return 0;
  return Math.round((plan.completed_days / plan.total_days) * 100);
}