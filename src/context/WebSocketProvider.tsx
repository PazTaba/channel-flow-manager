// src/context/WebSocketProvider.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import WebSocketService, { WebSocketEventType } from "@/services/websocket-service";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/context/AuthProvider";

// WebSocket context type
interface WebSocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (eventType: WebSocketEventType, callback: (data: any) => void) => void;
  unsubscribe: (eventType: WebSocketEventType, callback: (data: any) => void) => void;
}

// Create context with a default value
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Props for WebSocketProvider component
interface WebSocketProviderProps {
  children: ReactNode;
}

/**
 * WebSocketProvider component that provides WebSocket connection and events
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const ws = WebSocketService.getInstance();
  
  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    // Only connect if the user is authenticated
    if (isAuthenticated()) {
      ws.connect();
      
      // Set up connection status listener
      ws.onConnectionStatus(setIsConnected);
      
      // Set up automatic alerts for system events
      const handleSystemAlert = (data: any) => {
        if (data && data.title) {
          toast({
            title: data.title,
            description: data.description || "",
            variant: data.type === "critical" || data.type === "warning" ? "destructive" : "default",
          });
        }
      };
      
      ws.subscribe(WebSocketEventType.SYSTEM_ALERT, handleSystemAlert);
      
      // Clean up on unmount
      return () => {
        ws.unsubscribe(WebSocketEventType.SYSTEM_ALERT, handleSystemAlert);
        ws.disconnect();
      };
    }
  }, [isAuthenticated]);
  
  // Connection status indicator toast
  useEffect(() => {
    // Only show connection status changes after initial connection attempt
    if (isConnected) {
      toast({
        title: "Connected to real-time updates",
        description: "You will receive live updates for channels and system events.",
        variant: "default",
      });
    } else if (isAuthenticated()) {
      // Only show disconnected toast if we expect to be connected
      toast({
        title: "Disconnected from real-time updates",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    }
  }, [isConnected, isAuthenticated]);
  
  // Context value
  const value: WebSocketContextType = {
    isConnected,
    connect: ws.connect.bind(ws),
    disconnect: ws.disconnect.bind(ws),
    subscribe: ws.subscribe.bind(ws),
    unsubscribe: ws.unsubscribe.bind(ws),
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to use the WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  
  return context;
}