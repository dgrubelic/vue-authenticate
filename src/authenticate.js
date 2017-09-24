import Promise from './promise.js'
import { objectExtend, isString, isObject, isFunction, joinUrl, decodeBase64 } from './utils.js'
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
      }
    })

    // Setup request interceptors
    if (this.options.bindRequestInterceptor && isFunction(this.options.bindRequestInterceptor) &&
        this.options.bindResponseInterceptor && isFunction(this.options.bindResponseInterceptor)) {

      this.options.bindRequestInterceptor.call(this, this)
      this.options.bindResponseInterceptor.call(this, this)
    } else {
      throw new Error('Both request and response interceptors must be functions')
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
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace('-', '+').replace('_', '/');
          const exp = JSON.parse(window.atob(base64)).exp;
          if (typeof exp === 'number') {  // JWT with an optonal expiration claims
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
   * Get token if user is authenticated
   * @return {String} Authentication token
   */
  getToken() {
    return this.storage.getItem(this.tokenName)
  }

  /**
   * Set new authentication token
   * @param {String|Object} token
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

  getPayload() {
    const token = this.storage.getItem(this.tokenName);

    if (token && token.split('.').length === 3) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(decodeBase64(base64));
      } catch (e) {}
    }
  }
  
  /**
   * Login user using email and password
   * @param  {Object} user           User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  login(user, requestOptions) {
    requestOptions = requestOptions || {}
    requestOptions.url = requestOptions.url ? requestOptions.url : joinUrl(this.options.baseUrl, this.options.loginUrl)
    requestOptions[this.options.requestDataKey] = user || requestOptions[this.options.requestDataKey]
    requestOptions.method = requestOptions.method || 'POST'
    requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials

    return this.$http(requestOptions).then((response) => {
      this.setToken(response)
      return response
    })
  }

  /**
   * Register new user
   * @param  {Object} user           User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  register(user, requestOptions) {
    requestOptions = requestOptions || {}
    requestOptions.url = requestOptions.url ? requestOptions.url : joinUrl(this.options.baseUrl, this.options.registerUrl)
    requestOptions[this.options.requestDataKey] = user || requestOptions[this.options.requestDataKey]
    requestOptions.method = requestOptions.method || 'POST'
    requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials

    return this.$http(requestOptions).then((response) => {
      this.setToken(response)
      return response
    })
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
    requestOptions.url = requestOptions.logoutUrl || this.options.logoutUrl

    if (requestOptions.url) {
      requestOptions.method = requestOptions.method || 'POST'
      requestOptions.withCredentials = requestOptions.withCredentials || this.options.withCredentials

      return this.$http(requestOptions).then((response) => {
        this.storage.removeItem(this.tokenName)
      })
    } else {
      this.storage.removeItem(this.tokenName)
      return Promise.resolve();
    }
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
      }).catch(() => {
        reject(new Error('Authentication error occurred'))
      })
    })
  }
}
