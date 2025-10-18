import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';

const USERS_KEY = 'boxbus_users';
const CURRENT_USER_KEY = 'boxbus_current_user';

export class AuthService {
  private static instance: AuthService;
  private users: Map<string, User> = new Map();

  private constructor() {
    this.loadUsers();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async loadUsers(): Promise<void> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      if (usersData) {
        const usersArray = JSON.parse(usersData);
        this.users = new Map(usersArray);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  private async saveUsers(): Promise<void> {
    try {
      const usersArray = Array.from(this.users.entries());
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  public async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Check if user already exists
    if (this.users.has(userData.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(newUser.email, newUser);
    await this.saveUsers();

    return newUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real app, you would hash and verify passwords
    // For now, we'll use a simple check (you should implement proper password hashing)
    if (password.length < 6) {
      throw new Error('Invalid email or password');
    }

    // Save current user to AsyncStorage
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  public async logout(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    await this.saveUsers();

    // Update current user if it's the same user
    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    return updatedUser;
  }
}

export default AuthService.getInstance();

