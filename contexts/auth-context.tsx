//@ts-nocheck
// @/contexts/auth-context.tsx
'use client';

import { authApi } from '@/lib/api/auth';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type UserRole = 'seeker' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Improved auth check with better error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const token = Cookies.get('token');

        if (!token) {
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }

        // Verify token with server
        const userData = await authApi.getProfile();

        if (userData) {
          setUser(userData);
          // Refresh token with better settings
          Cookies.set('token', token, {
            expires: 70,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        } else {
          // Invalid token, remove it
          Cookies.remove('token', { path: '/' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't immediately remove token on network error
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        // Only remove token if it's actually invalid (401/403)
        if (
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('Unauthorized')
        ) {
          Cookies.remove('token', { path: '/' });
          setUser(null);
        }
        // For network errors, keep the token and user state
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const validateToken = async () => {
      try {
        await authApi.getProfile();
      } catch (error) {
        console.error('Token validation failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        if (
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('Unauthorized')
        ) {
          logout();
        }
      }
    };

    const interval = setInterval(validateToken, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      // Set cookie with improved settings
      Cookies.set('token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      setUser(response.user);
      toast.success('Welcome Back!');
      router.push('/');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Login Failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);

      toast.success('Account Created Successfully! Please Login To Continue.');
      router.push('/auth/login');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Registration Failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    setUser(null);
    setAuthChecked(false);
    router.push('/');
    toast.success('Logged Out Successfully');
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
