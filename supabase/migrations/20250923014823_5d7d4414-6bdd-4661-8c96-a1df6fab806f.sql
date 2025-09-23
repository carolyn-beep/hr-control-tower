-- Fix the get_coaching_history function return type mismatch
DROP FUNCTION IF EXISTS public.get_coaching_history(text);

CREATE OR REPLACE FUNCTION public.get_coaching_history(target_person_id text)
 RETURNS TABLE(id text, objective text, playbook text, status text, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, objective, playbook, status, created_at
  FROM coaching_plan 
  WHERE person_id = target_person_id
  ORDER BY created_at DESC
  LIMIT 2;
$function$;