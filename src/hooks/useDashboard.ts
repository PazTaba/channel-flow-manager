// src/hooks/useDashboard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard-service';
import WebSocketService, { WebSocketEventType } from '@/services/websocket-service';
import { useEffect } from 'react';
import { DashboardStats, BandwidthData, Channel, SystemAlert } from '@/types';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  status: () => [...dashboardKeys.all, 'status'] as const,
  bandwidth: (params?: any) => [...dashboardKeys.all, 'bandwidth', params] as const,
  topChannels: (params?: any) => [...dashboardKeys.all, 'topChannels', params] as const,
  alerts: (params?: any) => [...dashboardKeys.all, 'alerts', params] as const,
};

/**
 * Hook to fetch dashboard status
 * Polls every 30 seconds for semi-live updates
 */
export function useDashboardStatus() {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateStats = (data: Partial<DashboardStats>) => {
      queryClient.setQueryData(dashboardKeys.status(), (oldData: DashboardStats | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to relevant WebSocket events
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStats);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateStats);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStats);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateStats);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: dashboardKeys.status(),
    queryFn: () => DashboardService.getStatus(),
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000, // 25 seconds
  });
}

/**
 * Hook to fetch bandwidth data
 * @param params Time range and granularity parameters
 */
export function useBandwidthData(params?: { 
  range?: 'daily' | 'weekly' | 'monthly',
  from?: string,
  to?: string,
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateBandwidth = (data: BandwidthData) => {
      queryClient.setQueryData(dashboardKeys.bandwidth(params), (oldData: BandwidthData[] | undefined) => {
        if (!oldData) return oldData;
        
        // Check if we already have data for this timestamp
        const existingIndex = oldData.findIndex(item => item.timestamp === data.timestamp);
        
        if (existingIndex >= 0) {
          // Update existing entry
          const newData = [...oldData];
          newData[existingIndex] = { ...newData[existingIndex], ...data };
          return newData;
        } else {
          // Add new entry and sort by timestamp
          return [...oldData, data].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        }
      });
    };

    // Subscribe to bandwidth alerts
    ws.subscribe(WebSocketEventType.BANDWIDTH_ALERT, updateBandwidth);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.BANDWIDTH_ALERT, updateBandwidth);
    };
  }, [queryClient, params]);

  return useQuery({
    queryKey: dashboardKeys.bandwidth(params),
    queryFn: () => DashboardService.getBandwidthData(params),
    refetchInterval: 60000, // 1 minute
    staleTime: 55000, // 55 seconds
  });
}

/**
 * Hook to fetch top channels
 * @param params Optional filtering parameters
 */
export function useTopChannels(params?: {
  limit?: number,
  status?: 'active' | 'standby' | 'fault',
  sortBy?: 'bandwidth' | 'priority' | 'status',
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateChannels = (data: Channel) => {
      queryClient.setQueryData(dashboardKeys.topChannels(params), (oldData: Channel[] | undefined) => {
        if (!oldData) return oldData;
        
        // Check if this channel is in our current list
        const existingIndex = oldData.findIndex(channel => channel.id === data.id);
        
        if (existingIndex >= 0) {
          // Update existing channel
          const newData = [...oldData];
          newData[existingIndex] = { ...newData[existingIndex], ...data };
          return newData;
        }
        
        return oldData;
      });
    };

    // Subscribe to channel status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannels);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannels);
    };
  }, [queryClient, params]);

  return useQuery({
    queryKey: dashboardKeys.topChannels(params),
    queryFn: () => DashboardService.getTopChannels(params),
    refetchInterval: 15000, // 15 seconds
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook to fetch system alerts
 * @param params Filtering and pagination parameters
 */
export function useSystemAlerts(params?: {
  page?: number,
  pageSize?: number,
  type?: 'critical' | 'warning' | 'info' | 'success',
  read?: boolean,
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const addAlert = (data: SystemAlert) => {
      queryClient.setQueryData(dashboardKeys.alerts(params), (oldData: SystemAlert[] | undefined) => {
        if (!oldData) return [data];
        
        // Check if we already have this alert
        const existingIndex = oldData.findIndex(alert => alert.id === data.id);
        
        if (existingIndex >= 0) {
          // Update existing alert
          const newData = [...oldData];
          newData[existingIndex] = { ...newData[existingIndex], ...data };
          return newData;
        } else {
          // Add new alert at the beginning (most recent first)
          return [data, ...oldData];
        }
      });
    };

    // Subscribe to system alerts
    ws.subscribe(WebSocketEventType.SYSTEM_ALERT, addAlert);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.SYSTEM_ALERT, addAlert);
    };
  }, [queryClient, params]);

  return useQuery({
    queryKey: dashboardKeys.alerts(params),
    queryFn: () => DashboardService.getAlerts(params),
    refetchInterval: 30000, // 30 seconds
  });
}

/**
 * Hook to mark an alert as read
 */
export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: number) => DashboardService.markAlertAsRead(alertId),
    onSuccess: (_, alertId) => {
      // Update all alerts queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });
}

/**
 * Hook to mark all alerts as read
 */
export function useMarkAllAlertsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => DashboardService.markAllAlertsAsRead(),
    onSuccess: () => {
      // Update all alerts queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });
}

/**
 * Hook to dismiss an alert
 */
export function useDismissAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: number) => DashboardService.dismissAlert(alertId),
    onSuccess: () => {
      // Update all alerts queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });
}