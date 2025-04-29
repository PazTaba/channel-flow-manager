// src/services/destinations-service.ts
import ApiService from './api';
import { Destination, PaginatedResponse, QueryParams } from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Destinations API endpoints
const DESTINATIONS_ENDPOINTS = {
  BASE: '/destinations',
  DETAIL: (id: number) => `/destinations/${id}`,
  STATUS: (id: number) => `/destinations/${id}/status`,
};

// Destination creation/update payload
export interface DestinationPayload {
  name: string;
  destinationIp: string;
  portNumber: number;
  protocol: string;
  timeToLive: number;
  maxPacketSize: number;
  encryption: string;
  primaryIp?: string;
  secondaryIp?: string;
  status?: 'play' | 'pause';
}

/**
 * Service class for Destinations related API calls
 */
export class DestinationsService {
  /**
   * Get all destinations with pagination
   * @param params Pagination and filtering parameters
   */
  static async getAllDestinations(params?: QueryParams): Promise<PaginatedResponse<Destination>> {
    return api.get<PaginatedResponse<Destination>>(DESTINATIONS_ENDPOINTS.BASE, params);
  }

  /**
   * Get a single destination by ID
   * @param id Destination ID
   */
  static async getDestinationById(id: number): Promise<Destination> {
    return api.get<Destination>(DESTINATIONS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Create a new destination
   * @param destinationData Destination data to create
   */
  static async createDestination(destinationData: DestinationPayload): Promise<Destination> {
    return api.post<Destination>(DESTINATIONS_ENDPOINTS.BASE, destinationData);
  }

  /**
   * Update an existing destination
   * @param id Destination ID
   * @param destinationData Updated destination data
   */
  static async updateDestination(id: number, destinationData: Partial<DestinationPayload>): Promise<Destination> {
    return api.put<Destination>(DESTINATIONS_ENDPOINTS.DETAIL(id), destinationData);
  }

  /**
   * Delete a destination
   * @param id Destination ID
   */
  static async deleteDestination(id: number): Promise<void> {
    return api.delete<void>(DESTINATIONS_ENDPOINTS.DETAIL(id));
  }

  /**
   * Get real-time delivery state of a destination
   * @param id Destination ID
   */
  static async getDestinationStatus(id: number): Promise<{
    status: 'play' | 'pause';
    activeConnections: number;
    lastError?: string;
    lastUpdated: string;
  }> {
    return api.get<{
      status: 'play' | 'pause';
      activeConnections: number;
      lastError?: string;
      lastUpdated: string;
    }>(DESTINATIONS_ENDPOINTS.STATUS(id));
  }

  /**
   * Toggle the status of a destination between play and pause
   * @param id Destination ID
   * @param status New status
   */
  static async toggleDestinationStatus(id: number, status: 'play' | 'pause'): Promise<void> {
    return api.patch<void>(DESTINATIONS_ENDPOINTS.DETAIL(id), { status });
  }
}

export default DestinationsService;