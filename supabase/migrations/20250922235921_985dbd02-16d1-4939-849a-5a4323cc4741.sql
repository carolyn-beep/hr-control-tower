-- Create person table
CREATE TABLE public.person (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signal table
CREATE TABLE public.signal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.person(id),
  level TEXT NOT NULL CHECK (level IN ('critical', 'risk', 'warning', 'info')),
  reason TEXT NOT NULL,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_plan table
CREATE TABLE public.coaching_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.person(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_score table
CREATE TABLE public.risk_score (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.person(id),
  score NUMERIC(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.person ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_score ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now since this is an internal HR system)
CREATE POLICY "Allow all operations on person" ON public.person FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on signal" ON public.signal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on coaching_plan" ON public.coaching_plan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on risk_score" ON public.risk_score FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_signal_level_ts ON public.signal(level, ts);
CREATE INDEX idx_coaching_plan_status ON public.coaching_plan(status);
CREATE INDEX idx_risk_score_person_calculated ON public.risk_score(person_id, calculated_at);

-- Insert sample data
INSERT INTO public.person (name, email, department) VALUES
  ('Sarah Johnson', 'sarah.johnson@company.com', 'Engineering'),
  ('Mike Chen', 'mike.chen@company.com', 'Sales'),
  ('Emily Davis', 'emily.davis@company.com', 'Marketing'),
  ('James Wilson', 'james.wilson@company.com', 'Engineering'),
  ('Lisa Rodriguez', 'lisa.rodriguez@company.com', 'HR');

-- Insert sample signals
INSERT INTO public.signal (person_id, level, reason, ts) 
SELECT 
  p.id,
  CASE 
    WHEN random() < 0.2 THEN 'critical'
    WHEN random() < 0.5 THEN 'risk'
    ELSE 'warning'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'Unusual work hours pattern detected'
    WHEN random() < 0.6 THEN 'Performance metrics declining'
    ELSE 'Engagement score below threshold'
  END,
  now() - (random() * INTERVAL '30 days')
FROM public.person p, generate_series(1, 3);

-- Insert sample coaching plans
INSERT INTO public.coaching_plan (person_id, status, title, description)
SELECT 
  p.id,
  CASE WHEN random() < 0.7 THEN 'active' ELSE 'completed' END,
  'Performance Improvement Plan',
  'Focused coaching to improve key performance metrics'
FROM public.person p
WHERE random() < 0.6;

-- Insert sample risk scores
INSERT INTO public.risk_score (person_id, score)
SELECT 
  p.id,
  ROUND((random() * 8 + 1)::numeric, 1)
FROM public.person p;