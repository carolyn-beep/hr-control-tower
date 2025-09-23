-- Seed demo data for James Wilson
INSERT INTO performance_event (person_id, ts, kpi_id, value, source, meta) VALUES
  ((SELECT id FROM person WHERE name='James Wilson'), now() - interval '3 days', 'kpi_prs', 1, 'GitHub', '{"repo":"core-api"}'),
  ((SELECT id FROM person WHERE name='James Wilson'), now() - interval '3 days', 'kpi_bugs', 15, 'Jira', '{"sprint":"S39"}'),
  ((SELECT id FROM person WHERE name='James Wilson'), now() - interval '2 days', 'kpi_lead', 60, 'GitHub', '{"repo":"frontend"}');