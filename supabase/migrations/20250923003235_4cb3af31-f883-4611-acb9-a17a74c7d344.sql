-- Create KPI table for performance indicators
CREATE TABLE public.kpi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  unit TEXT,
  higher_is_better BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_event table for tracking metrics
CREATE TABLE public.performance_event (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_id UUID NOT NULL REFERENCES public.kpi(id),
  person_id UUID NOT NULL REFERENCES public.person(id),
  value NUMERIC NOT NULL,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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

-- Create the get_performance_evidence function
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

-- Insert sample KPIs
INSERT INTO public.kpi (name, description, unit, higher_is_better) VALUES
('code_commits', 'Number of code commits per day', 'commits/day', true),
('code_quality_score', 'Code quality rating from reviews', 'score', true),
('ticket_completion_rate', 'Percentage of tickets completed on time', 'percentage', true),
('collaboration_score', 'Team collaboration rating', 'score', true),
('meeting_attendance', 'Meeting attendance rate', 'percentage', true);