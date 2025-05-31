-- First, enable RLS if not already enabled
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin and staff can create vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin can manage all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Users can read all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin and staff can manage vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow authenticated users to insert vehicles with matching institution_id" ON vehicles;

-- Create a single policy that allows authenticated users to manage vehicles
CREATE POLICY "Authenticated users can manage vehicles" ON vehicles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);