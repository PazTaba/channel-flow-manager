
// src/services/channels-service.ts
import ApiService from './api';
import { 
  Artery,
  ArteryStatus, 
  BandwidthData, 
  PaginatedResponse, 
  QueryParams 
} from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Arteries API endpoints
const ARTERIES_ENDPOINTS = {
  BASE: '/arteries',
  DETAIL: (id: number) => `/arteries/${id}`,
  STATUS: (id: number) => `/arteries/${id}/status`,
  ACTIVATE: (id: number) => `/arteries/${id}/activate`,
  STANDBY: (id: number) => `/arteries/${id}/standby`,
  SWITCH_CHANNEL: (id: number) => `/arteries/${id}/switch-channel`,
  BANDWIDTH: (id: number) => `/arteries/${id}/bandwidth`,
};

// Artery creation/update payload
export interface ArteryPayload {
  name: string;
  sourceId: number;
  primaryDestinationId: number;
  backupDestinationId: number;
  broadcastIp: string;
  encryptionEnabled?: boolean;
  protocol?: string;
}

/**
 * Service class for Arteries related API calls
 */
export class ArteriesService {
  /**
   * Get all arteries with pagination
   * @param params Pagination and filtering parameters
   */
  static async getAllArteries(params?: QueryParams & {
    status?: 'active' | 'standby' | 'fault';
    online?: boolean;
  }): Promise<PaginatedResponse<Artery>> {
    return api.get<PaginatedResponse<Artery>>(ARTERIES_ENDPOINTS.BASE, params);
  }

  /**
   * Get a single artery by ID
   * @param id Artery ID
   */
  static async getArteryById(id: number): Promise<Artery> {
    return api.get<Artery>(ARTERIES_ENDPOINTS.DETAIL(id));
  }

  /**
   * Create a new artery with primary and backup channels
   * @param arteryData Artery data to create
   */
  static async createArtery(arteryData: ArteryPayload): Promise<Artery> {
    return api.post<Artery>(ARTERIES_ENDPOINTS.BASE, arteryData);
  }

  /**
   * Update an existing artery
   * @param id Artery ID
   * @param arteryData Updated artery data
   */
  static async updateArtery(id: number, arteryData: Partial<ArteryPayload>): Promise<Artery> {
    return api.put<Artery>(ARTERIES_ENDPOINTS.DETAIL(id), arteryData);
  }

  /**
   * Delete an artery
   * @param id Artery ID
   */
  static async deleteArtery(id: number): Promise<void> {
    return api.delete<void>(ARTERIES_ENDPOINTS.DETAIL(id));
  }

  /**
   * Get real-time status of an artery
   * @param id Artery ID
   */
  static async getArteryStatus(id: number): Promise<ArteryStatus> {
    return api.get<ArteryStatus>(ARTERIES_ENDPOINTS.STATUS(id));
  }

  /**
   * Activate an artery (set to active mode)
   * @param id Artery ID
   */
  static async activateArtery(id: number): Promise<void> {
    return api.patch<void>(ARTERIES_ENDPOINTS.ACTIVATE(id));
  }

  /**
   * Set an artery to standby mode
   * @param id Artery ID
   */
  static async setArteryToStandby(id: number): Promise<void> {
    return api.patch<void>(ARTERIES_ENDPOINTS.STANDBY(id));
  }

  /**
   * Switch between primary and backup channels for an artery
   * @param id Artery ID
   * @param useBackup Whether to use the backup channel
   */
  static async switchChannel(id: number, useBackup: boolean): Promise<void> {
    return api.patch<void>(ARTERIES_ENDPOINTS.SWITCH_CHANNEL(id), { useBackup });
  }

  /**
   * Get bandwidth usage data for a specific artery
   * @param id Artery ID
   * @param params Time range parameters
   */
  static async getArteryBandwidth(id: number, params?: {
    range?: 'hourly' | 'daily' | 'weekly';
    from?: string;
    to?: string;
  }): Promise<BandwidthData[]> {
    return api.get<BandwidthData[]>(ARTERIES_ENDPOINTS.BANDWIDTH(id), params);
  }
}

export default ArteriesService;
