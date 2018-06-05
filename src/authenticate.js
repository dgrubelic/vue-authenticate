import Promise from './promise.js'
import {
  objectExtend,
  isString,
  isObject,
  isFunction,
  joinUrl,
  decodeBase64,
  makeRequestOptions,
  isUndefined,
  parseJWT
} from './utils.js'
import defaultOptions from './options.js'
import StorageFactory from './storage.js'
import OAuth1 from './oauth/oauth1.js'
import OAuth2 from './oauth/oauth2.js'

export default class VueAuthenticate {
  constructor($http, overrideOptions) {
    let options = objectExtend({}, defaultOptions)
    options = objectExtend(options, overrideOptions)
    let storage = StorageFactory(options)

    Object.defineProperties(this, {
      $http: {
        get() {
          return $http
        }
      },

      options: {
        get() {
          return options
        }
      },

      storage: {
        get() {
          return storage
        }
      },

      tokenName: {
        get() {
          if (this.options.tokenPrefix) {
            return [this.options.tokenPrefix, this.options.tokenName].join('_')
          } else {
            return this.options.tokenName
          }
        }
      },

      refreshTokenName: {
        get() {
          if (this.options.refreshTokenPrefix) {
            return [this.options.refreshTokenPrefix, this.options.refreshTokenName].join('_')
          } else {
            return this.options.refreshTokenName
          }
        }
      },

      expirationName: {
        get() {
          if (this.options.expirationPrefix) {
            return [this.options.expirationPrefix, this.options.expirationName].join('_')
          } else {
            return this.options.expirationName
          }
        }
      }
    })

    // Setup request interceptors
    if (this.options.bindRequestInterceptor && isFunction(this.options.bindRequestInterceptor)) {
      this.options.bindRequestInterceptor.call(this, this)
    } else {
      throw new Error('Request interceptor must be functions')
    }

    // Setup response interceptors
    if (this.options.bindResponseInterceptor && isFunction(this.options.bindResponseInterceptor)) {
      this.options.bindResponseInterceptor.call(this, this)
    } else {
      throw new Error('Response interceptor must be functions')
    }
  }

  /**
   * Check if user is authenticated
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   * @return {Boolean}
   */
  isAuthenticated() {
    let token = this.storage.getItem(this.tokenName)

    if (token) {  // Token is present
      if (token.split('.').length === 3) {  // Token with a valid JWT format XXX.YYY.ZZZ
        try { // Could be a valid JWT or an access token with the same format
          const exp = parseJWT(token).exp;
          if (typeof exp === 'number') {  // JWT with an optional expiration claims
            return Math.round(new Date().getTime() / 1000) < exp;
          }
        } catch (e) {
          return true;  // Pass: Non-JWT token that looks like JWT
        }
      }
      return true;  // Pass: All other tokens
    }
    return false
  }

  /**
   * Returns if a token is set
   * @returns {boolean}
   */
  isTokenSet() {
    if (isUndefined(this.getToken())) return false;
    return !!this.getToken()
  }

  /**
   * Get token if user is authenticated
   * @return {String} Authentication token
   */
  getToken() {
    return this.storage.getItem(this.tokenName)
  }

  /**
   * Set new authentication token
   * @param {String|Object} response
   */
  setToken(response) {
    if (response[this.options.responseDataKey]) {
      response = response[this.options.responseDataKey];
    }

    let token;
    if (response.access_token) {
      if (isObject(response.access_token) && isObject(response.access_token[this.options.responseDataKey])) {
        response = response.access_token
      } else if (isString(response.access_token)) {
        token = response.access_token
      }
    }

    if (!token && response) {
      token = response[this.options.tokenName]
    }

    if (token) {
      this.storage.setItem(this.tokenName, token)
    }
  }

  /**
   * Get refresh token
   * @returns {String|null} refresh token
   */
  getRefreshToken() {
    if (this.options.refreshType === 'storage')
      return this.storage.getItem(this.refreshTokenName)

    return null;
  }

  /**
   * Get expiration of the access token
   * @returns {number|null} expiration
   */
  getExpiration() {
    if (this.options.refreshType)
      return this.storage.getItem(this.expirationName)
    return null;
  }

  /**
   * Set new refresh token
   * @param {String|Object} response
   * @returns {String|Object} response
   */
  setRefreshToken(response) {
    // Check if refresh token is required
    if (!this.options.refreshType) {
      return;
    }

    if (response[this.options.responseDataKey]) {
      response = response[this.options.responseDataKey];
    }

    this.setExpiration(response)
    // set refresh token if it's not provided over a HttpOnly cookie
    if (!(this.options.refreshType === 'storage')) {
      return response;
    }

    let refresh_token;
    if (response.refresh_token) {
      refresh_token = response.refresh_token;
    }

    if (!refresh_token && response) {
      refresh_token = response[this.options.expirationName]
    }

    if (refresh_token) {
      this.storage.setItem(this.refreshTokenName, refresh_token)
    }

    return response
  }

  /**
   * Sets the expiration of the access token
   * @param {String|Object} response
   * @returns {String|Object} response
   */
  setExpiration(response) {
    // set expiration of access token
    let expiration;
    if (response.expires_in) {
      let expires_in = parseInt(response.expires_in)
      if (isNaN(expires_in)) expires_in = 0
      expiration = Math.round(new Date().getTime() / 1000) + expires_in
    }

    if (!expiration && response) {
      let expires_in = parseInt(response[this.options.expirationName])
      if (isNaN(expires_in)) expires_in = 0
      expiration = Math.round(new Date().getTime() / 1000) + expires_in
    }

    if (expiration) {
      this.storage.setItem(this.expirationName, expiration)
    }

    return response
  }


  getPayload() {
    const token = this.storage.getItem(this.tokenName);

    if (token && token.split('.').length === 3) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(decodeBase64(base64));
      } catch (e) {
      }
    }
  }

  /**
   * Login user using email and password
   * @param  {Object} user           User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  login(user, requestOptions) {
    requestOptions = makeRequestOptions(requestOptions, this.options, 'loginUrl', user);

    return this.$http(requestOptions)
      .then(response => {
        this.setToken(response)
        this.setRefreshToken(response)
        // Check if we are authenticated
        if(this.isAuthenticated()){
          return Promise.resolve(response);
        }
        throw new Error('Server did not provided an access token.');
      })
      .catch(error => {
        return Promise.reject(error)
      })
  }

  /**
   * Register new user
   * @param  {Object} user           User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  register(user, requestOptions) {
    requestOptions = makeRequestOptions(requestOptions, this.options, 'registerUrl', user)

    return this.$http(requestOptions)
      .then((response) => {
        this.setToken(response)
        this.setRefreshToken(response)
        return response
      })
      .catch(err => err)
  }

  /**
   * Logout current user
   * @param  {Object} requestOptions  Logout request options object
   * @return {Promise}                Request promise
   */
  logout(requestOptions) {
    if (!this.isAuthenticated()) {
      return Promise.reject(new Error('There is no currently authenticated user'))
    }

    requestOptions = requestOptions || {}

    if (requestOptions.url) {
      requestOptions.url = requestOptions.url ? requestOptions.url : joinUrl(this.options.baseUrl, this.options.logoutUrl)
      requestOptions.method = requestOptions.method || 'POST'
      requestOptions[this.options.requestDataKey] = requestOptions[this.options.requestDataKey] || undefined
      requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials

      return this.$http(requestOptions)
        .then((response) => {
          this.clearStorage();
          return response
        })
        .catch(err => err)
    } else {
      this.clearStorage()
      return Promise.resolve();
    }
  }

  /**
   * Refresh access token
   * @param requestOptions  Request options
   * @returns {Promise}     Request Promise
   */
  refresh(requestOptions) {
    if (!this.options.storageType)
      return new Error('Refreshing is not set')

    let data = {}

    if (this.options.refreshType === 'storage')
      data.refresh_token = this.getRefreshToken()

    requestOptions = makeRequestOptions(requestOptions, this.options, 'refreshUrl', data)
    return this.$http(requestOptions)
      .then((response) => {
        this.setToken(response)
        this.setRefreshToken(response)
        return Promise.resolve(response)
      })
      .catch((error) => {
        this.clearStorage()
        return Promise.reject(error);
      })

  }

  /**
   * Remove all item from the storage
   */
  clearStorage() {
    this.storage.removeItem(this.tokenName)
    this.storage.removeItem(this.expirationName)
    this.storage.removeItem(this.refreshTokenName)
  }

  /**
   * Authenticate user using authentication provider
   *
   * @param  {String} provider       Provider name
   * @param  {Object} userData       User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  authenticate(provider, userData, requestOptions) {
    return new Promise((resolve, reject) => {
      var providerConfig = this.options.providers[provider]
      if (!providerConfig) {
        return reject(new Error('Unknown provider'))
      }

      let providerInstance;
      switch (providerConfig.oauthType) {
        case '1.0':
          providerInstance = new OAuth1(this.$http, this.storage, providerConfig, this.options)
          break
        case '2.0':
          providerInstance = new OAuth2(this.$http, this.storage, providerConfig, this.options)
          break
        default:
          return reject(new Error('Invalid OAuth type'))
          break
      }

      return providerInstance.init(userData).then((response) => {
        this.setToken(response)

        if (this.isAuthenticated()) {
          return resolve(response)
        } else {
          return reject(new Error('Authentication failed'))
        }
      }).catch(err => reject(err))
    })
  }
}
