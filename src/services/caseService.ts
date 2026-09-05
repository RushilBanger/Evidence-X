import apiClient from '../api/client';
import { CaseRequest, CaseResponse } from '../types';

export const caseService = {
  /**
   * Retrieve all cases
   * Endpoint: GET /api/cases
   */
  getAllCases: async (): Promise<CaseResponse[]> => {
    const response = await apiClient.get<CaseResponse[]>('/api/cases');
    return response.data;
  },

  /**
   * Retrieve single case by case number
   * Endpoint: GET /api/cases/{caseNumber}
   */
  getCaseByCaseNumber: async (caseNumber: string): Promise<CaseResponse> => {
    const response = await apiClient.get<CaseResponse>(`/api/cases/${encodeURIComponent(caseNumber)}`);
    return response.data;
  },

  /**
   * Create a new case (ADMIN, INVESTIGATOR)
   * Endpoint: POST /api/cases
   */
  createCase: async (caseData: CaseRequest): Promise<CaseResponse> => {
    const response = await apiClient.post<CaseResponse>('/api/cases', caseData);
    return response.data;
  },
};

export default caseService;
