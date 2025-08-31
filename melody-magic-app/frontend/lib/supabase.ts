import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a lazy-loaded Supabase client that only initializes when needed
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // Check if we're in a browser environment and have the required variables
    if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
      console.warn('Supabase environment variables not set - auth features will be disabled');
      // Return a mock client that won't crash the app
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
          signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
          insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
        }),
      } as any;
    }

    // Create basic Supabase client - types will be inferred at runtime
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  
  return supabaseClient;
}

// Export a function that returns the client, ensuring it's only called at runtime
export function getSupabase() {
  return getSupabaseClient();
}

// Export the client as a function to ensure it's only called when needed
export const supabase = () => getSupabaseClient();

// Simple type helpers for basic operations
export type SupabaseClient = ReturnType<typeof supabase>;
export type Tables<T extends string> = any; // Simplified for MVP
export type Inserts<T extends string> = any; // Simplified for MVP
export type Updates<T extends string> = any; // Simplified for MVP
