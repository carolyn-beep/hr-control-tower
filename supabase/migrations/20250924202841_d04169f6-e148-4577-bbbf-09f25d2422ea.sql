-- Insert developer-focused KPIs for CodeOps AI
INSERT INTO kpi (id, name, unit, direction) VALUES
  ('kpi_prs', 'Merged PRs/week', 'prs', 'higher_is_better'),
  ('kpi_review', 'PR review turnaround', 'hours', 'lower_is_better'),
  ('kpi_lead', 'Lead time (commit→deploy)', 'hours', 'lower_is_better'),
  ('kpi_bugs', 'Bug reopen rate', '%', 'lower_is_better'),
  ('kpi_ci', 'CI failure rate', '%', 'lower_is_better')
ON CONFLICT (id) DO NOTHING;