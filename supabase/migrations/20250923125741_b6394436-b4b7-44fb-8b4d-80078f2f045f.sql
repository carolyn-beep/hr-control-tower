-- Fix warning signals that are stored as 'warning' instead of 'warn'
update signal
set score_delta = abs(coalesce(score_delta, 3))
where level = 'warning';