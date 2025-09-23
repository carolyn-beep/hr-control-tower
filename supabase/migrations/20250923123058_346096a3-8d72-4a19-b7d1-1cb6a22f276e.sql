insert into performance_event (person_id, ts, kpi_id, value, source, meta) values
  ('u_201', now() - interval '3 days','kpi_prs', 2,  'GitHub','{"repo":"core-api"}'),
  ('u_201', now() - interval '2 days','kpi_bugs',12, 'Jira','{"sprint":"S41"}'),
  ('u_201', now() - interval '1 day','kpi_lead',48, 'GitHub','{"repo":"core-api"}'),

  ('u_202', now() - interval '3 days','kpi_prs', 1,  'GitHub','{"repo":"data-pipeline"}'),
  ('u_202', now() - interval '2 days','kpi_bugs',18, 'Jira','{"sprint":"S40"}'),
  ('u_202', now() - interval '1 day','kpi_lead',62, 'GitHub','{"repo":"data-pipeline"}'),

  ('u_204', now() - interval '2 days','kpi_prs', 2,  'GitHub','{"repo":"webapp"}'),
  ('u_204', now() - interval '1 day','kpi_bugs',10, 'Jira','{"sprint":"S41"}'),
  ('u_204', now() - interval '1 day','kpi_lead',55, 'GitHub','{"repo":"webapp"}');