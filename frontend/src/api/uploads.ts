import { apiClient } from './client';
import { FileType, UploadResponse, UploadStatusResponse } from '../types';

export const uploadCsvApi = async (
  file: File,
  fileType: FileType
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpointMap: Record<FileType, string> = {
    procurement: '/upload/procurement',
    inventory: '/upload/inventory',
    production_orders: '/upload/production-orders',
  };

  const response = await apiClient.post<UploadResponse>(
    endpointMap[fileType],
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getUploadHistoryApi = async (): Promise<UploadStatusResponse[]> => {
  const response = await apiClient.get<UploadStatusResponse[]>('/upload/history');
  return response.data;
};

export const getUploadStatusApi = async (
  uploadId: string
): Promise<UploadStatusResponse> => {
  const response = await apiClient.get<UploadStatusResponse>(`/upload/${uploadId}`);
  return response.data;
};
