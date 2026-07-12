## Root cause

`src/pages/Index.tsx` throws **"Rendered fewer hooks than expected"** and React unmounts the tree → black screen. The component calls `useState(flashOpen)` and `useAuth()` (which uses hooks), then does an **early `return <Navigate to="/auth" />`** *before* the remaining `useState` / `useEffect` / `useMemo` / `useRef` hooks. On the first render `loading` is `true` so all hooks run; on the next render `loading` flips to `false` and the early return fires, so React sees fewer hooks and crashes the whole `<Index>` subtree. Refresh doesn't help because it's deterministic.

Confirmed via Playwright: `[pageerror] Rendered fewer hooks than expected. This may be caused by an accidental early return statement.` originating at `Index.tsx`.

## Fix

Move the auth-gate redirect so it never sits between hook calls.

1. In `src/pages/Index.tsx`:
   - Keep **all** `useState`, `useEffect`, `useMemo`, `useRef`, and `useAuth` calls at the top, in a stable order.
   - Compute `shouldRedirect = !loading && !isAuthed && !isGuest` after the hooks.
   - While `loading` is true, render a lightweight loading placeholder (matches the crimson theme) instead of returning early before hooks.
   - Render `<Navigate to="/auth" replace />` only after every hook has been declared.

2. Add a tiny render-time guard so `HomeTab` / `ProfileTab` etc. don't try to read `profile` before it exists (they already handle null, but double-check by only mounting tabs when `!loading`).

3. Add a top-level `ErrorBoundary` around `<Routes>` in `src/App.tsx` so any future render error shows a readable fallback instead of a black screen. Small component, no deps.

## Verification

- Re-run the Playwright reproduction against `http://localhost:8080/`; expect a redirect to `/auth` (or the Home tab when signed in) with no `pageerror` and non-empty `#root` innerHTML.
- Manually check `?tab=coach` and refresh; no black screen.

## Out of scope

- The Vite CSS warning about `@import` order — cosmetic, unrelated to the black screen.
- Any i18n / plan-generation / coach behavior.
