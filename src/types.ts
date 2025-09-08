export interface CacheEntry {
    value: any;
    timestamp: number;
    expiresAt: number;
    lat: number;
    lon: number;
  }
  
  export interface GeohashCacheOptions {
    defaultExpiry?: number; // milliseconds
    precision?: number; // geohash precision
    maxSize?: number; // maximum cache entries
    cleanupInterval?: number; // automatic cleanup interval
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