import api from './api';
import { Supplier, SupplierCreate } from '../types/supplier';

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/suppliers');
    return response.data;
  },

  create: async (supplier: SupplierCreate): Promise<Supplier> => {
    const response = await api.post<Supplier>('/suppliers', supplier);
    return response.data;
  },
};
