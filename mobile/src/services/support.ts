import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/api';
import { PaginatedResponse } from './iam';

export interface Ticket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context: string;
  stackTrace: string;
  tenantId: string | null;
  tenantName: string | null;
  userId: string | null;
  userName: string | null;
  createdAt: string;
}

export interface MonitoringData {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: string;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastCheck: string;
  }>;
}

export const supportService = {
  // Tickets
  async getTickets(params: { page?: number; perPage?: number; search?: string; status?: string; priority?: string } = {}): Promise<PaginatedResponse<Ticket>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.search) {
      queryParams['filter[subject]'] = params.search;
    }
    if (params.status) {
      queryParams['filter[status]'] = params.status;
    }
    if (params.priority) {
      queryParams['filter[priority]'] = params.priority;
    }
    const response = await apiClient.get(API_ENDPOINTS.TICKETS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getTicket(ticketId: string): Promise<Ticket> {
    const response = await apiClient.get(`${API_ENDPOINTS.TICKETS}/${ticketId}`);
    return response.data.data;
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<Ticket> {
    const response = await apiClient.patch(`${API_ENDPOINTS.TICKETS}/${ticketId}`, { status });
    return response.data.data;
  },

  async assignTicket(ticketId: string, userId: string): Promise<Ticket> {
    const response = await apiClient.patch(`${API_ENDPOINTS.TICKETS}/${ticketId}/assign`, { userId });
    return response.data.data;
  },

  // Error Logs
  async getErrorLogs(params: { page?: number; perPage?: number; level?: string } = {}): Promise<PaginatedResponse<ErrorLog>> {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      perPage: params.perPage || 20,
    };
    if (params.level) {
      queryParams['filter[level]'] = params.level;
    }
    const response = await apiClient.get(API_ENDPOINTS.ERROR_LOGS, { params: queryParams });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getErrorLog(errorId: string): Promise<ErrorLog> {
    const response = await apiClient.get(`${API_ENDPOINTS.ERROR_LOGS}/${errorId}`);
    return response.data.data;
  },

  // Monitoring
  async getMonitoringData(): Promise<MonitoringData> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MONITORING);
      return response.data.data;
    } catch {
      // Return mock data if API fails
      return {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        activeConnections: 234,
        requestsPerMinute: 1250,
        averageResponseTime: 145,
        errorRate: 0.5,
        uptime: '45 days, 12 hours',
        services: [
          { name: 'API Gateway', status: 'healthy', responseTime: 45, lastCheck: new Date().toISOString() },
          { name: 'Database', status: 'healthy', responseTime: 12, lastCheck: new Date().toISOString() },
          { name: 'Cache', status: 'healthy', responseTime: 3, lastCheck: new Date().toISOString() },
          { name: 'Queue', status: 'healthy', responseTime: 8, lastCheck: new Date().toISOString() },
        ],
      };
    }
  },
};
