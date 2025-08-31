-- Fix RLS and Policies for Melody Magic
-- This script safely enables RLS and creates policies without conflicts

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_billing_updated_at ON billing;

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

DROP POLICY IF EXISTS "users_select_own_projects" ON projects;
DROP POLICY IF EXISTS "users_insert_own_projects" ON projects;
DROP POLICY IF EXISTS "users_update_own_projects" ON projects;
DROP POLICY IF EXISTS "users_delete_own_projects" ON projects;

DROP POLICY IF EXISTS "users_select_own_assets" ON assets;
DROP POLICY IF EXISTS "users_insert_own_assets" ON assets;
DROP POLICY IF EXISTS "users_update_own_assets" ON assets;
DROP POLICY IF EXISTS "users_delete_own_assets" ON assets;

DROP POLICY IF EXISTS "users_select_own_jobs" ON jobs;
DROP POLICY IF EXISTS "users_insert_own_jobs" ON jobs;
DROP POLICY IF EXISTS "users_update_own_jobs" ON jobs;
DROP POLICY IF EXISTS "users_delete_own_jobs" ON jobs;

DROP POLICY IF EXISTS "users_select_own_billing" ON billing;
DROP POLICY IF EXISTS "users_insert_own_billing" ON billing;
DROP POLICY IF EXISTS "users_update_own_billing" ON billing;

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at 
    BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recreate RLS policies for profiles
CREATE POLICY "users_select_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Recreate RLS policies for projects
CREATE POLICY "users_select_own_projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Recreate RLS policies for assets
CREATE POLICY "users_select_own_assets" ON assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_insert_own_assets" ON assets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_update_own_assets" ON assets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_delete_own_assets" ON assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = assets.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Recreate RLS policies for jobs
CREATE POLICY "users_select_own_jobs" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = jobs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_insert_own_jobs" ON jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = jobs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_update_own_jobs" ON jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = jobs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "users_delete_own_jobs" ON jobs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = jobs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Recreate RLS policies for billing
CREATE POLICY "users_select_own_billing" ON billing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_billing" ON billing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_billing" ON billing
    FOR UPDATE USING (auth.uid() = user_id);

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'projects', 'assets', 'jobs', 'billing')
ORDER BY tablename;
