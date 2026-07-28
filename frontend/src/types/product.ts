export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  unit_cost: number;
  reorder_level: number;
  safety_stock: number;
  category_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  unit_cost: number;
  reorder_level: number;
  safety_stock: number;
  category_id?: string;
}
