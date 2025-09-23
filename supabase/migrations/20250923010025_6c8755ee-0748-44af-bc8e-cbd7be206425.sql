-- Create or replace the view for open release cases
create or replace view v_release_open as
select rc.id, p.name, p.email, rc.opened_at, rc.reason, rc.status, rc.risk_score
from release_case rc join person p on p.id = rc.person_id
order by rc.opened_at desc;