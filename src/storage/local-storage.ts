import { $window } from '../globals.js';
import { IStorage } from './types';

class LocalStorage implements IStorage {
  namespace?: string;

  constructor(namespace?: string) {
    this.namespace = namespace || null;
  }

  setItem(key: string, value: unknown): void {
    $window.localStorage.setItem(this._getStorageKey(key), value);
  }

  getItem(key: string): unknown {
    return $window.localStorage.getItem(this._getStorageKey(key));
  }

  removeItem(key: string): void {
    $window.localStorage.removeItem(this._getStorageKey(key));
  }

  _getStorageKey(key: string): string {
    if (this.namespace) {
      return [this.namespace, key].join('.');
    }
    return key;
  }
}

export default LocalStorage;
