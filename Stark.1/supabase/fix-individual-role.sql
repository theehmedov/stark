-- =====================================================
-- FIX: Allow 'individual' role in the database
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor
--
-- The error "Database error saving new user" happens because
-- the handle_new_user() trigger tries to cast 'individual' to
-- the user_role enum, but 'individual' doesn't exist in the enum yet.

-- Step 1: Add 'individual' to the user_role enum
-- (Safe to re-run — checks if it already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'individual'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'individual';
    END IF;
END
$$;

-- Step 2: Add the new columns to profiles (if not already added)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved';

-- Step 3: Update the handle_new_user() trigger to handle 'individual'
-- Sets approval_status = 'pending' for individuals, 'approved' for others
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role user_role;
    _approval TEXT;
    _sub_role TEXT;
BEGIN
    _role := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'role', ''),
        'startup'
    )::user_role;

    -- Set approval status based on role
    IF _role = 'individual' THEN
        _approval := 'pending';
    ELSE
        _approval := 'approved';
    END IF;

    -- Set sub_role if provided (for individual role)
    _sub_role := NULLIF(NEW.raw_user_meta_data->>'sub_role', '');

    INSERT INTO public.profiles (id, role, full_name, sub_role, approval_status)
    VALUES (
        NEW.id,
        _role,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
            'User'
        ),
        _sub_role,
        _approval
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user() failed for user %: % %', NEW.id, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- DONE! Now try registering with the 'individual' role again.
-- =====================================================
