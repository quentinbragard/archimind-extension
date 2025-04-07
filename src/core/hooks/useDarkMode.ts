// src/core/hooks/useDarkMode.ts

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { emitEvent, AppEvent } from '../events/events';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook to manage dark mode
 */
export function useDarkMode(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeInStorage] = useLocalStorage<Theme>('jaydai-theme', 'system');
  
  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing classes
    root.classList.remove('light', 'dark');
    
    // Add appropriate class
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = () => {
      const root = window.document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);
  
  // Set theme with event emission
  const setTheme = (newTheme: Theme) => {
    setThemeInStorage(newTheme);
    emitEvent(AppEvent.UI_THEME_CHANGED, { theme: newTheme });
  };
  
  return [theme, setTheme];
}