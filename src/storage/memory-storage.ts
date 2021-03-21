import { IStorage } from './types'; 

class MemoryStorage implements IStorage {
  namespace: string;
  _storage: Record<string, unknown>;

  constructor(namespace?: string) {
    this.namespace = namespace || null;
    this._storage = {};
  }

  setItem(key: string, value: unknown): void {
    this._storage[this._getStorageKey(key)] = value;
  }

  getItem(key: string): unknown {
    return this._storage[this._getStorageKey(key)];
  }

  removeItem(key: string): void {
    delete this._storage[this._getStorageKey(key)];
  }

  _getStorageKey(key: string): string {
    if (this.namespace) {
      return [this.namespace, key].join('.');
    }
    return key;
  }
}

export default MemoryStorage;
