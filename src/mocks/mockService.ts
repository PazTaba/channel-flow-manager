// src/mocks/mockService.ts
import {
    mockDashboardStats,
    mockSources,
    mockChannels,
    mockDestinations,
    mockUsers,
    mockChannelStatuses,
    mockBandwidthData,
    mockSystemAlerts,
    paginateData,
    filterBySearch,
    delay
} from './mockData';
import {
    QueryParams,
    PaginatedResponse,
    Source,
    Channel,
    Destination,
    User,
    SystemAlert
} from '@/types';
import { LoginCredentials, AuthResponse } from '@/services/auth-service';

// Flag to enable mock mode
export const MOCK_ENABLED = true;

// Mock login response
export const mockAuthResponse: AuthResponse = {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2NzYzMDc2MDAsImV4cCI6MTY3NjMxMTIwMH0",
    refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjc2MzA3NjAwLCJleHAiOjE2NzYzOTQwMDB9",
    expires_in: 3600,
    token_type: "Bearer"
};

/**
 * Mock Auth Service
 */
export const MockAuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // Check if credentials match any mock user
        const user = mockUsers.find(
            u => u.username === credentials.username && credentials.password === 'password'
        );

        if (!user) {
            await delay(null, 500);
            throw new Error('Invalid credentials');
        }

        // Store the tokens
        localStorage.setItem('auth_token', mockAuthResponse.access_token);
        localStorage.setItem('refresh_token', mockAuthResponse.refresh_token);

        // Store token expiry - 1 hour from now
        const expiresAt = Date.now() + mockAuthResponse.expires_in * 1000;
        localStorage.setItem('token_expires_at', expiresAt.toString());

        // Store the user role for RBAC
        localStorage.setItem('user_role', user.role);

        return delay(mockAuthResponse, 800);
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user_role');

        return delay(undefined, 300);
    },

    refreshToken: async (): Promise<AuthResponse> => {
        // Just return a new token with extended expiry
        const response = { ...mockAuthResponse };

        // Update expiry - 1 hour from now
        const expiresAt = Date.now() + response.expires_in * 1000;
        localStorage.setItem('token_expires_at', expiresAt.toString());

        return delay(response, 300);
    },

    getCurrentUser: async (): Promise<User> => {
        // Check if user is authenticated
        const token = localStorage.getItem('auth_token');
        const role = localStorage.getItem('user_role');

        if (!token || !role) {
            throw new Error('Not authenticated');
        }

        // Return user based on role in local storage
        const user = mockUsers.find(u => u.role === role);

        if (!user) {
            throw new Error('User not found');
        }

        return delay(user, 500);
    },

    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('auth_token');
        const expiresAt = localStorage.getItem('token_expires_at');

        if (!token || !expiresAt) return false;

        // Check if token has expired
        const now = Date.now();
        const expiry = parseInt(expiresAt, 10);

        return now < expiry;
    }
};

/**
 * Mock Dashboard Service
 */
export const MockDashboardService = {
    getStatus: async () => {
        return delay(mockDashboardStats, 700);
    },

    getBandwidthData: async (params?: {
        range?: 'daily' | 'weekly' | 'monthly',
        from?: string,
        to?: string,
    }) => {
        // Filter bandwidth data based on the range
        let filteredData = [...mockBandwidthData];

        if (params?.range === 'daily') {
            // Last 24 hours - already filtered in mock data
        } else if (params?.range === 'weekly') {
            // Filter to last 7 days worth of data - in mock we just return all data
        } else if (params?.range === 'monthly') {
            // Filter to last 30 days worth of data - in mock we just return all data
        }

        return delay(filteredData, 800);
    },

    getTopChannels: async (params?: {
        limit?: number,
        status?: 'active' | 'standby' | 'fault',
        sortBy?: 'bandwidth' | 'priority' | 'status',
    }) => {
        // Filter and sort channels
        let filteredChannels = [...mockChannels];

        // Filter by status if specified
        if (params?.status) {
            filteredChannels = filteredChannels.filter(channel => channel.status === params.status);
        }

        // Sort by specified criterion
        if (params?.sortBy) {
            if (params.sortBy === 'bandwidth') {
                filteredChannels.sort((a, b) => parseFloat(b.bandwidth) - parseFloat(a.bandwidth));
            } else if (params.sortBy === 'status') {
                const statusOrder = { 'fault': 0, 'standby': 1, 'active': 2 };
                filteredChannels.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
            }
            // For 'priority' - assume we have no priority field so we do nothing
        }

        // Limit the number of results
        if (params?.limit) {
            filteredChannels = filteredChannels.slice(0, params.limit);
        }

        return delay(filteredChannels, 600);
    },

    getAlerts: async (params?: {
        page?: number,
        pageSize?: number,
        type?: 'critical' | 'warning' | 'info' | 'success',
        read?: boolean,
    }) => {
        // Copy alerts to avoid modifying the original
        let filteredAlerts = [...mockSystemAlerts];

        // Filter by type if specified
        if (params?.type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === params.type);
        }

        // Filter by read status if specified
        if (params?.read !== undefined) {
            filteredAlerts = filteredAlerts.filter(alert => alert.isRead === params.read);
        }

        // Sort by timestamp (most recent first)
        filteredAlerts.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Paginate results if pagination params are provided
        if (params?.page && params?.pageSize) {
            return delay(paginateData(filteredAlerts, params.page, params.pageSize), 500);
        }

        return delay(filteredAlerts, 500);
    },

    markAlertAsRead: async (alertId: number): Promise<void> => {
        // Find the alert in our mock data
        const alertIndex = mockSystemAlerts.findIndex(alert => alert.id === alertId);

        if (alertIndex !== -1) {
            mockSystemAlerts[alertIndex].isRead = true;
        }

        return delay(undefined, 300);
    },

    markAllAlertsAsRead: async (): Promise<void> => {
        // Mark all alerts as read
        mockSystemAlerts.forEach(alert => {
            alert.isRead = true;
        });

        return delay(undefined, 300);
    },

    dismissAlert: async (alertId: number): Promise<void> => {
        // Find and remove the alert
        const alertIndex = mockSystemAlerts.findIndex(alert => alert.id === alertId);

        if (alertIndex !== -1) {
            mockSystemAlerts.splice(alertIndex, 1);
        }

        return delay(undefined, 300);
    }
};

/**
 * Mock Sources Service
 */
export const MockSourcesService = {
    getAllSources: async (params?: QueryParams): Promise<PaginatedResponse<Source>> => {
        // Copy sources to avoid modifying the original
        let filteredSources = [...mockSources];

        // Filter by search term if provided
        if (params?.search) {
            filteredSources = filterBySearch(filteredSources, params.search);
        }

        // Filter by status if provided
        if (params?.status) {
            filteredSources = filteredSources.filter(source => source.status === params.status);
        }

        // Sort if specified
        if (params?.sort) {
            const direction = params.order === 'desc' ? -1 : 1;
            filteredSources.sort((a, b) => {
                const aValue = a[params.sort as keyof Source];
                const bValue = b[params.sort as keyof Source];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction * aValue.localeCompare(bValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction * (aValue - bValue);
                }

                return 0;
            });
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;

        return delay(paginateData(filteredSources, page, pageSize), 700);
    },

    getSourceById: async (id: number): Promise<Source> => {
        const source = mockSources.find(s => s.id === id);

        if (!source) {
            throw new Error(`Source with ID ${id} not found`);
        }

        return delay(source, 500);
    },

    createSource: async (sourceData: any): Promise<Source> => {
        // Generate new ID
        const newId = Math.max(...mockSources.map(s => s.id)) + 1;

        // Create new source
        const newSource: Source = {
            id: newId,
            name: sourceData.name,
            ipAddress: sourceData.ipAddress,
            encryptedMulticastAddress: sourceData.encryptedMulticastAddress,
            status: sourceData.status || 'play',
            protocol: sourceData.protocol,
            bandwidth: sourceData.bandwidth || 0,
            encryptionEnabled: sourceData.encryptionEnabled || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to mock data
        mockSources.push(newSource);

        return delay(newSource, 800);
    },

    updateSource: async (id: number, sourceData: any): Promise<Source> => {
        // Find source
        const sourceIndex = mockSources.findIndex(s => s.id === id);

        if (sourceIndex === -1) {
            throw new Error(`Source with ID ${id} not found`);
        }

        // Update source
        mockSources[sourceIndex] = {
            ...mockSources[sourceIndex],
            ...sourceData,
            updatedAt: new Date().toISOString()
        };

        return delay(mockSources[sourceIndex], 600);
    },

    deleteSource: async (id: number): Promise<void> => {
        // Find source
        const sourceIndex = mockSources.findIndex(s => s.id === id);

        if (sourceIndex === -1) {
            throw new Error(`Source with ID ${id} not found`);
        }

        // Remove source
        mockSources.splice(sourceIndex, 1);

        return delay(undefined, 500);
    },

    getSourceStatus: async (id: number): Promise<{
        status: 'play' | 'pause';
        bandwidth: number;
        lastUpdated: string;
    }> => {
        // Find source
        const source = mockSources.find(s => s.id === id);

        if (!source) {
            throw new Error(`Source with ID ${id} not found`);
        }

        return delay({
            status: source.status,
            bandwidth: source.bandwidth || 0,
            lastUpdated: new Date().toISOString()
        }, 300);
    },

    pauseSource: async (id: number): Promise<void> => {
        // Find source
        const sourceIndex = mockSources.findIndex(s => s.id === id);

        if (sourceIndex === -1) {
            throw new Error(`Source with ID ${id} not found`);
        }

        // Update status
        mockSources[sourceIndex].status = 'pause';
        mockSources[sourceIndex].updatedAt = new Date().toISOString();

        return delay(undefined, 400);
    },

    resumeSource: async (id: number): Promise<void> => {
        // Find source
        const sourceIndex = mockSources.findIndex(s => s.id === id);

        if (sourceIndex === -1) {
            throw new Error(`Source with ID ${id} not found`);
        }

        // Update status
        mockSources[sourceIndex].status = 'play';
        mockSources[sourceIndex].updatedAt = new Date().toISOString();

        return delay(undefined, 400);
    }
};

/**
 * Mock Channels Service
 */
export const MockChannelsService = {
    getAllChannels: async (params?: QueryParams & {
        status?: 'active' | 'standby' | 'fault';
        mode?: 'active' | 'passive';
        online?: boolean;
    }): Promise<PaginatedResponse<Channel>> => {
        // Copy channels to avoid modifying the original
        let filteredChannels = [...mockChannels];

        // Filter by search term if provided
        if (params?.search) {
            filteredChannels = filterBySearch(filteredChannels, params.search);
        }

        // Filter by status if provided
        if (params?.status) {
            filteredChannels = filteredChannels.filter(channel => channel.status === params.status);
        }

        // Filter by mode if provided
        if (params?.mode) {
            filteredChannels = filteredChannels.filter(channel => channel.mode === params.mode);
        }

        // Filter by online status if provided
        if (params?.online !== undefined) {
            filteredChannels = filteredChannels.filter(channel => channel.online === params.online);
        }

        // Sort if specified
        if (params?.sort) {
            const direction = params.order === 'desc' ? -1 : 1;
            filteredChannels.sort((a, b) => {
                const aValue = a[params.sort as keyof Channel];
                const bValue = b[params.sort as keyof Channel];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction * aValue.localeCompare(bValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction * (aValue - bValue);
                }

                return 0;
            });
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;

        return delay(paginateData(filteredChannels, page, pageSize), 700);
    },

    getChannelById: async (id: number): Promise<Channel> => {
        const channel = mockChannels.find(c => c.id === id);

        if (!channel) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        return delay(channel, 500);
    },

    createChannel: async (channelData: any): Promise<Channel> => {
        // Generate new ID
        const newId = Math.max(...mockChannels.map(c => c.id)) + 1;

        // Create new channel
        const newChannel: Channel = {
            id: newId,
            name: channelData.name,
            sourceId: channelData.sourceId,
            destinationId: channelData.destinationId,
            status: 'active',
            mode: channelData.mode || 'active',
            bandwidth: "100 Mbps", // Default initial bandwidth
            broadcastIp: channelData.broadcastIp,
            online: true,
            primaryDestinationIp: channelData.primaryDestinationIp,
            secondaryDestinationIp: channelData.secondaryDestinationIp,
            encryptionEnabled: channelData.encryptionEnabled || false,
            protocol: channelData.protocol || "UDP TS",
            bitrateIn: 0,
            bitrateOut: 0
        };

        // Add to mock data
        mockChannels.push(newChannel);

        return delay(newChannel, 800);
    },

    updateChannel: async (id: number, channelData: any): Promise<Channel> => {
        // Find channel
        const channelIndex = mockChannels.findIndex(c => c.id === id);

        if (channelIndex === -1) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        // Update channel
        mockChannels[channelIndex] = {
            ...mockChannels[channelIndex],
            ...channelData
        };

        return delay(mockChannels[channelIndex], 600);
    },

    deleteChannel: async (id: number): Promise<void> => {
        // Find channel
        const channelIndex = mockChannels.findIndex(c => c.id === id);

        if (channelIndex === -1) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        // Remove channel
        mockChannels.splice(channelIndex, 1);

        return delay(undefined, 500);
    },

    getChannelStatus: async (id: number): Promise<any> => {
        // Find channel status
        const status = mockChannelStatuses[id];

        if (!status) {
            throw new Error(`Channel status for ID ${id} not found`);
        }

        // Update lastUpdated to current time to simulate real-time updates
        status.lastUpdated = new Date().toISOString();

        return delay(status, 400);
    },

    activateChannel: async (id: number): Promise<void> => {
        // Find channel
        const channelIndex = mockChannels.findIndex(c => c.id === id);

        if (channelIndex === -1) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        // Update status
        mockChannels[channelIndex].status = 'active';
        mockChannels[channelIndex].mode = 'active';
        mockChannels[channelIndex].online = true;

        // Update channel status if it exists
        if (mockChannelStatuses[id]) {
            mockChannelStatuses[id].status = 'active';
            mockChannelStatuses[id].lastUpdated = new Date().toISOString();
        }

        return delay(undefined, 400);
    },

    setChannelToStandby: async (id: number): Promise<void> => {
        // Find channel
        const channelIndex = mockChannels.findIndex(c => c.id === id);

        if (channelIndex === -1) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        // Update status
        mockChannels[channelIndex].status = 'standby';
        mockChannels[channelIndex].mode = 'passive';
        mockChannels[channelIndex].online = false;

        // Update channel status if it exists
        if (mockChannelStatuses[id]) {
            mockChannelStatuses[id].status = 'standby';
            mockChannelStatuses[id].lastUpdated = new Date().toISOString();
        }

        return delay(undefined, 400);
    },

    getChannelBandwidth: async (id: number, params?: {
        range?: 'hourly' | 'daily' | 'weekly';
        from?: string;
        to?: string;
    }): Promise<BandwidthData[]> => {
        // Find channel
        const channel = mockChannels.find(c => c.id === id);

        if (!channel) {
            throw new Error(`Channel with ID ${id} not found`);
        }

        // Generate bandwidth data for this channel
        // We'll use a fraction of the total bandwidth data
        const channelBandwidth = mockBandwidthData.map(data => ({
            timestamp: data.timestamp,
            inbound: Math.round(data.inbound * (channel.bitrateIn || 100) / 3000),
            outbound: Math.round(data.outbound * (channel.bitrateOut || 90) / 3000),
            unit: data.unit
        }));

        return delay(channelBandwidth, 600);
    }
};

/**
 * Mock Destinations Service
 */
export const MockDestinationsService = {
    getAllDestinations: async (params?: QueryParams): Promise<PaginatedResponse<Destination>> => {
        // Copy destinations to avoid modifying the original
        let filteredDestinations = [...mockDestinations];

        // Filter by search term if provided
        if (params?.search) {
            filteredDestinations = filterBySearch(filteredDestinations, params.search);
        }

        // Filter by status if provided
        if (params?.status) {
            filteredDestinations = filteredDestinations.filter(dest => dest.status === params.status);
        }

        // Sort if specified
        if (params?.sort) {
            const direction = params.order === 'desc' ? -1 : 1;
            filteredDestinations.sort((a, b) => {
                const aValue = a[params.sort as keyof Destination];
                const bValue = b[params.sort as keyof Destination];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction * aValue.localeCompare(bValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction * (aValue - bValue);
                }

                return 0;
            });
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;

        return delay(paginateData(filteredDestinations, page, pageSize), 700);
    },

    getDestinationById: async (id: number): Promise<Destination> => {
        const destination = mockDestinations.find(d => d.id === id);

        if (!destination) {
            throw new Error(`Destination with ID ${id} not found`);
        }

        return delay(destination, 500);
    },

    createDestination: async (destinationData: any): Promise<Destination> => {
        // Generate new ID
        const newId = Math.max(...mockDestinations.map(d => d.id)) + 1;

        // Create new destination
        const newDestination: Destination = {
            id: newId,
            name: destinationData.name,
            destinationIp: destinationData.destinationIp,
            portNumber: destinationData.portNumber || 11111,
            status: destinationData.status || 'play',
            protocol: destinationData.protocol || 'UDP TS',
            timeToLive: destinationData.timeToLive || 64,
            maxPacketSize: destinationData.maxPacketSize || 1316,
            encryption: destinationData.encryption || 'None',
            primaryIp: destinationData.primaryIp,
            secondaryIp: destinationData.secondaryIp,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to mock data
        mockDestinations.push(newDestination);

        return delay(newDestination, 800);
    },

    updateDestination: async (id: number, destinationData: any): Promise<Destination> => {
        // Find destination
        const destinationIndex = mockDestinations.findIndex(d => d.id === id);

        if (destinationIndex === -1) {
            throw new Error(`Destination with ID ${id} not found`);
        }

        // Update destination
        mockDestinations[destinationIndex] = {
            ...mockDestinations[destinationIndex],
            ...destinationData,
            updatedAt: new Date().toISOString()
        };

        return delay(mockDestinations[destinationIndex], 600);
    },

    deleteDestination: async (id: number): Promise<void> => {
        // Find destination
        const destinationIndex = mockDestinations.findIndex(d => d.id === id);

        if (destinationIndex === -1) {
            throw new Error(`Destination with ID ${id} not found`);
        }

        // Remove destination
        mockDestinations.splice(destinationIndex, 1);

        return delay(undefined, 500);
    },

    getDestinationStatus: async (id: number): Promise<{
        status: 'play' | 'pause';
        activeConnections: number;
        lastError?: string;
        lastUpdated: string;
    }> => {
        // Find destination
        const destination = mockDestinations.find(d => d.id === id);

        if (!destination) {
            throw new Error(`Destination with ID ${id} not found`);
        }

        // Create status response
        const response = {
            status: destination.status,
            activeConnections: destination.status === 'play' ? Math.floor(Math.random() * 5) + 1 : 0,
            lastUpdated: new Date().toISOString()
        };

        // Add error if status is paused
        if (destination.status === 'pause') {
            response.lastError = 'Destination paused by user';
        }

        return delay(response, 400);
    },

    toggleDestinationStatus: async (id: number, status: 'play' | 'pause'): Promise<void> => {
        // Find destination
        const destinationIndex = mockDestinations.findIndex(d => d.id === id);

        if (destinationIndex === -1) {
            throw new Error(`Destination with ID ${id} not found`);
        }

        // Update status
        mockDestinations[destinationIndex].status = status;
        mockDestinations[destinationIndex].updatedAt = new Date().toISOString();

        return delay(undefined, 400);
    }
};

/**
 * Mock Users Service
 */
export const MockUsersService = {
    getAllUsers: async (params?: QueryParams & {
        role?: 'admin' | 'operator' | 'viewer';
        isActive?: boolean;
    }): Promise<PaginatedResponse<User>> => {
        // Copy users to avoid modifying the original
        let filteredUsers = [...mockUsers];

        // Filter by search term if provided
        if (params?.search) {
            filteredUsers = filterBySearch(filteredUsers, params.search);
        }

        // Filter by role if provided
        if (params?.role) {
            filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }

        // Filter by active status if provided
        if (params?.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(user => user.isActive === params.isActive);
        }

        // Sort if specified
        if (params?.sort) {
            const direction = params.order === 'desc' ? -1 : 1;
            filteredUsers.sort((a, b) => {
                const aValue = a[params.sort as keyof User];
                const bValue = b[params.sort as keyof User];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return direction * aValue.localeCompare(bValue);
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return direction * (aValue - bValue);
                }

                return 0;
            });
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;

        return delay(paginateData(filteredUsers, page, pageSize), 700);
    },

    getUserById: async (id: number): Promise<User> => {
        const user = mockUsers.find(u => u.id === id);

        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        return delay(user, 500);
    },

    createUser: async (userData: any): Promise<User> => {
        // Generate new ID
        const newId = Math.max(...mockUsers.map(u => u.id)) + 1;

        // Create new user
        const newUser: User = {
            id: newId,
            username: userData.username,
            email: userData.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role || 'viewer',
            lastLogin: null,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to mock data
        mockUsers.push(newUser);

        return delay(newUser, 800);
    },

    updateUser: async (id: number, userData: any): Promise<User> => {
        // Find user
        const userIndex = mockUsers.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }

        // Update user
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
        };

        return delay(mockUsers[userIndex], 600);
    },

    deleteUser: async (id: number): Promise<void> => {
        // Find user
        const userIndex = mockUsers.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }

        // Remove user
        mockUsers.splice(userIndex, 1);

        return delay(undefined, 500);
    },

    toggleUserActive: async (id: number, isActive: boolean): Promise<User> => {
        // Find user
        const userIndex = mockUsers.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }

        // Update active status
        mockUsers[userIndex].isActive = isActive;
        mockUsers[userIndex].updatedAt = new Date().toISOString();

        return delay(mockUsers[userIndex], 400);
    },

    resetPassword: async (id: number, newPassword: string): Promise<void> => {
        // In a real application, this would hash the password and store it
        // For our mock, we just simulate the process

        // Find user
        const userIndex = mockUsers.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error(`User with ID ${id} not found`);
        }

        // Simulate password reset
        mockUsers[userIndex].updatedAt = new Date().toISOString();

        return delay(undefined, 600);
    }
};

/**
 * Mock System Settings Service
 */
export const MockSystemSettingsService = {
    getSystemSettings: async (): Promise<{
        encryptionEnabled: boolean;
        defaultTTL: number;
        maxBandwidth: number;
        logRetentionDays: number;
        alertNotificationsEnabled: boolean;
        maintenanceMode: boolean;
        apiRateLimit: number;
        systemVersion: string;
        lastUpdated: string;
    }> => {
        // Return mock system settings
        return delay({
            encryptionEnabled: true,
            defaultTTL: 64,
            maxBandwidth: 10000, // 10 Gbps
            logRetentionDays: 30,
            alertNotificationsEnabled: true,
            maintenanceMode: false,
            apiRateLimit: 100,
            systemVersion: '2.3.5',
            lastUpdated: '2023-02-15T08:30:00Z'
        }, 600);
    },

    updateSystemSettings: async (settings: any): Promise<{
        encryptionEnabled: boolean;
        defaultTTL: number;
        maxBandwidth: number;
        logRetentionDays: number;
        alertNotificationsEnabled: boolean;
        maintenanceMode: boolean;
        apiRateLimit: number;
        systemVersion: string;
        lastUpdated: string;
    }> => {
        // Return updated settings
        return delay({
            ...settings,
            systemVersion: '2.3.5', // Cannot be updated
            lastUpdated: new Date().toISOString()
        }, 800);
    },

    getNetworkSettings: async (): Promise<{
        primaryInterface: string;
        backupInterface: string;
        mtu: number;
        dhcpEnabled: boolean;
        ipAddress: string;
        subnetMask: string;
        gateway: string;
        dnsServers: string[];
        ntpServers: string[];
        lastUpdated: string;
    }> => {
        // Return mock network settings
        return delay({
            primaryInterface: 'eth0',
            backupInterface: 'eth1',
            mtu: 1500,
            dhcpEnabled: false,
            ipAddress: '192.168.1.100',
            subnetMask: '255.255.255.0',
            gateway: '192.168.1.1',
            dnsServers: ['8.8.8.8', '8.8.4.4'],
            ntpServers: ['pool.ntp.org', 'time.google.com'],
            lastUpdated: '2023-02-10T14:22:00Z'
        }, 600);
    },

    updateNetworkSettings: async (settings: any): Promise<{
        primaryInterface: string;
        backupInterface: string;
        mtu: number;
        dhcpEnabled: boolean;
        ipAddress: string;
        subnetMask: string;
        gateway: string;
        dnsServers: string[];
        ntpServers: string[];
        lastUpdated: string;
    }> => {
        // Return updated network settings
        return delay({
            ...settings,
            lastUpdated: new Date().toISOString()
        }, 800);
    },

    backupSystem: async (): Promise<{
        backupId: string;
        timestamp: string;
        size: string;
        status: 'complete' | 'in_progress' | 'failed';
    }> => {
        // Simulate backup creation
        return delay({
            backupId: `backup-${Date.now()}`,
            timestamp: new Date().toISOString(),
            size: '256 MB',
            status: 'complete'
        }, 2000); // Longer delay to simulate backup process
    },

    restoreSystem: async (backupId: string): Promise<{
        restoreId: string;
        timestamp: string;
        status: 'complete' | 'in_progress' | 'failed';
        message: string;
    }> => {
        // Simulate restore process
        return delay({
            restoreId: `restore-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'complete',
            message: 'System restored successfully'
        }, 3000); // Even longer delay to simulate restore process
    }
};

/**
 * Mock Logs Service
 */
export const MockLogsService = {
    getSystemLogs: async (params?: {
        page?: number;
        pageSize?: number;
        level?: 'info' | 'warning' | 'error' | 'debug';
        from?: string;
        to?: string;
        service?: string;
    }): Promise<PaginatedResponse<{
        id: number;
        timestamp: string;
        level: 'info' | 'warning' | 'error' | 'debug';
        message: string;
        service: string;
        details?: any;
    }>> => {
        // Generate mock logs based on params
        const mockLogs = Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toISOString(), // Every 5 minutes in the past
            level: ['info', 'warning', 'error', 'debug'][i % 4] as 'info' | 'warning' | 'error' | 'debug',
            message: `System log message ${i + 1}`,
            service: ['auth', 'api', 'database', 'scheduler', 'channels'][i % 5],
            details: i % 3 === 0 ? { errorCode: i * 100, context: `Operation ${i}` } : undefined
        }));

        // Filter by level if specified
        let filteredLogs = [...mockLogs];
        if (params?.level) {
            filteredLogs = filteredLogs.filter(log => log.level === params.level);
        }

        // Filter by date range if specified
        if (params?.from) {
            const fromDate = new Date(params.from).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= fromDate);
        }

        if (params?.to) {
            const toDate = new Date(params.to).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= toDate);
        }

        // Filter by service if specified
        if (params?.service) {
            filteredLogs = filteredLogs.filter(log => log.service === params.service);
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;

        return delay(paginateData(filteredLogs, page, pageSize), 700);
    },

    getChannelLogs: async (channelId: number, params?: {
        page?: number;
        pageSize?: number;
        level?: 'info' | 'warning' | 'error' | 'debug';
        from?: string;
        to?: string;
    }): Promise<PaginatedResponse<{
        id: number;
        channelId: number;
        timestamp: string;
        level: 'info' | 'warning' | 'error' | 'debug';
        message: string;
        details?: any;
    }>> => {
        // Generate mock channel logs
        const mockChannelLogs = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            channelId,
            timestamp: new Date(Date.now() - i * 1000 * 60 * 10).toISOString(), // Every 10 minutes in the past
            level: ['info', 'warning', 'error', 'debug'][i % 4] as 'info' | 'warning' | 'error' | 'debug',
            message: `Channel ${channelId} log message ${i + 1}`,
            details: i % 3 === 0 ? { errorCode: i * 100, context: `Operation ${i}` } : undefined
        }));

        // Filter by level if specified
        let filteredLogs = [...mockChannelLogs];
        if (params?.level) {
            filteredLogs = filteredLogs.filter(log => log.level === params.level);
        }

        // Filter by date range if specified
        if (params?.from) {
            const fromDate = new Date(params.from).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= fromDate);
        }

        if (params?.to) {
            const toDate = new Date(params.to).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= toDate);
        }

        // Paginate results
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 20;

        return delay(paginateData(filteredLogs, page, pageSize), 700);
    },

    clearLogs: async (type: 'system' | 'channel', id?: number): Promise<void> => {
        // This would clear logs in a real application
        // For our mock, we just simulate the process
        return delay(undefined, 500);
    },

    exportLogs: async (type: 'system' | 'channel', format: 'csv' | 'json', id?: number): Promise<Blob> => {
        // In a real application, this would generate a file for download
        // For our mock, we just simulate the process with a delay

        // Create a simple blob to simulate file download
        const content = type === 'system'
            ? 'timestamp,level,message,service\n2023-02-20T12:00:00Z,info,System started,api'
            : `timestamp,level,message,channelId\n2023-02-20T12:00:00Z,info,Channel started,${id}`;

        return delay(new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' }), 1000);
    }
};

/**
 * Mock Analytics Service
 */
export const MockAnalyticsService = {
    getBandwidthUsage: async (params?: {
        period: 'hourly' | 'daily' | 'weekly' | 'monthly';
        from?: string;
        to?: string;
    }): Promise<{
        data: {
            timestamp: string;
            inbound: number;
            outbound: number;
            total: number;
            unit: string;
        }[];
        averageInbound: number;
        averageOutbound: number;
        peakInbound: number;
        peakOutbound: number;
        unit: string;
    }> => {
        // Use our existing bandwidth data and aggregate based on period
        const period = params?.period || 'hourly';
        let aggregatedData = [...mockBandwidthData];

        // For our mock, we'll just use the same data regardless of period
        // In a real application, you would aggregate based on period

        // Calculate averages and peaks
        const totalInbound = aggregatedData.reduce((sum, entry) => sum + entry.inbound, 0);
        const totalOutbound = aggregatedData.reduce((sum, entry) => sum + entry.outbound, 0);
        const averageInbound = Math.round(totalInbound / aggregatedData.length);
        const averageOutbound = Math.round(totalOutbound / aggregatedData.length);
        const peakInbound = Math.max(...aggregatedData.map(entry => entry.inbound));
        const peakOutbound = Math.max(...aggregatedData.map(entry => entry.outbound));

        return delay({
            data: aggregatedData,
            averageInbound,
            averageOutbound,
            peakInbound,
            peakOutbound,
            unit: 'Mbps'
        }, 800);
    },

    getChannelPerformance: async (params?: {
        top?: number;
        metric?: 'bandwidth' | 'uptime' | 'errors';
        period?: 'daily' | 'weekly' | 'monthly';
    }): Promise<{
        channels: {
            id: number;
            name: string;
            value: number;
            unit: string;
        }[];
        period: string;
    }> => {
        // Get top channels based on the metric
        const metric = params?.metric || 'bandwidth';
        const top = params?.top || 5;
        const period = params?.period || 'daily';

        let channelMetrics = mockChannels.map(channel => {
            let value: number;
            let unit = '';

            if (metric === 'bandwidth') {
                // Convert bandwidth string to number (remove "Mbps")
                value = parseFloat(channel.bandwidth.replace(/[^0-9.]/g, ''));
                unit = 'Mbps';
            } else if (metric === 'uptime') {
                // Random uptime percentage between 95 and 100
                value = 95 + Math.random() * 5;
                unit = '%';
            } else if (metric === 'errors') {
                // Random error count between 0 and 10
                value = Math.floor(Math.random() * 10);
                unit = 'errors';
            } else {
                value = 0;
                unit = '';
            }

            return {
                id: channel.id,
                name: channel.name,
                value,
                unit
            };
        });

        // Sort by value (descending) and take top N
        channelMetrics.sort((a, b) => {
            if (metric === 'errors') {
                // For errors, lower is better
                return a.value - b.value;
            }
            // For other metrics, higher is better
            return b.value - a.value;
        });

        channelMetrics = channelMetrics.slice(0, top);

        return delay({
            channels: channelMetrics,
            period: period
        }, 700);
    },

    getSystemHealthMetrics: async (): Promise<{
        cpu: number;
        memory: number;
        disk: number;
        temperature: number;
        networkLoad: number;
        lastUpdated: string;
    }> => {
        // Generate random health metrics
        return delay({
            cpu: 25 + Math.random() * 30, // 25-55%
            memory: 40 + Math.random() * 30, // 40-70%
            disk: 30 + Math.random() * 20, // 30-50%
            temperature: 35 + Math.random() * 15, // 35-50°C
            networkLoad: 20 + Math.random() * 40, // 20-60%
            lastUpdated: new Date().toISOString()
        }, 500);
    },

    getErrorRateStats: async (params?: {
        period: 'hourly' | 'daily' | 'weekly';
        from?: string;
        to?: string;
    }): Promise<{
        data: {
            timestamp: string;
            errorCount: number;
            source: 'channel' | 'system' | 'network';
        }[];
        totalErrors: number;
        averageErrors: number;
        errorsBySource: {
            source: string;
            count: number;
            percentage: number;
        }[];
    }> => {
        // Generate mock error data
        const period = params?.period || 'daily';
        const dataPoints = period === 'hourly' ? 24 : period === 'daily' ? 7 : 4;

        const mockErrorData = Array.from({ length: dataPoints }, (_, i) => {
            const date = new Date();
            if (period === 'hourly') {
                date.setHours(date.getHours() - i);
            } else if (period === 'daily') {
                date.setDate(date.getDate() - i);
            } else {
                date.setDate(date.getDate() - i * 7);
            }

            const sources = ['channel', 'system', 'network'] as const;
            const source = sources[i % 3];

            return {
                timestamp: date.toISOString(),
                errorCount: Math.floor(Math.random() * 10),
                source
            };
        });

        // Calculate total and average errors
        const totalErrors = mockErrorData.reduce((sum, entry) => sum + entry.errorCount, 0);
        const averageErrors = Math.round(totalErrors / mockErrorData.length * 10) / 10;

        // Calculate errors by source
        const errorsBySource = [
            { source: 'channel', count: 0, percentage: 0 },
            { source: 'system', count: 0, percentage: 0 },
            { source: 'network', count: 0, percentage: 0 }
        ];

        mockErrorData.forEach(entry => {
            const sourceIndex = errorsBySource.findIndex(s => s.source === entry.source);
            if (sourceIndex !== -1) {
                errorsBySource[sourceIndex].count += entry.errorCount;
            }
        });

        // Calculate percentages
        errorsBySource.forEach(source => {
            source.percentage = Math.round((source.count / totalErrors) * 100);
        });

        return delay({
            data: mockErrorData,
            totalErrors,
            averageErrors,
            errorsBySource
        }, 800);
    }
};

// Export all mock services
export const MockServices = {
    auth: MockAuthService,
    dashboard: MockDashboardService,
    sources: MockSourcesService,
    channels: MockChannelsService,
    destinations: MockDestinationsService,
    users: MockUsersService,
    systemSettings: MockSystemSettingsService,
    logs: MockLogsService,
    analytics: MockAnalyticsService
};

// Type for bandwidth data
interface BandwidthData {
    timestamp: string;
    inbound: number;
    outbound: number;
    unit: string;
}


