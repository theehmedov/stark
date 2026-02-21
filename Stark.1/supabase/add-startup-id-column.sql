-- Add unique startup_id column to the profiles table (only for startups)
-- This column will store values like 'str-7a2b'

-- 1. Add the column (nullable initially)
ALTER TABLE profiles
ADD COLUMN startup_id TEXT;

-- 2. Create a unique constraint to prevent duplicates
-- Note: We allow NULL so non-startup rows are not constrained
ALTER TABLE profiles
ADD CONSTRAINT profiles_startup_id_unique UNIQUE (startup_id)
WHERE startup_id IS NOT NULL;

-- 3. (Optional) Add an index for faster lookups
CREATE INDEX idx_profiles_startup_id ON profiles(startup_id) WHERE startup_id IS NOT NULL;

-- 4. Update RLS policies to allow users to update their own startup_id
CREATE POLICY "Users can update own startup_id"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. (Optional) Populate existing startup rows with a generated ID
-- Run this once if you already have startup rows:
-- UPDATE profiles SET startup_id = 'str-' || substr(md5(id::text), 1, 4) WHERE role = 'startup' AND startup_id IS NULL;
