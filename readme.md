## Location-Service 📍
A lightweight, framework-agnostic geohash-based caching system for location data with built-in Nominatim API integration. Perfect for reducing API calls while providing accurate city name lookups based on coordinates.

### Features
🗺️ Automatic Nominatim Integration - Built-in OpenStreetMap reverse geocoding

💾 Multiple Storage Options - Memory, localStorage, and sessionStorage support

⚡ Smart Caching - Finds nearby cached results to minimize API calls

🎯 Accurate Distance Calculations - Haversine formula implementation

🔄 Automatic Cleanup - Removes expired entries automatically

📱 Framework Agnostic - Works with React, Vue, Angular, and vanilla JS

🛡️ Rate Limiting - Respects Nominatim's usage policies

### Installation
```bash
npm install location-service
```
or using yarn:

```bash
yarn add location-service
```

### Quick Start
#### Basic Usage
```javascript
import { GeohashCache } from 'location-service';

// Create cache instance
const cache = new GeohashCache();

// Get city name - automatically handles caching and API calls
async function getCityName(lat, lon) {
  try {
    const result = await cache.getCityName(lat, lon);
    console.log(`City: ${result.name}`);
    console.log(`Full address: ${result.fullAddress}`);
    return result.name;
  } catch (error) {
    console.error('Error:', error);
    return 'Unknown location';
  }
}

// Usage
getCityName(40.7128, -74.0060); // New York
getCityName(51.5074, -0.1278);  // London
```

#### React Example
```jsx
import { useState, useEffect } from 'react';
import { GeohashCache } from 'location-service';

function CityDisplay() {
  const [city, setCity] = useState('');
  const [cache] = useState(() => new GeohashCache({
    storageType: 'localStorage', // Persist between sessions
    defaultExpiry: 24 * 60 * 60 * 1000 // 24 hours
  }));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await cache.getCityName(latitude, longitude);
          setCity(result.name);
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  }, []);

  return <div>Your city: {city || 'Loading...'}</div>;
}
```

#### Vue 3 Example
```vue
<template>
  <div>
    <p>Your city: {{ cityName }}</p>
    <button @click="getLocation">Find My City</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { GeohashCache } from 'location-service';

const cityName = ref('');
const cache = ref(new GeohashCache());

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await cache.value.getCityName(latitude, longitude);
        cityName.value = result.name;
      },
      (error) => console.error('Error getting location:', error)
    );
  }
};
</script>
```

### API Reference
#### GeohashCache Constructor Options
```typescript
const cache = new GeohashCache({
  defaultExpiry: 30 * 60 * 1000,    // Cache expiry time (30 minutes)
  precision: 4,                      // Coordinate rounding precision (decimal places)
  maxSize: 1000,                     // Maximum cache entries
  cleanupInterval: 5 * 60 * 1000,    // Cleanup trigger interval (used during cleanup operations)
  nominatimEndpoint: 'https://nominatim.openstreetmap.org/reverse',
  requestDelay: 1000,                // Delay between API calls (1 second)
  userAgent: 'location-service/1.0.0',  // User agent for API requests
  storageType: 'memory',             // 'memory' | 'localStorage' | 'sessionStorage'
  storageKey: 'geohash_cache'        // Key for storage
});
```

#### Methods
- `getCityName(lat: number, lon: number): Promise<CityResult>`
  - Get city name for coordinates. Uses cache first (including nearby cached results), then API if needed.

- `set(lat: number, lon: number, value: any, customExpiry?: number): void`
  - Manually add an entry to the cache.

- `get(lat: number, lon: number): any | null`
  - Get cached value for exact rounded coordinates or `null`.

- `getWithinRadius(lat: number, lon: number, maxDistance?: number): any | null`
  - Find closest cached result within radius (meters).

- `clear(): Promise<void>`
  - Clear all cached data from memory and persistent storage.

```javascript
const result = await cache.getCityName(40.7128, -74.0060);
// {
//   name: "New York",
//   fullAddress: "New York, NY, USA",
//   details: { city: "New York", state: "NY", country: "USA" },
//   coordinate: { lat: 40.7128, lon: -74.0060 }
// }
```

### Storage Options
#### Memory Storage (Default)
```javascript
// Only lasts during current runtime
const cache = new GeohashCache({ storageType: 'memory' });
```

#### LocalStorage
```javascript
// Persists between browser sessions
const cache = new GeohashCache({ 
  storageType: 'localStorage',
  storageKey: 'my_app_geo_cache' // Custom storage key
});
```

#### SessionStorage
```javascript
// Persists only during current tab session
const cache = new GeohashCache({ storageType: 'sessionStorage' });
```

### Error Handling
```javascript
import { GeohashCache } from 'location-service';

const cache = new GeohashCache();

async function getCitySafe(lat, lon) {
  try {
    return await cache.getCityName(lat, lon);
  } catch (error) {
    console.warn('API failed, trying fallback:', error);
    // Try to get nearby cached result as a fallback
    const fallback = cache.getWithinRadius(lat, lon, 10000);
    if (fallback) return fallback;
    return {
      name: 'Unknown Location',
      fullAddress: '',
      details: {},
      coordinate: { lat, lon }
    };
  }
}
```

### Best Practices
1. Proper User Agent
```javascript
// Always set a proper user agent
const cache = new GeohashCache({
  userAgent: 'your-app-name/version (contact@email.com)'
});
```

2. Respect Rate Limits
```javascript
// Use appropriate delays between requests
const cache = new GeohashCache({
  requestDelay: 2000 // 2 seconds between API calls
});
```

3. Cache Expiry Strategy
```javascript
// Balance between freshness and API calls
const cache = new GeohashCache({
  defaultExpiry: 24 * 60 * 60 * 1000, // 24 hours for city data
  precision: 4 // decimal rounding of coordinates
});
```

4. Storage Management
```javascript
// Use localStorage for persistence, but limit size
const cache = new GeohashCache({
  storageType: 'localStorage',
  maxSize: 200 // Prevent storage bloat
});
```

### Browser Support
This package supports all modern browsers that support:

- ES2015+
- Promises
- Fetch API
- localStorage/sessionStorage

For older browsers, you may need polyfills for:

- Promise
- fetch
- Object.entries
- Map

### License
ISC License

### Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

### Support
If you have any issues or questions, please file an issue on the GitHub repository.

Happy coding! 🚀


