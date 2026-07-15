## Goal

1. Show a language picker (English / O'zbek / Русский) as the very first screen — before landing, sign-in, sign-up, or Google auth.
2. Persist that choice and translate everything (auth page, onboarding, coach, tabs) into it.
3. Extend post-signin onboarding to also collect **display name** and **profile photo** with a clear **Skip / Later** button at the bottom of each step.
4. When the user finishes onboarding and lands on the AI Coach, the coach must greet them by name in their chosen language and immediately use their BMI + training focus to generate a personalized plan.
5. Sweep the flow end-to-end for mistakes / unclear copy.

## User-facing flow

```text
[Language Gate]  →  [Landing / Auth (Sign in · Sign up · Google)]
                        │
                        ▼
                [Onboarding wizard]
                  1. Name + Photo   (Skip / Later)
                  2. Height + Weight → BMI  (Skip / Later)
                  3. Training focus (MMA / Boxing / Bodybuilding / Calisthenics / Other / Skip)
                        │
                        ▼
                [AI Coach — auto-greets by name, in language,
                 with BMI + focus, and offers the first plan]
```

## Changes

### 1. Language-first gate
- New component `src/components/onboarding/LanguageGate.tsx`: full-screen picker with three tiles (EN / UZ / RU), each rendered in its native script. Selecting a language calls `setLang(...)` from `@/lib/i18n` (which already persists to `localStorage` under `frame:lang`) and marks `frame:lang_chosen = "1"`.
- Mount at the very top of `src/App.tsx` inside `LanguageProvider` (wrapping `Routes`): if `frame:lang_chosen` is missing, render `<LanguageGate />` and short-circuit the router. This runs before `/auth`, `/`, `/coach-chat`.
- Add "Change language" affordance in the Profile tab so users can switch later.

### 2. Full translation coverage
- Audit hard-coded English in the auth/onboarding/coach paths and route through `t(...)`:
  - `src/pages/Auth.tsx`: "Back", toast strings, "Continue as guest →".
  - `src/components/onboarding/PostSigninOnboarding.tsx`: headings, labels, buttons, toasts, placeholders.
  - `src/pages/tabs/CoachTab.tsx`: empty state, "Meet your AI Coach", "I'm ready to train", composer placeholders, error toasts.
- Add the missing keys to `T` in `src/lib/i18n.tsx` (all three langs). Examples:
  `onb_name_title`, `onb_name_label`, `onb_photo_label`, `onb_photo_upload`, `onb_skip_later`, `onb_continue`, `onb_back`, `coach_greet_ready`, `coach_generate_plan`, `auth_back`, `auth_guest`.

### 3. Onboarding: Name + Photo step
- Extend `PostSigninOnboarding` to a 3-step wizard: `name` → `bmi` → `focus`.
- Step 1 collects `display_name` (text) and profile photo (file picker uploading to existing `avatars` Supabase bucket at `avatars/<user_id>/avatar.<ext>`, then storing the signed / public URL in `profiles.avatar_url`).
- Every step shows a primary "Continue" button and a subtle bottom **Skip / Later** link that advances without saving that step's data.
- On finish, persist non-skipped fields to `profiles` (name, avatar_url, height_cm, weight_kg, bmi, bmi_category, goals) and set `onboarded_at = now()` so the gate doesn't re-appear.

### 4. Personalized coach greeting + auto plan
- `CoachTab` already loads `profile`. On first render for an onboarded user with an empty history, seed an assistant greeting locally: `"Salom, {name}! …"` / `"Hi, {name}! …"` / `"Привет, {name}!"` — templated per `lang`, referencing BMI + training focus.
- Add a prominent "Generate my training plan" button in the empty state that calls the existing `chat-coach` function with a language-tagged kickoff prompt including name, BMI, category, and focus.
- Update `supabase/functions/chat-coach/index.ts` system prompt so it:
  - Always addresses the user by `display_name` when present.
  - Always replies in `context.language`.
  - Uses `training_focus` + `bmi` + `bmi_category` as the primary constraints when generating the plan.
- Pass `display_name` in the `context` payload from `CoachTab` (already sends most fields).

### 5. Verification pass (mistakes / clarity)
- Manual walkthrough: fresh browser → language gate → sign up → onboarding (name/photo skip path AND fill path) → coach greets by name, in language, with plan generation.
- Re-check: no untranslated strings on those screens, Skip/Later works on each onboarding step, refresh does not re-show the language gate or onboarding once completed, avatar upload survives reload.

## Technical notes

- Language persistence stays on `localStorage` (`frame:lang`); no schema change needed. `profiles.preferred_language` is optionally mirrored on save for authenticated users so their choice roams across devices, but the client keeps localStorage as the source of truth on first paint to avoid a flash.
- Photo upload uses existing private `avatars` bucket via `supabase.storage.from('avatars').upload(...)` with `upsert: true`; store `data.path` and generate a signed URL when rendering (or convert bucket to public if that's simpler — will confirm before flipping it).
- All new copy added to `T` with EN/UZ/RU. No hard-coded strings in the touched components.
- No database migration required unless we decide to mirror `preferred_language` (existing column already present per `useAuth` types).

## Files touched

- `src/App.tsx` — mount `LanguageGate`.
- `src/components/onboarding/LanguageGate.tsx` — new.
- `src/components/onboarding/PostSigninOnboarding.tsx` — add name/photo step, translate, Skip/Later.
- `src/lib/i18n.tsx` — add new keys (EN/UZ/RU).
- `src/pages/Auth.tsx` — translate remaining strings.
- `src/pages/tabs/CoachTab.tsx` — personalized greeting, generate-plan CTA, translated empty state.
- `src/pages/tabs/ProfileTab.tsx` — "Change language" control.
- `supabase/functions/chat-coach/index.ts` — greet by name, reply in `context.language`, plan around BMI + focus.
