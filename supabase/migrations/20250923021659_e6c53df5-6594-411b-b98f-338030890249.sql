-- Add James and Lisa if they don't exist, then add their signals
DO $$
BEGIN
  -- Add James Wilson if he doesn't exist
  IF NOT EXISTS (SELECT 1 FROM person WHERE name = 'James Wilson') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_005', 'James Wilson', 'james.wilson@company.com', 'Engineering');
  END IF;
  
  -- Add Lisa Rodriguez if she doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM person WHERE name = 'Lisa Rodriguez') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_006', 'Lisa Rodriguez', 'lisa.rodriguez@company.com', 'Product');
  END IF;
END $$;

-- Add demo signals for James and Lisa (let system generate UUIDs)
INSERT INTO signal (person_id, ts, level, reason, score_delta) VALUES
  ((SELECT id FROM person WHERE name='James Wilson'), NOW() - INTERVAL '1 hour', 'critical', 'Performance metrics declining', -1.2),
  ((SELECT id FROM person WHERE name='Lisa Rodriguez'), NOW() - INTERVAL '2 hours', 'warning', 'Slow PR turnaround during onboarding', -0.5);