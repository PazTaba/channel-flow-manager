// src/mocks/mockData.ts
import { 
  Channel, 
  Source, 
  Destination, 
  User, 
  DashboardStats, 
  ChannelStatus, 
  BandwidthData, 
  SystemAlert,
  PaginatedResponse,
} from '@/types';

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  total: 24,
  active: 18,
  standby: 4,
  fault: 2,
  bandwidth: {
    total: 3850,
    unit: 'Mbps'
  }
};

// Mock sources
export const mockSources: Source[] = [
  {
    id: 1,
    name: "Main Feed",
    ipAddress: "192.168.1.10",
    encryptedMulticastAddress: "239.255.0.1",
    status: "play",
    protocol: "UDP TS",
    bandwidth: 1200,
    encryptionEnabled: false,
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-04-10T14:22:00Z"
  },
  {
    id: 2,
    name: "Backup Source",
    ipAddress: "192.168.1.11",
    encryptedMulticastAddress: "239.255.0.2",
    status: "pause",
    protocol: "UDP TS",
    bandwidth: 850,
    encryptionEnabled: true,
    createdAt: "2025-01-15T10:15:00Z",
    updatedAt: "2025-04-18T09:45:00Z"
  },
  {
    id: 3,
    name: "Remote Feed",
    ipAddress: "10.10.5.22",
    encryptedMulticastAddress: "239.255.0.3",
    status: "play",
    protocol: "SRT",
    bandwidth: 620,
    encryptionEnabled: true,
    createdAt: "2025-02-05T16:20:00Z",
    updatedAt: "2025-04-20T11:30:00Z"
  }
];

// Mock channels
export const mockChannels: Channel[] = [
  {
    id: 1,
    name: "Main Feed",
    sourceId: 1,
    destinationId: 1,
    source: mockSources[0],
    status: "active",
    mode: "active",
    bandwidth: "1.2 Gbps",
    broadcastIp: "239.255.0.1",
    online: true,
    primaryDestinationIp: "239.255.1.1",
    secondaryDestinationIp: "239.255.1.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 1250,
    bitrateOut: 1180
  },
  {
    id: 2,
    name: "Backup Link",
    sourceId: 2,
    destinationId: 2,
    source: mockSources[1],
    status: "active",
    mode: "active",
    bandwidth: "850 Mbps",
    broadcastIp: "239.255.0.2",
    online: true,
    primaryDestinationIp: "239.255.2.1",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 870,
    bitrateOut: 800
  },
  {
    id: 3,
    name: "Remote Site A",
    sourceId: 3,
    destinationId: 3,
    source: mockSources[2],
    status: "active",
    mode: "active",
    bandwidth: "620 Mbps",
    broadcastIp: "239.255.0.3",
    online: true,
    primaryDestinationIp: "239.255.3.1",
    secondaryDestinationIp: "239.255.3.2",
    encryptionEnabled: true,
    protocol: "SRT",
    bitrateIn: 320,
    bitrateOut: 290
  },
  {
    id: 4,
    name: "Cloud Storage",
    sourceId: 1,
    destinationId: 4,
    status: "standby",
    mode: "passive",
    bandwidth: "480 Mbps",
    broadcastIp: "239.255.0.4",
    online: false,
    primaryDestinationIp: "239.255.4.1",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0
  },
  {
    id: 5,
    name: "Archive System",
    sourceId: 2,
    destinationId: 5,
    status: "active",
    mode: "active",
    bandwidth: "350 Mbps",
    broadcastIp: "239.255.0.5",
    online: true,
    primaryDestinationIp: "239.255.5.1",
    secondaryDestinationIp: "239.255.5.2",
    encryptionEnabled: false,
    protocol: "UDP TS",
    bitrateIn: 143,
    bitrateOut: 137
  },
  {
    id: 6,
    name: "External Feed",
    sourceId: 3,
    destinationId: 6,
    status: "fault",
    mode: "active",
    bandwidth: "720 Mbps",
    broadcastIp: "239.255.0.6",
    online: false,
    primaryDestinationIp: "239.255.6.1",
    encryptionEnabled: true,
    protocol: "UDP TS",
    bitrateIn: 0,
    bitrateOut: 0
  }
];

// Mock destinations
export const mockDestinations: Destination[] = [
  {
    id: 1,
    name: "Primary Output Channel",
    destinationIp: "10.10.10.1",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.15.20.1",
    secondaryIp: "10.15.20.2",
    createdAt: "2025-01-15T08:35:00Z",
    updatedAt: "2025-04-12T16:40:00Z"
  },
  {
    id: 2,
    name: "Backup Output Channel",
    destinationIp: "10.10.10.2",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 32,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.16.20.1",
    secondaryIp: "10.16.20.2",
    createdAt: "2025-01-15T10:20:00Z",
    updatedAt: "2025-04-15T14:22:00Z"
  },
  {
    id: 3,
    name: "Remote Output Channel",
    destinationIp: "10.10.10.3",
    portNumber: 11111,
    status: "play",
    protocol: "SRT",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "AES-128",
    primaryIp: "10.17.20.1",
    secondaryIp: "10.17.20.2",
    createdAt: "2025-02-05T16:25:00Z",
    updatedAt: "2025-04-18T09:30:00Z"
  },
  {
    id: 4,
    name: "Cloud Storage Destination",
    destinationIp: "10.10.10.4",
    portNumber: 11111,
    status: "pause",
    protocol: "UDP TS",
    timeToLive: 32,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.18.20.1",
    createdAt: "2025-02-10T11:15:00Z",
    updatedAt: "2025-04-20T10:45:00Z"
  },
  {
    id: 5,
    name: "Archive Storage Destination",
    destinationIp: "10.10.10.5",
    portNumber: 11111,
    status: "play",
    protocol: "UDP TS",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "None",
    primaryIp: "10.19.20.1",
    secondaryIp: "10.19.20.2",
    createdAt: "2025-02-15T14:40:00Z",
    updatedAt: "2025-04-22T08:25:00Z"
  },
  {
    id: 6,
    name: "External Distribution",
    destinationIp: "10.10.10.6",
    portNumber: 11111,
    status: "play",
    protocol: "SRT",
    timeToLive: 64,
    maxPacketSize: 1316,
    encryption: "AES-256",
    primaryIp: "10.20.20.1",
    createdAt: "2025-03-01T09:30:00Z",
    updatedAt: "2025-04-23T15:10:00Z"
  }
];

// Mock users
export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    lastLogin: "2025-04-29T08:25:15Z",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-04-29T08:25:15Z"
  },
  {
    id: 2,
    username: "operator",
    email: "operator@example.com",
    firstName: "Operator",
    lastName: "User",
    role: "operator",
    lastLogin: "2025-04-28T14:30:20Z",
    isActive: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-04-28T14:30:20Z"
  },
  {
    id: 3,
    username: "viewer",
    email: "viewer@example.com",
    firstName: "Viewer",
    lastName: "User",
    role: "viewer",
    lastLogin: "2025-04-27T09:15:45Z",
    isActive: true,
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-04-27T09:15:45Z"
  }
];

// Mock channel status updates
export const mockChannelStatuses: Record<number, ChannelStatus> = {
  1: {
    id: 1,
    channelId: 1,
    name: "Main Feed",
    channelLink1Status: "online",
    channelLink2Status: "online",
    cpu: 47,
    ram: 61,
    bitrateIn: 125,
    bitrateOut: 118,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  2: {
    id: 2,
    channelId: 2,
    name: "Backup Link",
    channelLink1Status: "online",
    channelLink2Status: "offline",
    cpu: 38,
    ram: 52,
    bitrateIn: 87,
    bitrateOut: 80,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  3: {
    id: 3,
    channelId: 3,
    name: "Remote Site A",
    channelLink1Status: "online",
    channelLink2Status: "online",
    cpu: 32,
    ram: 45,
    bitrateIn: 62,
    bitrateOut: 58,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  4: {
    id: 4,
    channelId: 4,
    name: "Cloud Storage",
    channelLink1Status: "offline",
    channelLink2Status: "offline",
    cpu: 0,
    ram: 10,
    bitrateIn: 0,
    bitrateOut: 0,
    status: "standby",
    lastUpdated: new Date().toISOString()
  },
  5: {
    id: 5,
    channelId: 5,
    name: "Archive System",
    channelLink1Status: "online",
    channelLink2Status: "online",
    cpu: 25,
    ram: 42,
    bitrateIn: 35,
    bitrateOut: 33,
    status: "active",
    lastUpdated: new Date().toISOString()
  },
  6: {
    id: 6,
    channelId: 6,
    name: "External Feed",
    channelLink1Status: "offline",
    channelLink2Status: "offline",
    cpu: 95,
    ram: 88,
    bitrateIn: 0,
    bitrateOut: 0,
    status: "fault",
    lastUpdated: new Date().toISOString()
  }
};

// Mock bandwidth data (last 24 hours, hourly)
export const mockBandwidthData: BandwidthData[] = Array.from({ length: 24 }, (_, i) => {
  const date = new Date();
  date.setHours(date.getHours() - 23 + i);
  
  // Generate somewhat realistic data with a peak during working hours
  const hour = date.getHours();
  const baseInbound = 2800; // Base inbound rate
  const baseOutbound = 2600; // Base outbound rate
  
  // Factor to increase during "working hours" (9 AM to 5 PM)
  const workingHoursFactor = (hour >= 9 && hour <= 17) ? 1.3 : 1;
  
  // Add some randomness
  const randomFactor = 0.9 + Math.random() * 0.2; // Between 0.9 and 1.1
  
  const inbound = Math.round(baseInbound * workingHoursFactor * randomFactor);
  const outbound = Math.round(baseOutbound * workingHoursFactor * randomFactor);
  
  return {
    timestamp: date.toISOString(),
    inbound,
    outbound,
    unit: "Mbps"
  };
});

// Mock system alerts
export const mockSystemAlerts: SystemAlert[] = [
  {
    id: 1,
    type: "critical",
    title: "Channel 6 Connection Lost",
    description: "The connection to External Feed channel has been lost. All data transfer has stopped. Technical team has been notified automatically.",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    isRead: false,
    relatedEntityType: "channel",
    relatedEntityId: 6
  },
  {
    id: 2,
    type: "warning",
    title: "High Latency Detected",
    description: "Channel 3 is experiencing higher than normal latency. This may affect data transfer speed.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    isRead: false,
    relatedEntityType: "channel",
    relatedEntityId: 3
  },
  {
    id: 3,
    type: "info",
    title: "System Maintenance Scheduled",
    description: "Routine maintenance scheduled for tonight at 2:00 AM. Service interruption expected to last 30 minutes.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
    relatedEntityType: "system"
  },
  {
    id: 4,
    type: "success",
    title: "Channel 2 Backup Restored",
    description: "The backup system for Backup Link channel has been successfully restored and is now operational.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
    relatedEntityType: "channel",
    relatedEntityId: 2
  },
  {
    id: 5,
    type: "warning",
    title: "Bandwidth Threshold Reached",
    description: "Channel 1 has reached 85% of allocated bandwidth. Consider optimizing data flow or increasing capacity.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    relatedEntityType: "channel",
    relatedEntityId: 1
  }
];

// Helper function to paginate any array of data
export function paginateData<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
}

// Helper function to filter an array by text search across all string properties
export function filterBySearch<T>(data: T[], search: string): T[] {
  if (!search) return data;
  
  const searchLower = search.toLowerCase();
  
  return data.filter(item => {
    return Object.entries(item).some(([_, value]) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      return false;
    });
  });
}

// Helper function to delay a response (simulate network latency)
export function delay<T>(data: T, ms: number = 500): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), ms);
  });
}