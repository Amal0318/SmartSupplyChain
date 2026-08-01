import { apiClient } from './client';

export interface CriticalRisk {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
}

export interface RecommendedAction {
  priority: string;
  department: string;
  recommendation: string;
}

export interface AIReport {
  id?: string;
  report_title: string;
  generated_at: string;
  summary: string;
  key_metrics: {
    material_availability_rate: number;
    stockout_risk_count: number;
    schedule_adherence_rate: number;
    delayed_orders_count: number;
    total_stock_valuation: number;
  };
  critical_risks: CriticalRisk[];
  recommended_actions: RecommendedAction[];
}

export const getLatestAiReportApi = async (): Promise<AIReport> => {
  const response = await apiClient.get<AIReport>('/ai-reports/latest');
  return response.data;
};

export const generateAiReportApi = async (): Promise<AIReport> => {
  const response = await apiClient.post<AIReport>('/ai-reports/generate');
  return response.data;
};


export const getDirectPdfUrlWithToken = (): string => {
  const token = localStorage.getItem('access_token') || '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  return `${baseUrl}/ai-reports/export/pdf?token=${encodeURIComponent(token)}`;
};

export const downloadExecutivePdfReportApi = async (): Promise<void> => {
  const response = await apiClient.get('/ai-reports/export/pdf', {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Executive_Brief_${new Date().toISOString().split('T')[0]}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
