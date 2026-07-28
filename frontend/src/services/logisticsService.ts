import api from './api';

export interface LogisticsMetrics {
  total_shipments: number;
  in_transit_count: number;
  delivered_count: number;
  on_time_delivery_rate: number;
  active_vehicles: number;
  return_shipments_count: number;
}

export interface Shipment {
  id: string;
  shipment_number: string;
  origin_warehouse_id: string;
  destination_address: string;
  carrier_id: string;
  vehicle_id?: string;
  driver_id?: string;
  status: 'MANIFESTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RETURNED';
  estimated_arrival?: string;
  actual_arrival?: string;
  created_at: string;
}

export const logisticsService = {
  getMetrics: async (): Promise<LogisticsMetrics> => {
    const response = await api.get<LogisticsMetrics>('/logistics/dashboard/metrics');
    return response.data;
  },

  getShipments: async (): Promise<Shipment[]> => {
    const response = await api.get<Shipment[]>('/logistics/shipments');
    return response.data;
  },

  updateStatus: async (shipment_id: string, location_name: string, status: string, remarks?: string): Promise<Shipment> => {
    const response = await api.put<Shipment>('/logistics/shipments/status', {
      shipment_id,
      location_name,
      status,
      remarks,
    });
    return response.data;
  },
};
