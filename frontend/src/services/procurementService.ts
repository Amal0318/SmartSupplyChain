import api from './api';
import { PurchaseOrder, PurchaseRequisition } from '../types/procurement';

export interface ProcurementMetrics {
  total_spend: number;
  total_requisitions: number;
  total_purchase_orders: number;
  open_orders: number;
  completed_grns: number;
  three_way_mismatches: number;
}

export interface GoodsReceiptNote {
  id: string;
  grn_number: string;
  po_id: string;
  received_by_id: string;
  status: string;
  received_date: string;
}

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  po_id: string;
  supplier_id: string;
  billed_amount: number;
  match_status: string;
  is_paid: boolean;
  created_at: string;
}

export const procurementService = {
  getMetrics: async (): Promise<ProcurementMetrics> => {
    const response = await api.get<ProcurementMetrics>('/procurement/dashboard/metrics');
    return response.data;
  },

  getOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await api.get<PurchaseOrder[]>('/procurement/orders');
    return response.data;
  },

  getRequisitions: async (): Promise<PurchaseRequisition[]> => {
    const response = await api.get<PurchaseRequisition[]>('/procurement/requisitions');
    return response.data;
  },

  createRequisition: async (remarks?: string): Promise<PurchaseRequisition> => {
    const response = await api.post<PurchaseRequisition>('/procurement/requisitions', { remarks });
    return response.data;
  },

  approveRequisition: async (id: string): Promise<PurchaseRequisition> => {
    const response = await api.put<PurchaseRequisition>(`/procurement/requisitions/${id}/approve`);
    return response.data;
  },

  rejectRequisition: async (id: string): Promise<PurchaseRequisition> => {
    const response = await api.put<PurchaseRequisition>(`/procurement/requisitions/${id}/reject`);
    return response.data;
  },

  getGRNs: async (): Promise<GoodsReceiptNote[]> => {
    const response = await api.get<GoodsReceiptNote[]>('/procurement/grn');
    return response.data;
  },

  createGRN: async (po_id: string, remarks?: string): Promise<GoodsReceiptNote> => {
    const response = await api.post<GoodsReceiptNote>('/procurement/grn', { po_id, remarks });
    return response.data;
  },

  getInvoices: async (): Promise<PurchaseInvoice[]> => {
    const response = await api.get<PurchaseInvoice[]>('/procurement/invoices');
    return response.data;
  },
};
