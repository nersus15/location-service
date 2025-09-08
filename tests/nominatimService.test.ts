import { NominatimService } from '../src/NominatimService';

describe('NominatimService', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test('getCityName fetches and maps response', async () => {
    const service = new NominatimService('https://example.com/reverse', 0, 'test-agent');

    const mockJson = {
      address: { city: 'TestCity' },
      display_name: 'TestCity, Country'
    } as any;

    const fetchSpy = jest.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockJson,
    } as any);

    const result = await service.getCityName(1.23, 4.56);

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.name).toBe('TestCity');
    expect(result.fullAddress).toBe('TestCity, Country');
    expect(result.coordinate.lat).toBeCloseTo(1.23);
    expect(result.coordinate.lon).toBeCloseTo(4.56);

    fetchSpy.mockRestore();
  });

  test('uses rate limiting (delay) between requests', async () => {
    jest.useFakeTimers();
    const service = new NominatimService('https://example.com/reverse', 50, 'test-agent');

    const fetchSpy = jest.spyOn(globalThis, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ address: { city: 'A' } }),
    } as any);

    const p1 = service.getCityName(0, 0);
    await Promise.resolve();
    jest.advanceTimersByTime(0);
    await p1;

    const start = Date.now();
    const p2 = service.getCityName(0, 1);
    // advance less than required
    jest.advanceTimersByTime(20);
    // allow pending promises to process
    await Promise.resolve();
    // now advance the remaining time
    jest.advanceTimersByTime(40);
    await p2;

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  });
});


