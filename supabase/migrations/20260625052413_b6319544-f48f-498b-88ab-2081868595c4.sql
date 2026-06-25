ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS chosen_character TEXT,
  ADD COLUMN IF NOT EXISTS intensity_level TEXT NOT NULL DEFAULT 'standard';