CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_role TEXT NOT NULL CHECK (message_role IN ('user','assistant')),
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_history TO authenticated;
GRANT ALL ON public.chat_history TO service_role;

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own chat" ON public.chat_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chat" ON public.chat_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chat" ON public.chat_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX chat_history_user_created_idx ON public.chat_history(user_id, created_at);