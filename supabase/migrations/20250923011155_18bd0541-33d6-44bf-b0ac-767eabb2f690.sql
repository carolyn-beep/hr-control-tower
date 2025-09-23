-- Create user roles system to manage access control
CREATE TYPE public.app_role AS ENUM ('admin', 'hr_manager', 'manager', 'employee');

-- Create user profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role app_role NOT NULL DEFAULT 'employee',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

-- Create function to check if user has required role
CREATE OR REPLACE FUNCTION public.has_role_access(required_roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = ANY(required_roles);
$$;

-- Drop the overly permissive policies on all tables
DROP POLICY IF EXISTS "Allow all operations on person" ON public.person;
DROP POLICY IF EXISTS "Allow all operations on signal" ON public.signal;
DROP POLICY IF EXISTS "Allow all operations on coaching_plan" ON public.coaching_plan;
DROP POLICY IF EXISTS "Allow all operations on performance_event" ON public.performance_event;
DROP POLICY IF EXISTS "Allow all operations on risk_score" ON public.risk_score;
DROP POLICY IF EXISTS "Allow all operations on release_case" ON public.release_case;
DROP POLICY IF EXISTS "Allow all operations on kpi" ON public.kpi;

-- Secure RLS policies for person table (most sensitive)
CREATE POLICY "HR and admin can view all persons"
ON public.person FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

CREATE POLICY "HR and admin can insert persons"
ON public.person FOR INSERT
TO authenticated
WITH CHECK (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

CREATE POLICY "HR and admin can update persons"
ON public.person FOR UPDATE
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

CREATE POLICY "Only admin can delete persons"
ON public.person FOR DELETE
TO authenticated
USING (public.has_role_access(ARRAY['admin']::app_role[]));

-- Secure policies for signal table
CREATE POLICY "Authorized users can view signals"
ON public.signal FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage signals"
ON public.signal FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- Secure policies for coaching_plan table
CREATE POLICY "Authorized users can view coaching plans"
ON public.coaching_plan FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage coaching plans"
ON public.coaching_plan FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- Secure policies for performance_event table
CREATE POLICY "Authorized users can view performance events"
ON public.performance_event FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage performance events"
ON public.performance_event FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- Secure policies for risk_score table
CREATE POLICY "Authorized users can view risk scores"
ON public.risk_score FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage risk scores"
ON public.risk_score FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- Secure policies for release_case table
CREATE POLICY "Authorized users can view release cases"
ON public.release_case FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage release cases"
ON public.release_case FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- KPI table can be read by authorized users, managed by admin/HR
CREATE POLICY "Authorized users can view KPIs"
ON public.kpi FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager', 'manager']::app_role[]));

CREATE POLICY "HR and admin can manage KPIs"
ON public.kpi FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

-- User profiles policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin and HR can view all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (public.has_role_access(ARRAY['admin', 'hr_manager']::app_role[]));

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin can manage all profiles"
ON public.user_profiles FOR ALL
TO authenticated
USING (public.has_role_access(ARRAY['admin']::app_role[]));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'employee'::app_role
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();