-- Create function to refresh demo data for development/demo environments
CREATE OR REPLACE FUNCTION public.refresh_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    john_smith_id TEXT;
    priya_patel_id TEXT;
    result_data JSONB;
BEGIN
    -- Get person IDs (create if they don't exist)
    SELECT id INTO john_smith_id FROM person WHERE name = 'John Smith' LIMIT 1;
    SELECT id INTO priya_patel_id FROM person WHERE name = 'Priya Patel' LIMIT 1;
    
    -- Create John Smith if he doesn't exist
    IF john_smith_id IS NULL THEN
        INSERT INTO person (name, email, department, role, status)
        VALUES ('John Smith', 'john.smith@company.com', 'Engineering', 'Senior Developer', 'active')
        RETURNING id INTO john_smith_id;
    END IF;
    
    -- Create Priya Patel if she doesn't exist
    IF priya_patel_id IS NULL THEN
        INSERT INTO person (name, email, department, role, status)
        VALUES ('Priya Patel', 'priya.patel@company.com', 'Product', 'Product Manager', 'active')
        RETURNING id INTO priya_patel_id;
    END IF;
    
    -- Insert fresh signals
    INSERT INTO signal (person_id, level, reason, score_delta, ts)
    VALUES 
        (john_smith_id, 'critical', 'Code quality metrics showing significant decline', -2.1, NOW()),
        (priya_patel_id, 'warn', 'Meeting participation decreased by 30%', -0.8, NOW());
    
    -- Upsert risk scores
    INSERT INTO risk_score (person_id, score, calculated_at)
    VALUES 
        (john_smith_id, 8.9, NOW()),
        (priya_patel_id, 4.2, NOW())
    ON CONFLICT (person_id, calculated_at) 
    DO UPDATE SET score = EXCLUDED.score;
    
    -- Return summary
    result_data := jsonb_build_object(
        'success', true,
        'signals_inserted', 2,
        'risk_scores_updated', 2,
        'people', jsonb_build_array(
            jsonb_build_object('name', 'John Smith', 'id', john_smith_id),
            jsonb_build_object('name', 'Priya Patel', 'id', priya_patel_id)
        )
    );
    
    RETURN result_data;
END;
$function$;