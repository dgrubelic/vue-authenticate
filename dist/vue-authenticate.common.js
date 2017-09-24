/*!
 * vue-authenticate v1.3.0
 * https://github.com/dgrubelic/vue-authenticate
 * Released under the MIT License.
 */

'use strict';

if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) {
    'use strict';
    var arguments$1 = arguments;

    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments$1[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

function camelCase(name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
}





function isObject(value) {
  return value !== null && typeof value === 'object'
}

function isString(value) {
  return typeof value === 'string'
}



function isFunction(value) {
  return typeof value === 'function'
}

function objectExtend(a, b) {

  // Don't touch 'null' or 'undefined' objects.
  if (a == null || b == null) {
    return a;
  }

  Object.keys(b).forEach(function (key) {
    if (Object.prototype.toString.call(b[key]) == '[object Object]') {
      if (Object.prototype.toString.call(a[key]) != '[object Object]') {
        a[key] = b[key];
      } else {
        a[key] = objectExtend(a[key], b[key]);
      }
    } else {
      a[key] = b[key];
    }
  });

  return a;
}

/**
 * Assemble url from two segments
 * 
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @param  {String} baseUrl Base url
 * @param  {String} url     URI
 * @return {String}
 */
function joinUrl(baseUrl, url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) {
    return url;
  }
  var joined = [baseUrl, url].join('/');
  var normalize = function (str) {
    return str
      .replace(/[\/]+/g, '/')
      .replace(/\/\?/g, '?')
      .replace(/\/\#/g, '#')
      .replace(/\:\//g, '://');
  };
  return normalize(joined);
}

/**
 * Get full path based on current location
 * 
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @param  {Location} location
 * @return {String}
 */
function getFullUrlPath(location) {
  var isHttps = location.protocol === 'https:';
  return location.protocol + '//' + location.hostname +
    ':' + (location.port || (isHttps ? '443' : '80')) +
    (/^\//.test(location.pathname) ? location.pathname : '/' + location.pathname);
}

/**
 * Parse query string variables
 * 
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @param  {String} Query string
 * @return {String}
 */
function parseQueryString(str) {
  var obj = {};
  var key;
  var value;
  (str || '').split('&').forEach(function (keyValue) {
    if (keyValue) {
      value = keyValue.split('=');
      key = decodeURIComponent(value[0]);
      obj[key] = (!!value[1]) ? decodeURIComponent(value[1]) : true;
    }
  });
  return obj;
}

/**
 * Decode base64 string
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @param  {String} str base64 encoded string
 * @return {Object}
 */
function decodeBase64(str) {
  var buffer;
  if (typeof module !== 'undefined' && module.exports) {
    try {
      buffer = require('buffer').Buffer;
    } catch (err) {
      // noop
    }
  }

  var fromCharCode = String.fromCharCode;

  var re_btou = new RegExp([
    '[\xC0-\xDF][\x80-\xBF]',
    '[\xE0-\xEF][\x80-\xBF]{2}',
    '[\xF0-\xF7][\x80-\xBF]{3}'
  ].join('|'), 'g');

  var cb_btou = function (cccc) {
    switch (cccc.length) {
      case 4:
        var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
          | ((0x3f & cccc.charCodeAt(1)) << 12)
          | ((0x3f & cccc.charCodeAt(2)) << 6)
          | (0x3f & cccc.charCodeAt(3));
        var offset = cp - 0x10000;
        return (fromCharCode((offset >>> 10) + 0xD800)
        + fromCharCode((offset & 0x3FF) + 0xDC00));
      case 3:
        return fromCharCode(
          ((0x0f & cccc.charCodeAt(0)) << 12)
          | ((0x3f & cccc.charCodeAt(1)) << 6)
          | (0x3f & cccc.charCodeAt(2))
        );
      default:
        return fromCharCode(
          ((0x1f & cccc.charCodeAt(0)) << 6)
          | (0x3f & cccc.charCodeAt(1))
        );
    }
  };

  var btou = function (b) {
    return b.replace(re_btou, cb_btou);
  };

  var _decode = buffer ? function (a) {
    return (a.constructor === buffer.constructor
      ? a : new buffer(a, 'base64')).toString();
  }
    : function (a) {
    return btou(atob(a));
  };

  return _decode(
    String(str).replace(/[-_]/g, function (m0) {
      return m0 === '-' ? '+' : '/';
    })
      .replace(/[^A-Za-z0-9\+\/]/g, '')
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function () {
    fn.apply(thisArg, arguments);
  };
}

function Promise$1(fn) {
  if (typeof this !== 'object') { throw new TypeError('Promises must be constructed via new'); }
  if (typeof fn !== 'function') { throw new TypeError('not a function'); }
  this._state = 0;
  this._handled = false;
  this._value = undefined;
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise$1._immediateFn(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self) { throw new TypeError('A promise cannot be resolved with itself.'); }
    if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
      var then = newValue.then;
      if (newValue instanceof Promise$1) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise$1._immediateFn(function() {
      if (!self._handled) {
        Promise$1._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(function (value) {
      if (done) { return; }
      done = true;
      resolve(self, value);
    }, function (reason) {
      if (done) { return; }
      done = true;
      reject(self, reason);
    });
  } catch (ex) {
    if (done) { return; }
    done = true;
    reject(self, ex);
  }
}

Promise$1.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

Promise$1.prototype.then = function (onFulfilled, onRejected) {
  var prom = new (this.constructor)(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise$1.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise$1(function (resolve, reject) {
    if (args.length === 0) { return resolve([]); }
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(val, function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise$1.resolve = function (value) {
  if (value && typeof value === 'object' && value.constructor === Promise$1) {
    return value;
  }

  return new Promise$1(function (resolve) {
    resolve(value);
  });
};

Promise$1.reject = function (value) {
  return new Promise$1(function (resolve, reject) {
    reject(value);
  });
};

Promise$1.race = function (values) {
  return new Promise$1(function (resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise$1._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
  function (fn) {
    setTimeoutFunc(fn, 0);
  };

Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

/**
 * Set the immediate function to execute callbacks
 * @param fn {function} Function to execute
 * @deprecated
 */
Promise$1._setImmediateFn = function _setImmediateFn(fn) {
  Promise$1._immediateFn = fn;
};

/**
 * Change the function to execute on unhandled rejection
 * @param {function} fn Function to execute on unhandled rejection
 * @deprecated
 */
Promise$1._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
  Promise$1._unhandledRejectionFn = fn;
};

/**
 * Default configuration
 */
var defaultOptions = {
  baseUrl: null,
  tokenName: 'token',
  tokenPrefix: 'vueauth',
  tokenHeader: 'Authorization',
  tokenType: 'Bearer',
  loginUrl: '/auth/login',
  registerUrl: '/auth/register',
  logoutUrl: null,
  storageType: 'localStorage',
  storageNamespace: 'vue-authenticate',
  requestDataKey: 'data',
  responseDataKey: 'data',

  /**
   * Default request interceptor for Axios library
   * @context {VueAuthenticate}
   */
  bindRequestInterceptor: function () {
    var this$1 = this;

    this.$http.interceptors.request.use(function (config) {
      if (this$1.isAuthenticated()) {
        config.headers['Authorization'] = [
          this$1.options.tokenType, this$1.getToken()
        ].join(' ');
      } else {
        delete config.headers['Authorization'];
      }
      return config
    });
  },

  /**
   * Default response interceptor for Axios library
   * @contect {VueAuthenticate}
   */
  bindResponseInterceptor: function () {
    var this$1 = this;

    this.$http.interceptors.response.use(function (response) {
      this$1.setToken(response);
      return response
    });
  },

  providers: {
    facebook: {
      name: 'facebook',
      url: '/auth/facebook',
      authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
      redirectUri: null,
      requiredUrlParams: ['display', 'scope'],
      scope: ['email'],
      scopeDelimiter: ',',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 580, height: 400 }
    },

    google: {
      name: 'google',
      url: '/auth/google',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: null,
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      scope: ['profile', 'email'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 452, height: 633 }
    },

    github: {
      name: 'github',
      url: '/auth/github',
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      redirectUri: null,
      optionalUrlParams: ['scope'],
      scope: ['user:email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: { width: 1020, height: 618 }
    },

    instagram: {
      name: 'instagram',
      url: '/auth/instagram',
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
      redirectUri: null,
      requiredUrlParams: ['scope'],
      scope: ['basic'],
      scopeDelimiter: '+',
      oauthType: '2.0'
    },

    twitter: {
      name: 'twitter',
      url: '/auth/twitter',
      authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
      redirectUri: null,
      oauthType: '1.0',
      popupOptions: { width: 495, height: 645 }
    },

    bitbucket: {
      name: 'bitbucket',
      url: '/auth/bitbucket',
      authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
      redirectUri: null,
      optionalUrlParams: ['scope'],
      scope: ['email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: { width: 1020, height: 618 }
    },

    linkedin: {
      name: 'linkedin',
      url: '/auth/linkedin',
      authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
      redirectUri: null,
      requiredUrlParams: ['state'],
      scope: ['r_emailaddress'],
      scopeDelimiter: ' ',
      state: 'STATE',
      oauthType: '2.0',
      popupOptions: { width: 527, height: 582 }
    },

    live: {
      name: 'live',
      url: '/auth/live',
      authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
      redirectUri: null,
      requiredUrlParams: ['display', 'scope'],
      scope: ['wl.emails'],
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 500, height: 560 }
    },

    oauth1: {
      name: null,
      url: '/auth/oauth1',
      authorizationEndpoint: null,
      redirectUri: null,
      oauthType: '1.0',
      popupOptions: null
    },

    oauth2: {
      name: null,
      url: '/auth/oauth2',
      clientId: null,
      redirectUri: null,
      authorizationEndpoint: null,
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      requiredUrlParams: null,
      optionalUrlParams: null,
      scope: null,
      scopePrefix: null,
      scopeDelimiter: null,
      state: null,
      oauthType: '2.0',
      popupOptions: null,
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri'
      }
    }
  }
};

var LocalStorage = function LocalStorage(namespace) {
  this.namespace = namespace || null;
};

LocalStorage.prototype.setItem = function setItem (key, value) {
  window.localStorage.setItem(this._getStorageKey(key), value);
};

LocalStorage.prototype.getItem = function getItem (key) {
  return window.localStorage.getItem(this._getStorageKey(key))
};

LocalStorage.prototype.removeItem = function removeItem (key) {
  window.localStorage.removeItem(this._getStorageKey(key));
};

LocalStorage.prototype._getStorageKey = function _getStorageKey (key) {
  if (this.namespace) {
    return [this.namespace, key].join('.')
  }
  return key;
};

var MemoryStorage = function MemoryStorage(namespace) {
  this.namespace = namespace || null;
  this._storage = {};
};

MemoryStorage.prototype.setItem = function setItem (key, value) {
  this._storage[this._getStorageKey(key)] = value;
};

MemoryStorage.prototype.getItem = function getItem (key) {
  return this._storage[this._getStorageKey(key)]
};

MemoryStorage.prototype.removeItem = function removeItem (key) {
  delete this._storage[this._getStorageKey(key)];
};

MemoryStorage.prototype._getStorageKey = function _getStorageKey (key) {
  if (this.namespace) {
    return [this.namespace, key].join('.')
  }
  return key;
};

var LocalStorage$2 = function LocalStorage(namespace) {
  this.namespace = namespace || null;
};

LocalStorage$2.prototype.setItem = function setItem (key, value) {
  window.sessionStorage.setItem(this._getStorageKey(key), value);
};

LocalStorage$2.prototype.getItem = function getItem (key) {
  return window.sessionStorage.getItem(this._getStorageKey(key))
};

LocalStorage$2.prototype.removeItem = function removeItem (key) {
  window.sessionStorage.removeItem(this._getStorageKey(key));
};

LocalStorage$2.prototype._getStorageKey = function _getStorageKey (key) {
  if (this.namespace) {
    return [this.namespace, key].join('.')
  }
  return key;
};

function StorageFactory(options) {
  switch (options.storageType) {
    case 'localStorage':
      try {
        window.localStorage.setItem('testKey', 'test');
        window.localStorage.removeItem('testKey');
        return new LocalStorage(options.storageNamespace)
      } catch(e) {}

    case 'sessionStorage':
      try {
        window.sessionStorage.setItem('testKey', 'test');
        window.sessionStorage.removeItem('testKey');
        return new LocalStorage$2(options.storageNamespace)
      } catch(e) {}

    case 'memoryStorage': 
    default:
      return new MemoryStorage(options.storageNamespace)
      break;
  }
}

/**
 * OAuth2 popup management class
 * 
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer 
 * and adjusted to fit vue-authenticate library
 */
var OAuthPopup = function OAuthPopup(url, name, popupOptions) {
  this.popup = null;
  this.url = url;
  this.name = name;
  this.popupOptions = popupOptions;
};

OAuthPopup.prototype.open = function open (redirectUri, skipPooling) {
  try {
    this.popup = window.open(this.url, this.name, this._stringifyOptions());
    if (this.popup && this.popup.focus) {
      this.popup.focus();
    }

    if (skipPooling) {
      return Promise$1.resolve()
    } else {
      return this.pooling(redirectUri)
    }
  } catch(e) {
    return Promise$1.reject(new Error('OAuth popup error occurred'))
  }
};

OAuthPopup.prototype.pooling = function pooling (redirectUri) {
    var this$1 = this;

  return new Promise$1(function (resolve, reject) {
    var redirectUriParser = document.createElement('a');
    redirectUriParser.href = redirectUri;
    var redirectUriPath = getFullUrlPath(redirectUriParser);

    var poolingInterval = setInterval(function () {
      if (!this$1.popup || this$1.popup.closed || this$1.popup.closed === undefined) {
        clearInterval(poolingInterval);
        poolingInterval = null;
        reject(new Error('Auth popup window closed'));
      }

      try {
        var popupWindowPath = getFullUrlPath(this$1.popup.location);

        if (popupWindowPath === redirectUriPath) {
          if (this$1.popup.location.search || this$1.popup.location.hash) {
            var query = parseQueryString(this$1.popup.location.search.substring(1).replace(/\/$/, ''));
            var hash = parseQueryString(this$1.popup.location.hash.substring(1).replace(/[\/$]/, ''));
            var params = objectExtend({}, query);
            params = objectExtend(params, hash);

            if (params.error) {
              reject(new Error(params.error));
            } else {
              resolve(params);
            }
          } else {
            reject(new Error('OAuth redirect has occurred but no query or hash parameters were found.'));
          }

          clearInterval(poolingInterval);
          poolingInterval = null;
          this$1.popup.close();
        }
      } catch(e) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
      }
    }, 250);
  })
};

OAuthPopup.prototype._stringifyOptions = function _stringifyOptions () {
    var this$1 = this;

  var options = [];
  for (var optionKey in this$1.popupOptions) {
    options.push((optionKey + "=" + (this$1.popupOptions[optionKey])));
  }
  return options.join(',')
};

var defaultProviderConfig = {
  name: null,
  url: null,
  authorizationEndpoint: null,
  scope: null,
  scopePrefix: null,
  scopeDelimiter: null,
  redirectUri: null,
  requiredUrlParams: null,
  defaultUrlParams: null,
  oauthType: '1.0',
  popupOptions: { width: null, height: null }
};

var OAuth = function OAuth($http, storage, providerConfig, options) {
  this.$http = $http;
  this.storage = storage;
  this.providerConfig = objectExtend({}, defaultProviderConfig);
  this.providerConfig = objectExtend(this.providerConfig, providerConfig);
  this.options = options;
};

/**
 * Initialize OAuth1 process 
 * @param{Object} userData User data
 * @return {Promise}
 */
OAuth.prototype.init = function init (userData) {
    var this$1 = this;

  this.oauthPopup = new OAuthPopup('about:blank', this.providerConfig.name, this.providerConfig.popupOptions);

  if (window && !window['cordova']) {
    this.oauthPopup.open(this.providerConfig.redirectUri, true);
  }

  return this.getRequestToken().then(function (response) {
    return this$1.openPopup(response).then(function (popupResponse) {
      return this$1.exchangeForToken(popupResponse, userData)
    })
  })
};

/**
 * Get OAuth1 request token
 * @return {Promise}
 */
OAuth.prototype.getRequestToken = function getRequestToken () {
  var requestOptions = {};
  requestOptions.method = 'POST';
  requestOptions[this.options.requestDataKey] = objectExtend({}, this.providerConfig);
  requestOptions.withCredentials = this.options.withCredentials;
  if (this.options.baseUrl) {
    requestOptions.url = joinUrl(this.options.baseUrl, this.providerConfig.url);
  } else {
    requestOptions.url = this.providerConfig.url;
  }

  return this.$http(requestOptions)
};

/**
 * Open OAuth1 popup
 * @param{Object} response Response object containing request token
 * @return {Promise}
 */
OAuth.prototype.openPopup = function openPopup (response) {
  var url = [this.providerConfig.authorizationEndpoint, this.buildQueryString(response[this.options.responseDataKey])].join('?');

  this.oauthPopup.popup.location = url;
  if (window && window['cordova']) {
    return this.oauthPopup.open(this.providerConfig.redirectUri)
  } else {
    return this.oauthPopup.pooling(this.providerConfig.redirectUri)
  }
};

/**
 * Exchange token and token verifier for access token
 * @param{Object} oauth  OAuth data containing token and token verifier
 * @param{Object} userData User data
 * @return {Promise}
 */
OAuth.prototype.exchangeForToken = function exchangeForToken (oauth, userData) {
  var payload = objectExtend({}, userData);
  payload = objectExtend(payload, oauth);
  var requestOptions = {};
  requestOptions.method = 'POST';
  requestOptions[this.options.requestDataKey] = payload;
  requestOptions.withCredentials = this.options.withCredentials;
  if (this.options.baseUrl) {
    requestOptions.url = joinUrl(this.options.baseUrl, this.providerConfig.url);
  } else {
    requestOptions.url = this.providerConfig.url;
  }
  return this.$http(requestOptions)
};

OAuth.prototype.buildQueryString = function buildQueryString (params) {
  var parsedParams = [];
  for (var key in params) {
    var value = params[key];
    parsedParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }
  return parsedParams.join('&');
};

/**
 * Default provider configuration
 * @type {Object}
 */
var defaultProviderConfig$1 = {
  name: null,
  url: null,
  clientId: null,
  authorizationEndpoint: null,
  redirectUri: null,
  scope: null,
  scopePrefix: null,
  scopeDelimiter: null,
  state: null,
  requiredUrlParams: null,
  defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
  responseType: 'code',
  responseParams: {
    code: 'code',
    clientId: 'clientId',
    redirectUri: 'redirectUri'
  },
  oauthType: '2.0',
  popupOptions: { width: null, height: null }
};

var OAuth2 = function OAuth2($http, storage, providerConfig, options) {
  this.$http = $http;
  this.storage = storage;
  this.providerConfig = objectExtend({}, defaultProviderConfig$1);
  this.providerConfig = objectExtend(this.providerConfig, providerConfig);
  this.options = options;
};

OAuth2.prototype.init = function init (userData) {
    var this$1 = this;

  var stateName = this.providerConfig.name + '_state';
  if (isFunction(this.providerConfig.state)) {
    this.storage.setItem(stateName, this.providerConfig.state());
  } else if (isString(this.providerConfig.state)) {
    this.storage.setItem(stateName, this.providerConfig.state);
  }

  var url = [this.providerConfig.authorizationEndpoint, this._stringifyRequestParams()].join('?');

  this.oauthPopup = new OAuthPopup(url, this.providerConfig.name, this.providerConfig.popupOptions);
    
  return new Promise(function (resolve, reject) {
    this$1.oauthPopup.open(this$1.providerConfig.redirectUri).then(function (response) {
      if (this$1.providerConfig.responseType === 'token' || !this$1.providerConfig.url) {
        return resolve(response)
      }

      if (response.state && response.state !== this$1.storage.getItem(stateName)) {
        return reject(new Error('State parameter value does not match original OAuth request state value'))
      }

      resolve(this$1.exchangeForToken(response, userData));
    }).catch(function (err) {
      reject(err);
    });
  })
};

/**
 * Exchange temporary oauth data for access token
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @param{[type]} oauth  [description]
 * @param{[type]} userData [description]
 * @return {[type]}        [description]
 */
OAuth2.prototype.exchangeForToken = function exchangeForToken (oauth, userData) {
    var this$1 = this;

  var payload = objectExtend({}, userData);

  for (var key in defaultProviderConfig$1.responseParams) {
    var value = defaultProviderConfig$1[key];

    switch(key) {
      case 'code':
        payload[key] = oauth.code;
        break
      case 'clientId':
        payload[key] = this$1.providerConfig.clientId;
        break
      case 'redirectUri':
        payload[key] = this$1.providerConfig.redirectUri;
        break
      default:
        payload[key] = oauth[key];
    }
  }

  if (oauth.state) {
    payload.state = oauth.state;
  }

  var exchangeTokenUrl;
  if (this.options.baseUrl) {
    exchangeTokenUrl = joinUrl(this.options.baseUrl, this.providerConfig.url);
  } else {
    exchangeTokenUrl = this.providerConfig.url;
  }

  return this.$http.post(exchangeTokenUrl, payload, {
    withCredentials: this.options.withCredentials
  })
};

/**
 * Stringify oauth params
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * 
 * @return {String}
 */
OAuth2.prototype._stringifyRequestParams = function _stringifyRequestParams () {
    var this$1 = this;

  var keyValuePairs = [];
  var paramCategories = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

  paramCategories.forEach(function (categoryName) {
    if (!this$1.providerConfig[categoryName]) { return }
    if (!Array.isArray(this$1.providerConfig[categoryName])) { return }

    this$1.providerConfig[categoryName].forEach(function (paramName) {
      var camelCaseParamName = camelCase(paramName);
      var paramValue = isFunction(this$1.providerConfig[paramName]) ? this$1.providerConfig[paramName]() : this$1.providerConfig[camelCaseParamName];

      if (paramName === 'redirect_uri' && !paramValue) { return }

      if (paramName === 'state') {
        var stateName = this$1.providerConfig.name + '_state';
        paramValue = encodeURIComponent(this$1.storage.getItem(stateName));
      }
      if (paramName === 'scope' && Array.isArray(paramValue)) {
        paramValue = paramValue.join(this$1.providerConfig.scopeDelimiter);
        if (this$1.providerConfig.scopePrefix) {
          paramValue = [this$1.providerConfig.scopePrefix, paramValue].join(this$1.providerConfig.scopeDelimiter);
        }
      }

      keyValuePairs.push([paramName, paramValue]);
    });
  });

  return keyValuePairs.map(function (param) {
    return param.join('=')
  }).join('&')
};

var VueAuthenticate = function VueAuthenticate($http, overrideOptions) {
  var options = objectExtend({}, defaultOptions);
  options = objectExtend(options, overrideOptions);
  var storage = StorageFactory(options);

  Object.defineProperties(this, {
    $http: {
      get: function get() {
        return $http
      }
    },

    options: {
      get: function get() {
        return options
      }
    },

    storage: {
      get: function get() {
        return storage
      }
    },

    tokenName: {
      get: function get() {
        if (this.options.tokenPrefix) {
          return [this.options.tokenPrefix, this.options.tokenName].join('_')
        } else {
          return this.options.tokenName
        }
      }
    }
  });

  // Setup request interceptors
  if (this.options.bindRequestInterceptor && isFunction(this.options.bindRequestInterceptor) &&
      this.options.bindResponseInterceptor && isFunction(this.options.bindResponseInterceptor)) {

    this.options.bindRequestInterceptor.call(this, this);
    this.options.bindResponseInterceptor.call(this, this);
  } else {
    throw new Error('Both request and response interceptors must be functions')
  }
};

/**
 * Check if user is authenticated
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 * @return {Boolean}
 */
VueAuthenticate.prototype.isAuthenticated = function isAuthenticated () {
  var token = this.storage.getItem(this.tokenName);

  if (token) {// Token is present
    if (token.split('.').length === 3) {// Token with a valid JWT format XXX.YYY.ZZZ
      try { // Could be a valid JWT or an access token with the same format
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        var exp = JSON.parse(window.atob(base64)).exp;
        if (typeof exp === 'number') {// JWT with an optonal expiration claims
          return Math.round(new Date().getTime() / 1000) < exp;
        }
      } catch (e) {
        return true;// Pass: Non-JWT token that looks like JWT
      }
    }
    return true;// Pass: All other tokens
  }
  return false
};

/**
 * Get token if user is authenticated
 * @return {String} Authentication token
 */
VueAuthenticate.prototype.getToken = function getToken () {
  return this.storage.getItem(this.tokenName)
};

/**
 * Set new authentication token
 * @param {String|Object} token
 */
VueAuthenticate.prototype.setToken = function setToken (response) {
  if (response[this.options.responseDataKey]) {
    response = response[this.options.responseDataKey];
  }
    
  var token;
  if (response.access_token) {
    if (isObject(response.access_token) && isObject(response.access_token[this.options.responseDataKey])) {
      response = response.access_token;
    } else if (isString(response.access_token)) {
      token = response.access_token;
    }
  }

  if (!token && response) {
    token = response[this.options.tokenName];
  }

  if (token) {
    this.storage.setItem(this.tokenName, token);
  }
};

VueAuthenticate.prototype.getPayload = function getPayload () {
  var token = this.storage.getItem(this.tokenName);

  if (token && token.split('.').length === 3) {
    try {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(decodeBase64(base64));
    } catch (e) {}
  }
};
  
/**
 * Login user using email and password
 * @param{Object} user         User data
 * @param{Object} requestOptions Request options
 * @return {Promise}             Request promise
 */
VueAuthenticate.prototype.login = function login (user, requestOptions) {
    var this$1 = this;

  requestOptions = requestOptions || {};
  requestOptions.url = requestOptions.url ? requestOptions.url : joinUrl(this.options.baseUrl, this.options.loginUrl);
  requestOptions[this.options.requestDataKey] = user || requestOptions[this.options.requestDataKey];
  requestOptions.method = requestOptions.method || 'POST';
  requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials;

  return this.$http(requestOptions).then(function (response) {
    this$1.setToken(response);
    return response
  })
};

/**
 * Register new user
 * @param{Object} user         User data
 * @param{Object} requestOptions Request options
 * @return {Promise}             Request promise
 */
VueAuthenticate.prototype.register = function register (user, requestOptions) {
    var this$1 = this;

  requestOptions = requestOptions || {};
  requestOptions.url = requestOptions.url ? requestOptions.url : joinUrl(this.options.baseUrl, this.options.registerUrl);
  requestOptions[this.options.requestDataKey] = user || requestOptions[this.options.requestDataKey];
  requestOptions.method = requestOptions.method || 'POST';
  requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials;

  return this.$http(requestOptions).then(function (response) {
    this$1.setToken(response);
    return response
  })
};

/**
 * Logout current user
 * @param{Object} requestOptionsLogout request options object
 * @return {Promise}              Request promise
 */
VueAuthenticate.prototype.logout = function logout (requestOptions) {
    var this$1 = this;

  if (!this.isAuthenticated()) {
    return Promise$1.reject(new Error('There is no currently authenticated user'))
  }

  requestOptions = requestOptions || {};
  requestOptions.url = requestOptions.logoutUrl || this.options.logoutUrl;

  if (requestOptions.url) {
    requestOptions.method = requestOptions.method || 'POST';
    requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials;

    return this.$http(requestOptions).then(function (response) {
      this$1.storage.removeItem(this$1.tokenName);
    })
  } else {
    this.storage.removeItem(this.tokenName);
    return Promise$1.resolve();
  }
};

/**
 * Authenticate user using authentication provider
 * 
 * @param{String} provider     Provider name
 * @param{Object} userData     User data
 * @param{Object} requestOptions Request options
 * @return {Promise}             Request promise
 */
VueAuthenticate.prototype.authenticate = function authenticate (provider, userData, requestOptions) {
    var this$1 = this;

  return new Promise$1(function (resolve, reject) {
    var providerConfig = this$1.options.providers[provider];
    if (!providerConfig) {
      return reject(new Error('Unknown provider'))
    }

    var providerInstance;
    switch (providerConfig.oauthType) {
      case '1.0':
        providerInstance = new OAuth(this$1.$http, this$1.storage, providerConfig, this$1.options);
        break
      case '2.0':
        providerInstance = new OAuth2(this$1.$http, this$1.storage, providerConfig, this$1.options);
        break
      default:
        return reject(new Error('Invalid OAuth type'))
        break
    }

    return providerInstance.init(userData).then(function (response) {
      this$1.setToken(response);

      if (this$1.isAuthenticated()) {
        return resolve(response)
      } else {
        return reject(new Error('Authentication failed'))
      }
    }).catch(function () {
      reject(new Error('Authentication error occurred'));
    })
  })
};

/**
 * VueAuthenticate plugin
 * @param {Object} Vue
 * @param {Object} options
 */
function plugin(Vue, options) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true;

  var vueAuthInstance = null;
  Object.defineProperties(Vue.prototype, {
    $auth: {
      get: function get() {
        if (!vueAuthInstance) {
          // Request handler library not found, throw error
          if (!this.$http) {
            throw new Error('Request handler instance not found')
          }

          vueAuthInstance = new VueAuthenticate(this.$http, options);
        }
        return vueAuthInstance
      }
    }
  });
}

/**
 * External factory helper for ES5 and CommonJS
 * @param  {Object} $http     Instance of request handling library
 * @param  {Object} options   Configuration object
 * @return {VueAuthenticate}  VueAuthenticate instance
 */
plugin.factory = function ($http, options) {
  return new VueAuthenticate($http, options)
};

module.exports = plugin;
