import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
import { refreshToken } from './auth';
import type { Goal, GoalCategory, GoalStatus } from '../types/goals'; // Added Goal types

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
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }

  return await response.json();
}
/**
 * Admin API method to list users with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with paginated user data
 */
export async function listUsers(page = 1, limit = 10) {
  const response = await api.get('/admin/users', {
    params: { page, limit },
    headers: getAuthHeaders()
  });
  return response.data;
}

/**
 * Admin API method to delete a user
 * @param userId - ID of user to delete
 * @returns Promise with deletion result
 */
export async function deleteUser(userId: string) {
  const response = await api.delete(`/admin/users/${userId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
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

export async function getGoals(status?: GoalStatus): Promise<Goal[]> {
  let url = `/goals/`;
  if (status) {
    url += `?status=${status}`;
  }
  console.log('Fetching goals from URL:', url);
  try {
    const response = await api.get(url);
    console.log('Received goals data:', response.data);
    return response.data as Goal[];
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: GoalCategory;
  target_date: string; // ISO string
  status?: GoalStatus; // Optional, backend defaults to active
}

export async function createGoal(goalData: CreateGoalPayload): Promise<Goal> {
  const response = await api.post('/goals/', goalData);
  return response.data as Goal;
}

export type UpdateGoalPayload = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining'>>;

export async function updateGoal(goalId: string, goalData: UpdateGoalPayload): Promise<Goal> {
  const response = await api.put(`/goals/${goalId}`, goalData);
  return response.data as Goal;
}

export async function deleteGoal(goalId: string): Promise<void> {
  await api.delete(`/goals/${goalId}`);
}

// Task-related API endpoints
export interface Task {
  id: string;
  user_id: string;
  goal_id: string; // Tasks are tied to a specific goal
  title: string;
  status: 'pending' | 'complete' | 'incomplete'; // Updated status options
  created_at: string; // ISO string
}

export async function getTasks(status?: 'pending' | 'complete' | 'incomplete', filter?: 'today' | 'all'): Promise<Task[]> {
  let url = `/tasks/`;
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  if (filter) {
    params.append('filter', filter);
  }
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  console.log('Fetching tasks from URL:', url);
  try {
    const response = await api.get(url);
    console.log('Received tasks data:', response.data);
    const rawData = response.data;
    const tasks = rawData.map((task: { _id?: string; id?: string; [key: string]: unknown }) => ({
      ...task,
      id: task._id || task.id
    })) as Task[];
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export interface CreateTaskPayload {
  title: string;
  goal_id: string; // Required, as tasks must be tied to a goal
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  const response = await api.post('/tasks/', taskData);
  return response.data as Task;
}

export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'user_id' | 'goal_id' | 'created_at'>>;

export async function updateTask(taskId: string, taskData: UpdateTaskPayload): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}