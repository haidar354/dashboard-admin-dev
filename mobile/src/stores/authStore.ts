import { create } from 'zustand';
import { authService, User, AuthResponse } from '../services/auth';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  permissions: string[];
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  permissions: [],
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({
        isAuthenticated: true,
        user: response.user,
        permissions: response.permissions,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        permissions: [],
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getMe();
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
