// src/storage/StorageInterface.ts
export interface IStorage {
    getItem(key: string): Promise<any | null>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
}