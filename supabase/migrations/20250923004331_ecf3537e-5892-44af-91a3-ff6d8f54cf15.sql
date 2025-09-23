-- Update insert_release_case function to match the specified mutation format
CREATE OR REPLACE FUNCTION public.insert_release_case(
  person_id TEXT,
  reason TEXT,
  evidence_json JSONB,
  risk_score NUMERIC,
  decision TEXT
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  INSERT INTO release_case (person_id, reason, evidence, risk_score, status)
  VALUES (
    person_id,
    reason,
    evidence_json,
    risk_score,
    CASE
      WHEN decision = 'release' THEN 'approved'
      WHEN decision = 'extend_coaching' THEN 'under_review'
      ELSE 'retracted'
    END
  )
  RETURNING id;
$$;