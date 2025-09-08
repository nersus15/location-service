import { GeohashUtils } from '../src/utils';

describe('GeohashUtils', () => {
  test('calculateDistance returns ~0 for identical coordinates', () => {
    const d = GeohashUtils.calculateDistance(0, 0, 0, 0);
    expect(d).toBeCloseTo(0, 5);
  });

  test('getGeohash rounds to given precision', () => {
    const hash = GeohashUtils.getGeohash(12.345678, 98.7654321, 4);
    expect(hash).toBe('12.3457,98.7654');
  });

  test('getBoundingBox creates box around coordinate with precision', () => {
    const bbox = GeohashUtils.getBoundingBox(10.1234, 20.5678, 3);
    expect(bbox.minLat).toBeCloseTo(10.122, 3);
    expect(bbox.maxLat).toBeCloseTo(10.124, 3);
    expect(bbox.minLon).toBeCloseTo(20.567, 3);
    expect(bbox.maxLon).toBeCloseTo(20.569, 3);
  });

  test('isWithinBoundingBox returns correct boolean', () => {
    const bbox = GeohashUtils.getBoundingBox(10, 20, 2);
    expect(GeohashUtils.isWithinBoundingBox(10.0, 20.0, bbox)).toBe(true);
    expect(GeohashUtils.isWithinBoundingBox(9.9, 20.0, bbox)).toBe(false);
  });
});


