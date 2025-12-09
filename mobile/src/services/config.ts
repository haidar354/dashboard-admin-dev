import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { PaginatedResponse } from './iam';

export interface Module {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  featuresCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  moduleId: string;
  moduleName: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  moduleId: string | null;
  moduleName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  modulesCount: number;
  featuresCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanCapability {
  id: string;
  planId: string;
  planName: string;
  featureId: string;
  featureName: string;
  limit: number | null;
  isUnlimited: boolean;
  createdAt: string;
}

export const configService = {
  // Modules
  async getModules(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Module>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.MODULES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getModule(moduleId: string): Promise<Module> {
    const response = await apiClient.get(`${API_ENDPOINTS.MODULES}/${moduleId}`);
    return response.data.data;
  },

  async createModule(payload: Partial<Module>): Promise<Module> {
    const response = await apiClient.post(API_ENDPOINTS.MODULES, payload);
    return response.data.data;
  },

  async updateModule(moduleId: string, payload: Partial<Module>): Promise<Module> {
    const response = await apiClient.patch(`${API_ENDPOINTS.MODULES}/${moduleId}`, payload);
    return response.data.data;
  },

  async deleteModule(moduleId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MODULES}/${moduleId}`);
  },

  // Features
  async getFeatures(params: { page?: number; perPage?: number; search?: string; moduleId?: string } = {}): Promise<PaginatedResponse<Feature>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    if (params.moduleId) {
      queryParams['filter[module_id]'] = params.moduleId;
    }
    const response = await apiClient.get(API_ENDPOINTS.FEATURES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getFeature(featureId: string): Promise<Feature> {
    const response = await apiClient.get(`${API_ENDPOINTS.FEATURES}/${featureId}`);
    return response.data.data;
  },

  async createFeature(payload: Partial<Feature>): Promise<Feature> {
    const response = await apiClient.post(API_ENDPOINTS.FEATURES, payload);
    return response.data.data;
  },

  async updateFeature(featureId: string, payload: Partial<Feature>): Promise<Feature> {
    const response = await apiClient.patch(`${API_ENDPOINTS.FEATURES}/${featureId}`, payload);
    return response.data.data;
  },

  async deleteFeature(featureId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.FEATURES}/${featureId}`);
  },

  // Permissions
  async getPermissions(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Permission>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPermission(permissionId: string): Promise<Permission> {
    const response = await apiClient.get(`${API_ENDPOINTS.PERMISSIONS}/${permissionId}`);
    return response.data.data;
  },

  async createPermission(payload: Partial<Permission>): Promise<Permission> {
    const response = await apiClient.post(API_ENDPOINTS.PERMISSIONS, payload);
    return response.data.data;
  },

  async updatePermission(permissionId: string, payload: Partial<Permission>): Promise<Permission> {
    const response = await apiClient.patch(`${API_ENDPOINTS.PERMISSIONS}/${permissionId}`, payload);
    return response.data.data;
  },

  async deletePermission(permissionId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PERMISSIONS}/${permissionId}`);
  },

  // Packages
  async getPackages(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Package>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.PACKAGES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPackage(packageId: string): Promise<Package> {
    const response = await apiClient.get(`${API_ENDPOINTS.PACKAGES}/${packageId}`);
    return response.data.data;
  },

  async createPackage(payload: Partial<Package>): Promise<Package> {
    const response = await apiClient.post(API_ENDPOINTS.PACKAGES, payload);
    return response.data.data;
  },

  async updatePackage(packageId: string, payload: Partial<Package>): Promise<Package> {
    const response = await apiClient.patch(`${API_ENDPOINTS.PACKAGES}/${packageId}`, payload);
    return response.data.data;
  },

  async deletePackage(packageId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PACKAGES}/${packageId}`);
  },

  // Plan Capabilities
  async getPlanCapabilities(params: { page?: number; perPage?: number; planId?: string } = {}): Promise<PaginatedResponse<PlanCapability>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.planId) {
      queryParams['filter[plan_id]'] = params.planId;
    }
    const response = await apiClient.get(API_ENDPOINTS.PLAN_CAPABILITIES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
};
