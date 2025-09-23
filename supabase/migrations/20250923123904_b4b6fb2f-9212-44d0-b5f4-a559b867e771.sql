-- Positive signals (with meta JSON) 
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta) VALUES
  ('pos_001', (SELECT id FROM person WHERE name='Lisa Rodriguez'),
              now() - interval '2 hours', 'info',
              'PR throughput back to cohort median', -6,
              '{"type":"recovery","kpi":"kpi_prs"}'),
  ('pos_002', (SELECT id FROM person WHERE name='John Smith'),
              now() - interval '1 hour', 'info',
              'Lead time improved 25% vs last week', -4,
              '{"type":"improvement","kpi":"kpi_lead"}')
ON CONFLICT (id) DO NOTHING;