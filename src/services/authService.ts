import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

import { API_BASE_URL } from '../config/api';
const CURRENT_USER_KEY = 'boxbus_current_user';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const user = data.user;
      const token = data.token;

      // Save only token to AsyncStorage (user will be fetched from backend)
      await AsyncStorage.setItem('auth_token', token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    console.log('AuthService: Starting logout...');
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    await AsyncStorage.removeItem('auth_token');
    console.log('AuthService: Current user key and token removed from AsyncStorage');
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid, clear it
        await AsyncStorage.removeItem('auth_token');
        return null;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  public async getAllUsers(): Promise<User[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  public async approveDriver(userId: string): Promise<User> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve driver');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error approving driver:', error);
      throw error;
    }
  }

  public async archiveUser(userId: string): Promise<User | null> {
    console.log('🔍 AUTH SERVICE: archiveUser called with userId:', userId);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 AUTH SERVICE: Token exists:', !!token);
      
      const url = `${API_BASE_URL}/api/users/${userId}/archive`;
      console.log('🔍 AUTH SERVICE: Making request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 AUTH SERVICE: Response status:', response.status);
      console.log('🔍 AUTH SERVICE: Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('🔍 AUTH SERVICE: Error response:', errorData);
        throw new Error(errorData.message || 'Failed to archive user');
      }

      const data = await response.json();
      console.log('🔍 AUTH SERVICE: Success response:', data);
      return data.user;
    } catch (error) {
      console.error('🔍 AUTH SERVICE: Error archiving user:', error);
      return null;
    }
  }

  public async unarchiveUser(userId: string): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/unarchive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unarchive user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error unarchiving user:', error);
      return null;
    }
  }

  public async getArchivedUsers(): Promise<User[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/users/archived`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch archived users');
      }

      const users = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching archived users:', error);
      return [];
    }
  }
}

export default AuthService.getInstance();