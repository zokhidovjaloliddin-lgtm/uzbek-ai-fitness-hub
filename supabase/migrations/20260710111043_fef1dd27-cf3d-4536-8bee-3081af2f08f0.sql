
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  archetype TEXT NOT NULL,
  discipline TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  plan_markdown TEXT NOT NULL,
  total_days INT NOT NULL DEFAULT 60,
  completed_days INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_plans TO authenticated;
GRANT ALL ON public.training_plans TO service_role;
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own plans select" ON public.training_plans;
DROP POLICY IF EXISTS "own plans insert" ON public.training_plans;
DROP POLICY IF EXISTS "own plans update" ON public.training_plans;
DROP POLICY IF EXISTS "own plans delete" ON public.training_plans;
CREATE POLICY "own plans select" ON public.training_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own plans insert" ON public.training_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plans update" ON public.training_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plans delete" ON public.training_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS training_plans_updated_at ON public.training_plans;
CREATE TRIGGER training_plans_updated_at BEFORE UPDATE ON public.training_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.plan_day_completions (
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
DROP POLICY IF EXISTS "own completions select" ON public.plan_day_completions;
DROP POLICY IF EXISTS "own completions insert" ON public.plan_day_completions;
DROP POLICY IF EXISTS "own completions delete" ON public.plan_day_completions;
CREATE POLICY "own completions select" ON public.plan_day_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own completions insert" ON public.plan_day_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own completions delete" ON public.plan_day_completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "avatar read own" ON storage.objects;
DROP POLICY IF EXISTS "avatar insert own" ON storage.objects;
DROP POLICY IF EXISTS "avatar update own" ON storage.objects;
DROP POLICY IF EXISTS "avatar delete own" ON storage.objects;
CREATE POLICY "avatar read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
