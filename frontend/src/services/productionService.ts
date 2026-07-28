import api from './api';

export interface ProductionMetrics {
  total_boms: number;
  active_work_orders: number;
  completed_work_orders: number;
  overall_equipment_effectiveness: number;
  total_produced_units: number;
  total_scrap_units: number;
}

export interface WorkOrder {
  id: string;
  wo_number: string;
  bom_id: string;
  line_id?: string;
  target_quantity: number;
  produced_quantity: number;
  scrap_quantity: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export const productionService = {
  getMetrics: async (): Promise<ProductionMetrics> => {
    const response = await api.get<ProductionMetrics>('/production/dashboard/metrics');
    return response.data;
  },

  getWorkOrders: async (): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>('/production/work-orders');
    return response.data;
  },

  updateProgress: async (wo_id: string, produced_quantity: number, scrap_quantity: number = 0): Promise<WorkOrder> => {
    const response = await api.put<WorkOrder>('/production/work-orders/progress', {
      wo_id,
      produced_quantity,
      scrap_quantity,
    });
    return response.data;
  },
};
