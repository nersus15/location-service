import { GeohashCache } from '../src/GeohashCache';

// Mock NominatimService within GeohashCache by spying on its method via instance
jest.mock('../src/NominatimService', () => {
  return {
    NominatimService: class {
      async getCityName(lat: number, lon: number) {
        return {
          name: `City_${lat.toFixed(2)}_${lon.toFixed(2)}`,
          fullAddress: 'Full Address',
          details: { city: 'MockCity' },
          coordinate: { lat, lon },
        };
      }
    }
  };
});

describe('GeohashCache', () => {
  test('caches value after first fetch and returns cached on second call', async () => {
    const cache = new GeohashCache({ requestDelay: 0, storageType: 'memory' });
    const lat = 1.2345, lon = 2.3456;

    const first = await cache.getCityName(lat, lon);
    const second = await cache.getCityName(lat, lon);

    expect(first.name).toBe(second.name);
  });

  test('getWithinRadius returns nearby cached value', async () => {
    const cache = new GeohashCache({ requestDelay: 0, storageType: 'memory' });
    const ref = { lat: 10.0000, lon: 20.0000 };
    const near = { lat: 10.0010, lon: 20.0010 };

    const value = { name: 'NearbyCity', fullAddress: '', details: { city: 'Nearby' }, coordinate: near };
    cache.set(near.lat, near.lon, value, 60_000);

    const found = cache.getWithinRadius(ref.lat, ref.lon, 500);
    expect(found).toEqual(value);
  });

  test('getWithinRadius returns nearby cached value for radius 5 Km', async () => {
    const cache = new GeohashCache({ requestDelay: 0, storageType: 'memory' });
    const ref = { lat:40.7128, lon:-74.0060};
    const near = { lat: 40.7129, lon:-74.0061 };

    const value = { name: 'NearbyCity', fullAddress: '', details: { city: 'Nearby' }, coordinate: near };
    cache.set(near.lat, near.lon, value, 60_000);

    const found = cache.getWithinRadius(ref.lat, ref.lon, 5000);
    expect(found).toEqual(value);
  });

  test('getWithinRadius returns new value for radius 5 Km', async () => {
    const cache = new GeohashCache({ requestDelay: 0, storageType: 'memory' });
    const ref = { lat:40.7128, lon:-74.0060};
    const near = { lat: 40.7580, lon:-73.9855 };

    const value = { name: 'NearbyCity', fullAddress: '', details: { city: 'Nearby' }, coordinate: near };
    cache.set(near.lat, near.lon, value, 60_000);

    const found = cache.getWithinRadius(ref.lat, ref.lon, 5000);
    expect(found).not.toEqual(value);
  });

  test('expired entries are ignored and removed', async () => {
    const cache = new GeohashCache({ requestDelay: 0, storageType: 'memory' });
    const lat = 5, lon = 6;

    cache.set(lat, lon, { foo: 'bar' }, 1);
    await new Promise(r => setTimeout(r, 5));

    const got = cache.get(lat, lon);
    expect(got).toBeNull();
  });
});


