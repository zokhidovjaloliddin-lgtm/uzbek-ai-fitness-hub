ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_to_next INT NOT NULL DEFAULT 100;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  level INT,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.plan_milestones TO authenticated;
GRANT ALL ON public.plan_milestones TO service_role;

ALTER TABLE public.plan_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own milestones select" ON public.plan_milestones;
CREATE POLICY "own milestones select" ON public.plan_milestones FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own milestones insert" ON public.plan_milestones;
CREATE POLICY "own milestones insert" ON public.plan_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);