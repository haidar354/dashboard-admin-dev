import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface PaginationMeta {
  page: number;
  perPage: number;
  from: number;
  to: number;
  total: number;
  lastPage: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionsCount: number;
  usersCount: number;
  createdAt: string;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  status: string;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  status?: string;
}

export const iamService = {
  // Users
  async getUsers(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<User>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.USERS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS}/${userId}`);
    return response.data.data;
  },

  async createUser(payload: UserCreatePayload): Promise<User> {
    const response = await apiClient.post(API_ENDPOINTS.USERS, payload);
    return response.data.data;
  },

  async updateUser(userId: string, payload: UserUpdatePayload): Promise<User> {
    const response = await apiClient.patch(`${API_ENDPOINTS.USERS}/${userId}`, payload);
    return response.data.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.USERS}/${userId}`);
  },

  // Roles
  async getRoles(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Role>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.ROLES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getRole(roleId: string): Promise<Role> {
    const response = await apiClient.get(`${API_ENDPOINTS.ROLES}/${roleId}`);
    return response.data.data;
  },

  async createRole(payload: { name: string; description?: string; permissions?: string[] }): Promise<Role> {
    const response = await apiClient.post(API_ENDPOINTS.ROLES, payload);
    return response.data.data;
  },

  async updateRole(roleId: string, payload: { name?: string; description?: string; permissions?: string[] }): Promise<Role> {
    const response = await apiClient.patch(`${API_ENDPOINTS.ROLES}/${roleId}`, payload);
    return response.data.data;
  },

  async deleteRole(roleId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.ROLES}/${roleId}`);
  },
};
