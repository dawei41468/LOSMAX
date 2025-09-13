import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}
import { refreshToken } from './auth';
import type { Goal, GoalStatus, CreateGoalPayload, UpdateGoalPayload } from '../types/goals'; // Added Goal types
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/tasks'; // Added Task types
import { AUTH_ROUTE } from '../routes/constants';


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

// Note: Authorization header is injected by the request interceptor below.

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
        // Refresh failed - clear tokens and redirect to auth with returnTo, avoid redirect loop
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');

        try {
          const currentPath = window.location.pathname + window.location.search + window.location.hash;
          // If we are already on the auth route, do not attempt to redirect again
          if (window.location.pathname !== AUTH_ROUTE) {
            const returnTo = encodeURIComponent(currentPath);
            window.location.href = `${AUTH_ROUTE}?returnTo=${returnTo}`;
          }
        } catch {
          // Fallback: best-effort redirect to auth route
          window.location.href = AUTH_ROUTE;
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export async function getGoals(status?: GoalStatus): Promise<Goal[]> {
  let url = `/goals/`;
  if (status) {
    url += `?status=${status}`;
  }
  const response = await api.get(url);
  return response.data as Goal[];
}

export async function createGoal(goalData: CreateGoalPayload): Promise<Goal> {
  const response = await api.post('/goals/', goalData);
  return response.data as Goal;
}

export async function updateGoal(goalId: string, goalData: UpdateGoalPayload): Promise<Goal> {
  const response = await api.put(`/goals/${goalId}`, goalData);
  return response.data as Goal;
}

export async function deleteGoal(goalId: string): Promise<void> {
  await api.delete(`/goals/${goalId}`);
}

// Task-related API endpoints
export async function getTasks(status?: 'completed' | 'incomplete', filter?: 'today' | 'all'): Promise<Task[]> {
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
  const response = await api.get(url);
  const rawData = response.data;
  const tasks = rawData.map((task: { _id?: string; id?: string; [key: string]: unknown }) => ({
    ...task,
    id: task._id || task.id
  })) as Task[];
  return tasks;
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  const response = await api.post('/tasks/', taskData);
  return response.data as Task;
}
export async function updateTask(taskId: string, taskData: UpdateTaskPayload): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}