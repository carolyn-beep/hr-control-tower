-- Positive signals (info) = risk down
update signal
set score_delta = -abs(coalesce(score_delta, 3))
where level = 'info';

-- Warnings should add small positive risk
update signal
set score_delta = abs(coalesce(score_delta, 3))
where level = 'warn';

-- Risks should add larger positive risk
update signal
set score_delta = abs(coalesce(score_delta, 8))
where level = 'risk';

-- Critical should add largest positive risk
update signal
set score_delta = abs(coalesce(score_delta, 12))
where level = 'critical';