-- Create a function to execute dynamic SQL queries for AI analysis
-- This function will be used by the AI edge function to execute generated SQL

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- Execute the dynamic SQL and return as JSON
    EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', query) INTO result;
    
    -- Return empty array if no results
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', true,
            'message', SQLERRM,
            'code', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;