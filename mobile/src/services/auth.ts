import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  tokenType: string;
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
  user: User;
  permissions: string[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  businessUnitId?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    const data = response.data.data;

    // Store tokens
    await SecureStore.setItemAsync('access_token', data.accessToken);
    await SecureStore.setItemAsync('refresh_token', data.refreshToken);

    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('business_unit_id');
    }
  },

  async getMe(moduleId?: string): Promise<User> {
    const url = moduleId ? `${API_ENDPOINTS.ME}?module_id=${moduleId}` : API_ENDPOINTS.ME;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      return !!token;
    } catch {
      return false;
    }
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync('access_token');
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  },

  async resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }): Promise<void> {
    await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, payload);
  },
};
