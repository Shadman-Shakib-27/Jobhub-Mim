import { api } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'seeker' | 'employer';
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'seeker' | 'employer' | 'admin';
    avatar?: string;
    companyName?: string;
    isVerified: boolean;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return api.post('/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return api.post('/auth/register', data);
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  updateProfile: async (data: any) => {
    return api.put('/auth/profile', data);
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },
};