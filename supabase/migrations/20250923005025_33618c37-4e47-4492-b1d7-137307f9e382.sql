-- Update coaching_plan table structure
CREATE TABLE IF NOT EXISTS coaching_plan (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  person_id TEXT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  objective TEXT NOT NULL,
  playbook TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','completed','failed')) DEFAULT 'active'
);

-- If table already exists, ensure it has the correct structure
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaching_plan' AND column_name = 'id' AND data_type = 'text') THEN
    ALTER TABLE coaching_plan ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coaching_plan' AND column_name = 'person_id' AND data_type = 'text') THEN
    ALTER TABLE coaching_plan ALTER COLUMN person_id TYPE TEXT USING person_id::text;
  END IF;
  
  -- Update status constraint if needed
  BEGIN
    ALTER TABLE coaching_plan DROP CONSTRAINT IF EXISTS coaching_plan_status_check;
    ALTER TABLE coaching_plan ADD CONSTRAINT coaching_plan_status_check 
      CHECK (status IN ('active','completed','failed'));
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
END $$;