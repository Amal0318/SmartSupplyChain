import api from './api';

export interface WarehouseMetrics {
  total_zones: number;
  total_bins: number;
  total_capacity: number;
  occupied_capacity: number;
  occupancy_percentage: number;
  pending_tasks_count: number;
}

export interface WarehouseBin {
  id: string;
  zone_id: string;
  bin_code: string;
  barcode: string;
  rfid_tag_id?: string;
  max_capacity: number;
  occupied_capacity: number;
  is_available: boolean;
  created_at: string;
}

export interface WarehouseTask {
  id: string;
  task_number: string;
  task_type: 'RECEIVING' | 'PICKING' | 'PACKING' | 'DISPATCH' | 'BIN_TRANSFER';
  status: string;
  bin_id?: string;
  product_id: string;
  quantity: number;
  barcode_scanned?: string;
  rfid_scanned?: string;
  created_at: string;
}

export const warehouseService = {
  getMetrics: async (): Promise<WarehouseMetrics> => {
    const response = await api.get<WarehouseMetrics>('/warehouse-operations/capacity/metrics');
    return response.data;
  },

  getBins: async (): Promise<WarehouseBin[]> => {
    const response = await api.get<WarehouseBin[]>('/warehouse-operations/bins');
    return response.data;
  },

  getTasks: async (): Promise<WarehouseTask[]> => {
    const response = await api.get<WarehouseTask[]>('/warehouse-operations/tasks');
    return response.data;
  },

  scanTask: async (task_id: string, barcode_scanned?: string, rfid_scanned?: string): Promise<WarehouseTask> => {
    const response = await api.post<WarehouseTask>('/warehouse-operations/tasks/scan', {
      task_id,
      barcode_scanned,
      rfid_scanned,
    });
    return response.data;
  },
};
