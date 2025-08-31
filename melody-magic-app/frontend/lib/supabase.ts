import { createClient } from '@supabase/supabase-js';

// Database types for TypeScript - defined first so they can be used in createClient
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'enterprise';
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'draft' | 'analyzing' | 'generating' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status?: 'draft' | 'analyzing' | 'generating' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: 'draft' | 'analyzing' | 'generating' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          project_id: string;
          type: 'original' | 'analysis_json' | 'gen_intro' | 'gen_outro' | 'preview_mix';
          s3_url: string;
          duration_sec: number | null;
          format: string;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: 'original' | 'analysis_json' | 'gen_intro' | 'gen_outro' | 'preview_mix';
          s3_url: string;
          duration_sec?: number | null;
          format: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: 'original' | 'analysis_json' | 'gen_intro' | 'gen_outro' | 'preview_mix';
          s3_url?: string;
          duration_sec?: number | null;
          format?: string;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          project_id: string;
          kind: 'analysis' | 'generate_intro' | 'generate_outro';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          payload_json: Record<string, any>;
          result_json: Record<string, any> | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          kind: 'analysis' | 'generate_intro' | 'generate_outro';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payload_json: Record<string, any>;
          result_json?: Record<string, any> | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          kind?: 'analysis' | 'generate_intro' | 'generate_outro';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payload_json?: Record<string, any>;
          result_json?: Record<string, any> | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      billing: {
        Row: {
          id: string;
          user_id: string;
          provider: 'stripe';
          plan: 'free' | 'pro' | 'enterprise';
          status: 'active' | 'canceled' | 'past_due' | 'unpaid';
          renew_at: string | null;
          meta_json: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'stripe';
          plan: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          renew_at?: string | null;
          meta_json?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'stripe';
          plan?: 'free' | 'pro' | 'enterprise';
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
          renew_at?: string | null;
          meta_json?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a lazy-loaded Supabase client that only initializes when needed
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseClient(): ReturnType<typeof createClient<Database>> {
  if (!supabaseClient) {
    // Validate environment variables at runtime, not build time
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
      );
    }

    // Create Supabase client with proper database types
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Export typed Supabase client
export type SupabaseClient = typeof supabase;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
