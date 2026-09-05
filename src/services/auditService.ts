import apiClient from '../api/client';
import { AuditLogResponse } from '../types';

export const auditService = {
  /**
   * Retrieve chronological audit history for a document
   * Endpoint: GET /api/audit/document/{documentId}
   */
  getDocumentAuditHistory: async (documentId: number): Promise<AuditLogResponse[]> => {
    const response = await apiClient.get<AuditLogResponse[]>(`/api/audit/document/${documentId}`);
    return response.data;
  },
};

export default auditService;
