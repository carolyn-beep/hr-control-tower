-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.get_performance_evidence(target_person_id UUID)
RETURNS TABLE (
  kpi TEXT,
  value NUMERIC,
  benchmark NUMERIC,
  time_window TEXT,
  source_link TEXT
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent AS (
    SELECT k.name AS kpi, pe.value, pe.person_id, pe.ts, pe.source
    FROM performance_event pe 
    JOIN kpi k ON k.id = pe.kpi_id
    WHERE pe.ts > now() - INTERVAL '14 days'
  ),
  bench AS (
    SELECT kpi, percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS benchmark
    FROM recent 
    GROUP BY kpi
  )
  SELECT r.kpi,
         r.value,
         b.benchmark,
         'last_14d'::TEXT AS time_window,
         r.source AS source_link
  FROM recent r
  JOIN bench b ON b.kpi = r.kpi
  WHERE r.person_id = target_person_id
  ORDER BY r.kpi, r.ts DESC;
$$;