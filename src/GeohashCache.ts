import { CacheEntry, GeohashCacheOptions, CityResult } from './types';
import { GeohashUtils } from './utils';
import { NominatimService } from './NominatimService';

export class GeohashCache {
  private cache: Map<string, CacheEntry>;
  private options: Required<GeohashCacheOptions>;
  private cleanupIntervalId?: NodeJS.Timeout;
  private nominatimService: NominatimService;

  constructor(options: GeohashCacheOptions = {}) {
    this.options = {
      defaultExpiry: 30 * 60 * 1000,
      precision: 4,
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000,
      nominatimEndpoint: 'https://nominatim.openstreetmap.org/reverse',
      requestDelay: 1000,
      userAgent: 'geohash-cache/1.0.0',
      ...options
    };

    this.cache = new Map();
    this.nominatimService = new NominatimService(
      this.options.nominatimEndpoint,
      this.options.requestDelay,
      this.options.userAgent
    );
    
    this.startCleanup();
  }

  async getCityName(lat: number, lon: number): Promise<CityResult> {
    // Try to get from cache first
    const cached = this.get(lat, lon);
    if (cached) {
      return cached;
    }

    // Try to find nearby cached result
    const nearby = this.getWithinRadius(lat, lon, 5000);
    if (nearby) {
      return nearby;
    }

    // Fetch from Nominatim
    const cityResult = await this.nominatimService.getCityName(lat, lon);
    
    // Cache the result
    this.set(lat, lon, cityResult);
    
    return cityResult;
  }

  async getCityNameWithFallback(lat: number, lon: number, maxDistance: number = 10000): Promise<CityResult> {
    try {
      return await this.getCityName(lat, lon);
    } catch (error) {
      // If API fails, try to get nearest cached result
      const nearest = this.getWithinRadius(lat, lon, maxDistance);
      if (nearest) {
        return nearest;
      }
      
      // Return fallback result
      return {
        name: 'Unknown location',
        fullAddress: '',
        details: {},
        coordinate: { lat, lon }
      };
    }
  }

  set(lat: number, lon: number, value: any, customExpiry?: number): void {
    const geohash = GeohashUtils.getGeohash(lat, lon, this.options.precision);
    const expiresAt = Date.now() + (customExpiry || this.options.defaultExpiry);

    this.cache.set(geohash, {
      value,
      timestamp: Date.now(),
      expiresAt,
      lat,
      lon
    });

    if (this.cache.size > this.options.maxSize) {
      this.cleanup(true);
    }
  }

  get(lat: number, lon: number): any | null {
    const geohash = GeohashUtils.getGeohash(lat, lon, this.options.precision);
    const entry = this.cache.get(geohash);

    if (!entry || Date.now() > entry.expiresAt) {
      if (entry) this.cache.delete(geohash);
      return null;
    }

    return entry.value;
  }

  getWithinRadius(lat: number, lon: number, maxDistance: number = 5000): any | null {
    let closestEntry: CacheEntry | null = null;
    let minDistance = Infinity;

    for (const [geohash, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(geohash);
        continue;
      }

      const distance = GeohashUtils.calculateDistance(lat, lon, entry.lat, entry.lon);
      if (distance <= maxDistance && distance < minDistance) {
        minDistance = distance;
        closestEntry = entry;
      }
    }

    return closestEntry?.value || null;
  }

  // ... (rest of the methods remain the same as before)
  has(lat: number, lon: number): boolean {
    return this.get(lat, lon) !== null;
  }

  delete(lat: number, lon: number): boolean {
    const geohash = GeohashUtils.getGeohash(lat, lon, this.options.precision);
    return this.cache.delete(geohash);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private startCleanup(): void {
    if (this.options.cleanupInterval > 0) {
      this.cleanupIntervalId = setInterval(() => {
        this.cleanup();
      }, this.options.cleanupInterval);
    }
  }

  private cleanup(force: boolean = false): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [geohash, entry] of this.cache.entries()) {
      if (now > entry.expiresAt || (force && deletedCount < this.cache.size - this.options.maxSize)) {
        this.cache.delete(geohash);
        deletedCount++;
      }
    }
  }

  destroy(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }
    this.clear();
  }

  // Getter for the Nominatim service for advanced configuration
  getNominatimService(): NominatimService {
    return this.nominatimService;
  }
}