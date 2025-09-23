-- Give Emily Davis 3 performance events so ReleaseBot can run
insert into performance_event (person_id, ts, kpi_id, value, source, meta) values
  ((select id from person where name='Emily Davis' limit 1),
   now() - interval '10 days', 'kpi_prs', 2, 'GitHub', '{"repo":"qa-tests"}'),
  ((select id from person where name='Emily Davis' limit 1),
   now() - interval '7 days', 'kpi_bugs', 15, 'Jira', '{"sprint":"S42"}'),
  ((select id from person where name='Emily Davis' limit 1),
   now() - interval '3 days', 'kpi_lead', 50, 'GitHub', '{"repo":"qa-tests"}');

-- Update person start dates to meet tenure requirements
update person
set start_date = current_date - interval '45 days'
where name in ('Emily Davis','Sarah Johnson','Lisa Rodriguez','Mike Chen','John Smith');