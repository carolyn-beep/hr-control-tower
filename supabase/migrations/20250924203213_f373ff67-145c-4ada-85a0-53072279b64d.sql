-- Generate developer-focused signals based on KPI performance (fixed)

-- WARN: PRs/week < 75% of cohort median
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta)
SELECT gen_random_uuid(), pe.person_id, now(), 'warn',
       'Low PR throughput vs cohort',
       3, jsonb_build_object('kpi','kpi_prs','value',avg(pe.value),'cohort_pct',0.75)
FROM performance_event pe
JOIN kpi k ON k.id='kpi_prs'
JOIN person p ON p.id=pe.person_id
JOIN v_kpi_benchmarks b ON b.role=p.role AND b.kpi='Merged PRs/week'
WHERE pe.ts>now()-interval '7 days'
GROUP BY pe.person_id, b.median_14d
HAVING avg(pe.value) < 0.75 * max(b.median_14d);

-- RISK: bug reopen >= 15%
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta)
SELECT gen_random_uuid(), pe.person_id, now(), 'risk',
       'Bug reopen rate above threshold',
       8, jsonb_build_object('kpi',k.id,'value',avg(pe.value))
FROM performance_event pe
JOIN kpi k ON k.id=pe.kpi_id
WHERE pe.ts>now()-interval '7 days' AND k.id='kpi_bugs'
GROUP BY pe.person_id, k.id
HAVING avg(pe.value)>=15;

-- RISK: lead time >= 60h
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta)
SELECT gen_random_uuid(), pe.person_id, now(), 'risk',
       'Lead time above threshold',
       8, jsonb_build_object('kpi',k.id,'value',avg(pe.value))
FROM performance_event pe
JOIN kpi k ON k.id=pe.kpi_id
WHERE pe.ts>now()-interval '7 days' AND k.id='kpi_lead'
GROUP BY pe.person_id, k.id
HAVING avg(pe.value)>=60;

-- CRITICAL: PRs/week < 40% of cohort for 2 consecutive weeks
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta)
SELECT gen_random_uuid(), pe.person_id, now(), 'critical',
       'Sustained PR shortfall (2w)',
       12, jsonb_build_object('kpi','kpi_prs','value',avg(pe.value))
FROM performance_event pe
JOIN kpi k ON k.id='kpi_prs'
JOIN person p ON p.id=pe.person_id
JOIN v_kpi_benchmarks b ON b.role=p.role AND b.kpi='Merged PRs/week'
WHERE pe.ts>now()-interval '14 days'
GROUP BY pe.person_id, b.median_14d
HAVING avg(pe.value) < 0.4 * max(b.median_14d);

-- INFO (positive): recovery to ≥ cohort median this week
INSERT INTO signal (id, person_id, ts, level, reason, score_delta, meta)
SELECT gen_random_uuid(), pe.person_id, now(), 'info',
       'Recovered to cohort median',
       -6, jsonb_build_object('kpi','kpi_prs','value',avg(pe.value))
FROM performance_event pe
JOIN kpi k ON k.id='kpi_prs'
JOIN person p ON p.id=pe.person_id
JOIN v_kpi_benchmarks b ON b.role=p.role AND b.kpi='Merged PRs/week'
WHERE pe.ts>now()-interval '7 days'
GROUP BY pe.person_id, b.median_14d
HAVING avg(pe.value) >= max(b.median_14d);