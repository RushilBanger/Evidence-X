import apiClient from '../api/client';
import { LoginRequest, LoginResponse, UserRegistrationRequest, UserResponse } from '../types';

export const authService = {
  /**
   * Authenticate user with credentials
   * Endpoint: POST /api/auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * Endpoint: POST /api/users
   */
  register: async (userData: UserRegistrationRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/api/users', userData);
    return response.data;
  },

  /**
   * Get user details by username (ADMIN only)
   * Endpoint: GET /api/users/username/{username}
   */
  getUserByUsername: async (username: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/api/users/username/${encodeURIComponent(username)}`);
    return response.data;
  },
};

export default authService;
