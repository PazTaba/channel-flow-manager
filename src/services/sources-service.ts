// src/services/sources-service.ts
import ApiService from './api';
import { Source, PaginatedResponse, QueryParams } from '@/types';

// Initialize the API service
const api = ApiService.getInstance();

// Sources API endpoints
const SOURCES_ENDPOINTS = {
  BASE: '/sources',
  DETAIL: (id: number) => `/sources/${id}`,
  STATUS: (id: number) => `/sources/${id}/status`,
  PAUSE: (id: number) => `/sources/${id}/pause`,
  RESUME: (id: number) => `/sources/${id}/resume`,
};

// Source creation/update payload
export interface SourcePayload {
  name: string;
  ipAddress: string;
  protocol: string;
  encryptionEnabled?: boolean;
  encryptedMulticastAddress?: string;
}

/**
 * Service class for Sources related API calls
 */
export class SourcesService {
  /**
   * Get all sources with pagination
   * @param params Pagination and filtering parameters
   */
  static async getAllSources(params?: QueryParams): Promise<PaginatedResponse<Source>> {
    return api.get<PaginatedResponse<Source>>(SOURCES_ENDPOINTS.BASE, params);
  }

  /**
   * Get a single source by ID
   * @param id Source ID
   */
  static async getSourceById(id: number): Promise<Source> {
    return api.get<Source>(SOURCES_ENDPOINTS.DETAIL(id));
  }

  /**
   * Create a new source
   * @param sourceData Source data to create
   */
  static async createSource(sourceData: SourcePayload): Promise<Source> {
    return api.post<Source>(SOURCES_ENDPOINTS.BASE, sourceData);
  }

  /**
   * Update an existing source
   * @param id Source ID
   * @param sourceData Updated source data
   */
  static async updateSource(id: number, sourceData: Partial<SourcePayload>): Promise<Source> {
    return api.put<Source>(SOURCES_ENDPOINTS.DETAIL(id), sourceData);
  }

  /**
   * Delete a source
   * @param id Source ID
   */
  static async deleteSource(id: number): Promise<void> {
    return api.delete<void>(SOURCES_ENDPOINTS.DETAIL(id));
  }

  /**
   * Get real-time status of a source
   * @param id Source ID
   */
  static async getSourceStatus(id: number): Promise<{
    status: 'play' | 'pause';
    bandwidth: number;
    lastUpdated: string;
  }> {
    return api.get<{
      status: 'play' | 'pause';
      bandwidth: number;
      lastUpdated: string;
    }>(SOURCES_ENDPOINTS.STATUS(id));
  }

  /**
   * Pause a source stream
   * @param id Source ID
   */
  static async pauseSource(id: number): Promise<void> {
    return api.patch<void>(SOURCES_ENDPOINTS.PAUSE(id));
  }

  /**
   * Resume a paused source stream
   * @param id Source ID
   */
  static async resumeSource(id: number): Promise<void> {
    return api.patch<void>(SOURCES_ENDPOINTS.RESUME(id));
  }
}

export default SourcesService;