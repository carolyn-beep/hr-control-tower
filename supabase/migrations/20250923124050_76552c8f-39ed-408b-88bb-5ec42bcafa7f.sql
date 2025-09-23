-- Positive signals (with meta JSON) - using proper UUIDs
INSERT INTO signal (person_id, ts, level, reason, score_delta, meta) VALUES
  ((SELECT id FROM person WHERE name='Lisa Rodriguez'),
              now() - interval '2 hours', 'info',
              'PR throughput back to cohort median', -6,
              '{"type":"recovery","kpi":"kpi_prs"}'),
  ((SELECT id FROM person WHERE name='John Smith'),
              now() - interval '1 hour', 'info',
              'Lead time improved 25% vs last week', -4,
              '{"type":"improvement","kpi":"kpi_lead"}');