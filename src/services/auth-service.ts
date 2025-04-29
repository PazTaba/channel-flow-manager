// src/services/auth-service.ts
import ApiService from './api';
import { User } from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Auth API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
};

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Auth response containing tokens
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Service class for authentication related API calls
 */
export class AuthService {
  /**
   * Log in a user with credentials
   * @param credentials User login credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    
    // Store the tokens
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store token expiry
      const expiresAt = Date.now() + response.expires_in * 1000;
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }
    
    return response;
  }

  /**
   * Log out the current user
   */
  static async logout(): Promise<void> {
    try {
      await api.post<void>(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // If the API call fails, still clear tokens
      console.error('Error during logout:', error);
    } finally {
      // Clear tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, { refresh_token: refreshToken });
    
    // Store the new tokens
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store token expiry
      const expiresAt = Date.now() + response.expires_in * 1000;
      localStorage.setItem('token_expires_at', expiresAt.toString());
    }
    
    return response;
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    return api.get<User>(AUTH_ENDPOINTS.ME);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    // Check if token has expired
    const now = Date.now();
    const expiry = parseInt(expiresAt, 10);
    
    return now < expiry;
  }
}

export default AuthService;