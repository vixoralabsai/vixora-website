import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Vixora Digital Hub uses a fixed light corporate theme.
  // Previous saved dark preferences are intentionally migrated to light.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('light-theme');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('vixora_theme', 'light');
  }, []);

  // Kept for component compatibility; the public Vixora theme is light-only.
  const toggleTheme = () => setThemeState('light');
  const setTheme = () => setThemeState('light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
