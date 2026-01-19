# 🔗 Integration Guide - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** Senior Backend Engineer  

---

## 🎯 Overview

This guide provides comprehensive instructions for integrating the frontend application with the backend APIs, authentication system, and AI services. All integrations follow the architecture defined by the Technical Leader.

---

## 🔐 Authentication Integration

### Frontend Authentication Flow

#### 1. Login Integration
```typescript
// services/authIntegration.ts
import { AuthService } from '../services/enhancedAuthService';

export const loginIntegration = async (email: string, password: string) => {
  try {
    const result = await AuthService.login(
      email, 
      password,
      // Get client IP and user agent
      getClientIP(),
      navigator.userAgent
    );
    
    if (result.success) {
      // Store token in secure storage
      localStorage.setItem('auth-token', result.token);
      sessionStorage.setItem('user-session', JSON.stringify(result.user));
      
      // Update application state
      updateAuthState(result.user);
      
      return { success: true, user: result.user };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: 'Authentication service unavailable' };
  }
};

// Get client IP (you'll need to implement this)
const getClientIP = async (): Promise<string> => {
  // Implementation depends on your setup
  // Could use external service or server-side header
  return '127.0.0.1';
};
```

#### 2. Token Management
```typescript
// hooks/useAuthInterceptor.ts
import { useEffect } from 'react';

export const useAuthInterceptor = () => {
  useEffect(() => {
    // Add auth token to all requests
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refresh-token');
          if (refreshToken) {
            try {
              const newToken = await refreshAuthToken(refreshToken);
              localStorage.setItem('auth-token', newToken);
              // Retry original request
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios.request(error.config);
            } catch (refreshError) {
              // Refresh failed, logout
              logoutUser();
            }
          } else {
            logoutUser();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);
};
```

#### 3. Protected Route Wrapper
```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'viewer' | 'editor' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user && !hasRole(user, requiredRole)) {
    return <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p>You don't have permission to access this resource.</p>
    </div>;
  }
  
  return <>{children}</>;
};
```

---

## 📡 API Integration

### Base API Configuration
```typescript
// services/apiClient.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Tasks API Integration
```typescript
// services/taskService.ts
import { apiClient } from './apiClient';
import type { Card } from '../types';

export interface TaskFilters {
  status?: string;
  sprint_id?: string;
  user_id?: string;
  urgente?: boolean;
  limit?: number;
  offset?: number;
}

export class TaskService {
  static async getTasks(filters: TaskFilters = {}): Promise<Card[]> {
    try {
      const response = await apiClient.get('/api/tasks', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw new Error('Unable to load tasks');
    }
  }

  static async createTask(taskData: Partial<Card>): Promise<Card> {
    try {
      const response = await apiClient.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('Unable to create task');
    }
  }

  static async updateTask(id: string, taskData: Partial<Card>): Promise<Card> {
    try {
      // Include version for optimistic locking
      const response = await apiClient.patch(`/api/tasks/${id}`, {
        ...taskData,
        version: taskData.version
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Handle conflict - version mismatch
        throw new Error('Task was modified by another user. Please refresh and try again.');
      }
      console.error('Failed to update task:', error);
      throw new Error('Unable to update task');
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/tasks/${id}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw new Error('Unable to delete task');
    }
  }
}
```

### Sprint API Integration
```typescript
// services/sprintService.ts
import { apiClient } from './apiClient';

export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  team_id?: string;
  velocity_goal?: number;
}

export class SprintService {
  static async getSprints(activeOnly: boolean = false): Promise<Sprint[]> {
    try {
      const response = await apiClient.get('/api/sprints', {
        params: { active_only: activeOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
      throw new Error('Unable to load sprints');
    }
  }

  static async getSprintDetails(id: string): Promise<Sprint & { tasks: any[] }> {
    try {
      const response = await apiClient.get(`/api/sprints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sprint details:', error);
      throw new Error('Unable to load sprint details');
    }
  }

  static async createSprint(sprintData: Partial<Sprint>): Promise<Sprint> {
    try {
      const response = await apiClient.post('/api/sprints', sprintData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sprint:', error);
      throw new Error('Unable to create sprint');
    }
  }
}
```

### Audit Log Integration
```typescript
// services/auditService.ts
import { apiClient } from './apiClient';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export class AuditService {
  static async getAuditLogs(filters: {
    card_id?: string;
    user_id?: string;
    action_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AuditLog[]> {
    try {
      // Only admins can access audit logs
      const response = await apiClient.get('/api/audit-logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw new Error('Unable to load audit logs');
    }
  }

  // Function to create audit logs (used internally by backend)
  static async createAuditLog(logData: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    try {
      await apiClient.post('/api/internal/audit-logs', logData);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error for audit logs to avoid breaking main functionality
    }
  }
}
```

---

## 🤖 AI Service Integration

### AI Suggestions Hook
```typescript
// hooks/useAISuggestions.ts
import { useState, useCallback } from 'react';
import { EnhancedAIService } from '../services/enhancedAIService';

interface AISuggestionHook {
  suggestions: any;
  isLoading: boolean;
  error: string | null;
  generateSuggestions: (taskText: string, context?: any) => Promise<void>;
}

export const useAISuggestions = (): AISuggestionHook => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (taskText: string, context?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const aiService = EnhancedAIService.getInstance(); // Assuming singleton pattern
      const result = await aiService.generateTaskSuggestions(taskText, context);
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    generateSuggestions
  };
};
```

### AI Integration in Task Creation
```typescript
// components/CreateTaskWithAI.tsx
import { useAISuggestions } from '../hooks/useAISuggestions';
import { TaskService } from '../services/taskService';

interface CreateTaskForm {
  title: string;
  description: string;
  status: string;
  // ... other fields
}

export const CreateTaskWithAI: React.FC = () => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    status: 'backlog'
  });
  
  const {
    suggestions,
    isLoading: isGenerating,
    error: aiError,
    generateSuggestions
  } = useAISuggestions();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));
    
    // Auto-generate suggestions when title reaches certain length
    if (title.length > 10) {
      generateSuggestions(title, {
        projectContext: 'Agenda-QA Kanban',
        teamSize: 5
      });
    }
  };

  const handleApplySuggestions = () => {
    if (suggestions) {
      setFormData(prev => ({
        ...prev,
        description: suggestions.subtasks.join('\n'),
        tags: suggestions.tags
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTask = await TaskService.createTask({
        titulo: formData.title,
        descricao: formData.description,
        status: formData.status,
        tags: formData.tags
      });
      
      // Reset form and show success
      setFormData({ title: '', description: '', status: 'backlog' });
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title">Task Title</label>
        <input
          id="title"
          value={formData.title}
          onChange={handleTitleChange}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {isGenerating && (
        <div className="text-blue-600">Generating AI suggestions...</div>
      )}
      
      {aiError && (
        <div className="text-red-600">{aiError}</div>
      )}
      
      {suggestions && (
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">AI Suggestions</h3>
          <div className="space-y-2">
            <div>
              <strong>Subtasks:</strong>
              <ul className="list-disc ml-5">
                {suggestions.subtasks.map((task: string, index: number) => (
                  <li key={index}>{task}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Tags:</strong> {suggestions.tags.join(', ')}
            </div>
            <div>
              <strong>Priority:</strong> {suggestions.priority}
            </div>
            <button
              type="button"
              onClick={handleApplySuggestions}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Apply Suggestions
            </button>
          </div>
        </div>
      )}
      
      {/* Rest of form */}
    </form>
  );
};
```

---

## 🔄 Real-time Integration

### Supabase Real-time Setup
```typescript
// services/realtimeService.ts
import { supabase } from './supabaseClient';

export class RealtimeService {
  private channels: Map<string, any> = new Map();

  subscribeToTasks(callback: (payload: any) => void) {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cards'
      }, callback)
      .subscribe();

    this.channels.set('tasks', channel);
    return channel;
  }

  subscribeToSprints(callback: (payload: any) => void) {
    const channel = supabase
      .channel('sprints-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sprints'
      }, callback)
      .subscribe();

    this.channels.set('sprints', channel);
    return channel;
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();
```

### Using Real-time in Components
```typescript
// hooks/useRealtimeTasks.ts
import { useEffect, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import { TaskService } from '../services/taskService';

export const useRealtimeTasks = (initialTasks: any[]) => {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    const channel = realtimeService.subscribeToTasks((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          setTasks(prev => [...prev, newRecord]);
          break;
        case 'UPDATE':
          setTasks(prev => 
            prev.map(task => task.id === newRecord.id ? newRecord : task)
          );
          break;
        case 'DELETE':
          setTasks(prev => prev.filter(task => task.id !== oldRecord.id));
          break;
      }
    });

    // Cleanup subscription
    return () => {
      realtimeService.unsubscribe('tasks');
    };
  }, []);

  return tasks;
};
```

---

## ⚠️ Error Handling Strategy

### Global Error Handler
```typescript
// services/errorHandler.ts
export class ErrorHandler {
  static handleAPIError(error: any): { message: string; shouldRetry: boolean } {
    if (!error.response) {
      // Network error
      return {
        message: 'Network connection failed. Please check your internet.',
        shouldRetry: true
      };
    }

    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    switch (status) {
      case 400:
        return {
          message: `Bad request: ${message}`,
          shouldRetry: false
        };
      case 401:
        // Trigger logout
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
        return {
          message: 'Session expired. Please log in again.',
          shouldRetry: false
        };
      case 403:
        return {
          message: 'Access denied. You don\'t have permission for this action.',
          shouldRetry: false
        };
      case 404:
        return {
          message: 'Resource not found.',
          shouldRetry: false
        };
      case 409:
        return {
          message: 'Conflict detected. Data may have been modified by another user.',
          shouldRetry: false
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          shouldRetry: true
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: 'Server error. Please try again later.',
          shouldRetry: true
        };
      default:
        return {
          message: `Unexpected error (${status}): ${message}`,
          shouldRetry: true
        };
    }
  }

  static showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    // Integration with your toast system
    console.log(`[${type.toUpperCase()}] ${message}`);
    // toast[type](message); // If using react-toastify
  }
}
```

### Retry Logic Hook
```typescript
// hooks/useRetry.ts
import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  exponentialBackoff?: boolean;
}

export const useRetry = <T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const { maxRetries = 3, delay = 1000, exponentialBackoff = true } = options;

  const executeWithRetry = useCallback(async (): Promise<T | null> => {
    let currentRetry = 0;
    
    while (currentRetry <= maxRetries) {
      try {
        setIsRetrying(true);
        const result = await asyncFunction();
        setIsRetrying(false);
        setRetryCount(currentRetry);
        setLastError(null);
        return result;
      } catch (error) {
        currentRetry++;
        setLastError(error as Error);
        
        if (currentRetry > maxRetries) {
          setIsRetrying(false);
          setRetryCount(currentRetry);
          throw error;
        }
        
        // Calculate delay
        const actualDelay = exponentialBackoff 
          ? delay * Math.pow(2, currentRetry - 1)
          : delay;
        
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
    
    return null;
  }, [asyncFunction, maxRetries, delay, exponentialBackoff]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    lastError,
    reset
  };
};
```

---

## 📊 Performance Optimization

### API Caching Strategy
```typescript
// services/cacheService.ts
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  invalidate(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
```

### Optimized Data Fetching Hook
```typescript
// hooks/useOptimizedFetch.ts
import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../services/cacheService';
import { useRetry } from './useRetry';

interface FetchOptions {
  cacheKey?: string;
  cacheTTL?: number;
  enabled?: boolean;
  dependencies?: any[];
}

export const useOptimizedFetch = <T>(
  fetchFunction: () => Promise<T>,
  options: FetchOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cacheKey, cacheTTL = 300000, enabled = true, dependencies = [] } = options;
  
  const { executeWithRetry, isRetrying, lastError, reset } = useRetry(fetchFunction, {
    maxRetries: 2,
    delay: 1000
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    reset();
    
    try {
      // Check cache first
      let result: T | null = null;
      
      if (cacheKey) {
        result = cacheService.get(cacheKey);
      }
      
      if (!result) {
        result = await executeWithRetry();
        
        // Cache the result
        if (cacheKey && result) {
          cacheService.set(cacheKey, result, cacheTTL);
        }
      }
      
      setData(result);
    } catch (err) {
      const errorMessage = lastError?.message || 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, cacheKey, cacheTTL, executeWithRetry, lastError, reset, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      cacheService.invalidate(cacheKey);
    }
  }, [cacheKey]);

  return {
    data,
    isLoading: isLoading || isRetrying,
    error,
    refetch: fetchData,
    invalidateCache
  };
};
```

---

## 🔒 Security Best Practices

### Input Sanitization
```typescript
// utils/inputSanitizer.ts
export class InputSanitizer {
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .substring(0, 1000); // Limit length
  }

  static sanitizeRichText(input: string): string {
    if (!input) return '';
    
    // Allow safe HTML tags for rich text
    const allowedTags = /<(?!\/?(b|i|u|strong|em|br|p|ul|ol|li|blockquote)\b)[^>]*>/gi;
    return input
      .replace(allowedTags, '')
      .substring(0, 5000);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}
```

### CSRF Protection
```typescript
// services/csrfProtection.ts
class CSRFProtection {
  private static token: string | null = null;

  static async getCSRFToken(): Promise<string> {
    if (!this.token) {
      // Fetch from server
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      this.token = data.csrfToken;
    }
    return this.token;
  }

  static async refreshCSRFToken(): Promise<void> {
    this.token = null;
    await this.getCSRFToken();
  }
}

// Use in forms
export const useCSRFToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    CSRFProtection.getCSRFToken().then(setToken);
  }, []);

  return token;
};
```

---

## 🧪 Testing Integration Points

### API Mock Service
```typescript
// services/mockApiService.ts
export class MockApiService {
  static mockTasks = [
    {
      id: '1',
      titulo: 'Setup project structure',
      descricao: 'Create folder structure and basic files',
      status: 'em-progresso',
      created_by: 'user1',
      responsavel: ['john@example.com'],
      urgente: false,
      tags: ['setup', 'infrastructure']
    }
  ];

  static async getTasks(): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockTasks;
  }

  static async createTask(taskData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTask = {
      ...taskData,
      id: (this.mockTasks.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    this.mockTasks.push(newTask);
    return newTask;
  }
}
```

### Integration Test Examples
```typescript
// __tests__/integration/api.integration.test.ts
import { TaskService } from '../../services/taskService';
import { MockApiService } from '../../services/mockApiService';

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Setup mock data or interceptors
  });

  test('should fetch tasks successfully', async () => {
    const tasks = await TaskService.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  test('should create task with proper validation', async () => {
    const taskData = {
      titulo: 'Test Task',
      descricao: 'Test Description',
      status: 'backlog'
    };

    const createdTask = await TaskService.createTask(taskData);
    
    expect(createdTask.titulo).toBe(taskData.titulo);
    expect(createdTask.status).toBe(taskData.status);
    expect(createdTask.id).toBeDefined();
  });

  test('should handle authentication errors gracefully', async () => {
    // Test with invalid token
    localStorage.setItem('auth-token', 'invalid-token');
    
    await expect(TaskService.getTasks()).rejects.toThrow();
  });
});
```

---

## 🚀 Deployment Considerations

### Environment Configuration
```typescript
// config/environment.ts
export interface EnvironmentConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  googleAiApiKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs: Record<string, EnvironmentConfig> = {
    development: {
      apiUrl: 'http://localhost:3000',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL!,
      supabaseKey: process.env.REACT_APP_SUPABASE_KEY!,
      googleAiApiKey: process.env.REACT_APP_GOOGLE_AI_API_KEY!,
      isDevelopment: true,
      isProduction: false
    },
    production: {
      apiUrl: 'https://api.agenda-qa.com',
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL!,
      supabaseKey: process.env.REACT_APP_SUPABASE_KEY!,
      googleAiApiKey: process.env.REACT_APP_GOOGLE_AI_API_KEY!,
      isDevelopment: false,
      isProduction: true
    }
  };

  return configs[env] || configs.development;
};

export const config = getConfig();
```

### Health Check Integration
```typescript
// services/healthCheckService.ts
import { apiClient } from './apiClient';

export class HealthCheckService {
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/health/database');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async checkAIHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/health/ai');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
```

---

*Integration Guide - Maintained by Senior Backend Engineer*  
*Last Updated: 2026-01-17*