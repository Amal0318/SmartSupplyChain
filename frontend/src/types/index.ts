export type UserRole = 'viewer' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type FileType = 'procurement' | 'inventory' | 'production_orders';

export type UploadStatus =
  | 'uploaded'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'processing'
  | 'processed'
  | 'failed';

export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  value?: string;
}

export interface UploadResponse {
  id: string;
  file_type: FileType;
  original_filename: string;
  status: UploadStatus;
  file_size_bytes?: number;
  uploaded_at: string;
  message: string;
}

export interface UploadStatusResponse {
  id: string;
  file_type: FileType;
  original_filename: string;
  status: UploadStatus;
  row_count?: number;
  file_size_bytes?: number;
  validation_errors: ValidationError[];
  uploaded_at: string;
  validated_at?: string;
  processed_at?: string;
}
