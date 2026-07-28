import api from './api';
import { Product, ProductCreate } from '../types/product';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  create: async (product: ProductCreate): Promise<Product> => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },
};
