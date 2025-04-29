// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '@/components/ui/use-toast';

// Types for API responses
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

// Error handling interface
export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

// Configuration type
export interface ApiConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

class ApiService {
    private client: AxiosInstance;
    private static instance: ApiService;

    private constructor(config: ApiConfig) {
        this.client = axios.create({
            baseURL: 'http://localhost:3000/api',
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
        });

        this.setupInterceptors();
    }

    public static getInstance(config?: ApiConfig): ApiService {
        if (!ApiService.instance) {
            if (!config) {
                // Default configuration
                config = {
                    baseURL: '/api',
                };
            }
            ApiService.instance = new ApiService(config);
        }
        return ApiService.instance;
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Get token from localStorage
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                const { response } = error;

                // Handle common error scenarios
                if (response) {
                    // Unauthorized - redirect to login
                    if (response.status === 401) {
                        // Clear token and redirect to login
                        localStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    }

                    // Server errors - show toast notification
                    if (response.status >= 500) {
                        toast({
                            title: 'Server Error',
                            description: 'An unexpected error occurred. Please try again later.',
                            variant: 'destructive',
                        });
                    }

                    // Client errors (400-level) - handled by the API call
                    if (response.status >= 400 && response.status < 500) {
                        const errorMessage = response.data?.message || 'An error occurred';
                        toast({
                            title: 'Error',
                            description: errorMessage,
                            variant: 'destructive',
                        });
                    }
                } else {
                    // Network error
                    toast({
                        title: 'Connection Error',
                        description: 'Please check your internet connection and try again.',
                        variant: 'destructive',
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic request method
    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<ApiResponse<T>> = await this.client(config);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    // HTTP methods
    public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url,
            params,
        });
    }

    public async post<T>(url: string, data?: any): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url,
            data,
        });
    }

    public async put<T>(url: string, data?: any): Promise<T> {
        return this.request<T>({
            method: 'PUT',
            url,
            data,
        });
    }

    public async patch<T>(url: string, data?: any): Promise<T> {
        return this.request<T>({
            method: 'PATCH',
            url,
            data,
        });
    }

    public async delete<T>(url: string): Promise<T> {
        return this.request<T>({
            method: 'DELETE',
            url,
        });
    }
}

export default ApiService;
