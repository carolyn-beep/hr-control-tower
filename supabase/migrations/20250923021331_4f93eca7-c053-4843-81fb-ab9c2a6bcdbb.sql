-- Insert sample data for demonstration
-- Insert sample persons (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM person WHERE id = 'person_001') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_001', 'John Smith', 'john.smith@company.com', 'Engineering');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM person WHERE id = 'person_002') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_002', 'Sarah Johnson', 'sarah.johnson@company.com', 'Sales');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM person WHERE id = 'person_003') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_003', 'Mike Chen', 'mike.chen@company.com', 'Marketing');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM person WHERE id = 'person_004') THEN
    INSERT INTO person (id, name, email, department) VALUES 
      ('person_004', 'Emily Davis', 'emily.davis@company.com', 'Engineering');
  END IF;
END $$;

-- Insert sample signals
INSERT INTO signal (person_id, level, reason, ts, score_delta) VALUES 
  ('person_001', 'critical', 'Performance metrics declining rapidly', NOW() - INTERVAL '2 hours', -2.5),
  ('person_002', 'risk', 'Missed multiple project deadlines', NOW() - INTERVAL '5 hours', -1.8),
  ('person_001', 'risk', 'Decreased team collaboration scores', NOW() - INTERVAL '1 day', -1.2),
  ('person_004', 'critical', 'Quality metrics below threshold', NOW() - INTERVAL '3 hours', -3.1),
  ('person_002', 'risk', 'Increased error rate in deliverables', NOW() - INTERVAL '6 hours', -1.5),
  ('person_003', 'risk', 'Customer satisfaction scores dropping', NOW() - INTERVAL '8 hours', -2.0);