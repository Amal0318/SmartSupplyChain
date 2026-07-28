import api from './api';
import { InventoryItem, StockTransaction, InventoryMetrics } from '../types/inventory';

export const inventoryService = {
  getMetrics: async (): Promise<InventoryMetrics> => {
    const response = await api.get<InventoryMetrics>('/inventory/dashboard/metrics');
    return response.data;
  },

  getItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItem[]>('/inventory/items');
    return response.data;
  },

  getTransactions: async (): Promise<StockTransaction[]> => {
    const response = await api.get<StockTransaction[]>('/inventory/transactions');
    return response.data;
  },

  stockIn: async (data: { product_id: string; warehouse_id: string; quantity: number; batch_number?: string }): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>('/inventory/stock-in', data);
    return response.data;
  },

  stockOut: async (data: { product_id: string; warehouse_id: string; quantity: number }): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>('/inventory/stock-out', data);
    return response.data;
  },
};
