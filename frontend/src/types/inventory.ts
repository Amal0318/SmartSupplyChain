export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  product_id: string;
  warehouse_id?: string;
  transaction_type: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference_id?: string;
  performed_by_id: string;
  created_at: string;
}

export interface InventoryMetrics {
  total_skus: number;
  total_inventory_items: number;
  low_stock_alerts: number;
  expiring_batches_count: number;
  total_stock_value: number;
}
