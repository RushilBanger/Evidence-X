// Roles supported by Spring Boot Backend
export type Role = 'ADMIN' | 'INVESTIGATOR' | 'VIEWER';

// Case Lifecycle Status
export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED';

// Document Lifecycle Status
export type DocumentStatus = 'ACTIVE' | 'ARCHIVED';

// Audit Trail Action Types logged by backend
export type DocumentAction = 'DOCUMENT_UPLOADED' | 'DOCUMENT_VERIFIED' | 'DOCUMENT_DOWNLOADED';

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  message: string;
}

export interface AuthUser {
  username: string;
  role: Role;
  exp?: number;
  iat?: number;
}

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
}

// Case types
export interface CaseRequest {
  caseNumber: string;
  title: string;
  description: string;
}

export interface CaseResponse {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdBy: string;
  createdAt: string;
}

// Document types
export interface DocumentResponse {
  id: number;
  title: string;
  filePath: string;
  fileHash: string;
  uploadedBy: string;
  caseNumber: string;
  uploadedAt: string;
  status: string;
}

// Audit types
export interface AuditLogResponse {
  id: number;
  username: string;
  action: DocumentAction | string;
  documentId: number;
  caseNumber: string;
  details: string;
  timestamp: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Stats & Dashboard aggregate interface
export interface DashboardStats {
  totalCases: number;
  totalDocuments: number;
  activeCases: number;
  closedCases: number;
  recentDocuments: DocumentResponse[];
  recentCases: CaseResponse[];
  verifiedCount?: number;
}
