
## Overview

Convert the single-funnel page into a 5-tab bottom-nav app while keeping the existing funnel intact as the Coach tab. Add durable Plans + Progress, an avatar upload flow, a Location tab, and enforce strict single-language output (EN / UZ / RU) across UI copy AND generated training plans. Global copy rename: "protocol" → "training plan", "forging" → "working on your selected plans".

## 1. Global copy + language enforcement

- Rename across all i18n keys and hardcoded strings: `protocol` → `training plan` (UZ: `mashg'ulot rejasi`, RU: `тренировочный план`), `forging` → `working on your selected plans` (UZ: `tanlangan rejangiz ustida ishlash`, RU: `работа над выбранным планом`). Includes `CheatCodePanel`, `AICoach` ("FINISHED THIS PROTOCOL", "Forging your protocol..."), `FloatingCoachChat`, `UltraBanner`, `Pricing`, `Funnel` step titles.
- Edge functions (`chat-coach`, `generate-workout`): tighten `languageBlock()` to a hard contract — "Respond ONLY in {lang}. Do not include a single word in any other language. If tempted to use an English term, translate it. Never use Uzbek/Russian slang. Use only literary registers." Pass `language` from `i18n.getLanguage()` on every request.
- On language switch (`i18n.setLanguage`): wipe cached plan (`storage.setPlan(null)`), clear `chat_history` rows for the user, clear local funnel step cache. Trigger a fresh `generate-workout` regeneration when the user re-enters the Coach tab so the plan is 100% in the new language.
- Remove any leftover Uzbek slang tokens ("brat", "aka", "boriku", etc.) from all copy and system prompts; explicit forbidden list already exists in `chat-coach` — mirror it into `generate-workout`.

## 2. Bottom navigation shell

- New `src/components/nav/BottomNav.tsx` — fixed bottom, safe-area padded, 5 pill tabs: Home / Plans / Coach / Location / Profile. Icons: `Home`, `ClipboardList`, `Sparkles` replaced with a domain image mark for Coach, `MapPin`, `User`. Active tab: crimson underline + glow, label always visible.
- `src/pages/Index.tsx` becomes a tab router with `useState<Tab>`; renders one of `HomeTab`, `PlansTab`, `CoachTab` (= existing `Funnel` + AI output), `LocationTab`, `ProfileTab`. Floating pills (Cheat, Discount) and `FloatingCoachChat` remain global but hide on the Coach tab (full-screen coach experience).
- URL sync via `?tab=` search param so refresh restores tab.

## 3. Coach tab (full-screen)

- The Coach tab renders the existing `Funnel` up through the AI Coach output but expanded to the full viewport (no bottom pricing until user scrolls). 
- Add a **Recommended Prompts** rail above the chat input: chips like "Ask about nutrition", "What foods to avoid", "How to recover faster", "Scale up my plan", "Halal diet options" — localized. Clicking a chip fills the composer and auto-focuses.
- Hide `FloatingCoachChat` while on Coach tab (would duplicate). Keep persistent history via existing `chat_history` table.

## 4. Home tab

- Header card: greeting + user avatar (top-right). Avatar area supports:
  - Tap → sheet with two options: **Upload from device** (file input, images only, ≤5 MB) + **Choose recommended** grid (6 preset warrior avatars generated via `imagegen`, stored as project assets: kratos, yujiro, khabib, khamzat, spartan, samurai).
  - Uploads go to a new Cloud Storage bucket `avatars` (private, RLS: user reads/writes their own path `{user_id}/…`). URL saved to `profiles.avatar_url` (new column).
- Editable display name inline (pencil icon → input → save to `profiles.display_name`).
- Below: **My Training Plans** list — each row = plan card with:
  - Plan title (archetype + discipline + created date)
  - Circular progress ring (0–100%) using SVG stroke-dasharray; crimson fill
  - Stats line: `X / Y days completed · started {date} · {duration} weeks`
  - Status pill: `In Progress` / `Completed` / `Abandoned`
  - Actions: Continue → jumps to Coach tab with that plan hydrated; Mark day done (+); View details.
- Additional home widgets (added on my own for a professional feel):
  - Streak counter (consecutive days with a completed session)
  - Weekly volume chart (last 7 days, simple bars)
  - Next session card (today's prescribed lift/skill)
  - Motivational quote of the day (per archetype, localized)

## 5. Plans tab

- Full list of all training plans (past + current), filter chips (All / Active / Completed).
- Each card = detailed breakdown with the same circular progress.
- Tap a card → detail sheet: full plan markdown, day-by-day checklist. Checking a day increments `completed_days` → recalculates progress %.
- "Create new training plan" CTA at bottom → routes to Coach tab, resets funnel.

## 6. Location tab

- Simple curated map of Tashkent lifting/calisthenics/MMA gyms:
  - Static list of ~8 hand-picked gyms (name, discipline tag, district, hours, phone, Google Maps link).
  - Embedded OpenStreetMap iframe (no API key) centered on Tashkent showing pins.
  - Filter chips by discipline (MMA / Calisthenics / Powerlifting / Mixed).
  - "Nearest to me" button uses browser geolocation to sort by distance (Haversine, client-side).

## 7. Profile tab

- Auth-gated. Shows: avatar, display name, email, tier badge, joined date.
- Editable fields: display_name, preferred_language (EN/UZ/RU), height, weight, goals — all persisted to `profiles`.
- Sections: Subscription (link to Pricing), Language, Sign out, Delete account (soft: signs out + clears local cache).
- Recompute BMI live on weight/height change; reflects immediately in Home + Coach.

## 8. Progress model (professional default)

Implemented as **manual check-offs with auto-inferred duration**:
- Each plan has `total_days` (derived from archetype: e.g. Kratos = 84, Yujiro = 60, etc.) and `completed_days` (int).
- `progress = round(completed_days / total_days * 100)`.
- User marks a day complete from Home ("Mark today done") or from the plan detail sheet.
- Auto-completes plan when `completed_days >= total_days` → screen-shake + celebrate() beep, moves to Completed list, unlocks next-cycle regeneration.

## Technical section

### New DB tables (migration)

```sql
-- profiles: add avatar_url
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- training_plans
CREATE TABLE public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  archetype TEXT NOT NULL,
  discipline TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  plan_markdown TEXT NOT NULL,
  total_days INT NOT NULL DEFAULT 60,
  completed_days INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',  -- active | completed | abandoned
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_plans TO authenticated;
GRANT ALL ON public.training_plans TO service_role;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.training_plans FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- plan_day_completions (for streak + calendar heatmap)
CREATE TABLE public.plan_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, completed_on)
);
GRANT SELECT, INSERT, DELETE ON public.plan_day_completions TO authenticated;
GRANT ALL ON public.plan_day_completions TO service_role;
ALTER TABLE public.plan_day_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own completions" ON public.plan_day_completions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Storage bucket

- Create private bucket `avatars` via `supabase--storage_create_bucket`.
- RLS on `storage.objects`: users may read/write files where `(storage.foldername(name))[1] = auth.uid()::text`.

### New/modified files

- **new**: `src/components/nav/BottomNav.tsx`, `src/pages/tabs/HomeTab.tsx`, `PlansTab.tsx`, `CoachTab.tsx`, `LocationTab.tsx`, `ProfileTab.tsx`, `src/components/home/AvatarPicker.tsx`, `src/components/home/PlanCard.tsx`, `src/components/home/ProgressRing.tsx`, `src/components/coach/RecommendedPrompts.tsx`, `src/lib/plans.ts` (CRUD + progress helpers), `src/assets/avatars/*.jpg.asset.json` (6 generated presets).
- **edit**: `src/pages/Index.tsx` (tab router), `src/lib/i18n.tsx` (new keys + rename + language-switch cache purge), `src/components/hub/AICoach.tsx` (persist plan into `training_plans` on generation; rename copy), `src/components/hub/FloatingCoachChat.tsx` (hide on Coach tab), `supabase/functions/chat-coach/index.ts` + `generate-workout/index.ts` (hard language contract), `src/index.css` (bottom-nav spacing, safe-area).

### Language purge behavior

`i18n.setLanguage(lang)`:
1. `localStorage.setItem('lang', lang)`
2. `storage.setPlan(null)` (clear cached plan)
3. `supabase.from('chat_history').delete().eq('user_id', uid)` if signed in
4. `supabase.from('training_plans').update({ status: 'abandoned' }).eq('user_id', uid).eq('status', 'active').neq('language', lang)` — old-language active plans get archived, not shown as current
5. Emit `frame:lang-changed` event → `CoachTab` triggers `generate-workout` regeneration

### Out of scope / preserved

- Existing Cheat Code panel, Ultra demon-mode theme, Flash Discount pill, tier gating, and pricing tiers stay unchanged.
- No changes to auth flow or Supabase auth providers.
