-- Ensure KPIs exist
insert into kpi (id,name,unit,direction) values
  ('kpi_prs','Merged PRs/week','prs','higher_is_better'),
  ('kpi_bugs','Bug reopen rate','%','lower_is_better'),
  ('kpi_lead','Lead time (PR)','hours','lower_is_better'),
  ('kpi_csat','CSAT','score','higher_is_better')
on conflict (id) do nothing;

-- Evidence for a few folks (last 14d)
insert into performance_event (person_id, ts, kpi_id, value, source, meta) values
  ('u_102', now() - interval '3 days','kpi_prs', 1,  'GitHub','{"repo":"data-pipeline"}'),
  ('u_102', now() - interval '3 days','kpi_bugs',16, 'Jira','{"sprint":"S40"}'),
  ('u_102', now() - interval '2 days','kpi_lead',58, 'GitHub','{"repo":"data-pipeline"}'),

  ('u_104', now() - interval '2 days','kpi_prs', 2,  'GitHub','{"repo":"webapp"}'),
  ('u_104', now() - interval '2 days','kpi_bugs',12, 'Jira','{"sprint":"S40"}'),
  ('u_104', now() - interval '1 days','kpi_lead',62, 'GitHub','{"repo":"webapp"}'),

  ('u_106', now() - interval '4 days','kpi_prs', 1,  'GitHub','{"repo":"platform"}'),
  ('u_106', now() - interval '3 days','kpi_bugs',18, 'Jira','{"sprint":"S39"}'),
  ('u_106', now() - interval '2 days','kpi_lead',60, 'GitHub','{"repo":"platform"}');