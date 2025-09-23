-- Enable Row Level Security on release_case table
ALTER TABLE public.release_case ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all operations (matching other tables in your system)
CREATE POLICY "Allow all operations on release_case" 
ON public.release_case 
FOR ALL 
USING (true) 
WITH CHECK (true);