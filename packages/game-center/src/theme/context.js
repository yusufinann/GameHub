import React, { createContext, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './index';

// Create a context for theme management
export const ThemeContext = createContext({
  mode: 'light',
  toggle: () => {},
  setSpecificTheme: () => {}
});

export const AppThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'light'
  const [mode, setMode] = useState(() => { return localStorage.getItem('themeMode') || 'light';   });

  // Create the theme object based on the current mode
  const theme = useMemo(() => buildTheme(mode), [mode]);

  // Toggle between light and dark mode
  const toggle = useCallback(() => {
    setMode((prev) => {

      if (prev === 'neonOcean') {
        localStorage.setItem('themeMode', 'light');
        return 'light';
      }
      // Otherwise toggle between light and dark
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  }, []);

  const setSpecificTheme = useCallback((themeName) => {
    if (['light', 'dark', 'neonOcean'].includes(themeName)) {
      localStorage.setItem('themeMode', themeName);
      setMode(themeName);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggle, setSpecificTheme }}>
      <MuiProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiProvider>
    </ThemeContext.Provider>
  );
};