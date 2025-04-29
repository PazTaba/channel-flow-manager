// src/services/dashboard-service.ts
import ApiService from './api';
import {
    DashboardStats,
    BandwidthData,
    Channel,
    SystemAlert,
    QueryParams
} from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Dashboard API endpoints
const DASHBOARD_ENDPOINTS = {
    STATUS: '/dashboard/status',
    BANDWIDTH: '/dashboard/bandwidth',
    TOP_CHANNELS: '/dashboard/channels/top',
    ALERTS: '/dashboard/alerts',
};

/**
 * Service class for Dashboard related API calls
 */
export class DashboardService {
    /**
     * Get overall system health and status
     */
    static async getStatus(): Promise<DashboardStats> {
        return api.get<DashboardStats>(DASHBOARD_ENDPOINTS.STATUS);
    }

    /**
     * Get bandwidth usage metrics
     * @param params Time range and granularity parameters
     */
    static async getBandwidthData(params?: {
        range?: 'daily' | 'weekly' | 'monthly',
        from?: string,
        to?: string,
    }): Promise<BandwidthData[]> {
        return api.get<BandwidthData[]>(DASHBOARD_ENDPOINTS.BANDWIDTH, params);
    }

    /**
     * Get top active/critical channels
     * @param params Optional filtering parameters
     */
    static async getTopChannels(params?: {
        limit?: number,
        status?: 'active' | 'standby' | 'fault',
        sortBy?: 'bandwidth' | 'priority' | 'status',
    }): Promise<Channel[]> {
        return api.get<Channel[]>(DASHBOARD_ENDPOINTS.TOP_CHANNELS, params);
    }

    /**
     * Get system alerts
     * @param params Filtering and pagination parameters
     */
    static async getAlerts(params?: QueryParams & {
        type?: 'critical' | 'warning' | 'info' | 'success',
        read?: boolean,
    }): Promise<SystemAlert[]> {
        return api.get<SystemAlert[]>(DASHBOARD_ENDPOINTS.ALERTS, params);
    }

    /**
     * Mark alert as read
     * @param id Alert ID
     */
    static async markAlertAsRead(id: number): Promise<void> {
        return api.patch<void>(`${DASHBOARD_ENDPOINTS.ALERTS}/${id}/read`);
    }

    /**
     * Mark all alerts as read
     */
    static async markAllAlertsAsRead(): Promise<void> {
        return api.patch<void>(`${DASHBOARD_ENDPOINTS.ALERTS}/read-all`);
    }

    /**
     * Dismiss an alert
     * @param id Alert ID
     */
    static async dismissAlert(id: number): Promise<void> {
        return api.delete<void>(`${DASHBOARD_ENDPOINTS.ALERTS}/${id}`);
    }
}

export default DashboardService;