-- Add missing columns to person table
ALTER TABLE public.person 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create person profile view
CREATE OR REPLACE VIEW v_person_profile AS
SELECT p.id, p.name, p.email, p.role, p.status,
       COALESCE(rs.score, 0) as risk_score
FROM person p
LEFT JOIN risk_score rs ON rs.person_id = p.id;

-- Create function to get person profile
CREATE OR REPLACE FUNCTION public.get_person_profile(target_person_id TEXT)
RETURNS TABLE(id TEXT, name TEXT, email TEXT, role TEXT, status TEXT, risk_score NUMERIC)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT * FROM v_person_profile WHERE v_person_profile.id = target_person_id;
$function$;

-- Create function to get evidence (updated to use TEXT person_id)
CREATE OR REPLACE FUNCTION public.get_evidence(target_person_id TEXT)
RETURNS TABLE(kpi TEXT, value NUMERIC, benchmark NUMERIC, time_window TEXT, source_link TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Create function to get coaching history
CREATE OR REPLACE FUNCTION public.get_coaching_history(target_person_id TEXT)
RETURNS TABLE(id UUID, objective TEXT, status TEXT, created_at TIMESTAMPTZ, outcome TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id, objective, status, created_at, 
         CASE 
           WHEN status = 'completed' THEN 'Success - Goals achieved'
           WHEN status = 'cancelled' THEN 'Cancelled - No improvement'
           ELSE 'In progress'
         END as outcome
  FROM coaching_plan 
  WHERE person_id = target_person_id 
  ORDER BY created_at DESC 
  LIMIT 2;
$function$;

-- Create release safeguards function
CREATE OR REPLACE FUNCTION public.release_safeguards(target_person_id TEXT)
RETURNS TABLE(tenure_ok BOOLEAN, data_ok BOOLEAN, coach_ok BOOLEAN)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  WITH person_data AS (
    SELECT p.created_at,
           COUNT(pe.id) as event_count,
           COUNT(CASE WHEN cp.status = 'completed' THEN 1 END) as completed_coaching
    FROM person p
    LEFT JOIN performance_event pe ON pe.person_id = p.id
    LEFT JOIN coaching_plan cp ON cp.person_id = p.id
    WHERE p.id = target_person_id
    GROUP BY p.created_at
  )
  SELECT 
    (NOW() - person_data.created_at > INTERVAL '90 days') as tenure_ok,
    (person_data.event_count >= 5) as data_ok,
    (person_data.completed_coaching >= 1) as coach_ok
  FROM person_data;
$function$;

-- Create insert release case function
CREATE OR REPLACE FUNCTION public.insert_release_case(
  target_person_id TEXT,
  decision_reason TEXT,
  risk_score_value NUMERIC,
  evidence_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_case_id UUID;
BEGIN
  INSERT INTO release_case (person_id, reason, risk_score, evidence, status)
  VALUES (target_person_id, decision_reason, risk_score_value, evidence_data, 'under_review')
  RETURNING id INTO new_case_id;
  
  RETURN new_case_id;
END;
$function$;