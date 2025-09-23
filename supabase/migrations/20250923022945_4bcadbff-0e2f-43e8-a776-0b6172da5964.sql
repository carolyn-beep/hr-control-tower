-- Fix security issue: Recreate view without SECURITY DEFINER (use SECURITY INVOKER which is default)
DROP VIEW IF EXISTS v_person_overview;

CREATE VIEW v_person_overview 
SECURITY INVOKER AS
SELECT
  p.id,
  p.name,
  p.email,
  p.role,
  p.status,
  COALESCE(rs.score, 0) AS risk_score,
  (SELECT MAX(s.ts) FROM signal s WHERE s.person_id = p.id) AS last_signal_ts
FROM person p
LEFT JOIN risk_score rs ON rs.person_id = p.id;