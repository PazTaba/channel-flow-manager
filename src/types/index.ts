// src/types/index.ts

// Source entity type
export interface Source {
    id: number;
    name: string;
    ipAddress: string;
    encryptedMulticastAddress?: string;
    status: 'play' | 'pause';
    protocol: string;
    bandwidth?: number;
    encryptionEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Channel entity type
export interface Channel {
    id: number;
    name: string;
    sourceId: number;
    destinationId: number;
    source?: Source;
    destination?: Destination;
    status: 'active' | 'standby' | 'fault';
    mode: 'active' | 'passive';
    bandwidth: string;
    broadcastIp: string;
    online: boolean;
    primaryDestinationIp?: string;
    secondaryDestinationIp?: string;
    encryptionEnabled?: boolean;
    protocol?: string;
    bitrateIn?: number;
    bitrateOut?: number;
    lastError?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Destination entity type
export interface Destination {
    id: number;
    name: string;
    destinationIp: string;
    portNumber: number;
    status: 'play' | 'pause';
    protocol: string;
    timeToLive: number;
    maxPacketSize: number;
    encryption: string;
    primaryIp?: string;
    secondaryIp?: string;
    createdAt?: string;
    updatedAt?: string;
}

// User entity type
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'operator' | 'viewer';
    lastLogin?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Dashboard stats
export interface DashboardStats {
    total: number;
    active: number;
    standby: number;
    fault: number;
    bandwidth: {
        total: number;
        unit: string;
    };
}

// Channel status for live monitoring
export interface ChannelStatus {
    id: number;
    channelId: number;
    name: string;
    channelLink1Status: 'online' | 'offline';
    channelLink2Status: 'online' | 'offline';
    cpu: number;
    ram: number;
    bitrateIn: number;
    bitrateOut: number;
    status: 'active' | 'standby' | 'fault';
    lastUpdated: string;
}

// Bandwidth data for charts
export interface BandwidthData {
    timestamp: string;
    inbound: number;
    outbound: number;
    unit: string;
}

// System alert
export interface SystemAlert {
    id: number;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    relatedEntityType?: 'channel' | 'source' | 'destination' | 'system';
    relatedEntityId?: number;
}

// Pagination parameters
export interface PaginationParams {
    page: number;
    pageSize: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

// Pagination result
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// API Query Parameters
export interface QueryParams extends Partial<PaginationParams> {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: any;
}