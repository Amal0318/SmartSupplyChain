export type UserRole = 
  | 'ADMIN' 
  | 'PROCUREMENT_MANAGER' 
  | 'PROCUREMENT_EXEC' 
  | 'WAREHOUSE_MANAGER' 
  | 'WAREHOUSE_STAFF' 
  | 'QUALITY_INSPECTOR' 
  | 'PRODUCTION_MANAGER' 
  | 'LOGISTICS_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'SUPPLIER';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization_id?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
