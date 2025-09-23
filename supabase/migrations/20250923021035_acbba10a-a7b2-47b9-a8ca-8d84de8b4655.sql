-- Insert sample signal data for demonstration
-- First, let's ensure we have some sample persons
INSERT INTO person (id, name, email, department) VALUES 
  ('person_001', 'John Smith', 'john.smith@company.com', 'Engineering'),
  ('person_002', 'Sarah Johnson', 'sarah.johnson@company.com', 'Sales'),
  ('person_003', 'Mike Chen', 'mike.chen@company.com', 'Marketing'),
  ('person_004', 'Emily Davis', 'emily.davis@company.com', 'Engineering')
ON CONFLICT (id) DO NOTHING;

-- Insert sample signals with various levels and recent timestamps
INSERT INTO signal (person_id, level, reason, ts, score_delta) VALUES 
  ('person_001', 'critical', 'Performance metrics declining rapidly', NOW() - INTERVAL '2 hours', -2.5),
  ('person_002', 'risk', 'Missed multiple project deadlines', NOW() - INTERVAL '5 hours', -1.8),
  ('person_001', 'risk', 'Decreased team collaboration scores', NOW() - INTERVAL '1 day', -1.2),
  ('person_003', 'watch', 'Minor performance dip detected', NOW() - INTERVAL '2 days', -0.5),
  ('person_004', 'critical', 'Quality metrics below threshold', NOW() - INTERVAL '3 hours', -3.1),
  ('person_002', 'risk', 'Increased error rate in deliverables', NOW() - INTERVAL '6 hours', -1.5),
  ('person_003', 'risk', 'Customer satisfaction scores dropping', NOW() - INTERVAL '8 hours', -2.0),
  ('person_004', 'watch', 'Attendance pattern changes detected', NOW() - INTERVAL '12 hours', -0.8);

-- Also insert some risk scores for context
INSERT INTO risk_score (person_id, score) VALUES 
  ('person_001', 8.6),
  ('person_002', 4.7),
  ('person_003', 3.6),
  ('person_004', 7.2)
ON CONFLICT (person_id) DO NOTHING;