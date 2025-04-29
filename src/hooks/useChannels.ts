// src/hooks/useChannels.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ChannelsService, ChannelPayload } from '@/services/channels-service';
import WebSocketService, { WebSocketEventType } from '@/services/websocket-service';
import { useEffect } from 'react';
import { Channel, ChannelStatus, BandwidthData, PaginatedResponse, QueryParams } from '@/types';

// Query keys
export const channelKeys = {
  all: ['channels'] as const,
  lists: () => [...channelKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...channelKeys.lists(), params] as const,
  details: () => [...channelKeys.all, 'detail'] as const,
  detail: (id: number) => [...channelKeys.details(), id] as const,
  status: (id: number) => [...channelKeys.detail(id), 'status'] as const,
  bandwidth: (id: number, params?: any) => [...channelKeys.detail(id), 'bandwidth', params] as const,
};

/**
 * Hook to fetch paginated list of channels
 * @param params Pagination and filtering parameters
 */
export function useChannels(params?: QueryParams & {
  status?: 'active' | 'standby' | 'fault';
  mode?: 'active' | 'passive';
  online?: boolean;
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateChannel = (data: Partial<Channel>) => {
      if (!data.id) return;

      // Update any existing channel lists that contain this channel
      queryClient.setQueriesData({ queryKey: channelKeys.lists() }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        
        // Find if the updated channel is in our list
        const channelIndex = oldData.data.findIndex((channel: Channel) => channel.id === data.id);
        
        if (channelIndex === -1) return oldData;
        
        // Create a new array with the updated channel
        const newData = [...oldData.data];
        newData[channelIndex] = { ...newData[channelIndex], ...data };
        
        return {
          ...oldData,
          data: newData
        };
      });
    };

    // Subscribe to channel status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannel);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateChannel);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannel);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateChannel);
    };
  }, [queryClient]);

  return useQuery<PaginatedResponse<Channel>>({
    queryKey: channelKeys.list(params || {}),
    queryFn: () => ChannelsService.getAllChannels(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single channel by ID
 * @param id Channel ID
 * @param options Additional query options
 */
export function useChannel(id: number, options?: UseQueryOptions<Channel>) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates for this specific channel
  useEffect(() => {
    const updateChannel = (data: any) => {
      if (data.id !== id && data.channelId !== id) return;
      
      queryClient.setQueryData(channelKeys.detail(id), (oldData: Channel | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to channel status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannel);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateChannel);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateChannel);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateChannel);
    };
  }, [queryClient, id]);

  return useQuery<Channel>({
    queryKey: channelKeys.detail(id),
    queryFn: () => ChannelsService.getChannelById(id),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to create a new channel
 */
export function useCreateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (channelData: ChannelPayload) => ChannelsService.createChannel(channelData),
    onSuccess: () => {
      // Invalidate and refetch channels list
      queryClient.invalidateQueries({ queryKey: channelKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing channel
 */
export function useUpdateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, channelData }: { id: number, channelData: Partial<ChannelPayload> }) => 
      ChannelsService.updateChannel(id, channelData),
    onSuccess: (updatedChannel) => {
      // Update the specific channel
      queryClient.setQueryData(channelKeys.detail(updatedChannel.id), updatedChannel);
      
      // Invalidate channels lists
      queryClient.invalidateQueries({ queryKey: channelKeys.lists() });
    },
  });
}

/**
 * Hook to delete a channel
 */
export function useDeleteChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ChannelsService.deleteChannel(id),
    onSuccess: (_, id) => {
      // Remove the specific channel from cache
      queryClient.removeQueries({ queryKey: channelKeys.detail(id) });
      
      // Invalidate channels lists
      queryClient.invalidateQueries({ queryKey: channelKeys.lists() });
    },
  });
}

/**
 * Hook to get real-time status of a channel
 * @param id Channel ID
 */
export function useChannelStatus(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateStatus = (data: any) => {
      if (data.channelId !== id) return;
      
      queryClient.setQueryData(channelKeys.status(id), (oldData: ChannelStatus | undefined) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to channel status updates
    ws.subscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStatus);
    ws.subscribe(WebSocketEventType.FAULT_EVENT, updateStatus);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.CHANNEL_STATUS_UPDATE, updateStatus);
      ws.unsubscribe(WebSocketEventType.FAULT_EVENT, updateStatus);
    };
  }, [queryClient, id]);

  return useQuery<ChannelStatus>({
    queryKey: channelKeys.status(id),
    queryFn: () => ChannelsService.getChannelStatus(id),
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Hook to get bandwidth usage data for a specific channel
 * @param id Channel ID
 * @param params Time range parameters
 */
export function useChannelBandwidth(id: number, params?: {
  range?: 'hourly' | 'daily' | 'weekly';
  from?: string;
  to?: string;
}) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateBandwidth = (data: any) => {
      if (data.channelId !== id) return;
      
      queryClient.setQueryData(channelKeys.bandwidth(id, params), (oldData: BandwidthData[] | undefined) => {
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
    queryKey: channelKeys.bandwidth(id, params),
    queryFn: () => ChannelsService.getChannelBandwidth(id, params),
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000, // 25 seconds
  });
}

/**
 * Hook to activate a channel (switch to active mode)
 */
export function useActivateChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ChannelsService.activateChannel(id),
    onSuccess: (_, id) => {
      // Invalidate channel status
      queryClient.invalidateQueries({ queryKey: channelKeys.status(id) });
      // Invalidate channel detail
      queryClient.invalidateQueries({ queryKey: channelKeys.detail(id) });
    },
  });
}

/**
 * Hook to set a channel to standby mode
 */
export function useSetChannelToStandby() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ChannelsService.setChannelToStandby(id),
    onSuccess: (_, id) => {
      // Invalidate channel status
      queryClient.invalidateQueries({ queryKey: channelKeys.status(id) });
      // Invalidate channel detail
      queryClient.invalidateQueries({ queryKey: channelKeys.detail(id) });
    },
  });
}