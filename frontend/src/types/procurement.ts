export interface POItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  total_amount: number;
  items: POItem[];
  created_at: string;
}

export interface PurchaseRequisition {
  id: string;
  pr_number: string;
  requested_by_id: string;
  status: string;
  remarks?: string;
  created_at: string;
}
