import { LocalStorage } from './LocalStorage';
import { MemoryStorage } from './MemoryStorage';
import { SessionStorage } from './SessionStorage';
import { IStorage } from './StorageInterface';

export const createStorage = (type: 'memory' | 'localStorage' | 'sessionStorage'): IStorage => {
  switch (type) {
    case 'localStorage':
      return new LocalStorage();
    case 'sessionStorage':
      return new SessionStorage;
    default:
      return new MemoryStorage();
  }
};