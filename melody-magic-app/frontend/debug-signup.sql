-- Debug and fix user signup issues
-- This script checks and fixes common signup problems

-- 1. Check if the handle_new_user function exists
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 2. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Check if auth.users table exists and has data
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- 5. Check RLS policies on profiles table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Check if we can insert into profiles manually (for testing)
-- This will help identify if it's a permissions issue
SELECT 
    has_table_privilege('authenticated', 'profiles', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'profiles', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'profiles', 'UPDATE') as can_update;

-- 7. Check if the profiles table has the correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
