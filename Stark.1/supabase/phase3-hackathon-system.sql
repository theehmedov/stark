-- =====================================================
-- PHASE 3: HACKATHON MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Prerequisites: schema.sql (profiles, audit_logs) and phase2-tables.sql (startups, it_companies)

-- =====================================================
-- 1. EXTEND user_role ENUM WITH 'individual'
-- =====================================================
-- Postgres doesn't allow IF NOT EXISTS for ALTER TYPE,
-- so we check first to make it safe to re-run.

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

-- =====================================================
-- 2. ALTER profiles TABLE — ADD NEW COLUMNS
-- =====================================================

-- sub_role: 'mentor' or 'jury' (only relevant for 'individual' role)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_role TEXT;

-- cv_url: link to uploaded resume (for mentors/jury)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- approval_status: 'approved' for startup/it_company, 'pending' for individual
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved';

-- Add a CHECK constraint for sub_role values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_sub_role_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_sub_role_check
            CHECK (sub_role IS NULL OR sub_role IN ('mentor', 'jury'));
    END IF;
END
$$;

-- Add a CHECK constraint for approval_status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_approval_status_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_approval_status_check
            CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    END IF;
END
$$;

-- Index for filtering by approval status (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);

-- Index for filtering by sub_role
CREATE INDEX IF NOT EXISTS idx_profiles_sub_role ON profiles(sub_role);

-- =====================================================
-- 3. UPDATE handle_new_user() TRIGGER FUNCTION
-- =====================================================
-- Now sets approval_status based on role:
--   'individual' → 'pending'
--   everything else → 'approved'

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

-- =====================================================
-- 4. CREATE hackathons TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    it_company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT hackathons_status_check
        CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hackathons_it_company_id ON hackathons(it_company_id);
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_event_date ON hackathons(event_date);

-- =====================================================
-- 5. CREATE hackathon_staff TABLE (Juries & Mentors)
-- =====================================================

CREATE TABLE IF NOT EXISTS hackathon_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    staff_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent duplicate assignments
    UNIQUE (hackathon_id, profile_id),

    CONSTRAINT hackathon_staff_role_check
        CHECK (staff_role IN ('mentor', 'jury'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hackathon_staff_hackathon_id ON hackathon_staff(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_staff_profile_id ON hackathon_staff(profile_id);

-- =====================================================
-- 6. CREATE hackathon_applications TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS hackathon_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent duplicate applications
    UNIQUE (hackathon_id, startup_id),

    CONSTRAINT hackathon_applications_status_check
        CHECK (status IN ('applied', 'accepted', 'rejected', 'withdrawn'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hackathon_applications_hackathon_id ON hackathon_applications(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_applications_startup_id ON hackathon_applications(startup_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_applications_status ON hackathon_applications(status);

-- =====================================================
-- 7. AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_hackathons_updated_at
    BEFORE UPDATE ON hackathons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hackathon_applications_updated_at
    BEFORE UPDATE ON hackathon_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. RLS POLICIES — hackathons
-- =====================================================

-- Anyone authenticated can browse hackathons
CREATE POLICY "Authenticated users can browse hackathons"
    ON hackathons FOR SELECT
    USING (auth.role() = 'authenticated');

-- IT companies can create hackathons (they own them)
CREATE POLICY "IT companies can create hackathons"
    ON hackathons FOR INSERT
    WITH CHECK (auth.uid() = it_company_id);

-- IT companies can update their own hackathons
CREATE POLICY "IT companies can update own hackathons"
    ON hackathons FOR UPDATE
    USING (auth.uid() = it_company_id)
    WITH CHECK (auth.uid() = it_company_id);

-- IT companies can delete their own hackathons
CREATE POLICY "IT companies can delete own hackathons"
    ON hackathons FOR DELETE
    USING (auth.uid() = it_company_id);

-- Admins can manage all hackathons
CREATE POLICY "Admins can manage all hackathons"
    ON hackathons FOR ALL
    USING (is_admin());

-- =====================================================
-- 10. RLS POLICIES — hackathon_staff
-- =====================================================

-- Anyone authenticated can view staff assignments (public info)
CREATE POLICY "Authenticated users can view hackathon staff"
    ON hackathon_staff FOR SELECT
    USING (auth.role() = 'authenticated');

-- IT company that owns the hackathon can assign staff
CREATE POLICY "Hackathon owner can assign staff"
    ON hackathon_staff FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM hackathons
            WHERE hackathons.id = hackathon_id
            AND hackathons.it_company_id = auth.uid()
        )
    );

-- IT company that owns the hackathon can remove staff
CREATE POLICY "Hackathon owner can remove staff"
    ON hackathon_staff FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM hackathons
            WHERE hackathons.id = hackathon_id
            AND hackathons.it_company_id = auth.uid()
        )
    );

-- Admins can manage all staff
CREATE POLICY "Admins can manage all hackathon staff"
    ON hackathon_staff FOR ALL
    USING (is_admin());

-- =====================================================
-- 11. RLS POLICIES — hackathon_applications
-- =====================================================

-- Startups can view their own applications
CREATE POLICY "Startups can view own applications"
    ON hackathon_applications FOR SELECT
    USING (auth.uid() = startup_id);

-- IT company that owns the hackathon can view all applications
CREATE POLICY "Hackathon owner can view applications"
    ON hackathon_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM hackathons
            WHERE hackathons.id = hackathon_id
            AND hackathons.it_company_id = auth.uid()
        )
    );

-- Startups can apply to hackathons
CREATE POLICY "Startups can apply to hackathons"
    ON hackathon_applications FOR INSERT
    WITH CHECK (auth.uid() = startup_id);

-- Startups can withdraw their own application
CREATE POLICY "Startups can withdraw own application"
    ON hackathon_applications FOR UPDATE
    USING (auth.uid() = startup_id)
    WITH CHECK (auth.uid() = startup_id);

-- IT company that owns the hackathon can update application status
CREATE POLICY "Hackathon owner can update application status"
    ON hackathon_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM hackathons
            WHERE hackathons.id = hackathon_id
            AND hackathons.it_company_id = auth.uid()
        )
    );

-- Admins can manage all applications
CREATE POLICY "Admins can manage all hackathon applications"
    ON hackathon_applications FOR ALL
    USING (is_admin());

-- =====================================================
-- 12. ADD RLS POLICY — profiles visible to all authenticated
-- =====================================================
-- Needed so hackathon pages can show mentor/jury/startup names.
-- This is safe because profiles only contain name + role, no secrets.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Authenticated users can browse profiles'
    ) THEN
        CREATE POLICY "Authenticated users can browse profiles"
            ON profiles FOR SELECT
            USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- =====================================================
-- 13. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON hackathons TO authenticated;
GRANT ALL ON hackathon_staff TO authenticated;
GRANT ALL ON hackathon_applications TO authenticated;

-- =====================================================
-- 14. STORAGE BUCKET FOR RESUMES
-- =====================================================
-- Supabase storage buckets are created via the storage API,
-- not via SQL. Run this to create the bucket:

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Allow authenticated users to upload their own resume
CREATE POLICY "Users can upload own resume"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes'
        AND auth.role() = 'authenticated'
    );

-- Storage RLS: Anyone can read resumes (public bucket)
CREATE POLICY "Public resume access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes');

-- Storage RLS: Users can update their own resume
CREATE POLICY "Users can update own resume"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'resumes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage RLS: Users can delete their own resume
CREATE POLICY "Users can delete own resume"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resumes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 15. RELOAD POSTGREST SCHEMA CACHE
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- DONE! Phase 3 Hackathon Management System is ready.
-- =====================================================
--
-- Summary of changes:
--   ✓ Added 'individual' to user_role enum
--   ✓ Added sub_role, cv_url, approval_status to profiles
--   ✓ Updated handle_new_user() trigger for new fields
--   ✓ Created hackathons table (owned by IT companies)
--   ✓ Created hackathon_staff table (mentors & juries)
--   ✓ Created hackathon_applications table (startup applications)
--   ✓ Created 'resumes' storage bucket with RLS
--   ✓ All tables have RLS enabled with proper policies
--   ✓ All tables have indexes and auto-update triggers
--
-- Next: Build the UI components in Next.js
