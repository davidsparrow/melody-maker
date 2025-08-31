# Supabase Setup Guide for Melody Magic

This guide will help you set up Supabase for the Melody Magic application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Git repository cloned

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `melody-magic` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the `frontend` directory:
   ```bash
   cd melody-magic-app/frontend
   cp ../../env.example .env.local
   ```

2. Edit `.env.local` and update the Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL editor and click "Run"
4. This will create all the necessary tables and RLS policies

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
   - **Enable email confirmations**: Yes (recommended)
   - **Enable phone confirmations**: No (not needed for MVP)

3. Go to **Authentication** → **Providers**
4. Enable the providers you want:
   - **Email**: Enabled by default
   - **Google**: Optional (requires Google OAuth setup)
   - **GitHub**: Optional (requires GitHub OAuth setup)

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try to sign up with a new account
4. Check the Supabase dashboard to see if the user was created

## Step 7: Verify Database Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - `profiles`
   - `projects`
   - `assets`
   - `jobs`
   - `billing`

3. Check that RLS is enabled on all tables
4. Verify that the policies are working correctly

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure `.env.local` exists and has the correct values
   - Restart your development server after adding environment variables

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check that the database password is correct
   - Ensure your IP is not blocked by Supabase

3. **RLS policy errors**
   - Make sure all tables have RLS enabled
   - Verify that the policies are correctly applied
   - Check that the `auth.uid()` function is working

4. **Authentication not working**
   - Verify redirect URLs are correct
   - Check that email confirmations are properly configured
   - Ensure the site URL matches your development environment

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com)
- Review the [Supabase GitHub issues](https://github.com/supabase/supabase/issues)

## Security Notes

- **Never commit** your `.env.local` file to version control
- **Never expose** the `service_role` key in client-side code
- Use the `anon` key for client-side operations
- The `service_role` key should only be used in server-side code or Edge Functions
- All tables have Row Level Security (RLS) enabled by default
- Users can only access their own data

## Next Steps

After completing this setup:

1. **Test authentication flow** - sign up, sign in, sign out
2. **Verify RLS policies** - ensure users can only access their own data
3. **Test database operations** - create, read, update, delete projects
4. **Set up monitoring** - enable Supabase logs and alerts

Your Supabase integration is now ready for development! 🎉
