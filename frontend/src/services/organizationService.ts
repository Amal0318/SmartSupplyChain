import api from './api';

export interface AdminMetrics {
  total_organizations: number;
  total_departments: number;
  total_teams: number;
  total_employees: number;
  total_active_users: number;
  unread_notifications: number;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export const organizationService = {
  getAdminMetrics: async (): Promise<AdminMetrics> => {
    const response = await api.get<AdminMetrics>('/organization-management/dashboard/metrics');
    return response.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<Department[]>('/organization-management/departments');
    return response.data;
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/organization-management/notifications');
    return response.data;
  },
};
