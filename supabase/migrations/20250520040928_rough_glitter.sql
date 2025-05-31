-- First, ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Enable update for admin users and own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON users;

-- Create a single UPDATE policy that allows any authenticated user to update any record
CREATE POLICY "Authenticated users can update any profile"
ON users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);