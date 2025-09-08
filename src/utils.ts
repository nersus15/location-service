import { BoundingBox } from './types';

export class GeohashUtils {
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  static getGeohash(lat: number, lon: number, precision: number = 4): string {
    // Simple geohash implementation using rounded coordinates
    return `${lat.toFixed(precision)},${lon.toFixed(precision)}`;
  }

  static getBoundingBox(lat: number, lon: number, precision: number): BoundingBox {
    const step = Math.pow(10, -precision);
    return {
      minLat: parseFloat((lat - step).toFixed(precision)),
      maxLat: parseFloat((lat + step).toFixed(precision)),
      minLon: parseFloat((lon - step).toFixed(precision)),
      maxLon: parseFloat((lon + step).toFixed(precision))
    };
  }

  static isWithinBoundingBox(lat: number, lon: number, bbox: BoundingBox): boolean {
    return lat >= bbox.minLat && lat <= bbox.maxLat &&
           lon >= bbox.minLon && lon <= bbox.maxLon;
  }
}