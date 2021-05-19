import { $window } from './globals';
import {
  objectExtend,
  joinUrl,
  decodeBase64,
  getObjectProperty,
} from './utils';
import defaultOptions, { AuthConfig, ProviderConfig } from './options';
import StorageFactory from './storage';
import { IStorage } from './storage/types';
import OAuth1 from './oauth/oauth1';
import OAuth2 from './oauth/oauth2';
import { AuthHttp, AuthRequestOptions, AuthResponse } from './network/types';

export default class VueAuthenticate {
  $http: AuthHttp;
  options: AuthConfig = {} as AuthConfig;
  storage: IStorage = {} as IStorage;
  tokenName: string = '';

  constructor($http: AuthHttp, overrideOptions: AuthConfig) {
    this.$http = $http;

    let options = objectExtend({}, defaultOptions);
    options = objectExtend(options, overrideOptions);
    this.options = options;

    let storage = StorageFactory(options);
    this.storage = storage;

    Object.defineProperties(this, {
      $http: {
        get() {
          return $http;
        },
      },

      options: {
        get() {
          return options;
        },
      },

      storage: {
        get() {
          return storage;
        },
      },

      tokenName: {
        get() {
          if (this.options.tokenPrefix) {
            return [this.options.tokenPrefix, this.options.tokenName].join('_');
          } else {
            return this.options.tokenName;
          }
        },
      },
    });
  }

  /**
   * Check if user is authenticated
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   * @return {Boolean}
   */
  isAuthenticated(): boolean {
    let token = this.storage.getItem(this.tokenName);

    if (token) {
      // Token is present
      if (token.split('.').length === 3) {
        // Token with a valid JWT format XXX.YYY.ZZZ
        try {
          // Could be a valid JWT or an access token with the same format
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace('-', '+').replace('_', '/');
          const exp = JSON.parse($window.atob(base64)).exp;
          if (typeof exp === 'number') {
            // JWT with an optonal expiration claims
            return Math.round(new Date().getTime() / 1000) < exp;
          }
        } catch (e) {
          return true; // Pass: Non-JWT token that looks like JWT
        }
      }
      return true; // Pass: All other tokens
    }
    return false;
  }

  /**
   * Get token if user is authenticated
   * @return {String} Authentication token
   */
  getToken() {
    return this.storage.getItem(this.tokenName);
  }

  /**
   * Set new authentication token
   * @param {String|Object} token
   */
  async setToken(response: AuthResponse, tokenPath?: string): Promise<void> {
    const responseData = await response.json();

    const responseTokenPath = tokenPath || this.options.tokenPath;
    const token = getObjectProperty(responseData, responseTokenPath);

    if (token) {
      this.storage.setItem(this.tokenName, token);
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
  async login(data: any, options?: AuthRequestOptions): Promise<AuthResponse> {
    const { url, ...restOptions } = options || {};

    const requestOptions = {
      method: options && options.method || 'POST',
      body: JSON.stringify(data),
      credentials: options && options.credentials,
      ...restOptions,
    };

    const requestUrl = url
      ? url
      : joinUrl(this.options.baseUrl || '', this.options.loginUrl);

    const response: AuthResponse = await  this.$http(requestUrl, requestOptions);
    await this.setToken(response);
    return response;
  }

  /**
   * Register new user
   * @param  {Object} user           User data
   * @param  {Object} requestOptions Request options
   * @return {Promise}               Request promise
   */
  async register(data: any, options: AuthRequestOptions): Promise<AuthResponse> {
    const { url, ...restOptions } = options || {};

    const requestOptions = {
      method: options && options.method || 'POST',
      body: JSON.stringify(data),
      credentials: options && options.credentials,
      ...restOptions,
    };
    
    const requestUrl = url
      ? url
      : joinUrl(this.options.baseUrl || '', this.options.registerUrl);

    const response = await this.$http(requestUrl, requestOptions);
    await this.setToken(response);
    return response;
  }

  /**
   * Logout current user
   * @param  {Object} requestOptions  Logout request options object
   * @return {Promise}                Request promise
   */
  async logout(options: AuthRequestOptions): Promise<AuthResponse | boolean> {
    if (!this.isAuthenticated()) {
      return Promise.reject(
        new Error('There is no currently authenticated user')
      );
    }

    const { url, ...restOptions } = options || {};

    const requestOptions = {
      method: options && options.method || 'POST',
      credentials: options && options.credentials,
      ...restOptions,
    };
    
    const requestUrl = url
      ? url
      : joinUrl(this.options.baseUrl || '', this.options.registerUrl);

    if (requestUrl || this.options.logoutUrl) {
      const response = await this.$http(requestUrl, requestOptions);
      this.storage.removeItem(this.tokenName);
      return response;
    } else {
      this.storage.removeItem(this.tokenName);
      return true;
    }
  }

  /**
   * Authenticate user using authentication provider
   *
   * @param  {String} provider       Provider name
   * @param  {Object} userData       User data
   * @return {Promise}               Request promise
   */
  async authenticate(provider: string, data: any): Promise<AuthResponse> {
    let providerInstance;
    var providerConfig: ProviderConfig = this.options.providers[provider];

    if (!providerConfig) {
      throw new Error('Unknown provider');
    }

    switch (providerConfig.oauthType) {
      case '1.0':
        providerInstance = new OAuth1(
          this.$http,
          this.storage,
          providerConfig,
          this.options
        );
        break;
      case '2.0':
        providerInstance = new OAuth2(
          this.$http,
          this.storage,
          providerConfig,
          this.options
        );
        break;
      default:
        new Error('Invalid OAuth type')
    }

    if (!providerInstance) {
      throw new Error('Unknown provider');
    }

    return providerInstance
      .init(data)
      .then((response: AuthResponse) => {
        this.setToken(response, providerConfig.tokenPath);
        return response;
      });
  }

  /**
   * Link user using authentication provider without login
   *
   * @param  {String} provider       Provider name
   * @param  {Object} userData       User data
   * @return {Promise}               Request promise
   */
  async link(provider: string, data: any): Promise<AuthResponse> {
    let providerInstance;
    const providerConfig = this.options.providers[provider];

    if (!providerConfig) {
      throw new Error('Unknown provider')
    }

    switch (providerConfig.oauthType) {
      case '1.0':
        providerInstance = new OAuth1(
          this.$http,
          this.storage,
          providerConfig,
          this.options
        );
        break;
      case '2.0':
        providerInstance = new OAuth2(
          this.$http,
          this.storage,
          providerConfig,
          this.options
        );
        break;
      default:
        new Error('Invalid OAuth type');
    }

    if (!providerInstance) {
      throw new Error('Unknown provider')
    }

    return providerInstance
      .init(data)
      .then((response) => {
        return response as AuthResponse;
      });
  }
}
