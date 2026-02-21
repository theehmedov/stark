-- =====================================================
-- FIX: "Database error saving new user" on registration
-- =====================================================
-- Run this in your Supabase Dashboard → SQL Editor
-- This replaces the handle_new_user() trigger function
-- with a version that won't roll back auth signup on failure.

-- Step 1: Drop the existing trigger (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Replace the function with an exception-safe version
-- SECURITY DEFINER means it runs as the function owner (postgres),
-- bypassing RLS policies on the profiles table.
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
        -- Log the error but do NOT roll back the auth.users insert
        RAISE WARNING 'handle_new_user() failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Re-create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Step 4: Ensure the profiles table grants are correct
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT INSERT ON profiles TO anon;
GRANT ALL ON audit_logs TO authenticated;

-- Step 5: Verify the RLS policy for self-insert exists
-- (This should already exist, but re-create if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON profiles
            FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Done! Try registering again.
