insert into person (id, email, name, role, status, start_date) values
  ('u_201','priya.patel@company.com','Priya Patel','Backend Engineer','active', current_date - interval '60 days'),
  ('u_202','chen.wei@company.com','Chen Wei','Data Engineer','coaching',  current_date - interval '45 days'),
  ('u_203','maria.gomez@company.com','Maria Gomez','QA Engineer','active', current_date - interval '20 days'),
  ('u_204','omar.haddad@company.com','Omar Haddad','Frontend Engineer','active', current_date - interval '90 days'),
  ('u_205','zoe.kim@company.com','Zoe Kim','Support Engineer','onboarding', current_date - interval '5 days')
on conflict (id) do nothing;