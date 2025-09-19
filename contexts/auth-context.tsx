'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api/auth';
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
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      Cookies.set('token', response.token, { expires: 7 });
      setUser(response.user);
      
      toast.success('Welcome Back!');
      
      // Redirect to homepage after login
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
      
      // Option 1: Registration এর পর token set না করে শুধু success message দিন
      // এবং login page এ redirect করুন
      toast.success('Account Created Successfully! Please Login To Continue.');
      
      // Redirect to login page after registration
      router.push('/auth/login');
      return true;

      /* Option 2: যদি registration এর পর automatic login করতে চান
      Cookies.set('token', response.token, { expires: 7 });
      setUser(response.user);
      
      toast.success('Welcome! Your account has been created successfully.');
      
      // Role based redirect
      if (response.user.role === 'employer') {
        router.push('/employer/dashboard');
      } else if (response.user.role === 'seeker') {
        router.push('/seeker/dashboard');
      } else {
        router.push('/');
      }
      return true;
      */
      
    } catch (error: any) {
      toast.error(error.message || 'Registration Failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/');
    toast.success('Logged Out Successfully');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
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