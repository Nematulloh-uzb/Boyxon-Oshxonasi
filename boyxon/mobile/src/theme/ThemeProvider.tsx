import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  type Palette,
  type ThemeMode,
  palettes,
  radius,
  shadows,
  spacing,
  typography,
} from './tokens';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows.light;
}

export const THEME_STORAGE_KEY = 'boyxon-theme';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light') setModeState(v);
      })
      .catch(() => undefined);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_STORAGE_KEY, m).catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo<Theme>(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: palettes[mode],
      spacing,
      radius,
      typography,
      shadows: shadows[mode],
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme faqat ThemeProvider ichida ishlaydi');
  return ctx;
}
