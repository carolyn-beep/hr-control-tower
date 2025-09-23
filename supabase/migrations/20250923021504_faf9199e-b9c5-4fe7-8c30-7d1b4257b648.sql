-- Fix RLS issue: Allow person data to be accessed when joining with signals
-- Add a policy that allows reading person data in the context of signal queries

CREATE POLICY "Allow person data for signal queries" ON person
FOR SELECT USING (
  -- Allow access to person data when it's being joined with signals
  EXISTS (
    SELECT 1 FROM signal 
    WHERE signal.person_id = person.id
  )
);

-- Also create a more permissive policy for basic directory access
CREATE POLICY "Public directory access" ON person  
FOR SELECT USING (true);