-- Create database functions for release evaluation

-- Function to get person profile with risk score
CREATE OR REPLACE FUNCTION public.get_person_profile(target_person_id TEXT)
RETURNS TABLE(
  id TEXT,
  name TEXT,
  email TEXT,
  department TEXT,
  risk_score NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.department,
    COALESCE(rs.score, 0) as risk_score,
    p.created_at
  FROM person p
  LEFT JOIN (
    SELECT DISTINCT ON (person_id) person_id, score
    FROM risk_score 
    ORDER BY person_id, calculated_at DESC
  ) rs ON rs.person_id = p.id
  WHERE p.id = target_person_id;
$$;

-- Function to get evidence for last 14 days
CREATE OR REPLACE FUNCTION public.get_evidence(target_person_id TEXT)
RETURNS TABLE(
  kpi TEXT,
  value NUMERIC,
  benchmark NUMERIC,
  time_window TEXT,
  source_link TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
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

-- Function to get coaching history (last 2 plans)
CREATE OR REPLACE FUNCTION public.get_coaching_history(target_person_id TEXT)
RETURNS TABLE(
  id UUID,
  objective TEXT,
  playbook TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id, objective, playbook, status, created_at
  FROM coaching_plan 
  WHERE person_id = target_person_id
  ORDER BY created_at DESC
  LIMIT 2;
$$;

-- Function to check release safeguards
CREATE OR REPLACE FUNCTION public.release_safeguards(target_person_id TEXT)
RETURNS TABLE(
  tenure_ok BOOLEAN,
  data_ok BOOLEAN,
  coach_ok BOOLEAN,
  messages TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH person_data AS (
    SELECT 
      p.created_at,
      (SELECT COUNT(*) FROM performance_event WHERE person_id = p.id AND ts > now() - INTERVAL '30 days') as recent_events,
      (SELECT COUNT(*) FROM coaching_plan WHERE person_id = p.id AND status = 'completed') as completed_coaching
    FROM person p 
    WHERE p.id = target_person_id
  )
  SELECT 
    (pd.created_at < now() - INTERVAL '90 days') as tenure_ok,
    (pd.recent_events >= 3) as data_ok,
    (pd.completed_coaching >= 1) as coach_ok,
    ARRAY[
      CASE WHEN pd.created_at >= now() - INTERVAL '90 days' 
           THEN 'Person must have 90+ days tenure' 
           ELSE NULL END,
      CASE WHEN pd.recent_events < 3 
           THEN 'Need at least 3 data points in last 30 days' 
           ELSE NULL END,
      CASE WHEN pd.completed_coaching < 1 
           THEN 'Warning: No completed coaching cycles' 
           ELSE NULL END
    ] as messages
  FROM person_data pd;
$$;

-- Function to insert release case
CREATE OR REPLACE FUNCTION public.insert_release_case(
  target_person_id TEXT,
  decision_reason TEXT,
  calculated_risk_score NUMERIC,
  evidence_data JSONB
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  INSERT INTO release_case (person_id, reason, risk_score, evidence, status)
  VALUES (target_person_id, decision_reason, calculated_risk_score, evidence_data, 'under_review')
  RETURNING id;
$$;