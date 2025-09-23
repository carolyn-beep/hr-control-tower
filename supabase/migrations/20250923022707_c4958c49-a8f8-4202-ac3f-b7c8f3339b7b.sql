-- 1) Make sure the person table has the columns we reference
ALTER TABLE person
  ADD COLUMN IF NOT EXISTS role       text,
  ADD COLUMN IF NOT EXISTS start_date date;

-- 2) Remove any accidental duplicate rows in risk_score
--    (duplicates block the UNIQUE constraint)
DELETE FROM risk_score a
USING risk_score b
WHERE a.ctid < b.ctid
  AND a.person_id = b.person_id;

-- 3) Enforce uniqueness on person_id so upserts work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conname = 'risk_score_person_unique'
  ) THEN
    ALTER TABLE risk_score
      ADD CONSTRAINT risk_score_person_unique UNIQUE (person_id);
  END IF;
END$$;

-- 4) Verify: a simple upsert should now succeed
INSERT INTO risk_score (person_id, score, calculated_at)
VALUES
  ((SELECT id FROM person WHERE name = 'James Wilson'), 3.6, now())
ON CONFLICT (person_id)
DO UPDATE SET score = EXCLUDED.score, calculated_at = now();