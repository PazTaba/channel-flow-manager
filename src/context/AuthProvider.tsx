// src/context/AuthProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { useAuth, useTokenRefresh } from "@/hooks/useAuth";
import { User } from "@/types";
import { LoginCredentials, AuthResponse } from "@/services/auth-service";

// Auth context type - updated login return type
interface AuthContextType {
  user: User | undefined;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (role: 'admin' | 'operator' | 'viewer') => boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isViewer: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application and provides authentication context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Use auth hook to get authentication state and functions
  const auth = useAuth();

  // Set up token refresh
  useTokenRefresh();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}