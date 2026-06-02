-- ROOTCHAIN · Public investor counts for active marketplace listings

CREATE OR REPLACE VIEW public.marketplace_project_stats AS
SELECT
  i.project_id,
  COUNT(DISTINCT i.user_id)::int AS investor_count
FROM public.investments i
INNER JOIN public.projects p ON p.id = i.project_id
INNER JOIN public.farmers f ON f.id = p.farmer_id
WHERE f.verification_status = 'verified'
  AND p.status = 'active'
  AND i.status IN ('pending', 'confirmed')
GROUP BY i.project_id;

GRANT SELECT ON public.marketplace_project_stats TO anon, authenticated;
