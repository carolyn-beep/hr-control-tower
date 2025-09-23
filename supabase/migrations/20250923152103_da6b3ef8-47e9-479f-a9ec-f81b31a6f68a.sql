-- Disable RLS on signal table and allow public inserts
ALTER TABLE signal DISABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all inserts on signal"
ON signal
FOR INSERT
TO public
WITH CHECK (true);