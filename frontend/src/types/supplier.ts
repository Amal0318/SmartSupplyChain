export interface Supplier {
  id: string;
  code: string;
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  rating: number;
  otif_rate: number;
  lead_time_days: number;
  is_active: boolean;
  created_at: string;
}

export interface SupplierCreate {
  code: string;
  company_name: string;
  contact_person?: string;
  email: string;
  phone?: string;
  address?: string;
  lead_time_days?: number;
}
