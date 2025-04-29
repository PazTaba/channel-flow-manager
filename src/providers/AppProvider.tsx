// src/providers/AppProvider.tsx
import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { WebSocketProvider } from "@/context/WebSocketProvider";

// Create a QueryClient for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
});

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that wraps the entire application with necessary providers
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="channel-link-theme">
        <BrowserRouter>
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}