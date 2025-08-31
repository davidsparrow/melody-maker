-- Fix the missing trigger function for automatic profile creation
-- This is likely the cause of the "Database error saving new user"

-- 1. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop existing function if it exists
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Create the function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, plan, credits)
    VALUES (
        NEW.id,
        NEW.email,
        'free',
        10
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error for debugging
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;

-- 6. Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Test if we can manually insert a profile (for debugging)
-- This will help identify any remaining issues
SELECT 
    has_table_privilege('authenticated', 'profiles', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'profiles', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'profiles', 'UPDATE') as can_update;
