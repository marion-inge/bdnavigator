UPDATE public.opportunities SET stage = 'gate5' WHERE stage = 'gate3';
UPDATE public.opportunities
SET gates = (
  SELECT jsonb_agg(
    CASE
      WHEN g->>'gate' = 'gate3' THEN jsonb_set(g, '{gate}', '"gate5"')
      WHEN g->>'gate' = 'gate2' THEN jsonb_set(g, '{gate}', '"gate3"')
      ELSE g
    END ORDER BY ord
  )
  FROM jsonb_array_elements(opportunities.gates) WITH ORDINALITY AS t(g, ord)
)
WHERE gates::text LIKE '%gate2%' OR gates::text LIKE '%gate3%';