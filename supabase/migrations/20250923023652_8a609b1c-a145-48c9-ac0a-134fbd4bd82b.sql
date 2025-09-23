-- Fix the security definer view issue
DROP VIEW IF EXISTS v_person_overview;

CREATE VIEW v_person_overview 
WITH (security_invoker = on) AS
SELECT
  p.id,
  p.name,
  p.email,
  p.role,
  p.status,
  COALESCE(rs.score, 0) AS risk_score,
  (
    SELECT MAX(s.ts)
    FROM signal s
    WHERE s.person_id = p.id
  ) AS last_signal_ts
FROM person p
LEFT JOIN (
  SELECT DISTINCT ON (person_id) person_id, score
  FROM risk_score 
  ORDER BY person_id, calculated_at DESC
) rs ON rs.person_id = p.id;