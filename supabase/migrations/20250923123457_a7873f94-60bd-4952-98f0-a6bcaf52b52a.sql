-- Example: Lisa recovered; John improved lead time
insert into signal (person_id, ts, level, reason, score_delta, meta) values
  ((select id from person where name='Lisa Rodriguez'),
              now() - interval '2 hours', 'info',
              'PR throughput back to cohort median', -6, '{"type":"recovery","kpi":"kpi_prs"}'),
  ((select id from person where name='John Smith'),
              now() - interval '1 hour', 'info',
              'Lead time improved 25% vs last week', -4, '{"type":"improvement","kpi":"kpi_lead"}');