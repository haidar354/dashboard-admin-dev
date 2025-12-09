import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      isDark: Appearance.getColorScheme() === 'dark',

      setMode: (mode: ThemeMode) => {
        let isDark = false;
        if (mode === 'system') {
          isDark = Appearance.getColorScheme() === 'dark';
        } else {
          isDark = mode === 'dark';
        }
        set({ mode, isDark });
      },

      toggleTheme: () => {
        const { mode, isDark } = get();
        if (mode === 'system') {
          set({ mode: 'light', isDark: false });
        } else if (mode === 'light') {
          set({ mode: 'dark', isDark: true });
        } else {
          set({ mode: 'system', isDark: Appearance.getColorScheme() === 'dark' });
        }
      },

      initializeTheme: () => {
        const { mode } = get();
        let isDark = false;
        if (mode === 'system') {
          isDark = Appearance.getColorScheme() === 'dark';
        } else {
          isDark = mode === 'dark';
        }
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
