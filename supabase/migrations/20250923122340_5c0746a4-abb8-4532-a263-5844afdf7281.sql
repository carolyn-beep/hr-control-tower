-- Delete existing risk scores for James Wilson to insert trend data
DELETE FROM risk_score WHERE person_id = (SELECT id FROM person WHERE name='James Wilson');

-- Insert risk score trend data for James Wilson  
INSERT INTO risk_score (person_id, score, calculated_at) VALUES
  ((SELECT id FROM person WHERE name='James Wilson'), 7.2, now() - interval '7 days'),
  ((SELECT id FROM person WHERE name='James Wilson'), 6.5, now() - interval '5 days'),
  ((SELECT id FROM person WHERE name='James Wilson'), 5.8, now() - interval '3 days'),
  ((SELECT id FROM person WHERE name='James Wilson'), 5.2, now());