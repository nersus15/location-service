import { NominatimResponse, CityResult } from './types';

export class NominatimService {
  private endpoint: string;
  private requestDelay: number;
  private userAgent: string;
  private lastRequestTime: number = 0;

  constructor(
    endpoint: string = 'https://nominatim.openstreetmap.org/reverse',
    requestDelay: number = 1000,
    userAgent: string = 'geohash-cache/1.0.0'
  ) {
    this.endpoint = endpoint;
    this.requestDelay = requestDelay;
    this.userAgent = userAgent;
  }

  async getCityName(lat: number, lon: number): Promise<CityResult> {
    // Respect rate limiting
    await this.delayIfNeeded();

    try {
      const url = `${this.endpoint}?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
      }

      const data: NominatimResponse = await response.json();
      
      return {
        name: this.extractCityName(data.address),
        fullAddress: data.display_name || '',
        details: data.address,
        coordinate: { lat, lon }
      };
    } catch (error) {
      console.error('Error fetching from Nominatim:', error);
      throw error;
    }
  }

  private extractCityName(address: NominatimResponse['address']): string {
    return (
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state ||
      address.country ||
      'Unknown location'
    );
  }

  private async delayIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const delay = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  setRequestDelay(delay: number): void {
    this.requestDelay = delay;
  }

  setUserAgent(agent: string): void {
    this.userAgent = agent;
  }
}