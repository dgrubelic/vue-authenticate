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

  setItem(key: string, value: unknown): void {
    const options = objectExtend({}, this._defaultOptions);
    const cookie = formatCookie(key, value, options);
    this._setCookie(cookie);
  }

  getItem(key: string): string | void | null {
    const cookies: Record<string, string> = parseCookies(this._getCookie());
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

  _getStorageKey(): string {
    throw new Error('not supported');
  }
}

export default CookieStorage;
