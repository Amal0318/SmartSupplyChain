import api from './api';

export interface ExecutiveSummary {
  total_procurement_spend: number;
  total_inventory_valuation: number;
  overall_equipment_effectiveness: number;
  on_time_delivery_rate: number;
  vendor_otif_average: number;
  active_work_orders_count: number;
  low_stock_alerts_count: number;
  total_employees_count: number;
  system_health: string;
}

export interface DemandForecast {
  id: string;
  product_id: string;
  forecast_period: string;
  predicted_demand_qty: number;
  confidence_score: number;
  algorithm_type: string;
  created_at: string;
}

export const analyticsService = {
  getExecutiveSummary: async (): Promise<ExecutiveSummary> => {
    const response = await api.get<ExecutiveSummary>('/analytics/executive/summary');
    return response.data;
  },

  getForecasts: async (): Promise<DemandForecast[]> => {
    const response = await api.get<DemandForecast[]>('/analytics/forecasts');
    return response.data;
  },
};
