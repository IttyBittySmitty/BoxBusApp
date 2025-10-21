import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { User, AuthState } from '../types';
import authService from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string) => Promise<void>;
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
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
      });
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
      
      // Check if driver is approved
      if (user.userType === 'driver' && !user.isApproved) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Your driver account is pending approval. Please wait for admin approval.',
        }));
        return;
      }
      
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

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.register(userData, password);
      
      // Check if driver is approved
      if (user.userType === 'driver' && !user.isApproved) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        // Simple success - no alert that might interfere with scrolling
        return;
      }
      
      // Show success message for customer registration
      Alert.alert(
        'Registration Successful',
        'Account created successfully! You are now logged in.',
        [{ text: 'OK' }]
      );
      
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
      console.log('AuthContext: Starting logout process...');
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await authService.logout();
      console.log('AuthContext: AuthService logout completed');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      console.log('AuthContext: Auth state updated - user logged out');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
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

