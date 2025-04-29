// src/hooks/useDestinations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DestinationsService, DestinationPayload } from '@/services/destinations-service';
import WebSocketService, { WebSocketEventType } from '@/services/websocket-service';
import { useEffect } from 'react';
import { Destination, PaginatedResponse, QueryParams } from '@/types';

// Query keys
export const destinationKeys = {
  all: ['destinations'] as const,
  lists: () => [...destinationKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...destinationKeys.lists(), params] as const,
  details: () => [...destinationKeys.all, 'detail'] as const,
  detail: (id: number) => [...destinationKeys.details(), id] as const,
  status: (id: number) => [...destinationKeys.detail(id), 'status'] as const,
};

/**
 * Hook to fetch paginated list of destinations
 * @param params Pagination and filtering parameters
 */
export function useDestinations(params?: QueryParams) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateDestination = (data: Partial<Destination>) => {
      if (!data.id) return;

      // Update any existing destination lists that contain this destination
      queryClient.setQueriesData({ queryKey: destinationKeys.lists() }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        
        // Find if the updated destination is in our list
        const destIndex = oldData.data.findIndex((dest: Destination) => dest.id === data.id);
        
        if (destIndex === -1) return oldData;
        
        // Create a new array with the updated destination
        const newData = [...oldData.data];
        newData[destIndex] = { ...newData[destIndex], ...data };
        
        return {
          ...oldData,
          data: newData
        };
      });
    };

    // Subscribe to destination status updates
    ws.subscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateDestination);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateDestination);
    };
  }, [queryClient]);

  return useQuery<PaginatedResponse<Destination>>({
    queryKey: destinationKeys.list(params || {}),
    queryFn: () => DestinationsService.getAllDestinations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single destination by ID
 * @param id Destination ID
 */
export function useDestination(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates for this specific destination
  useEffect(() => {
    const updateDestination = (data: any) => {
      if (data.id !== id) return;
      
      queryClient.setQueryData(destinationKeys.detail(id), (oldData: Destination | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to destination status updates
    ws.subscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateDestination);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateDestination);
    };
  }, [queryClient, id]);

  return useQuery<Destination>({
    queryKey: destinationKeys.detail(id),
    queryFn: () => DestinationsService.getDestinationById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new destination
 */
export function useCreateDestination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (destinationData: DestinationPayload) => 
      DestinationsService.createDestination(destinationData),
    onSuccess: () => {
      // Invalidate and refetch destinations list
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing destination
 */
export function useUpdateDestination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, destinationData }: { id: number, destinationData: Partial<DestinationPayload> }) => 
      DestinationsService.updateDestination(id, destinationData),
    onSuccess: (updatedDestination) => {
      // Update the specific destination
      queryClient.setQueryData(destinationKeys.detail(updatedDestination.id), updatedDestination);
      
      // Invalidate destinations lists
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}

/**
 * Hook to delete a destination
 */
export function useDeleteDestination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => DestinationsService.deleteDestination(id),
    onSuccess: (_, id) => {
      // Remove the specific destination from cache
      queryClient.removeQueries({ queryKey: destinationKeys.detail(id) });
      
      // Invalidate destinations lists
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}

/**
 * Hook to get real-time delivery state of a destination
 * @param id Destination ID
 */
export function useDestinationStatus(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateStatus = (data: any) => {
      if (data.id !== id) return;
      
      queryClient.setQueryData(destinationKeys.status(id), (oldData: any) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to destination status updates
    ws.subscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateStatus);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.DESTINATION_STATUS_UPDATE, updateStatus);
    };
  }, [queryClient, id]);

  return useQuery({
    queryKey: destinationKeys.status(id),
    queryFn: () => DestinationsService.getDestinationStatus(id),
    refetchInterval: 15000, // 15 seconds
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook to toggle the status of a destination between play and pause
 */
export function useToggleDestinationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: 'play' | 'pause' }) => 
      DestinationsService.toggleDestinationStatus(id, status),
    onSuccess: (_, { id }) => {
      // Invalidate destination status
      queryClient.invalidateQueries({ queryKey: destinationKeys.status(id) });
      // Invalidate destination detail
      queryClient.invalidateQueries({ queryKey: destinationKeys.detail(id) });
    },
  });
}