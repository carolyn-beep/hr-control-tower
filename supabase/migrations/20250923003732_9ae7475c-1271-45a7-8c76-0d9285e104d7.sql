-- Drop existing tables to recreate with new schema
DROP FUNCTION IF EXISTS public.get_performance_evidence(UUID);
DROP TABLE IF EXISTS public.performance_event;
DROP TABLE IF EXISTS public.kpi;

-- Drop foreign key constraints temporarily
ALTER TABLE public.signal DROP CONSTRAINT IF EXISTS signal_person_id_fkey;
ALTER TABLE public.coaching_plan DROP CONSTRAINT IF EXISTS coaching_plan_person_id_fkey;
ALTER TABLE public.release_case DROP CONSTRAINT IF EXISTS release_case_person_id_fkey;
ALTER TABLE public.risk_score DROP CONSTRAINT IF EXISTS risk_score_person_id_fkey;

-- Convert person table to text IDs
ALTER TABLE public.person ALTER COLUMN id TYPE TEXT USING id::text;

-- Convert all referencing tables to text IDs
ALTER TABLE public.signal ALTER COLUMN person_id TYPE TEXT USING person_id::text;
ALTER TABLE public.coaching_plan ALTER COLUMN person_id TYPE TEXT USING person_id::text;  
ALTER TABLE public.release_case ALTER COLUMN person_id TYPE TEXT USING person_id::text;
ALTER TABLE public.risk_score ALTER COLUMN person_id TYPE TEXT USING person_id::text;

-- Recreate foreign key constraints
ALTER TABLE public.signal ADD CONSTRAINT signal_person_id_fkey 
  FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;
ALTER TABLE public.coaching_plan ADD CONSTRAINT coaching_plan_person_id_fkey 
  FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;
ALTER TABLE public.release_case ADD CONSTRAINT release_case_person_id_fkey 
  FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;
ALTER TABLE public.risk_score ADD CONSTRAINT risk_score_person_id_fkey 
  FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;

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