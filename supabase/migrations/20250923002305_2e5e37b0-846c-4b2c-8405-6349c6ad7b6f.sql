-- Modify existing coaching_plan table to match desired structure
ALTER TABLE public.coaching_plan 
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS updated_at;

-- Add new columns
ALTER TABLE public.coaching_plan 
  ADD COLUMN objective text NOT NULL DEFAULT 'Improve performance',
  ADD COLUMN playbook text NOT NULL DEFAULT 'Standard coaching approach';

-- Add check constraint for status
ALTER TABLE public.coaching_plan 
  DROP CONSTRAINT IF EXISTS coaching_plan_status_check;

ALTER TABLE public.coaching_plan 
  ADD CONSTRAINT coaching_plan_status_check 
  CHECK (status IN ('active', 'completed', 'failed'));

-- Update default for status
ALTER TABLE public.coaching_plan 
  ALTER COLUMN status SET DEFAULT 'active';