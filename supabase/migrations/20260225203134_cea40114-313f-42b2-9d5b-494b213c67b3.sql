ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to ai_assessments"
  ON public.ai_assessments
  FOR ALL
  USING (true)
  WITH CHECK (true);