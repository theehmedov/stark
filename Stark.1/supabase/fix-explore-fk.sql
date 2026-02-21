-- =====================================================
-- FIX: Add Foreign Keys from startups/it_companies to profiles
-- =====================================================
-- PostgREST needs a direct FK to join tables.
-- Currently user_id references auth.users(id) but NOT profiles(id).
-- Since profiles.id = auth.users.id (same UUID), we can safely add
-- a second FK constraint pointing to profiles.
--
-- Run this in Supabase Dashboard → SQL Editor

-- Add FK from startups.user_id → profiles.id
ALTER TABLE startups
    ADD CONSTRAINT startups_profile_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add FK from it_companies.user_id → profiles.id
ALTER TABLE it_companies
    ADD CONSTRAINT it_companies_profile_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Reload PostgREST schema cache so it picks up the new relationships
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- DONE! The Explore page joins will now work.
-- =====================================================
