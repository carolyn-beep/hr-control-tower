-- Seed demo data for Lisa Rodriguez
INSERT INTO performance_event (person_id, ts, kpi_id, value, source, meta) VALUES
  ((SELECT id FROM person WHERE name='Lisa Rodriguez'), now() - interval '2 days', 'kpi_prs', 2, 'GitHub', '{"repo":"mobile-app"}'),
  ((SELECT id FROM person WHERE name='Lisa Rodriguez'), now() - interval '2 days', 'kpi_bugs', 10, 'Jira', '{"sprint":"S40"}'),
  ((SELECT id FROM person WHERE name='Lisa Rodriguez'), now() - interval '1 days', 'kpi_lead', 55, 'GitHub', '{"repo":"mobile-app"}');