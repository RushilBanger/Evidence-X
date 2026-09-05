import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginRequest, Role, UserRegistrationRequest } from '../types';
import { authService } from '../services/authService';
import { decodeJwt, isTokenExpired } from '../utils/jwt';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (data: UserRegistrationRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
  isAdmin: boolean;
  isInvestigator: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('securedoc_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem('securedoc_token');
    if (savedToken && !isTokenExpired(savedToken)) {
      return decodeJwt(savedToken);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('securedoc_token');
    setToken(null);
    setUser(null);
  }, []);

  // Handle unauthorized event dispatched from axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('securedoc:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('securedoc:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Initial check on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('securedoc_token');
    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        logout();
      } else {
        const decoded = decodeJwt(savedToken);
        if (decoded) {
          setUser(decoded);
          setToken(savedToken);
        } else {
          logout();
        }
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.token) {
        localStorage.setItem('securedoc_token', response.token);
        setToken(response.token);
        const decoded = decodeJwt(response.token);
        setUser(decoded);
        setIsLoading(false);
        return { success: true, message: response.message || 'Authentication successful' };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message || 'Invalid username or password' };
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err as Error;
      return { success: false, message: errorObj.message || 'Failed to authenticate with server' };
    }
  };

  const register = async (data: UserRegistrationRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      await authService.register(data);
      return { success: true, message: 'User account created successfully. You can now login.' };
    } catch (err: unknown) {
      const errorObj = err as Error;
      return { success: false, message: errorObj.message || 'Failed to register account' };
    }
  };

  const hasRole = useCallback(
    (roles: Role | Role[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user]
  );

  const isAdmin = user?.role === 'ADMIN';
  const isInvestigator = user?.role === 'INVESTIGATOR';
  const isViewer = user?.role === 'VIEWER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
        isAdmin,
        isInvestigator,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
