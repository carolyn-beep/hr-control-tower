-- Add columns to person table
ALTER TABLE person ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE person ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE person ADD COLUMN IF NOT EXISTS start_date date DEFAULT current_date;

-- People (safe upserts)
insert into person (id, email, name, role, status, start_date, department) values
  ('u_101','priya.patel@company.com','Priya Patel','Backend Engineer','active', current_date - interval '60 days', 'Engineering'),
  ('u_102','chen.wei@company.com','Chen Wei','Data Engineer','coaching',  current_date - interval '45 days', 'Engineering'),
  ('u_103','maria.gomez@company.com','Maria Gomez','QA Engineer','active', current_date - interval '20 days', 'Engineering'),
  ('u_104','omar.haddad@company.com','Omar Haddad','Frontend Engineer','active', current_date - interval '90 days', 'Engineering'),
  ('u_105','zoe.kim@company.com','Zoe Kim','Support Engineer','onboarding', current_date - interval '5 days', 'Support'),
  ('u_106','john.smith@company.com','John Smith','Platform Engineer','active', current_date - interval '120 days', 'Engineering')
on conflict (id) do nothing;

-- Baseline risk scores (just insert, allowing multiple scores per person over time)
insert into risk_score (person_id, score, calculated_at) values
  ('u_101', 4.0, now()), ('u_102', 12.5, now()), ('u_103', 3.0, now()),
  ('u_104', 7.0, now()), ('u_105', 2.0, now()), ('u_106', 9.5, now());

-- Clear any old demo spam for these ids (optional)
delete from signal where id like 'seed_%' OR id::text like 'seed_%';

-- Fresh signals
insert into signal (id, person_id, ts, level, reason, score_delta) values
  ('seed_1'::uuid,'u_101', now() - interval '50 minutes', 'warn',     'PR review latency above target', 4),
  ('seed_2'::uuid,'u_102', now() - interval '2 hours',    'risk',     'Low PR throughput + high reopen rate', 10),
  ('seed_3'::uuid,'u_103', now() - interval '1 day',      'info',     'On-call recovery within SLO', -2),
  ('seed_4'::uuid,'u_104', now() - interval '3 hours',    'risk',     'Frontend build failures this sprint', 8),
  ('seed_5'::uuid,'u_105', now() - interval '30 minutes', 'warn',     'Onboarding task overdue (>24h)', 5),
  ('seed_6'::uuid,'u_106', now() - interval '4 hours',    'critical', 'Sustained PR shortfall (2 wks)', 15)
on conflict (id) do nothing;

-- Ensure KPIs exist (insert if they don't exist based on id)
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