-- Add updated_at column to release_case table
ALTER TABLE public.release_case 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for release_case table
CREATE TRIGGER update_release_case_updated_at
    BEFORE UPDATE ON public.release_case
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update release case status
CREATE OR REPLACE FUNCTION public.update_release_case_status(
  target_release_case_id UUID,
  new_status TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE release_case 
    SET status = new_status
    WHERE id = target_release_case_id;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;