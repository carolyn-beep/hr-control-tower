-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Insert KPIs if they don't exist with correct direction values
INSERT INTO kpi (id, name, unit, direction) VALUES
('prs-week', 'PRs/week', 'count', 'higher_is_better'),
('review-turnaround', 'Review turnaround', 'hours', 'lower_is_better'),
('lead-time', 'Lead time', 'hours', 'lower_is_better'),
('bug-reopen-rate', 'Bug reopen rate', 'percent', 'lower_is_better'),
('features-week', 'Features/week', 'count', 'higher_is_better'),
('spec-turnaround', 'Spec turnaround', 'hours', 'lower_is_better'),
('stakeholder-meetings', 'Stakeholder meetings', 'count', 'higher_is_better')
ON CONFLICT (id) DO NOTHING;

-- Create the nightly cron job to run dev signal processing
SELECT cron.schedule(
  'dev_signal_cron',
  '0 2 * * *', -- Run at 2 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://iioxvitiymgpdmcheznt.supabase.co/functions/v1/dev-signal-cron',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb3h2aXRpeW1ncGRtY2hlem50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODUzODQsImV4cCI6MjA3NDE2MTM4NH0.B1_4q-GCaHfwjpU36avzY16CLM9GWLsW2ccJ2sDY-JM"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);