import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
import { refreshToken } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Request interceptor to attach auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    const tokenExpiry = localStorage.getItem('token_expiry');
    const now = new Date().getTime();
    
    // Only attempt refresh if:
    // 1. Status is 401 (Unauthorized)
    // 2. Token is expired or will expire within 5 minutes
    // 3. Not already a refresh request
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const extendedRequest = originalRequest as ExtendedAxiosRequestConfig;
    
    if (error.response?.status === 401 &&
        tokenExpiry &&
        (now > parseInt(tokenExpiry) - 300000) &&
        !extendedRequest._retry) {
      
      extendedRequest._retry = true;
      try {
        await refreshToken();
        return api(extendedRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Basic API client function for registration
 * Returns raw API response without auth state handling
 * For auth-specific logic, use auth.ts register()
 */
export async function register(email: string, password: string, name: string) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return await response.json();
}

/**
 * Basic API client function for logout
 * Returns raw API response without auth state handling
 * For auth-specific logic, use auth.ts logout()
 */
export async function logout() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return await response.json();
}

/**
 * Basic API client function for login
 * Returns raw API response without auth state handling
 * For auth-specific logic, use auth.ts login()
 */
export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return await response.json();
}

export async function getGoals() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/goals`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }

  return await response.json();
}

export async function createGoal(goalData: { title: string; description?: string; category: string }) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create goal');
  }

  return await response.json();
}