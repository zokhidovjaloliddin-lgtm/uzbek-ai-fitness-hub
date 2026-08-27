# UI/UX Polish Pass — Production Ready

Presentation-only refactor across the tabs. No backend or business-logic changes.

## 1. Home header & empty state
- Truncate the displayed name: first name only, capped at 12 characters with an ellipsis, so long emails never stretch the header on mobile.
- Replace the plain "No training plans yet" box with a modern CTA card: framed card, clean icon, short supporting line, and a prominent "Create New Plan" button that opens the Coach tab.

## 2. Cheat badge → PRO badge
- Restyle the floating dev pill from "👑 CHEAT" to a sleek "PRO" badge (crown icon, same pill geometry, crimson/mono-tech styling). The override panel behind it stays functional, just visually rebranded.

## 3. Localization of the Coach tab
- Route every remaining hard-coded English string in the Coach chat through the translation dictionary: input placeholder, guest prompt, Pro-limit prompt, "Thinking…", "Loading history…", tier labels, and the sign-in button.
- Placeholder text per language: EN "Ask the coach…", UZ "Murabbiyga savol bering…", RU "Задайте вопрос тренеру…".
- Add any missing keys for these strings in all three languages.

## 4. Toasts
- Style the Sonner toaster for dark mode: black background, subtle crimson border, mono-tech type — configured once where the toaster is mounted.
- Confirm success toasts fire on profile Save Changes and on plan creation (add where missing).

## 5. Bottom navigation
- Increase vertical padding, bump label size slightly, tighten letter-spacing, and allow labels to sit comfortably on narrow screens so "BOSH SAHIFA", "REJALAR", "MANZIL", "PROFIL" no longer feel cramped.

## Technical notes
Files touched: `src/pages/tabs/HomeTab.tsx`, `src/pages/tabs/CoachTab.tsx`, `src/components/hub/CheatCodePanel.tsx`, `src/components/nav/BottomNav.tsx`, `src/components/ui/sonner.tsx`, `src/App.tsx`, `src/lib/i18n.tsx`, and a new CTA card component under `src/components/home/`. All colors stay on existing semantic tokens (crimson, card, border, muted-foreground).
