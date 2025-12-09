import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { PaginatedResponse } from './iam';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  isActive: boolean;
  subscribersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  subscriptionId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string;
  createdAt: string;
}

export const billingService = {
  // Plans
  async getPlans(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Plan>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[name]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.PLANS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPlan(planId: string): Promise<Plan> {
    const response = await apiClient.get(`${API_ENDPOINTS.PLANS}/${planId}`);
    return response.data.data;
  },

  async createPlan(payload: Partial<Plan>): Promise<Plan> {
    const response = await apiClient.post(API_ENDPOINTS.PLANS, payload);
    return response.data.data;
  },

  async updatePlan(planId: string, payload: Partial<Plan>): Promise<Plan> {
    const response = await apiClient.patch(`${API_ENDPOINTS.PLANS}/${planId}`, payload);
    return response.data.data;
  },

  async deletePlan(planId: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PLANS}/${planId}`);
  },

  // Subscriptions
  async getSubscriptions(params: { page?: number; perPage?: number; search?: string; status?: string } = {}): Promise<PaginatedResponse<Subscription>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[tenant_name]'] = params.search;
    }
    if (params.status) {
      queryParams['filter[status]'] = params.status;
    }
    const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTIONS}/${subscriptionId}`);
    return response.data.data;
  },

  // Invoices
  async getInvoices(params: { page?: number; perPage?: number; search?: string; status?: string } = {}): Promise<PaginatedResponse<Invoice>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[invoice_number]'] = params.search;
    }
    if (params.status) {
      queryParams['filter[status]'] = params.status;
    }
    const response = await apiClient.get(API_ENDPOINTS.INVOICES, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get(`${API_ENDPOINTS.INVOICES}/${invoiceId}`);
    return response.data.data;
  },

  // Payments
  async getPayments(params: { page?: number; perPage?: number; search?: string } = {}): Promise<PaginatedResponse<Payment>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[invoice_number]'] = params.search;
    }
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
    return response.data.data;
  },
};
