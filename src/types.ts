// src/types.ts
export interface CacheEntry {
    value: any;
    timestamp: number;
    expiresAt: number;
    lat: number;
    lon: number;
  }
  
  export interface GeohashCacheOptions {
    defaultExpiry?: number;
    precision?: number;
    maxSize?: number;
    cleanupInterval?: number;
    nominatimEndpoint?: string;
    requestDelay?: number;
    userAgent?: string;
    storageType?: 'memory' | 'localStorage' | 'sessionStorage';
    storageKey?: string;
  }

export interface Location {
    lat: number;
    lon: number;
}

export interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

export interface NominatimResponse {
    address: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        county?: string;
        state?: string;
        country?: string;
    };
    display_name?: string;
}

export interface CityResult {
    name: string;
    fullAddress: string;
    details: NominatimResponse['address'];
    coordinate: {
        lat: number;
        lon: number;
    };
}