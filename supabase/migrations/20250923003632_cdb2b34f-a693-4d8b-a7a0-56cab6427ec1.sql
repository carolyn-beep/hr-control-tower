-- Drop existing tables and function to recreate with new schema
DROP FUNCTION IF EXISTS public.get_performance_evidence(UUID);
DROP TABLE IF EXISTS public.performance_event;
DROP TABLE IF EXISTS public.kpi;

-- KPIs we care about
CREATE TABLE public.kpi (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('higher_is_better','lower_is_better')) NOT NULL
);

-- Raw metric events
CREATE TABLE public.performance_event (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  person_id TEXT NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  kpi_id TEXT REFERENCES public.kpi(id),
  value NUMERIC,
  source TEXT NOT NULL,
  meta JSONB
);

-- Enable RLS on both tables
ALTER TABLE public.kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_event ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on kpi" 
ON public.kpi FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on performance_event" 
ON public.performance_event FOR ALL 
USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_performance_event_person_ts ON public.performance_event(person_id, ts DESC);
CREATE INDEX idx_performance_event_kpi_ts ON public.performance_event(kpi_id, ts DESC);

-- Seed some KPIs
INSERT INTO public.kpi (id, name, unit, direction) VALUES
  ('kpi_prs', 'Merged PRs/week', 'prs', 'higher_is_better'),
  ('kpi_bugs', 'Bug reopen rate', '%', 'lower_is_better'),
  ('kpi_lead', 'Lead time (PR)', 'hours', 'lower_is_better'),
  ('kpi_csat', 'CSAT', 'score', 'higher_is_better')
ON CONFLICT (id) DO NOTHING;

-- Update person table to use text IDs if needed and add sample people
ALTER TABLE public.person ALTER COLUMN id TYPE TEXT;

-- Insert sample people if they don't exist
INSERT INTO public.person (id, name, email) VALUES
  ('u_001', 'Alice Johnson', 'alice@company.com'),
  ('u_002', 'Bob Smith', 'bob@company.com'),
  ('u_003', 'Carol Davis', 'carol@company.com'),
  ('u_004', 'David Wilson', 'david@company.com')
ON CONFLICT (id) DO NOTHING;

-- Seed sample events
INSERT INTO public.performance_event (person_id, ts, kpi_id, value, source, meta) VALUES
  ('u_001', now() - INTERVAL '3 days', 'kpi_prs', 7, 'GitHub', '{"repo":"core-api"}'),
  ('u_002', now() - INTERVAL '3 days', 'kpi_prs', 1, 'GitHub', '{"repo":"data-pipeline"}'),
  ('u_002', now() - INTERVAL '3 days', 'kpi_bugs', 18, 'Jira', '{"sprint":"S39"}'),
  ('u_003', now() - INTERVAL '2 days', 'kpi_lead', 72, 'GitHub', '{"repo":"qa-harness"}'),
  ('u_004', now() - INTERVAL '1 days', 'kpi_prs', 5, 'GitHub', '{"repo":"webapp"}');

-- Recreate the get_performance_evidence function with updated schema
CREATE OR REPLACE FUNCTION public.get_performance_evidence(target_person_id TEXT)
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