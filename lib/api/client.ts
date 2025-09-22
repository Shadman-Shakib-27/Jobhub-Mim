// @/lib/api/client.ts
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    // Try multiple ways to get token
    const cookieToken = Cookies.get('token');
    
    if (cookieToken) {
      return cookieToken;
    }
    
    // Fallback: check localStorage (for debugging)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    
    return null;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token with better error handling
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        // Add cache control for fresh data
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers,
      },
      // Disable caching for API calls
      cache: 'no-store',
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      if (token) {
        console.log('Token present:', token.substring(0, 10) + '...');
      } else {
        console.warn('No token found for API request');
      }

      const response = await fetch(url, config);

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Don't throw on 401 - let auth context handle it
        if (response.status === 401) {
          console.warn('Unauthorized request - token may be invalid');
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('API Response Data:', data);
        return data;
      } else {
        return {} as T;
      }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check if the server is running');
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);