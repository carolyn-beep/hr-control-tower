-- Ensure helper columns exist
ALTER TABLE person
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Recreate the overview view used by the Control Tower table
CREATE OR REPLACE VIEW v_person_overview AS
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