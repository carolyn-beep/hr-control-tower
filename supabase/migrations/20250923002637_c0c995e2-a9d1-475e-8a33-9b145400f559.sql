create table if not exists release_case (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references person(id) on delete cascade,
  opened_at timestamptz not null default now(),
  reason text not null,           -- short label: "Sustained PR shortfall"
  evidence jsonb not null,        -- array of rows {kpi, value, benchmark, window, source}
  risk_score numeric not null,
  status text not null check (status in ('under_review','approved','retracted','executed')) default 'under_review'
);