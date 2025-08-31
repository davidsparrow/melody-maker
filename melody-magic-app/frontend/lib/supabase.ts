import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a lazy-loaded Supabase client that only initializes when needed
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // Validate environment variables at runtime, not build time
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
      );
    }

    // Create basic Supabase client - types will be inferred at runtime
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
