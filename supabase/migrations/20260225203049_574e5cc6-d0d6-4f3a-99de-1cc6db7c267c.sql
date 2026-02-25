CREATE TABLE public.ai_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  basis TEXT NOT NULL DEFAULT 'idea_scoring',
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  pitfalls JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_rating TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_assessments DISABLE ROW LEVEL SECURITY;