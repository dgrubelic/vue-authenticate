import { $window } from '../globals.js';
import { IStorage } from './types';

class LocalStorage implements IStorage {
  namespace?: string;

  constructor(namespace?: string) {
    this.namespace = namespace;
  }

  setItem(key: string, value: string): void {
    $window.localStorage.setItem(this._getStorageKey(key), value);
  }

  getItem(key: string): string | void | null {
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
