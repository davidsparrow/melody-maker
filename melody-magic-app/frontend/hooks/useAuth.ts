import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables, Inserts } from '../lib/supabase';

interface UseAuthReturn {
  user: Tables<'profiles'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Tables<'profiles'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth state changes
    const supabaseClient = supabase();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const supabaseClient = supabase();
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      const supabaseClient = supabase();
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create one
        if (error.message === 'Supabase not configured') {
          // Handle configuration error
          console.error('Supabase not configured');
          return;
        }
        if ('code' in error && error.code === 'PGRST116') {
          await createUserProfile(supabaseUser);
        } else {
          throw error;
        }
      } else {
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    }
  }, []);

  const createUserProfile = useCallback(async (supabaseUser: User) => {
    try {
      const supabaseClient = supabase();
      const profileData: Inserts<'profiles'> = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        plan: 'free',
        credits: 10,
      };
      
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      setUser(profile);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const supabaseClient = supabase();
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        await fetchUserProfile(data.user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      const supabaseClient = supabase();
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [router]);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const supabaseClient = supabase();
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        // User is automatically signed in after signup
        await fetchUserProfile(data.user);
        router.push('/dashboard');
      } else if (data.user && !data.session) {
        // Email confirmation required
        router.push('/auth/verify-email');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchUserProfile]);

  const refreshUser = useCallback(async () => {
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  }, [checkAuthStatus]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const supabaseClient = supabase();
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser,
    resetPassword,
  };
}
