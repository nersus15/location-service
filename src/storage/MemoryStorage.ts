// src/storage/MemoryStorage.ts
import { IStorage } from './StorageInterface';

export class MemoryStorage implements IStorage {
  private storage: Map<string, any> = new Map();

  async getItem(key: string): Promise<any | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}