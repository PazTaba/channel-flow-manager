// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService, LoginCredentials, AuthResponse } from '@/services/auth-service';
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook for authentication and user management
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication state on mount
  useEffect(() => {
    // Initialize by checking if we're authenticated
    const checkAuth = async () => {
      const isAuthenticated = AuthService.isAuthenticated();

      if (isAuthenticated) {
        try {
          // Prefetch the current user for the cache
          await queryClient.prefetchQuery({
            queryKey: authKeys.user(),
            queryFn: AuthService.getCurrentUser,
          });
        } catch (error) {
          // If fetching user fails, log out
          await AuthService.logout();
        }
      }

      setIsInitialized(true);
    };

    checkAuth();
  }, [queryClient]);

  // Get current user query
  const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<User>({
    queryKey: authKeys.user(),
    queryFn: AuthService.getCurrentUser,
    // Don't fetch if not authenticated to avoid unnecessary 401s
    enabled: isInitialized && AuthService.isAuthenticated(),
    // Keep cache valid for a moderate time since user data changes infrequently
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation - return the full Auth Response
  const { mutateAsync: login, isPending: isLoggingIn } = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: async () => {
      // After login, fetch the user data
      await queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  // Logout mutation
  const { mutateAsync: logout, isPending: isLoggingOut } = useMutation<void, Error>({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(authKeys.user(), null);

      // Reset all queries to ensure no stale data persists
      queryClient.resetQueries();
    },
  });

  // Check if the user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && AuthService.isAuthenticated();
  }, [user]);

  // Check if the user has a specific role
  const hasRole = useCallback((role: 'admin' | 'operator' | 'viewer') => {
    return !!user && user.role === role;
  }, [user]);

  // Function to refresh token
  const refreshToken = useCallback(async () => {
    try {
      await AuthService.refreshToken();
      return true;
    } catch (error) {
      // If refresh fails, clear auth state
      await logout();
      return false;
    }
  }, [logout]);

  return {
    user,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    hasRole,
    isAdmin: !!user && user.role === 'admin',
    isOperator: !!user && user.role === 'operator',
    isViewer: !!user && user.role === 'viewer',
    isLoading: isLoadingUser || isLoggingIn || isLoggingOut,
    isInitialized,
    error: userError,
  };
}

/**
 * Hook for token auto-refresh
 * Automatically refreshes the token when it's about to expire
 */
export function useTokenRefresh() {
  const { refreshToken } = useAuth();

  useEffect(() => {
    // Get token expiration time
    const expiresAtStr = localStorage.getItem('token_expires_at');
    if (!expiresAtStr) return;

    const expiresAt = parseInt(expiresAtStr, 10);

    // Set up a timer to refresh the token 1 minute before it expires
    const refreshTime = expiresAt - Date.now() - 60 * 1000; // 1 minute before expiry

    // If token is already expired or expires in less than 10 seconds, refresh now
    if (refreshTime < 10 * 1000) {
      refreshToken();
      return;
    }

    // Set up the refresh timer
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    // Clean up the timer when component unmounts
    return () => {
      clearTimeout(refreshTimer);
    };
  }, [refreshToken]);
}