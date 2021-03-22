import { $window } from '../globals.js';
import { IStorage } from './types';

class SessionStorage implements IStorage {
  namespace?: string;

  constructor(namespace?: string) {
    this.namespace = namespace;
  }

  setItem(key: string, value: string): void {
    $window.sessionStorage.setItem(this._getStorageKey(key), value);
  }

  getItem(key: string): string | void | null {
    return $window.sessionStorage.getItem(this._getStorageKey(key));
  }

  removeItem(key: string): void {
    $window.sessionStorage.removeItem(this._getStorageKey(key));
  }

  _getStorageKey(key) {
    if (this.namespace) {
      return [this.namespace, key].join('.');
    }
    return key;
  }
}

export default SessionStorage;
