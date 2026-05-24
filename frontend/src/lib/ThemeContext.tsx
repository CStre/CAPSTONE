/* eslint-disable react-refresh/only-export-components -- Provider and hook are intentionally co-located */
/**
 * @fileoverview Theme context — dark / light palette switcher.
 *
 * Applies `data-theme` to <html> immediately (before the next React paint)
 * so the CSS variable swap happens synchronously.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => undefined,
});

const STORAGE_KEY = 'bba-theme';

function applyTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t);
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const t: Theme = saved === 'light' ? 'light' : 'dark';
    applyTheme(t);
    return t;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
