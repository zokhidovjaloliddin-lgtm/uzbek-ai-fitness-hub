## Problem

`useAuth()` is a plain hook — each component that calls it gets an isolated `profile` state (no shared context). `PostSigninOnboarding` calls its own `useAuth()` and refreshes *its* local copy after save. `Index.tsx` calls a *different* `useAuth()` whose `profile` is never re-fetched, so `needsOnboarding` stays true and the onboarding overlay keeps rendering — you never see the Coach tab.

## Fix

Refresh the profile from the same `useAuth()` instance that `Index.tsx` uses.

1. **`src/pages/Index.tsx`** — destructure `refreshProfile` from `useAuth()`. In the `<PostSigninOnboarding onDone={...} />` callback, `await refreshProfile()` then `setTab("coach")`.
2. **`src/components/onboarding/PostSigninOnboarding.tsx`** — drop the internal `refreshProfile()` call (Index owns it now). Just save to Supabase and invoke `onDone()`; Index re-reads the profile so `needsOnboarding` flips to false and the Coach tab renders.

Optional safety: in Index, also set a local `justOnboarded` flag so the gate is bypassed immediately even if the profile refetch is briefly stale.

## Technical notes

Root cause is that `useAuth` is not backed by a React Context / Zustand store, so state doesn't propagate across component instances. This targeted fix keeps the hook shape unchanged. A larger refactor (wrap in a Provider) is out of scope unless you want it.
