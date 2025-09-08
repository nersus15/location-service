// src/storage/SessionStorage.ts
import { IStorage } from './StorageInterface';

export class SessionStorage implements IStorage {
    async getItem(key: string): Promise<any | null> {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('SessionStorage getItem error:', error);
            return null;
        }
    }

    async setItem(key: string, value: any): Promise<void> {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('SessionStorage setItem error:', error);
        }
    }

    async removeItem(key: string): Promise<void> {
        sessionStorage.removeItem(key);
    }

    async clear(): Promise<void> {
        sessionStorage.clear();
    }

    async getAllKeys(): Promise<string[]> {
        return Object.keys(sessionStorage);
    }
}