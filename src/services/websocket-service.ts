// src/services/websocket-service.ts
import { toast } from '@/components/ui/use-toast';

type EventCallback = (data: any) => void;
type ConnectionStatusCallback = (status: boolean) => void;

// WebSocket event types
export enum WebSocketEventType {
    CHANNEL_STATUS_UPDATE = 'channel_status_update',
    BANDWIDTH_ALERT = 'bandwidth_alert',
    FAULT_EVENT = 'fault_event',
    SOURCE_STATUS_UPDATE = 'source_status_update',
    DESTINATION_STATUS_UPDATE = 'destination_status_update',
    SYSTEM_ALERT = 'system_alert',
}

/**
 * Service for handling WebSocket connections and real-time events
 */
class WebSocketService {
    private socket: WebSocket | null = null;
    private eventHandlers: Map<string, EventCallback[]> = new Map();
    private connectionStatusCallbacks: ConnectionStatusCallback[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private baseReconnectDelay = 1000; // 1 second initial delay
    private url: string;
    private static instance: WebSocketService;

    private constructor(url: string) {
        this.url = 'http://localhost:3000/';
    }

    public static getInstance(url?: string): WebSocketService {
        if (!WebSocketService.instance) {
            if (!url) {
                // Default WebSocket URL
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                url = `${protocol}//${host}/api/events`;
            }
            WebSocketService.instance = new WebSocketService(url);
        }
        return WebSocketService.instance;
    }

    /**
     * Connect to the WebSocket server
     */
    public connect(): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            console.log('WebSocket connection already open');
            return;
        }

        console.log(`Connecting to WebSocket at ${this.url}`);

        try {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onerror = this.handleError.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    /**
     * Subscribe to a specific event type
     * @param eventType Event type to subscribe to
     * @param callback Callback to execute when event occurs
     */
    public subscribe(eventType: WebSocketEventType, callback: EventCallback): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)?.push(callback);
    }

    /**
     * Unsubscribe from a specific event type
     * @param eventType Event type to unsubscribe from
     * @param callback Callback to remove
     */
    public unsubscribe(eventType: WebSocketEventType, callback: EventCallback): void {
        if (!this.eventHandlers.has(eventType)) return;

        const handlers = this.eventHandlers.get(eventType) || [];
        const index = handlers.indexOf(callback);

        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    /**
     * Subscribe to connection status changes
     * @param callback Callback to execute on connection status change
     */
    public onConnectionStatus(callback: ConnectionStatusCallback): void {
        this.connectionStatusCallbacks.push(callback);
    }

    /**
     * Handle WebSocket open event
     */
    private handleOpen(event: Event): void {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus(true);
    }

    /**
     * Handle WebSocket close event
     */
    private handleClose(event: CloseEvent): void {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.notifyConnectionStatus(false);
        this.scheduleReconnect();
    }

    /**
     * Handle WebSocket error event
     */
    private handleError(event: Event): void {
        console.error('WebSocket error:', event);
        this.notifyConnectionStatus(false);

        // The socket will also trigger onclose after an error
    }

    /**
     * Handle WebSocket message event
     */
    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;

            // Alert significant events through the UI
            if (type === WebSocketEventType.FAULT_EVENT || type === WebSocketEventType.BANDWIDTH_ALERT) {
                toast({
                    title: type === WebSocketEventType.FAULT_EVENT ? 'Fault Detected' : 'Bandwidth Alert',
                    description: payload.message,
                    variant: 'destructive',
                });
            }

            // Dispatch to all registered handlers for this event type
            if (this.eventHandlers.has(type)) {
                const handlers = this.eventHandlers.get(type) || [];
                handlers.forEach(handler => handler(payload));
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    /**
     * Notify all subscribers of connection status change
     */
    private notifyConnectionStatus(isConnected: boolean): void {
        this.connectionStatusCallbacks.forEach(callback => callback(isConnected));
    }

    /**
     * Schedule a reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Maximum reconnect attempts reached');
            return;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        // Exponential backoff
        const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
        console.log(`Scheduling reconnect in ${delay}ms`);

        this.reconnectTimeout = setTimeout(() => {
            console.log(`Reconnect attempt ${this.reconnectAttempts + 1} of ${this.maxReconnectAttempts}`);
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
}

export default WebSocketService;