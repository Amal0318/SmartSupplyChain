import { apiClient } from './client';

export interface StockoutItem {
  material_id: string;
  material_name: string;
  category: string;
  stock_on_hand: number;
  available_stock: number;
  reorder_point: number;
  deficit: number;
  unit_cost: number;
  location: string;
}

export interface SupplierPerf {
  supplier_name: string;
  total_orders: number;
  fulfillment_rate: number;
  total_spend: number;
}

export interface WarehouseAnalyticsResponse {
  summary: {
    total_materials_tracked: number;
    material_availability_rate: number;
    total_stock_valuation: number;
    stockout_risk_count: number;
  };
  stockout_risk_items: StockoutItem[];
  supplier_performance: SupplierPerf[];
  inventory_breakdown: any[];
}

export interface MachineUtil {
  machine_id: string;
  order_count: number;
  planned_units: number;
  produced_units: number;
  efficiency_pct: number;
}

export interface DelayRisk {
  order_number: string;
  product_id: string;
  machine_id: string;
  status: string;
  quantity_planned: number;
  quantity_produced: number;
  adherence_pct: number;
}

export interface ProductionAnalyticsResponse {
  summary: {
    total_production_orders: number;
    schedule_adherence_rate: number;
    completed_orders: number;
    in_progress_orders: number;
    delayed_orders: number;
    planned_orders: number;
  };
  machine_utilization: MachineUtil[];
  delay_risks: DelayRisk[];
  production_orders: any[];
}

export const getWarehouseAnalyticsApi = async (): Promise<WarehouseAnalyticsResponse> => {
  const response = await apiClient.get<WarehouseAnalyticsResponse>('/analytics/warehouse');
  return response.data;
};

export const getProductionAnalyticsApi = async (): Promise<ProductionAnalyticsResponse> => {
  const response = await apiClient.get<ProductionAnalyticsResponse>('/analytics/production');
  return response.data;
};
