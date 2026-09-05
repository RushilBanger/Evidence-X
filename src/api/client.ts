import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get Base URL from environment variable or fallback to backend default port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token if available and handle Content-Type
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('securedoc_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set JSON content-type only if not FormData and not already set
    if (!(config.data instanceof FormData)) {
      if (config.headers && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    } else if (config.headers) {
      // Allow browser/Axios to set multipart boundary automatically
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors cleanly
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      // Network / Connection error
      const networkError = new Error(
        'Unable to connect to SecureDoc backend service. Please verify that the server is running on ' + API_BASE_URL
      );
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Unauthorized or expired token
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('securedoc_token');
        window.dispatchEvent(new CustomEvent('securedoc:unauthorized'));
      }
    }

    // Extract message if backend sent error message
    let message = 'An unexpected error occurred';
    if (typeof data === 'string' && data.trim()) {
      message = data;
    } else if (data && typeof data === 'object') {
      const errObj = data as Record<string, unknown>;
      if (typeof errObj.message === 'string') {
        message = errObj.message;
      } else if (typeof errObj.error === 'string') {
        message = errObj.error;
      }
    } else if (status === 403) {
      message = 'Access forbidden: You do not have the required permissions for this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status === 500) {
      message = 'Internal server error occurred. Please contact the system administrator.';
    }

    const customError = new Error(message);
    (customError as unknown as { status: number; originalError: AxiosError }).status = status;
    (customError as unknown as { status: number; originalError: AxiosError }).originalError = error;

    return Promise.reject(customError);
  }
);

export default apiClient;
