/**
 * Theme Slice - Baseado em Flutter ThemeProvider
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/lib/api/client';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: 'system',
  isDark: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    initializeTheme: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
        if (saved) {
          state.mode = saved;
        }
        // Determinar isDark baseado no modo
        if (state.mode === 'system') {
          state.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          state.isDark = state.mode === 'dark';
        }
        // Aplicar classe ao document
        document.documentElement.classList.toggle('dark', state.isDark);
      }
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.THEME, action.payload);
        if (action.payload === 'system') {
          state.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          state.isDark = action.payload === 'dark';
        }
        document.documentElement.classList.toggle('dark', state.isDark);
      }
    },
    toggleTheme: (state) => {
      const newMode = state.isDark ? 'light' : 'dark';
      state.mode = newMode;
      state.isDark = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.THEME, newMode);
        document.documentElement.classList.toggle('dark', state.isDark);
      }
    },
  },
});

export const { initializeTheme, setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
