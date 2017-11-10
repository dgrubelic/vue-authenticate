import {
  objectExtend,
  formatCookie,
  getCookieDomain,
  parseCookies
} from '../utils.js';

class CookieStorage {
  constructor(defaultOptions) {
    this._defaultOptions = objectExtend({
      domain: getCookieDomain(),
      expires: null,
      path: '/',
      secure: false,
      getCookieFn: this._getCookie,
    }, defaultOptions);
  }

  setItem(key, value) {
    const options = objectExtend({}, this._defaultOptions);
    const cookie = formatCookie(key, value, options);
    this._setCookie(cookie);
  }

  getItem(key) {
    const options = objectExtend({}, this._defaultOptions);
    const cookies = parseCookies(options.getCookieFn());
    return cookies.hasOwnProperty(key) ? cookies[key] : null;
  }

  removeItem(key) {
    const value = '';
    const defaultOptions = objectExtend({}, this._defaultOptions);
    const options = objectExtend(defaultOptions, {
      expires: new Date(0)
    });
    const cookie = formatCookie(key, value, options);
    this._setCookie(cookie);
  }

  _getCookie() {
    return typeof document === 'undefined'
      ? '' : typeof document.cookie === 'undefined'
        ? '' : document.cookie;
  }

  _setCookie(cookie) {
    document.cookie = cookie;
  }
}

export default CookieStorage
