import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import authService from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TEMPORARY: Auto-login for development/testing
      // Remove this when you want to implement real authentication
      const demoUser: User = {
        id: 'demo-user-123',
        email: 'demo@boxbus.com',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1 (555) 123-4567',
        address: '123 Demo Street, Demo City, DC 12345',
        userType: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setAuthState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Uncomment the code below when you want real authentication:
      /*
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
      */
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(email, password);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.register(userData);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const updatedUser = await authService.updateUser(authState.user.id, updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Update failed',
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

