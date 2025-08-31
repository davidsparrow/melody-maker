import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types/api';

interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('melody_magic_auth_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // TODO: Validate token with backend
      // For now, just check if token exists
      const userProfile = localStorage.getItem('melody_magic_user_profile');
      if (userProfile) {
        setUser(JSON.parse(userProfile));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement actual login logic with backend
      // For now, simulate login
      const mockUser: UserProfile = {
        id: 'user-1',
        email,
        plan: 'free',
        credits: 10,
        createdAt: new Date().toISOString(),
      };

      // Store auth data
      localStorage.setItem('melody_magic_auth_token', 'mock-token');
      localStorage.setItem('melody_magic_user_profile', JSON.stringify(mockUser));
      
      setUser(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Clear auth data
      localStorage.removeItem('melody_magic_auth_token');
      localStorage.removeItem('melody_magic_user_profile');
      
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement actual signup logic with backend
      // For now, simulate signup
      const mockUser: UserProfile = {
        id: 'user-1',
        email,
        plan: 'free',
        credits: 10,
        createdAt: new Date().toISOString(),
      };

      // Store auth data
      localStorage.setItem('melody_magic_auth_token', 'mock-token');
      localStorage.setItem('melody_magic_user_profile', JSON.stringify(mockUser));
      
      setUser(mockUser);
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      // TODO: Implement actual user refresh logic
      await checkAuthStatus();
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  }, [checkAuthStatus]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    refreshUser,
  };
}
