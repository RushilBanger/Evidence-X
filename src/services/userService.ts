import apiClient from '../api/client';
import { UserRegistrationRequest, UserResponse } from '../types';

export const userService = {
  /**
   * Create a new user (Open endpoint)
   * Endpoint: POST /api/users
   */
  createUser: async (userData: UserRegistrationRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/api/users', userData);
    return response.data;
  },

  /**
   * Lookup user details by username (ADMIN only)
   * Endpoint: GET /api/users/username/{username}
   */
  getUserByUsername: async (username: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/api/users/username/${encodeURIComponent(username)}`);
    return response.data;
  },
};

export default userService;
