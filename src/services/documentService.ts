import apiClient from '../api/client';
import { DocumentResponse } from '../types';

export const documentService = {
  /**
   * Upload a new document with multipart/form-data
   * Endpoint: POST /api/documents
   * @param title Title of the document
   * @param caseNumber Existing Case Number
   * @param file File binary
   */
  createDocument: async (
    title: string,
    caseNumber: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('caseNumber', caseNumber.trim());
    formData.append('file', file);

    const response = await apiClient.post<DocumentResponse>('/api/documents', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  /**
   * Retrieve all documents linked to a case
   * Endpoint: GET /api/documents/case/{caseNumber}
   */
  getDocumentsByCaseNumber: async (caseNumber: string): Promise<DocumentResponse[]> => {
    const response = await apiClient.get<DocumentResponse[]>(
      `/api/documents/case/${encodeURIComponent(caseNumber)}`
    );
    return response.data;
  },

  /**
   * Retrieve single document by ID
   * Endpoint: GET /api/documents/{id}
   */
  getDocumentById: async (id: number): Promise<DocumentResponse> => {
    const response = await apiClient.get<DocumentResponse>(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Cryptographic integrity verification
   * Endpoint: GET /api/documents/{id}/verify
   * Returns true if file matches stored SHA-256 hash, false otherwise.
   */
  verifyDocumentIntegrity: async (id: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/api/documents/${id}/verify`);
    return response.data;
  },

  /**
   * Download document binary
   * Endpoint: GET /api/documents/{id}/download
   */
  downloadDocument: async (id: number, fallbackFilename = 'document.pdf'): Promise<void> => {
    const response = await apiClient.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header if present
    let filename = fallbackFilename;
    const contentDisposition = response.headers['content-disposition']
      ? String(response.headers['content-disposition'])
      : undefined;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create object URL and trigger browser download
    const contentType = response.headers['content-type']
      ? String(response.headers['content-type'])
      : 'application/octet-stream';

    const blob = new Blob([response.data], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  /**
   * Extract text from document using OCR
   * Endpoint: GET /api/documents/{id}/ocr-test
   */
  extractOcrText: async (id: number): Promise<string> => {
    const response = await apiClient.get<string>(`/api/documents/${id}/ocr-test`, {
      responseType: 'text',
    });
    return response.data;
  },

  /**
   * Search documents by query (matches title or caseNumber)
   * Endpoint: GET /api/documents/search?query=...
   */
  searchDocuments: async (query: string): Promise<DocumentResponse[]> => {
    if (!query || !query.trim()) {
      return [];
    }
    const response = await apiClient.get<DocumentResponse[]>('/api/documents/search', {
      params: { query: query.trim() },
    });
    return response.data;
  },
};

export default documentService;
