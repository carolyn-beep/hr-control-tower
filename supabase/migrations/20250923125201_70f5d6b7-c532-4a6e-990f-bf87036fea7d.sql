-- INFO signals (positive events) should LOWER risk
update signal
set score_delta = -abs(coalesce(score_delta, 3))
where level = 'info';

-- WARN/RISK/CRITICAL (negative events) should RAISE risk
update signal
set score_delta =  abs(coalesce(score_delta, 3))
where level = 'warn';

update signal
set score_delta =  abs(coalesce(score_delta, 8))
where level = 'risk';

update signal
set score_delta =  abs(coalesce(score_delta,12))
where level = 'critical';