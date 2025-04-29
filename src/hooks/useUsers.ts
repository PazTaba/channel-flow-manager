// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService, UserPayload, UserActivity } from '@/services/users-service';
import { User, PaginatedResponse, QueryParams } from '@/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  activity: (id: number, params?: QueryParams) => [...userKeys.detail(id), 'activity', params] as const,
};

/**
 * Hook to fetch paginated list of users
 * @param params Pagination and filtering parameters
 */
export function useUsers(params?: QueryParams & {
  role?: 'admin' | 'operator' | 'viewer';
  isActive?: boolean;
}) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: userKeys.list(params || {}),
    queryFn: () => UsersService.getAllUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single user by ID
 * @param id User ID
 */
export function useUser(id: number) {
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: () => UsersService.getUserById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserPayload) => UsersService.createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: number, userData: Partial<UserPayload> }) => 
      UsersService.updateUser(id, userData),
    onSuccess: (updatedUser) => {
      // Update the specific user
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      
      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => UsersService.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      
      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to get a user's activity log
 * @param id User ID
 * @param params Pagination and filtering parameters
 */
export function useUserActivity(id: number, params?: QueryParams & {
  action?: string;
  entityType?: 'channel' | 'source' | 'destination' | 'user' | 'system';
  entityId?: number;
}) {
  return useQuery<PaginatedResponse<UserActivity>>({
    queryKey: userKeys.activity(id, params),
    queryFn: () => UsersService.getUserActivity(id, params),
    staleTime: 60 * 1000, // 1 minute
  });
}