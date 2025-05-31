/*
  # Update Users Table RLS Policies

  1. Changes
    - Remove all existing UPDATE policies
    - Add a single UPDATE policy for authenticated users
    - Keep other existing policies intact

  2. Security
    - Enable RLS on users table
    - Allow authenticated users to update their own profile
*/

-- First, ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Enable update for admin users and own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create a single UPDATE policy for authenticated users
CREATE POLICY "Authenticated users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);