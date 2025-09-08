// src/storage/LocalStorage.ts
import { IStorage } from './StorageInterface';

export class LocalStorage implements IStorage {
  async getItem(key: string): Promise<any | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('LocalStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage setItem error:', error);
      // Handle storage quota exceeded
      if (typeof error === 'object' && error !== null && (error as any).name === 'QuotaExceededError') {
        await this.clearOldEntries();
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage);
  }

  private async clearOldEntries(): Promise<void> {
    // Implement logic to clear oldest entries if storage is full
    const keys = await this.getAllKeys();
    if (keys.length > 0) {
      localStorage.removeItem(keys[0]);
    }
  }
}