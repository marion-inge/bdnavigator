
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  geography text NOT NULL DEFAULT '',
  technology text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'idea',
  scoring jsonb NOT NULL DEFAULT '{}'::jsonb,
  detailed_scoring jsonb,
  business_case jsonb,
  strategic_analyses jsonb,
  go_to_market_plan jsonb,
  implement_review jsonb,
  rough_scoring_answers jsonb,
  rough_scoring_comments jsonb,
  gates jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to opportunities"
  ON public.opportunities
  FOR ALL
  USING (true)
  WITH CHECK (true);
