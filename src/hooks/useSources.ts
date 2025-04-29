// src/hooks/useSources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SourcesService, SourcePayload } from '@/services/sources-service';
import WebSocketService, { WebSocketEventType } from '@/services/websocket-service';
import { useEffect } from 'react';
import { Source, PaginatedResponse, QueryParams } from '@/types';

// Query keys
export const sourceKeys = {
  all: ['sources'] as const,
  lists: () => [...sourceKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...sourceKeys.lists(), params] as const,
  details: () => [...sourceKeys.all, 'detail'] as const,
  detail: (id: number) => [...sourceKeys.details(), id] as const,
  status: (id: number) => [...sourceKeys.detail(id), 'status'] as const,
};

/**
 * Hook to fetch paginated list of sources
 * @param params Pagination and filtering parameters
 */
export function useSources(params?: QueryParams) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateSource = (data: Source) => {
      // Update any existing source lists that contain this source
      queryClient.setQueriesData({ queryKey: sourceKeys.lists() }, (oldData: any) => {
        if (!oldData || !oldData.data) return oldData;
        
        // Find if the updated source is in our list
        const sourceIndex = oldData.data.findIndex((source: Source) => source.id === data.id);
        
        if (sourceIndex === -1) return oldData;
        
        // Create a new array with the updated source
        const newData = [...oldData.data];
        newData[sourceIndex] = { ...newData[sourceIndex], ...data };
        
        return {
          ...oldData,
          data: newData
        };
      });
      
      // Also update individual source details if we have them cached
      queryClient.setQueryData(sourceKeys.detail(data.id), (oldData: Source | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to source status updates
    ws.subscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateSource);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateSource);
    };
  }, [queryClient]);

  return useQuery<PaginatedResponse<Source>>({
    queryKey: sourceKeys.list(params || {}),
    queryFn: () => SourcesService.getAllSources(params),
    // Longer stale time since source configs change less frequently
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single source by ID
 * @param id Source ID
 */
export function useSource(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates for this specific source
  useEffect(() => {
    const updateSource = (data: any) => {
      if (data.id !== id) return;
      
      queryClient.setQueryData(sourceKeys.detail(id), (oldData: Source | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to source status updates
    ws.subscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateSource);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateSource);
    };
  }, [queryClient, id]);

  return useQuery<Source>({
    queryKey: sourceKeys.detail(id),
    queryFn: () => SourcesService.getSourceById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new source
 */
export function useCreateSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sourceData: SourcePayload) => SourcesService.createSource(sourceData),
    onSuccess: () => {
      // Invalidate and refetch sources list
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing source
 */
export function useUpdateSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, sourceData }: { id: number, sourceData: Partial<SourcePayload> }) => 
      SourcesService.updateSource(id, sourceData),
    onSuccess: (updatedSource) => {
      // Update the specific source
      queryClient.setQueryData(sourceKeys.detail(updatedSource.id), updatedSource);
      
      // Invalidate sources lists
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    },
  });
}

/**
 * Hook to delete a source
 */
export function useDeleteSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => SourcesService.deleteSource(id),
    onSuccess: (_, id) => {
      // Remove the specific source from cache
      queryClient.removeQueries({ queryKey: sourceKeys.detail(id) });
      
      // Invalidate sources lists
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    },
  });
}

/**
 * Hook to get real-time status of a source
 * @param id Source ID
 */
export function useSourceStatus(id: number) {
  const queryClient = useQueryClient();
  const ws = WebSocketService.getInstance();

  // Set up real-time updates
  useEffect(() => {
    const updateStatus = (data: any) => {
      if (data.id !== id) return;
      
      queryClient.setQueryData(sourceKeys.status(id), (oldData: any) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      });
    };

    // Subscribe to source status updates
    ws.subscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateStatus);
    
    // Ensure WebSocket connection is active
    ws.connect();

    return () => {
      ws.unsubscribe(WebSocketEventType.SOURCE_STATUS_UPDATE, updateStatus);
    };
  }, [queryClient, id]);

  return useQuery({
    queryKey: sourceKeys.status(id),
    queryFn: () => SourcesService.getSourceStatus(id),
    refetchInterval: 10000, // 10 seconds
    staleTime: 5000, // 5 seconds
  });
}

/**
 * Hook to pause a source stream
 */
export function usePauseSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => SourcesService.pauseSource(id),
    onSuccess: (_, id) => {
      // Invalidate source status
      queryClient.invalidateQueries({ queryKey: sourceKeys.status(id) });
      // Invalidate source detail
      queryClient.invalidateQueries({ queryKey: sourceKeys.detail(id) });
    },
  });
}

/**
 * Hook to resume a paused source stream
 */
export function useResumeSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => SourcesService.resumeSource(id),
    onSuccess: (_, id) => {
      // Invalidate source status
      queryClient.invalidateQueries({ queryKey: sourceKeys.status(id) });
      // Invalidate source detail
      queryClient.invalidateQueries({ queryKey: sourceKeys.detail(id) });
    },
  });
}