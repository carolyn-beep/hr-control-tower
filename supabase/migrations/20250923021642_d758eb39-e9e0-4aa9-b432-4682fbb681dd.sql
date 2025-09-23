-- Add demo signals for James and Lisa
INSERT INTO signal (id, person_id, ts, level, reason, score_delta) VALUES
  ('s1001', (SELECT id FROM person WHERE name='James Wilson'), NOW() - INTERVAL '1 hour', 'critical', 'Performance metrics declining', -1.2),
  ('s1002', (SELECT id FROM person WHERE name='Lisa Rodriguez'), NOW() - INTERVAL '2 hours', 'warning', 'Slow PR turnaround during onboarding', -0.5)
ON CONFLICT (id) DO NOTHING;