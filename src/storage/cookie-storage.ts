import { $document } from '../globals.js';
import { objectExtend, formatCookie, parseCookies } from '../utils.js';
import { getCookieDomainUrl } from '../options.js';
import { IStorage, ICookieStorageOptions } from './types';

class CookieStorage implements IStorage {
  namespace?: string;
  _defaultOptions: ICookieStorageOptions;

  constructor(defaultOptions?: ICookieStorageOptions) {
    this._defaultOptions = objectExtend(
      {
        domain: getCookieDomainUrl(),
        expires: null,
        path: '/',
        secure: false,
      },
      defaultOptions
    );
  }

  setItem(key: string, value: ICookieStorageOptions) {
    const options = objectExtend({}, this._defaultOptions);
    const cookie = formatCookie(key, value, options);
    this._setCookie(cookie);
  }

  getItem(key: string): unknown {
    const cookies = parseCookies(this._getCookie());
    return cookies.hasOwnProperty(key) ? cookies[key] : null;
  }

  removeItem(key: string): void {
    const value = '';
    const defaultOptions = objectExtend({}, this._defaultOptions);
    const options = objectExtend(defaultOptions, {
      expires: new Date(0),
    });
    const cookie = formatCookie(key, value, options);
    this._setCookie(cookie);
  }

  _getCookie(): string {
    try {
      return $document.cookie === 'undefined' ? '' : $document.cookie;
    } catch (e) {}

    return '';
  }

  _setCookie(cookie: string) {
    try {
      $document.cookie = cookie;
    } catch (e) {}
  }

  _getStorageKey() {
    return null;
  }
}

export default CookieStorage;
