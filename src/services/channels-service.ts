// src/services/channels-service.ts
import ApiService from './api';
import { 
  Channel, 
  ChannelStatus, 
  BandwidthData, 
  PaginatedResponse, 
  QueryParams 
} from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Channels API endpoints
const CHANNELS_ENDPOINTS = {
  BASE: '/channels',
  DETAIL: (id: number) => `/channels/${id}`,
  STATUS: (id: number) => `/channels/${id}/status`,
  ACTIVATE: (id: number) => `/channels/${id}/activate`,
  STANDBY: (id: number) => `/channels/${id}/standby`,
  BANDWIDTH: (id: number) => `/channels/${id}/bandwidth`,
};

// Channel creation/update payload
export interface ChannelPayload {
  name: string;
  sourceId: number;
  destinationId: number;
  mode: 'active' | 'passive';
  broadcastIp: string;
  primaryDestinationIp?: string;
  secondaryDestinationIp?: string;
  encryptionEnabled?: boolean;
  protocol?: string;
}

/**
 * Service class for Channels related API calls
 */
export class ChannelsService {
  /**
   * Get all channels with pagination
   * @param params Pagination and filtering parameters
   */
  static async getAllChannels(params?: QueryParams & {
    status?: 'active' | 'standby' | 'fault';
    mode?: 'active' | 'passive';
    online?: boolean;
  }): Promise<PaginatedResponse<Channel>> {
    return api.get<PaginatedResponse<Channel>>(CHANNELS_ENDPOINTS.BASE, params);
  }

  /**
   * Get a single channel by ID
   * @param id Channel ID
   */
  static async getChannelById(id: number): Promise<Channel> {
    return api.get<Channel>(CHANNELS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Create a new channel
   * @param channelData Channel data to create
   */
  static async createChannel(channelData: ChannelPayload): Promise<Channel> {
    return api.post<Channel>(CHANNELS_ENDPOINTS.BASE, channelData);
  }

  /**
   * Update an existing channel
   * @param id Channel ID
   * @param channelData Updated channel data
   */
  static async updateChannel(id: number, channelData: Partial<ChannelPayload>): Promise<Channel> {
    return api.put<Channel>(CHANNELS_ENDPOINTS.DETAIL(id), channelData);
  }

  /**
   * Delete a channel
   * @param id Channel ID
   */
  static async deleteChannel(id: number): Promise<void> {
    return api.delete<void>(CHANNELS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Get real-time status of a channel
   * @param id Channel ID
   */
  static async getChannelStatus(id: number): Promise<ChannelStatus> {
    return api.get<ChannelStatus>(CHANNELS_ENDPOINTS.STATUS(id));
  }

  /**
   * Activate a channel (switch to active mode)
   * @param id Channel ID
   */
  static async activateChannel(id: number): Promise<void> {
    return api.patch<void>(CHANNELS_ENDPOINTS.ACTIVATE(id));
  }

  /**
   * Set a channel to standby mode
   * @param id Channel ID
   */
  static async setChannelToStandby(id: number): Promise<void> {
    return api.patch<void>(CHANNELS_ENDPOINTS.STANDBY(id));
  }

  /**
   * Get bandwidth usage data for a specific channel
   * @param id Channel ID
   * @param params Time range parameters
   */
  static async getChannelBandwidth(id: number, params?: {
    range?: 'hourly' | 'daily' | 'weekly';
    from?: string;
    to?: string;
  }): Promise<BandwidthData[]> {
    return api.get<BandwidthData[]>(CHANNELS_ENDPOINTS.BANDWIDTH(id), params);
  }
}

export default ChannelsService;