ALTER TABLE public.opportunities RENAME COLUMN detailed_scoring TO business_plan;
UPDATE public.opportunities SET stage = 'business_plan' WHERE stage = 'detailed_scoring';