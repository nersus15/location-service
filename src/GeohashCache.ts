import { CacheEntry, GeohashCacheOptions, CityResult } from './types';
import { GeohashUtils } from './utils';
import { NominatimService } from './NominatimService';
import { createStorage } from './storage';
import { IStorage } from './storage/StorageInterface';

export class GeohashCache {
    private cache: Map<string, CacheEntry>;
    private options: Required<GeohashCacheOptions>;
    private cleanupIntervalId?: NodeJS.Timeout;
    private nominatimService: NominatimService;
    private storage: IStorage;
    private storageKey: string;

    constructor(options: GeohashCacheOptions = {}) {
        this.options = {
            defaultExpiry: 30 * 60 * 1000,
            precision: 4,
            maxSize: 1000,
            cleanupInterval: 5 * 60 * 1000,
            nominatimEndpoint: 'https://nominatim.openstreetmap.org/reverse',
            requestDelay: 1000,
            userAgent: 'geohash-cache/1.0.0',
            storageType: 'memory',
            storageKey: 'geohash_cache',
            ...options
        };

        this.cache = new Map();
        this.nominatimService = new NominatimService(
            this.options.nominatimEndpoint,
            this.options.requestDelay,
            this.options.userAgent
        );

        this.storage = createStorage(this.options.storageType);
        this.storageKey = this.options.storageKey;

        this.initialize();
    }

    private async initialize(): Promise<void> {
        // Load cached data from storage
        if (this.options.storageType !== 'memory') {
            await this.loadFromStorage();
        }

        this.cleanup();
    }

    private async loadFromStorage(): Promise<void> {
        try {
            const storedData = await this.storage.getItem(this.storageKey);
            if (storedData && typeof storedData === 'object') {
                Object.entries(storedData).forEach(([geohash, entry]) => {
                    if (this.isValidCacheEntry(entry)) {
                        this.cache.set(geohash, entry as CacheEntry);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load cache from storage:', error);
        }
    }

    private async saveToStorage(): Promise<void> {
        if (this.options.storageType === 'memory') {
            return;
        }

        try {
            const cacheObject = Object.fromEntries(this.cache);
            await this.storage.setItem(this.storageKey, cacheObject);
        } catch (error) {
            console.error('Failed to save cache to storage:', error);
        }
    }

    private isValidCacheEntry(entry: any): entry is CacheEntry {
        return entry &&
            typeof entry === 'object' &&
            'value' in entry &&
            'timestamp' in entry &&
            'expiresAt' in entry &&
            'lat' in entry &&
            'lon' in entry;
    }

    async getCityName(lat: number, lon: number): Promise<CityResult> {
        const cached = this.get(lat, lon);
        if (cached) {
            return cached;
        }

        const nearby = this.getWithinRadius(lat, lon, 5000);
        if (nearby) {
            return nearby;
        }

        const cityResult = await this.nominatimService.getCityName(lat, lon);
        this.set(lat, lon, cityResult);

        return cityResult;
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

        // Save to storage (async, no await for performance)
        this.saveToStorage();

        if (this.cache.size > this.options.maxSize) {
            this.cleanup(true);
        }
    }

    // ... other methods remain similar but with storage integration
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

    async clear(): Promise<void> {
        this.cache.clear();
        await this.storage.removeItem(this.storageKey);
    }

    private async cleanup(force: boolean = false): Promise<void> {
        const now = Date.now();
        let deletedCount = 0;

        for (const [geohash, entry] of this.cache.entries()) {
            if (now > entry.expiresAt || (force && deletedCount < this.cache.size - this.options.maxSize)) {
                this.cache.delete(geohash);
                deletedCount++;
            }
        }

        // Save cleaned cache to storage
        await this.saveToStorage();
    }
}