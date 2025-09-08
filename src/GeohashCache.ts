import { CacheEntry, GeohashCacheOptions, Location } from './types';
import { GeohashUtils } from './utils';

export class GeohashCache {
  private cache: Map<string, CacheEntry>;
  private options: Required<GeohashCacheOptions>;
  private cleanupIntervalId?: NodeJS.Timeout;

  constructor(options: GeohashCacheOptions = {}) {
    this.options = {
      defaultExpiry: 30 * 60 * 1000, // 30 minutes
      precision: 4, // ~20km precision
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...options
    };

    this.cache = new Map();
    this.startCleanup();
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

    // Enforce max size
    if (this.cache.size > this.options.maxSize) {
      this.cleanup(true); // Force cleanup
    }
  }

  get(lat: number, lon: number): any | null {
    const geohash = GeohashUtils.getGeohash(lat, lon, this.options.precision);
    const entry = this.cache.get(geohash);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(geohash);
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

  getAllEntries(): Map<string, CacheEntry> {
    return new Map(this.cache);
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

  // Utility methods
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return GeohashUtils.calculateDistance(lat1, lon1, lat2, lon2);
  }

  getPrecision(): number {
    return this.options.precision;
  }

  setPrecision(precision: number): void {
    this.options.precision = precision;
  }

  setDefaultExpiry(expiry: number): void {
    this.options.defaultExpiry = expiry;
  }
}