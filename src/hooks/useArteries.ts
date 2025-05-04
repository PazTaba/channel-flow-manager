
// src/hooks/useArteries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArteriesService, ArteryPayload } from '@/services/channels-service';
import WebSocketService, { WebSocketEventType } from '@/services/websocket-service';
import { useEffect } from 'react';
import { Artery, ArteryStatus, BandwidthData, PaginatedResponse, QueryParams } from '@/types';

// Query keys
export const arteryKeys = {
  all: ['arteries'] as const,
  lists: () => [...arteryKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...arteryKeys.lists(), params] as const,
  details: () => [...arteryKeys.all, 'detail'] as const,
  detail: (id: number) => [...arteryKeys.details(), id] as const,
  status: (id: number) => [...arteryKeys.detail(id), 'status'] as const,
  bandwidth: (id: number, params?: any) => [...arteryKeys.detail(id), 'bandwidth', params] as const,
};

/**
 * Hook to fetch paginated list of arteries
 * @param params Pagination and filtering parameters
 */
export function useArteries(params?: QueryParams & {
  status?: 'active' | 'standby' | 'fault';
  online?: boolean;
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateArtery = (data: Partial<Artery>) => {
      if (!data.id) return;

      // Update any existing artery lists that contain this artery
      queryClient.setQueriesData({ queryKey: arteryKeys.lists() }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        
        // Find if the updated artery is in our list
        const arteryIndex = oldData.data.findIndex((artery: Artery) => artery.id === data.id);
        
        if (arteryIndex === -1) return oldData;
        
        // Create a new array with the updated artery
        const newData = [...oldData.data];
        newData[arteryIndex] = { ...newData[arteryIndex], ...data };
        
        return {
          ...oldData,
          data: newData
        };
      });
    };

    // Subscribe to artery status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateArtery);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateArtery);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateArtery);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateArtery);
    };
  }, [queryClient]);

  return useQuery<PaginatedResponse<Artery>>({
    queryKey: arteryKeys.list(params || {}),
    queryFn: () => ArteriesService.getAllArteries(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single artery by ID
 * @param id Artery ID
 */
export function useArtery(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates for this specific artery
  useEffect(() => {
    const updateArtery = (data: any) => {
      if (data.id !== id && data.arteryId !== id) return;
      
      queryClient.setQueryData(arteryKeys.detail(id), (oldData: Artery | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to artery status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateArtery);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateArtery);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateArtery);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateArtery);
    };
  }, [queryClient, id]);

  return useQuery<Artery>({
    queryKey: arteryKeys.detail(id),
    queryFn: () => ArteriesService.getArteryById(id),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a new artery
 */
export function useCreateArtery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (arteryData: ArteryPayload) => ArteriesService.createArtery(arteryData),
    onSuccess: () => {
      // Invalidate and refetch arteries list
      queryClient.invalidateQueries({ queryKey: arteryKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing artery
 */
export function useUpdateArtery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, arteryData }: { id: number, arteryData: Partial<ArteryPayload> }) => 
      ArteriesService.updateArtery(id, arteryData),
    onSuccess: (updatedArtery) => {
      // Update the specific artery
      queryClient.setQueryData(arteryKeys.detail(updatedArtery.id), updatedArtery);
      
      // Invalidate arteries lists
      queryClient.invalidateQueries({ queryKey: arteryKeys.lists() });
    },
  });
}

/**
 * Hook to delete an artery
 */
export function useDeleteArtery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ArteriesService.deleteArtery(id),
    onSuccess: (_, id) => {
      // Remove the specific artery from cache
      queryClient.removeQueries({ queryKey: arteryKeys.detail(id) });
      
      // Invalidate arteries lists
      queryClient.invalidateQueries({ queryKey: arteryKeys.lists() });
    },
  });
}

/**
 * Hook to get real-time status of an artery
 * @param id Artery ID
 */
export function useArteryStatus(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateStatus = (data: any) => {
      if (data.arteryId !== id) return;
      
      queryClient.setQueryData(arteryKeys.status(id), (oldData: ArteryStatus | undefined) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to artery status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStatus);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateStatus);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStatus);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateStatus);
    };
  }, [queryClient, id]);

  return useQuery<ArteryStatus>({
    queryKey: arteryKeys.status(id),
    queryFn: () => ArteriesService.getArteryStatus(id),
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Hook to get bandwidth usage data for a specific artery
 * @param id Artery ID
 * @param params Time range parameters
 */
export function useArteryBandwidth(id: number, params?: {
  range?: 'hourly' | 'daily' | 'weekly';
  from?: string;
  to?: string;
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateBandwidth = (data: any) => {
      if (data.arteryId !== id) return;
      
      queryClient.setQueryData(arteryKeys.bandwidth(id, params), (oldData: BandwidthData[] | undefined) => {
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
  }, [queryClient, id, params]);

  return useQuery<BandwidthData[]>({
    queryKey: arteryKeys.bandwidth(id, params),
    queryFn: () => ArteriesService.getArteryBandwidth(id, params),
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000, // 25 seconds
  });
}

/**
 * Hook to activate an artery
 */
export function useActivateArtery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ArteriesService.activateArtery(id),
    onSuccess: (_, id) => {
      // Invalidate artery status
      queryClient.invalidateQueries({ queryKey: arteryKeys.status(id) });
      // Invalidate artery detail
      queryClient.invalidateQueries({ queryKey: arteryKeys.detail(id) });
    },
  });
}

/**
 * Hook to set an artery to standby mode
 */
export function useSetArteryToStandby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ArteriesService.setArteryToStandby(id),
    onSuccess: (_, id) => {
      // Invalidate artery status
      queryClient.invalidateQueries({ queryKey: arteryKeys.status(id) });
      // Invalidate artery detail
      queryClient.invalidateQueries({ queryKey: arteryKeys.detail(id) });
    },
  });
}

/**
 * Hook to switch between primary and backup channels
 */
export function useSwitchChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, useBackup }: { id: number, useBackup: boolean }) => 
      ArteriesService.switchChannel(id, useBackup),
    onSuccess: (_, { id }) => {
      // Invalidate artery status
      queryClient.invalidateQueries({ queryKey: arteryKeys.status(id) });
      // Invalidate artery detail
      queryClient.invalidateQueries({ queryKey: arteryKeys.detail(id) });
    },
  });
}
