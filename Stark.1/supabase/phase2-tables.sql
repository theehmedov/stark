-- =====================================================
-- PHASE 2: STARTUPS & IT COMPANIES TABLES
-- =====================================================
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Startups Table
CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'idea',
    team_size INTEGER DEFAULT 1,
    pitch_deck_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- IT Companies Table
CREATE TABLE it_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    voen TEXT NOT NULL,
    residency_status TEXT NOT NULL DEFAULT 'local',
    main_service TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_startups_user_id ON startups(user_id);
CREATE INDEX idx_it_companies_user_id ON it_companies(user_id);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_companies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES FOR STARTUPS
-- =====================================================

-- Users can view their own startup
CREATE POLICY "Users can view own startup"
    ON startups FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own startup
CREATE POLICY "Users can insert own startup"
    ON startups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own startup
CREATE POLICY "Users can update own startup"
    ON startups FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all startups (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all startups"
    ON startups FOR SELECT
    USING (is_admin());

-- Anyone authenticated can browse startups (for discovery)
CREATE POLICY "Authenticated users can browse startups"
    ON startups FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. RLS POLICIES FOR IT COMPANIES
-- =====================================================

-- Users can view their own IT company
CREATE POLICY "Users can view own it_company"
    ON it_companies FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own IT company
CREATE POLICY "Users can insert own it_company"
    ON it_companies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own IT company
CREATE POLICY "Users can update own it_company"
    ON it_companies FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all IT companies (uses SECURITY DEFINER function)
CREATE POLICY "Admins can view all it_companies"
    ON it_companies FOR SELECT
    USING (is_admin());

-- Anyone authenticated can browse IT companies (for discovery)
CREATE POLICY "Authenticated users can browse it_companies"
    ON it_companies FOR SELECT
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. AUTO-UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_startups_updated_at
    BEFORE UPDATE ON startups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_it_companies_updated_at
    BEFORE UPDATE ON it_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON startups TO authenticated;
GRANT ALL ON it_companies TO authenticated;

-- =====================================================
-- DONE! Now deploy the Next.js UI components.
-- =====================================================
