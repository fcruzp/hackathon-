/*
  # Update vehicle RLS policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Add policy for vehicle creation by admin and staff
    - Add policy for full vehicle management by admin
    - Add policy for read access to all authenticated users

  2. Security
    - Ensures proper access control for vehicle management
    - Maintains data integrity through role-based permissions
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin and staff can create vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin can manage all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can read all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin and staff can manage vehicles" ON vehicles;

-- Add comprehensive policies for vehicle management
CREATE POLICY "Admin and staff can create vehicles"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'staff')
);

CREATE POLICY "Admin can manage all vehicles"
ON vehicles
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Enable read access for all authenticated users"
ON vehicles
FOR SELECT
TO authenticated
USING (true);