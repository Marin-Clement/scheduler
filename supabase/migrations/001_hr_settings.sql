-- HR Settings Feature Migration
-- Run this in Supabase SQL Editor

-- ================================================
-- 1. Leave Balances: Add monthly increment column
-- ================================================
ALTER TABLE leave_balances 
ADD COLUMN IF NOT EXISTS monthly_increment DECIMAL(5,2);

-- ================================================
-- 2. Leave Types: Add default monthly increment
-- ================================================
ALTER TABLE leave_types 
ADD COLUMN IF NOT EXISTS default_monthly_increment DECIMAL(5,2) DEFAULT 0;

-- ================================================
-- 3. Remote Work Policies Table
-- ================================================
CREATE TABLE IF NOT EXISTS remote_work_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = org-wide default
    policy_type TEXT NOT NULL CHECK (policy_type IN ('flexible', 'fixed')),
    days_per_week INTEGER NOT NULL DEFAULT 0,
    fixed_days TEXT[], -- e.g., ['monday', 'friday']
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 4. RLS Policies for remote_work_policies
-- ================================================
ALTER TABLE remote_work_policies ENABLE ROW LEVEL SECURITY;

-- HR/Admin can manage all policies in their org
CREATE POLICY "HR can manage remote work policies" ON remote_work_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.org_id = remote_work_policies.org_id
            AND p.role IN ('hr', 'admin')
        )
    );

-- Users can read their own policy or org default
CREATE POLICY "Users can read their own policy" ON remote_work_policies
    FOR SELECT USING (
        profile_id = auth.uid() OR
        (profile_id IS NULL AND org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
    );

-- ================================================
-- 5. Index for performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_remote_work_policies_org_id 
ON remote_work_policies(org_id);

CREATE INDEX IF NOT EXISTS idx_remote_work_policies_profile_id 
ON remote_work_policies(profile_id);
