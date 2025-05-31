/*
  # Simplify Vehicle RLS Policies

  1. Changes
    - Drop existing policies
    - Create simplified INSERT policy for authenticated users
    - Create simplified SELECT policy for authenticated users
    - Create ALL policy for admins
    - Create UPDATE policy for staff

  2. Security
    - All policies enforce institution_id matching
    - Maintains data isolation between institutions
*/

-- First, enable RLS if not already enabled
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin and staff can create vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin can manage all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON vehicles;
DROP POLICY IF EXISTS "Users can read all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin and staff can manage vehicles" ON vehicles;

-- Allow authenticated users to insert vehicles, ensuring institution_id matches
CREATE POLICY "Allow authenticated users to insert vehicles with matching institution_id" ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  institution_id = (
    SELECT institution_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Enable read access for all authenticated users
CREATE POLICY "Enable read access for all authenticated users" ON vehicles
FOR SELECT
TO authenticated
USING (
  institution_id = (
    SELECT institution_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Admin can manage all vehicles
CREATE POLICY "Admin can manage all vehicles" ON vehicles
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'role'::text) = 'admin' AND institution_id = ( SELECT institution_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'admin' AND institution_id = ( SELECT institution_id FROM users WHERE id = auth.uid())
);

-- Staff can update vehicles
CREATE POLICY "Staff can update vehicles" ON vehicles
FOR UPDATE
TO authenticated
USING (
    (auth.jwt() ->> 'role'::text) = 'staff' AND institution_id = ( SELECT institution_id FROM users WHERE id = auth.uid())
)
WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'staff' AND institution_id = ( SELECT institution_id FROM users WHERE id = auth.uid())
);