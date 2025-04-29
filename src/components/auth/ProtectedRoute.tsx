// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('admin' | 'operator' | 'viewer')[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that restricts access based on authentication and role
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, isLoading, isInitialized, user } = useAuthContext();
  const location = useLocation();
  
  // Show loading state while authentication is being checked
  if (!isInitialized || isLoading) {
    return (
      <div className="w-full p-8 flex flex-col space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-2/3 mx-auto" />
      </div>
    );
  }
  
  // Check if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated()) {
    // Redirect to login with the current location as a redirect parameter
    return <Navigate to={`${redirectTo}?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Check if user has required role (if specified)
  if (requireAuth && allowedRoles && allowedRoles.length > 0 && user) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    
    if (!hasAllowedRole) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // User is authenticated and has required role (if any)
  return <>{children}</>;
}