insert into signal (id, person_id, ts, level, reason, score_delta) values
  ('sig201','u_201', now() - interval '2 hours', 'warn',     'PR review latency above target', 4),
  ('sig202','u_202', now() - interval '1 day',   'critical', 'Low PR throughput + high reopen rate', 15),
  ('sig203','u_203', now() - interval '3 hours', 'info',     'On-call recovery within SLO', -2),
  ('sig204','u_204', now() - interval '4 hours', 'risk',     'Frontend build failures this sprint', 8),
  ('sig205','u_205', now() - interval '1 hour',  'warn',     'Onboarding task overdue (>24h)', 5)
on conflict (id) do nothing;