
## Goal

Rework the entry flow, plan generation, and coach button placement so the app behaves like a real product: sign-in first (with guest preview), the AI coach chat is the only thing that creates and levels up training plans, and level/XP/progress on Home reflect real DB values written by the coach — not mockups.

## 1. Landing / routing (auth first, guest preview)

- Root route (`/`) becomes a gate:
  - Not signed in → redirect to `/auth` (existing `src/pages/Auth.tsx`).
  - `/auth` shows sign in / sign up, plus a small `Continue as guest` link.
  - Guests get a `guest=1` flag in `sessionStorage`; they can run the funnel + chat but every "save plan / level up / mark day done" action opens a sign-in sheet instead of writing.
- After auth (or guest continue) → funnel steps (language → discipline → intro video → "I'M READY TO TRAIN").
- Pressing "I'M READY TO TRAIN" no longer calls `generate-workout`. It navigates into the Coach tab and opens a fresh chat with the AI coach, seeded with the user's funnel answers as the first system/context message.
- After the funnel has been completed once (persisted in `profiles.onboarded_at` for signed-in users, or `localStorage` for guests), future visits skip straight to the Home tab.

## 2. Bottom nav + coach button cleanup

- Remove `FloatingCoachChat` entirely (component + usages in `Index.tsx`). No more separate floating coach button.
- `BottomNav.tsx` keeps its 5 slots, but the center Coach slot becomes the single entry point to the coach — bigger crimson pill, label "COACH".
- Coach tab renders full-viewport (no funnel wrapper): header, message list, recommended-prompt chips row, sticky composer. No pricing / footer inside the tab.
- Recommended prompt chips (localized) sit right above the composer and dispatch text into the input:
  `Ask about nutrition`, `What to avoid`, `Recovery`, `Halal diet`, `Sleep`, `Level me up`, `Scale my plan`.

## 3. Chat-only plan generation

- Delete the `generate-workout` one-shot path from the UI. Keep the edge function file for now but stop calling it; plans come only from `chat-coach`.
- Extend `supabase/functions/chat-coach/index.ts`:
  - Adds AI SDK tool calls the model can invoke:
    - `create_training_plan({ title, archetype, discipline, total_days, plan_markdown })` → inserts into `training_plans` for the authed user, marks it `active`, and archives any other active plan for that user.
    - `update_plan_progress({ plan_id, completed_days_delta, level_delta, xp_delta, note })` → updates the active plan row.
    - `level_up({ plan_id, new_level, unlocked_title })` → bumps `level` + writes a milestone row.
  - System prompt: coach must ask 3–5 short qualifying questions (goal, experience, days/week, equipment, injuries), then call `create_training_plan` exactly once, then continue chatting for coaching + level-ups. Strict single-language contract (EN / UZ / RU).
- On the client, when a tool result comes back, the Coach tab shows an inline "Plan saved ✓ — view in Home" card and Home + Plans tabs invalidate their queries so the new plan appears immediately.

## 4. Real progress on Home (no mockups)

- Extend `training_plans` with the level/XP fields the coach writes to; add a `plan_milestones` table for level-up history.
- Home tab reads real values:
  - Active plan card: title, level, XP bar, `completed_days / total_days`, streak (from `plan_day_completions`), last milestone.
  - "Mark today done" button → `markTodayDone()` (already implemented) — kept, but the level-ups themselves come from the coach's tool calls, not from client math.
  - Empty state (no plan yet): CTA "Talk to the AI Coach" → opens Coach tab.
- Remove any hardcoded / demo plan fallbacks in `HomeTab.tsx` and `PlanCard.tsx`.

## 5. Guest → sign-in upgrade

- Guest chat messages are held in memory only (no `chat_history` writes).
- If the coach tries to call `create_training_plan` / `level_up` while `guest=1`, the client intercepts and shows a "Sign in to save your plan" sheet. On successful sign-in, the queued tool call is replayed against the now-authenticated session so the plan lands in their account.

## Technical section

### DB migration

```sql
ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_to_next INT NOT NULL DEFAULT 100;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

CREATE TABLE public.plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,          -- 'level_up' | 'day_done' | 'plan_created' | 'plan_completed'
  level INT,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.plan_milestones TO authenticated;
GRANT ALL ON public.plan_milestones TO service_role;
ALTER TABLE public.plan_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own milestones select" ON public.plan_milestones FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "own milestones insert" ON public.plan_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Edge function tool-calling shape

Use AI SDK `streamText({ tools: { create_training_plan, update_plan_progress, level_up }, stopWhen: stepCountIs(6) })`. Each tool's `execute` uses a service-role Supabase client scoped to the JWT's `sub` (user_id) it read from the `Authorization` header. Emit tool results back into the UI stream so the client can react.

### New / edited files

- **new**: `src/pages/tabs/CoachTab.tsx` (full rewrite — no `Funnel` wrapper, dedicated chat layout), `src/components/coach/RecommendedPrompts.tsx`, `src/components/coach/PlanSavedCard.tsx`, `src/components/auth/AuthGate.tsx`, `src/components/auth/SignInToSaveSheet.tsx`, `src/lib/coachTools.ts` (client-side handlers for tool result messages + guest queue).
- **edit**: `src/pages/Index.tsx` (AuthGate wrapper + remove `FloatingCoachChat`), `src/components/nav/BottomNav.tsx` (bigger center pill), `src/pages/Auth.tsx` (add "Continue as guest"), `src/components/funnel/Funnel.tsx` (final step routes to Coach tab instead of calling `generate-workout`), `src/components/hub/AICoach.tsx` (deprecate or slim to just render chat history; remove one-shot generation), `src/pages/tabs/HomeTab.tsx` + `src/components/home/PlanCard.tsx` (read level/XP/milestones from DB; kill mockups), `src/lib/plans.ts` (add `getActivePlan`, `getMilestones`), `supabase/functions/chat-coach/index.ts` (tools + single-language contract).
- **delete usage of**: `src/components/hub/FloatingCoachChat.tsx` (remove import from `Index.tsx`; file can stay unused or be deleted in the same pass).

### Out of scope / preserved

- Cheat Code panel, Ultra theme, Flash Discount pill, Pricing, existing i18n strings (only the plan-generation copy changes).
- No changes to auth providers or Supabase auth config.
- `generate-workout` edge function stays on disk but is no longer invoked.
