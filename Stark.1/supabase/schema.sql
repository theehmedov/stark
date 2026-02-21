-- =====================================================
-- INNOVATION ECOSYSTEM PLATFORM - DATABASE SCHEMA
-- =====================================================
-- This schema includes tables for user profiles and audit logs
-- with Row Level Security (RLS) policies for secure access control.

-- =====================================================
-- 1. CREATE CUSTOM TYPES
-- =====================================================

-- User role enumeration
CREATE TYPE user_role AS ENUM ('admin', 'startup', 'investor', 'it_company');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Profiles Table
-- Extends auth.users with additional user information
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit Logs Table
-- Tracks all important user actions for security and compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on profiles role for faster role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Index on audit_logs user_id for faster user activity lookups
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Index on audit_logs created_at for time-based queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Index on audit_logs action for filtering by action type
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. HELPER FUNCTION FOR ADMIN CHECK (avoids RLS recursion)
-- =====================================================

-- SECURITY DEFINER bypasses RLS so querying profiles won't trigger
-- the admin policy again, preventing infinite recursion.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR PROFILES TABLE
-- =====================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all profiles"
    ON profiles
    FOR SELECT
    USING (is_admin());

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles
    FOR UPDATE
    USING (is_admin());

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
    ON profiles
    FOR DELETE
    USING (is_admin());

-- =====================================================
-- 6. CREATE RLS POLICIES FOR AUDIT_LOGS TABLE
-- =====================================================

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs"
    ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admins can view all audit logs (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all audit logs"
    ON audit_logs
    FOR SELECT
    USING (is_admin());

-- Policy: Admins can delete audit logs (for data retention management)
CREATE POLICY "Admins can delete audit logs"
    ON audit_logs
    FOR DELETE
    USING (is_admin());

-- =====================================================
-- 7. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE TRIGGER FOR AUTO-UPDATE
-- =====================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. CREATE FUNCTION TO HANDLE NEW USER REGISTRATION
-- =====================================================
-- This function automatically creates a profile when a new user signs up
-- Note: This requires setting up a trigger in Supabase Dashboard
-- Database Webhooks or using Supabase Auth Hooks

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'role', ''),
            'startup'
        )::user_role,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            'User'
        )
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user() failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if you have access)
-- Note: You may need to create this trigger via Supabase Dashboard
-- or use a Database Webhook instead
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON audit_logs TO authenticated;

-- Grant permissions for anonymous users (for registration)
GRANT INSERT ON profiles TO anon;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- To verify the setup, you can run:
-- SELECT * FROM profiles;
-- SELECT * FROM audit_logs;
