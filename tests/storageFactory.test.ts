import { createStorage } from '../src/storage';
import { MemoryStorage } from '../src/storage/MemoryStorage';
import { LocalStorage } from '../src/storage/LocalStorage';
import { SessionStorage } from '../src/storage/SessionStorage';

describe('createStorage', () => {
  test('returns MemoryStorage by default', () => {
    const storage = createStorage('memory');
    expect(storage).toBeInstanceOf(MemoryStorage);
  });

  test('returns LocalStorage when type is localStorage', () => {
    const storage = createStorage('localStorage');
    expect(storage).toBeInstanceOf(LocalStorage);
  });

  test('returns SessionStorage when type is sessionStorage', () => {
    const storage = createStorage('sessionStorage');
    expect(storage).toBeInstanceOf(SessionStorage);
  });
});


