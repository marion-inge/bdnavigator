UPDATE opportunities 
SET business_plan = jsonb_set(
  business_plan::jsonb,
  '{somOverview,projections}',
  '[{"year":1,"value":8},{"year":2,"value":19},{"year":3,"value":38},{"year":4,"value":58},{"year":5,"value":77}]'::jsonb
)
WHERE id = 'a0000001-0005-4000-8000-000000000005';