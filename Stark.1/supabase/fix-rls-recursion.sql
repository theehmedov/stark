-- =====================================================
-- FIX: "infinite recursion detected in policy for relation profiles"
-- =====================================================
-- The admin policies on `profiles` do a sub-SELECT on `profiles` itself
-- to check if the current user is an admin. This causes infinite recursion
-- because Postgres re-evaluates RLS on every query to the table.
--
-- FIX: Use auth.jwt() to read the role from the JWT metadata instead,
-- or use a SECURITY DEFINER helper function that bypasses RLS.
--
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Step 2: Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS so it won't cause recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 3: Recreate policies using the helper function

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles (uses SECURITY DEFINER function — no recursion)
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON profiles FOR DELETE
    USING (is_admin());

-- =====================================================
-- Also fix audit_logs admin policies (same recursion issue)
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can delete audit logs" ON audit_logs;

CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can delete audit logs"
    ON audit_logs FOR DELETE
    USING (is_admin());

-- =====================================================
-- Also fix startups & it_companies admin policies (if they exist)
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all startups" ON startups;
DROP POLICY IF EXISTS "Admins can view all it_companies" ON it_companies;

-- Only create these if the tables exist (from phase2)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'startups') THEN
        EXECUTE 'CREATE POLICY "Admins can view all startups" ON startups FOR SELECT USING (is_admin())';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'it_companies') THEN
        EXECUTE 'CREATE POLICY "Admins can view all it_companies" ON it_companies FOR SELECT USING (is_admin())';
    END IF;
END $$;

-- =====================================================
-- DONE! The infinite recursion is fixed.
-- =====================================================
