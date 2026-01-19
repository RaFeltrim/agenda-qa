# 🧠 State Management Architecture - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** Senior Frontend Engineer  

---

## 🏗️ Architecture Overview

Following the Technical Leader's decision to use **Context API + Custom Hooks** instead of Redux/Zustand for this medium-sized application.

### Why Context API?
- ✅ **Lightweight:** No external dependencies (3KB vs 50KB+ for Redux)
- ✅ **Built-in:** Part of React core
- ✅ **TypeScript Friendly:** Excellent type inference
- ✅ **Learning Curve:** Minimal for team adoption
- ✅ **Performance:** Sufficient for < 500 components

### State Management Layers

```
Global State (Context API)
├── Authentication State
├── Kanban Board State  
├── Sprint Management State
├── UI State (theme, sidebar, modals)
└── User Preferences

Local Component State
├── Form inputs
├── Temporary UI states
└── Component-specific data

Server State (SWR)
├── API data caching
├── Real-time updates
└── Offline synchronization
```

---

## 🌐 Global State with Context API

### AppContext Implementation

```tsx
// contexts/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Card, Sprint } from '../types';

// State Interface
export interface AppState {
  // Kanban Data
  cards: Card[];
  sprints: Sprint[];
  activeSprintId: string | null;
  
  // UI State
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  currentView: 'board' | 'dashboard' | 'analytics';
  
  // Loading States
  isLoading: {
    cards: boolean;
    sprints: boolean;
    initialData: boolean;
  };
  
  // Error States
  errors: {
    cards: string | null;
    sprints: string | null;
    general: string | null;
  };
}

// Action Types
export type AppAction =
  // Card Actions
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; newStatus: string } }
  
  // Sprint Actions
  | { type: 'SET_SPRINTS'; payload: Sprint[] }
  | { type: 'SET_ACTIVE_SPRINT'; payload: string | null }
  | { type: 'ADD_SPRINT'; payload: Sprint }
  | { type: 'UPDATE_SPRINT'; payload: Sprint }
  
  // UI Actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  
  // Loading Actions
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['isLoading']; value: boolean } }
  
  // Error Actions
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }
  | { type: 'CLEAR_ERRORS' };

// Initial State
const initialState: AppState = {
  cards: [],
  sprints: [],
  activeSprintId: null,
  
  isSidebarOpen: true,
  isDarkMode: false,
  currentView: 'board',
  
  isLoading: {
    cards: false,
    sprints: false,
    initialData: false
  },
  
  errors: {
    cards: null,
    sprints: null,
    general: null
  }
};

// Reducer Function
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Card Management
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.payload,
        isLoading: { ...state.isLoading, cards: false },
        errors: { ...state.errors, cards: null }
      };
      
    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.payload]
      };
      
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.id ? action.payload : card
        )
      };
      
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
      
    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map(card => 
          card.id === action.payload.cardId
            ? { ...card, status: action.payload.newStatus, updated_at: new Date().toISOString() }
            : card
        )
      };
      
    // Sprint Management
    case 'SET_SPRINTS':
      return {
        ...state,
        sprints: action.payload,
        isLoading: { ...state.isLoading, sprints: false }
      };
      
    case 'SET_ACTIVE_SPRINT':
      return {
        ...state,
        activeSprintId: action.payload
      };
      
    // UI State
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen
      };
      
    case 'SET_DARK_MODE':
      return {
        ...state,
        isDarkMode: action.payload
      };
      
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
      
    // Loading States
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: {
          ...state.isLoading,
          [action.payload.key]: action.payload.value
        }
      };
      
    // Error Handling
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value
        }
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: initialState.errors
      };
      
    default:
      return state;
  }
};

// Context Creation
interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Persist dark mode preference
  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('dark-mode') === 'true';
    if (savedDarkMode !== state.isDarkMode) {
      dispatch({ type: 'SET_DARK_MODE', payload: savedDarkMode });
    }
  }, []);
  
  React.useEffect(() => {
    localStorage.setItem('dark-mode', state.isDarkMode.toString());
  }, [state.isDarkMode]);
  
  // Persist sidebar state
  React.useEffect(() => {
    const savedSidebar = localStorage.getItem('sidebar-open') === 'true';
    if (savedSidebar !== state.isSidebarOpen) {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }
  }, []);
  
  React.useEffect(() => {
    localStorage.setItem('sidebar-open', state.isSidebarOpen.toString());
  }, [state.isSidebarOpen]);
  
  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

---

## 🎣 Custom Hooks for State Logic

### 1. useStorage Hook
```tsx
// hooks/useStorage.ts
import { useState, useEffect } from 'react';

export function useStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 2. useOptimisticUpdate Hook
```tsx
// hooks/useOptimisticUpdate.ts
import { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface OptimisticUpdateOptions<T> {
  mutationFn: (data: T) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
}

export function useOptimisticUpdate<T>(
  key: string,
  options: OptimisticUpdateOptions<T>
) {
  const { dispatch } = useAppContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (newData: T) => {
    setIsPending(true);
    setError(null);
    
    // Get current state for rollback
    // This would depend on your specific state structure
    const rollbackData = {} as T; // Store current state here
    
    try {
      // Optimistic update
      // dispatch({ type: 'UPDATE_TEMP', payload: newData });
      
      // Perform actual mutation
      const result = await options.mutationFn(newData);
      
      // Confirm successful update
      // dispatch({ type: 'UPDATE_CONFIRM', payload: result });
      
      options.onSuccess?.(result);
    } catch (err) {
      // Rollback on error
      // dispatch({ type: 'UPDATE_ROLLBACK', payload: rollbackData });
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error, rollbackData);
    } finally {
      setIsPending(false);
    }
  }, [options, dispatch]);

  return {
    mutate,
    isPending,
    error
  };
}
```

### 3. useRealtimeSync Hook
```tsx
// hooks/useRealtimeSync.ts
import { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { realtimeService } from '../services/realtimeService';

export function useRealtimeSync() {
  const { dispatch } = useAppContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    
    isInitialized.current = true;
    
    // Subscribe to real-time updates
    const unsubscribeTasks = realtimeService.subscribeToTasks((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          dispatch({ type: 'ADD_CARD', payload: newRecord });
          break;
        case 'UPDATE':
          dispatch({ type: 'UPDATE_CARD', payload: newRecord });
          break;
        case 'DELETE':
          dispatch({ type: 'DELETE_CARD', payload: oldRecord.id });
          break;
      }
    });
    
    const unsubscribeSprints = realtimeService.subscribeToSprints((payload) => {
      const { eventType, new: newRecord } = payload;
      
      if (eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_SPRINT', payload: newRecord });
      }
    });
    
    // Cleanup subscriptions
    return () => {
      unsubscribeTasks();
      unsubscribeSprints();
      isInitialized.current = false;
    };
  }, [dispatch]);
}
```

---

## 📈 Performance Optimization Strategies

### 1. Selective Context Consumption
```tsx
// hooks/useCards.ts - Only subscribe to cards changes
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../contexts/AppContext';

export const useCards = () => {
  return useContextSelector(AppContext, state => ({
    cards: state.cards,
    isLoading: state.isLoading.cards,
    error: state.errors.cards,
    dispatch: state.dispatch
  }));
};

// Usage in component
const MyComponent = () => {
  const { cards, isLoading, error, dispatch } = useCards();
  // Component only re-renders when cards change, not other state
};
```

### 2. Memoized Selectors
```tsx
// utils/selectors.ts
import { createSelector } from 'reselect';
import type { AppState } from '../contexts/AppContext';

export const selectActiveSprintCards = createSelector(
  [(state: AppState) => state.cards, (state: AppState) => state.activeSprintId],
  (cards, activeSprintId) => 
    cards.filter(card => card.sprint_id === activeSprintId)
);

export const selectCardById = createSelector(
  [(state: AppState) => state.cards, (_, cardId: string) => cardId],
  (cards, cardId) => cards.find(card => card.id === cardId)
);

// Usage
const activeCards = useSelector(selectActiveSprintCards);
```

### 3. Lazy Loading Contexts
```tsx
// contexts/LazyContexts.tsx
import React, { Suspense } from 'react';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';

const LazyProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading providers...</div>}>
      <AuthProvider>
        <AppProvider>
          {children}
        </AppProvider>
      </AuthProvider>
    </Suspense>
  );
};

export default LazyProviders;
```

---

## 🧪 Testing State Management

### Reducer Tests
```tsx
// __tests__/reducers/appReducer.test.ts
import { appReducer, initialState } from '../../contexts/AppContext';

describe('appReducer', () => {
  test('should set cards', () => {
    const cards = [{ id: '1', titulo: 'Test Card' }];
    const action = { type: 'SET_CARDS', payload: cards };
    
    const newState = appReducer(initialState, action);
    
    expect(newState.cards).toEqual(cards);
    expect(newState.isLoading.cards).toBe(false);
    expect(newState.errors.cards).toBeNull();
  });

  test('should add card', () => {
    const newCard = { id: '2', titulo: 'New Card' };
    const action = { type: 'ADD_CARD', payload: newCard };
    
    const stateWithCards = { ...initialState, cards: [{ id: '1', titulo: 'Existing Card' }] };
    const newState = appReducer(stateWithCards, action);
    
    expect(newState.cards).toHaveLength(2);
    expect(newState.cards[1]).toEqual(newCard);
  });

  test('should handle errors', () => {
    const error = 'Network error';
    const action = { type: 'SET_ERROR', payload: { key: 'cards', value: error } };
    
    const newState = appReducer(initialState, action);
    
    expect(newState.errors.cards).toBe(error);
  });
});
```

### Hook Tests
```tsx
// __tests__/hooks/useStorage.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useStorage } from '../../hooks/useStorage';

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should initialize with default value', () => {
    const { result } = renderHook(() => useStorage('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
  });

  test('should persist values to localStorage', () => {
    const { result } = renderHook(() => useStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated-value');
    });
    
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated-value'));
    expect(result.current[0]).toBe('updated-value');
  });

  test('should read existing values from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing-value'));
    
    const { result } = renderHook(() => useStorage('test-key', 'default'));
    
    expect(result.current[0]).toBe('existing-value');
  });
});
```

---

## 📊 State Management Best Practices

### Do's:
✅ **Keep state flat** when possible to avoid deep nesting
✅ **Use TypeScript** for all state interfaces
✅ **Separate concerns** - UI state vs. domain state
✅ **Memoize expensive computations** with useMemo
✅ **Batch updates** when multiple state changes occur
✅ **Clean up subscriptions** in useEffect cleanup functions
✅ **Handle loading states** explicitly
✅ **Provide default values** for all context consumers

### Don'ts:
❌ **Don't put everything in global state** - keep local when appropriate
❌ **Don't mutate state directly** - always create new objects/arrays
❌ **Don't ignore errors** - handle them gracefully
❌ **Don't forget cleanup** - unsubscribe from real-time updates
❌ **Don't over-optimize prematurely** - measure first
❌ **Don't create circular dependencies** between contexts

---

## 🚀 Migration Guide

### From Redux to Context API:
```tsx
// BEFORE (Redux)
const cards = useSelector(state => state.kanban.cards);
const dispatch = useDispatch();
dispatch(addCard(cardData));

// AFTER (Context API)
const { cards, dispatch } = useAppContext();
dispatch({ type: 'ADD_CARD', payload: cardData });
```

### From Class Components to Hooks:
```tsx
// BEFORE (Class Component)
class MyComponent extends Component {
  static contextType = AppContext;
  render() {
    const { cards } = this.context;
    // ...
  }
}

// AFTER (Functional Component)
const MyComponent = () => {
  const { cards } = useAppContext();
  // ...
};
```

---

## 📈 Performance Monitoring

### State Change Tracking:
```tsx
// utils/stateLogger.ts
const stateLogger = (reducer: Reducer) => {
  return (state: any, action: any) => {
    const startTime = performance.now();
    const newState = reducer(state, action);
    const endTime = performance.now();
    
    console.group(`State Update: ${action.type}`);
    console.log('Previous State:', state);
    console.log('Action:', action);
    console.log('New State:', newState);
    console.log('Duration:', endTime - startTime, 'ms');
    console.groupEnd();
    
    return newState;
  };
};

// Usage in development
if (process.env.NODE_ENV === 'development') {
  appReducer = stateLogger(appReducer);
}
```

### Bundle Size Impact:
- **Context API:** ~3KB
- **Custom Hooks:** ~5KB
- **Total State Management:** ~8KB
- **vs Redux Toolkit:** ~50KB+ savings

---

*State Management Documentation - Maintained by Senior Frontend Engineer*  
*Last Updated: 2026-01-17*