-- Update release_safeguards function with simplified requirements
CREATE OR REPLACE FUNCTION public.release_safeguards(target_person_id text)
RETURNS TABLE(tenure_ok boolean, data_ok boolean, coach_ok boolean, messages text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH person_data AS (
    SELECT 
      p.created_at,
      (SELECT COUNT(*) FROM performance_event WHERE person_id = p.id AND ts > now() - INTERVAL '14 days') as recent_events,
      (SELECT COUNT(*) FROM coaching_plan WHERE person_id = p.id AND status = 'completed') as completed_coaching
    FROM person p 
    WHERE p.id = target_person_id
  )
  SELECT 
    (pd.created_at < now() - INTERVAL '21 days') as tenure_ok,
    (pd.recent_events >= 3) as data_ok,
    (pd.completed_coaching >= 1) as coach_ok,
    ARRAY[
      CASE WHEN pd.created_at >= now() - INTERVAL '21 days' 
           THEN 'Person must have 21+ days tenure' 
           ELSE NULL END,
      CASE WHEN pd.recent_events < 3 
           THEN 'Need at least 3 data points in last 14 days' 
           ELSE NULL END,
      CASE WHEN pd.completed_coaching < 1 
           THEN 'Warning: No completed coaching cycles' 
           ELSE NULL END
    ]::TEXT[] as messages
  FROM person_data pd;
$function$;