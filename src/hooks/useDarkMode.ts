import { useSyncExternalStore, useCallback, useEffect } from 'react';

// ── Shared dark mode store ──────────────────────────────────
// Uses useSyncExternalStore so that ALL components consuming
// this hook share the SAME state (Header, Layout, etc.)
// Without this, each useState creates an independent copy
// and toggling in Header wouldn't update Layout's ConfigProvider.

let _isDark = (() => {
  try {
    const saved = localStorage.getItem('theme');
    return (
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  } catch {
    return false;
  }
})();

const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((fn) => fn());
}

function _subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function _getSnapshot() {
  return _isDark;
}

function _setDark(value: boolean) {
  if (_isDark === value) return;
  _isDark = value;

  // Sync DOM
  document.documentElement.classList.add('theme-transition');

  if (value) {
    document.documentElement.classList.add('dark', 'dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark', 'dark-theme');
    localStorage.setItem('theme', 'light');
  }

  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 300);

  _notify();
}

// Apply initial DOM state immediately
if (typeof document !== 'undefined') {
  if (_isDark) {
    document.documentElement.classList.add('dark', 'dark-theme');
  } else {
    document.documentElement.classList.remove('dark', 'dark-theme');
  }
}

// ── Hook ─────────────────────────────────────────────────────
export function useDarkMode() {
  const isDark = useSyncExternalStore(_subscribe, _getSnapshot);

  const toggleDarkMode = useCallback((dark?: boolean) => {
    const newValue = dark !== undefined ? dark : !isDark;
    _setDark(newValue);
  }, [isDark]);


  // System preference change listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        _setDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return [isDark, toggleDarkMode] as const;
}
