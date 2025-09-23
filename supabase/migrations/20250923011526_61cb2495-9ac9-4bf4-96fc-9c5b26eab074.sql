-- Remove restrictive RLS policies and make tables publicly readable for demo
-- This is for demo purposes only - in production, proper authentication would be required

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authorized users can view signals" ON signal;
DROP POLICY IF EXISTS "HR and admin can manage signals" ON signal;
DROP POLICY IF EXISTS "Authorized users can view release cases" ON release_case;
DROP POLICY IF EXISTS "HR and admin can manage release cases" ON release_case;
DROP POLICY IF EXISTS "Authorized users can view risk scores" ON risk_score;
DROP POLICY IF EXISTS "HR and admin can manage risk scores" ON risk_score;
DROP POLICY IF EXISTS "HR and admin can view all persons" ON person;
DROP POLICY IF EXISTS "HR and admin can insert persons" ON person;
DROP POLICY IF EXISTS "HR and admin can update persons" ON person;
DROP POLICY IF EXISTS "Only admin can delete persons" ON person;
DROP POLICY IF EXISTS "Authorized users can view performance events" ON performance_event;
DROP POLICY IF EXISTS "HR and admin can manage performance events" ON performance_event;
DROP POLICY IF EXISTS "Authorized users can view coaching plans" ON coaching_plan;
DROP POLICY IF EXISTS "HR and admin can manage coaching plans" ON coaching_plan;
DROP POLICY IF EXISTS "Authorized users can view KPIs" ON kpi;
DROP POLICY IF EXISTS "HR and admin can manage KPIs" ON kpi;

-- Create permissive policies for demo (public read access)
CREATE POLICY "Public can view signals" ON signal FOR SELECT USING (true);
CREATE POLICY "Public can view release cases" ON release_case FOR SELECT USING (true);
CREATE POLICY "Public can view risk scores" ON risk_score FOR SELECT USING (true);
CREATE POLICY "Public can view persons" ON person FOR SELECT USING (true);
CREATE POLICY "Public can view performance events" ON performance_event FOR SELECT USING (true);
CREATE POLICY "Public can view coaching plans" ON coaching_plan FOR SELECT USING (true);
CREATE POLICY "Public can view KPIs" ON kpi FOR SELECT USING (true);

-- Keep user_profiles restricted since it's not needed for the demo
-- The v_release_open view doesn't have RLS policies, so it's already accessible