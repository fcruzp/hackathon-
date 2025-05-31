/*
  # Fix Vehicle RLS Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Add comprehensive RLS policies for vehicle management
    - Ensure proper access control for vehicle operations

  2. Security
    - Enable RLS on vehicles table
    - Add policies for:
      - Vehicle creation by admin and staff
      - Full vehicle management by admin
      - Read access for all authenticated users
*/

-- First, enable RLS if not already enabled
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin and staff can create vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin can manage all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON vehicles;
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

CREATE POLICY "Staff can update vehicles"
ON vehicles
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'staff'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'staff'
);

CREATE POLICY "Enable read access for all authenticated users"
ON vehicles
FOR SELECT
TO authenticated
USING (true);