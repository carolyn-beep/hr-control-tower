-- Create view for KPI benchmarks by role
CREATE OR REPLACE VIEW v_kpi_benchmarks AS
SELECT p.role,
       k.name AS kpi,
       percentile_cont(0.5) WITHIN GROUP (ORDER BY pe.value) AS median_14d
FROM performance_event pe
JOIN kpi k ON k.id = pe.kpi_id
JOIN person p ON p.id = pe.person_id
WHERE pe.ts > now() - INTERVAL '14 days'
GROUP BY p.role, k.name;