-- Insert risk score trend data for James Wilson
insert into risk_score (person_id, score, calculated_at) values
  ((select id from person where name='James Wilson'), 7.2, now() - interval '7 days'),
  ((select id from person where name='James Wilson'), 6.5, now() - interval '5 days'),
  ((select id from person where name='James Wilson'), 5.8, now() - interval '3 days'),
  ((select id from person where name='James Wilson'), 5.2, now());