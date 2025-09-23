-- Create function to update release case status
CREATE OR REPLACE FUNCTION public.update_release_case_status(
  target_release_case_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE release_case 
  SET status = new_status,
      updated_at = now()
  WHERE id = target_release_case_id;
  
  SELECT FOUND;
$$;

-- Add updated_at column to release_case if it doesn't exist
ALTER TABLE public.release_case 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for release_case table
DROP TRIGGER IF EXISTS update_release_case_updated_at ON public.release_case;
CREATE TRIGGER update_release_case_updated_at
    BEFORE UPDATE ON public.release_case
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();