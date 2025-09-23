create table if not exists coaching_plan (
  id text primary key default gen_random_uuid(),
  person_id text not null references person(id) on delete cascade,
  created_at timestamptz not null default now(),
  objective text not null,
  playbook text not null,
  status text check (status in ('active','completed','failed')) not null default 'active'
);