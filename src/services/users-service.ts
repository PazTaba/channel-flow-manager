// src/services/users-service.ts
import ApiService from './api';
import { User, PaginatedResponse, QueryParams } from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Users API endpoints
const USERS_ENDPOINTS = {
  BASE: '/users',
  DETAIL: (id: number) => `/users/${id}`,
  ACTIVITY: (id: number) => `/users/${id}/activity`,
};

// User creation/update payload
export interface UserPayload {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'operator' | 'viewer';
  password?: string;
  isActive?: boolean;
}

// User activity log entry
export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  entityType: 'channel' | 'source' | 'destination' | 'user' | 'system';
  entityId?: number;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

/**
 * Service class for Users related API calls
 */
export class UsersService {
  /**
   * Get all users with pagination
   * @param params Pagination and filtering parameters
   */
  static async getAllUsers(params?: QueryParams & {
    role?: 'admin' | 'operator' | 'viewer';
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> {
    return api.get<PaginatedResponse<User>>(USERS_ENDPOINTS.BASE, params);
  }

  /**
   * Get a single user by ID
   * @param id User ID
   */
  static async getUserById(id: number): Promise<User> {
    return api.get<User>(USERS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Create a new user
   * @param userData User data to create
   */
  static async createUser(userData: UserPayload): Promise<User> {
    return api.post<User>(USERS_ENDPOINTS.BASE, userData);
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData Updated user data
   */
  static async updateUser(id: number, userData: Partial<UserPayload>): Promise<User> {
    return api.put<User>(USERS_ENDPOINTS.DETAIL(id), userData);
  }

  /**
   * Delete a user
   * @param id User ID
   */
  static async deleteUser(id: number): Promise<void> {
    return api.delete<void>(USERS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Get a user's activity log
   * @param id User ID
   * @param params Pagination and filtering parameters
   */
  static async getUserActivity(id: number, params?: QueryParams & {
    action?: string;
    entityType?: 'channel' | 'source' | 'destination' | 'user' | 'system';
    entityId?: number;
  }): Promise<PaginatedResponse<UserActivity>> {
    return api.get<PaginatedResponse<UserActivity>>(USERS_ENDPOINTS.ACTIVITY(id), params);
  }
}

export default UsersService;