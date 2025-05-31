/*
  # Add vehicle creation policy

  1. Changes
    - Add RLS policy to allow admin and staff users to create vehicles
    - Use correct syntax for INSERT policy with only WITH CHECK clause

  2. Security
    - Policy only allows authenticated users with admin or staff roles
    - Ensures proper role-based access control for vehicle creation
*/

-- Add policy for vehicle creation
CREATE POLICY "Admin and staff can create vehicles"
ON vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role'::text) IN ('admin', 'staff')
);