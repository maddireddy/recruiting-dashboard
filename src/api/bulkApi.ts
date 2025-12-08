import api from '../services/api';

export interface BulkStatusUpdateRequest {
  candidateIds: string[];
  newStatus: string;
}

export interface BulkEmailRequest {
  candidateIds: string[];
  subject: string;
  body: string;
  templateId?: string;
  sendIndividually?: boolean;
}

export interface BulkExportRequest {
  candidateIds: string[];
  format: 'CSV' | 'EXCEL' | 'PDF';
  fields?: string[];
}

export interface BulkOperationResponse {
  id: string;
  operationType: string;
  targetEntity: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS';
  total: number;
  processed: number;
  successful: number;
  failed: number;
  percentComplete: number;
  startedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export const bulkApi = {
  updateStatus: async (request: BulkStatusUpdateRequest): Promise<BulkOperationResponse> => {
    const { data } = await api.post('/bulk/candidates/status', request);
    return data;
  },

  sendEmail: async (request: BulkEmailRequest): Promise<BulkOperationResponse> => {
    const { data } = await api.post('/bulk/candidates/email', request);
    return data;
  },

  exportData: async (request: BulkExportRequest): Promise<BulkOperationResponse> => {
    const { data } = await api.post('/bulk/candidates/export', request);
    return data;
  },

  getOperationStatus: async (operationId: string): Promise<BulkOperationResponse> => {
    const { data } = await api.get(`/bulk/operations/${operationId}`);
    return data;
  },

  getOperations: async (): Promise<BulkOperationResponse[]> => {
    const { data } = await api.get('/bulk/operations');
    return data;
  },
};
