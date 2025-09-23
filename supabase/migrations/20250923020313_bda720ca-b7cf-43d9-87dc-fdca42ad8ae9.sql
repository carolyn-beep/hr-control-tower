-- Create a secure directory view that exposes only non-sensitive information
-- This allows employees and managers to access basic directory info without exposing emails
CREATE OR REPLACE VIEW public.person_directory AS
SELECT 
  id,
  name,
  department,
  created_at
FROM public.person;

-- Apply RLS to the directory view
ALTER VIEW public.person_directory ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view the directory (without email addresses)
CREATE POLICY "Authenticated users can view person directory"
ON public.person_directory
FOR SELECT
TO authenticated
USING (true);

-- Create a secure function for HR/Admin to get full person details including sensitive data
CREATE OR REPLACE FUNCTION public.get_person_details(person_id text)
RETURNS TABLE (
  id text,
  name text, 
  email text,
  department text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.email, p.department, p.created_at, p.updated_at
  FROM public.person p
  WHERE p.id = person_id
  AND has_role_access(ARRAY['admin'::app_role, 'hr_manager'::app_role]);
$$;