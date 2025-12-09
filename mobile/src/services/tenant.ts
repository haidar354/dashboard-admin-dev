import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { PaginatedResponse } from './iam';

export interface Company {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  businessUnitsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  outletsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  businessUnitId: string;
  businessUnitName: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const tenantService = {
  // Companies
  async getCompanies(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Company>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.COMPANIES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getCompany(companyId: string): Promise<Company> {
    const response = await apiClient.get(`${API_ENDPOINTS.COMPANIES}/${companyId}`);
    return response.data.data;
  },

  async createCompany(payload: Partial<Company>): Promise<Company> {
    const response = await apiClient.post(API_ENDPOINTS.COMPANIES, payload);
    return response.data.data;
  },

  async updateCompany(companyId: string, payload: Partial<Company>): Promise<Company> {
    const response = await apiClient.patch(`${API_ENDPOINTS.COMPANIES}/${companyId}`, payload);
    return response.data.data;
  },

  async deleteCompany(companyId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.COMPANIES}/${companyId}`);
  },

  // Business Units
  async getBusinessUnits(params: { page?: number; perPage?: number; search?: string; companyId?: string } = {}): Promise<PaginatedResponse<BusinessUnit>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    if (params.companyId) {
      queryParams['filter[company_id]'] = params.companyId;
    }
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS_UNITS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getBusinessUnit(businessUnitId: string): Promise<BusinessUnit> {
    const response = await apiClient.get(`${API_ENDPOINTS.BUSINESS_UNITS}/${businessUnitId}`);
    return response.data.data;
  },

  async createBusinessUnit(payload: Partial<BusinessUnit>): Promise<BusinessUnit> {
    const response = await apiClient.post(API_ENDPOINTS.BUSINESS_UNITS, payload);
    return response.data.data;
  },

  async updateBusinessUnit(businessUnitId: string, payload: Partial<BusinessUnit>): Promise<BusinessUnit> {
    const response = await apiClient.patch(`${API_ENDPOINTS.BUSINESS_UNITS}/${businessUnitId}`, payload);
    return response.data.data;
  },

  async deleteBusinessUnit(businessUnitId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.BUSINESS_UNITS}/${businessUnitId}`);
  },

  // Outlets
  async getOutlets(params: { page?: number; perPage?: number; search?: string; businessUnitId?: string } = {}): Promise<PaginatedResponse<Outlet>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    if (params.businessUnitId) {
      queryParams['filter[business_unit_id]'] = params.businessUnitId;
    }
    const response = await apiClient.get(API_ENDPOINTS.OUTLETS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getOutlet(outletId: string): Promise<Outlet> {
    const response = await apiClient.get(`${API_ENDPOINTS.OUTLETS}/${outletId}`);
    return response.data.data;
  },

  async createOutlet(payload: Partial<Outlet>): Promise<Outlet> {
    const response = await apiClient.post(API_ENDPOINTS.OUTLETS, payload);
    return response.data.data;
  },

  async updateOutlet(outletId: string, payload: Partial<Outlet>): Promise<Outlet> {
    const response = await apiClient.patch(`${API_ENDPOINTS.OUTLETS}/${outletId}`, payload);
    return response.data.data;
  },

  async deleteOutlet(outletId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.OUTLETS}/${outletId}`);
  },
};
