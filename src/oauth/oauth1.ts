import OAuthPopup from './popup';
import { VueAuthenticationError } from '../errors';
import { $window } from '../globals';
import {
  objectExtend,
  joinUrl,
} from '../utils';
import { IStorage } from '../storage/types';
import { AuthConfig, ProviderConfig } from '../options';
import { AuthHttp, AuthResponse } from '../network/types';

const defaultProviderConfig = {
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
  popupOptions: {},
};

export default class OAuth {
  $http: AuthHttp;
  oauthPopup?: OAuthPopup;
  options: AuthConfig;
  providerConfig: ProviderConfig;
  storage: IStorage;

  constructor($http: AuthHttp, storage: IStorage, providerConfig: ProviderConfig, options: AuthConfig) {
    this.$http = $http;
    this.storage = storage;
    this.providerConfig = objectExtend({}, defaultProviderConfig);
    this.providerConfig = objectExtend(this.providerConfig, providerConfig);
    this.options = options;
  }

  /**
   * Initialize OAuth1 process
   * @param  {Object} userData User data
   * @return {Promise}
   */
  async init(data: Record<string, any>): Promise<AuthResponse> {
    this.oauthPopup = new OAuthPopup(
      'about:blank',
      this.providerConfig.name,
      this.providerConfig.popupOptions
    );

    if (!$window['cordova']) {
      this.oauthPopup.open(this.providerConfig.redirectUri, true);
    }

    const tokenResponse = await this.getRequestToken();
    const popupResponse: Record<string, unknown> = await this.openPopup(tokenResponse);
    return this.exchangeForToken(popupResponse, data);

    .then(response => {
      return this.openPopup(response).then((popupResponse: AuthResponse) => {
        return this.exchangeForToken(popupResponse, data);
      });
    });
  }

  /**
   * Get OAuth1 request token
   * @return {Promise}
   */
  async getRequestToken(): Promise<AuthResponse> {
    const requestUrl = this.options.baseUrl ? joinUrl(
        this.options.baseUrl,
        this.providerConfig.url
      ) : this.providerConfig.url;

    const requestOptions = {
      method: 'POST',
      credentials: this.options.credentials,
    };

    return this.$http(requestUrl, requestOptions);
  }

  /**
   * Open OAuth1 popup
   * @param  {Object} response Response object containing request token
   * @return {Promise}
   */
  openPopup(response: AuthResponse): Response {
    const url = [
      this.providerConfig.authorizationEndpoint,
      this.buildQueryString(response[this.options.responseDataKey]),
    ].join('?');

    if (!this.oauthPopup) {
      throw new Error(VueAuthenticationError.INVALID_POPUP_INSTANCE);
    }

    this.oauthPopup.popup.location = url;
    if ($window['cordova']) {
      return this.oauthPopup.open(this.providerConfig.redirectUri);
    } else {
      return this.oauthPopup.pooling(this.providerConfig.redirectUri);
    }
  }

  /**
   * Exchange token and token verifier for access token
   * @param  {Object} oauth    OAuth data containing token and token verifier
   * @param  {Object} userData User data
   * @return {Promise}
   */
  async exchangeForToken(oauthData: Record<string, any>, data: Record<string, any>): Promise<AuthResponse> {
    let payload = objectExtend({}, data);
    payload = objectExtend(payload, oauthData);

    const requestUrl = this.options.baseUrl ? joinUrl(
        this.options.baseUrl,
        this.providerConfig.url
      ) : this.providerConfig.url;

    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload),
      credentials: this.options.credentials,
    };

    return this.$http(requestUrl, requestOptions);
  }

  buildQueryString(params: Record<string, any>) {
    const parsedParams = [];
    for (var key in params) {
      let value = params[key];
      parsedParams.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(value)
      );
    }
    return parsedParams.join('&');
  }
}
