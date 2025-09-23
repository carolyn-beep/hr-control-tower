-- Make the 'meta' column exist so future inserts won't fail
ALTER TABLE signal ADD COLUMN IF NOT EXISTS meta jsonb;

-- sanity check
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='signal';