-- Recreate the view with SECURITY INVOKER to fix security warning
-- This ensures the view uses the permissions of the querying user, not the creator
create or replace view v_release_open with (security_invoker = true) as
select rc.id, p.name, p.email, rc.opened_at, rc.reason, rc.status, rc.risk_score
from release_case rc join person p on p.id = rc.person_id
order by rc.opened_at desc;