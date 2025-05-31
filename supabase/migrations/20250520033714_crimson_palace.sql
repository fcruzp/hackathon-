/*
  # Update Service Provider RLS policies

  1. Changes
    - Enable RLS on service_providers table
    - Drop all existing policies
    - Create single policy for authenticated users to manage service providers

  2. Security
    - Enable RLS on service_providers table
    - Add policy for authenticated users to manage service providers
*/

-- First, enable RLS if not already enabled
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin and staff can manage service providers" ON service_providers;
DROP POLICY IF EXISTS "Users can read all service providers" ON service_providers;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON service_providers;
DROP POLICY IF EXISTS "Admin can manage all service providers" ON service_providers;

-- Create a single policy that allows authenticated users to manage service providers
CREATE POLICY "Authenticated users can manage service providers"
ON service_providers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);