import { isUndefined } from './utils';
import { $window } from './globals';

export function getCookieDomainUrl(): string {
  try {
    return $window?.location?.hostname;
  } catch (e) {}

  return '';
}

export function getRedirectUri(uri?: string): string | null {
  try {
    return !isUndefined(uri)
      ? `${$window.location.origin}${uri}`
      : $window.location.origin;
  } catch (e) {}

  return uri || null;
}

export type ProviderConfig = {
  name: string;
  url: string;
  clientId: string;
  authorizationEndpoint: string;
  redirectUri: string;
  requiredUrlParams?: string[];
  optionalUrlParams?: string[];
  scope?: string[];
  tokenPath: string;
  scopeDelimiter?: string;
  oauthType: '1.0' | '2.0';
  state?: string;
  popupOptions?: Record<string, any>;
  responseType?: string;
  responseParams?: {
    code: string;
    clientId: string;
    redirectUri: string;
  };
}

export type AuthConfig = {
  baseUrl?: string;
  tokenPath: string;
  tokenName: string;
  tokenPrefix: string;
  tokenHeader: string;
  tokenType: string;
  loginUrl: string;
  registerUrl: string;
  logoutUrl: string;
  requestDataKey: string;
  responseDataKey: string;
  storageType: string;
  storageNamespace: string;
  cookieStorage: {
    domain?: string;
    path?: string;
    secure?: boolean;
  },
  providers: { [providerName: string]: ProviderConfig },
  credentials?: RequestCredentials;
}

/**
 * Default configuration
 */
export default {
  baseUrl: '',
  tokenPath: 'access_token',
  tokenName: 'token',
  tokenPrefix: 'vueauth',
  tokenHeader: 'Authorization',
  tokenType: 'Bearer',
  loginUrl: '/auth/login',
  registerUrl: '/auth/register',
  logoutUrl: undefined,
  storageType: 'localStorage',
  storageNamespace: 'vue-authenticate',
  cookieStorage: {
    domain: getCookieDomainUrl(),
    path: '/',
    secure: false,
  },

  providers: {
    facebook: {
      name: 'facebook',
      url: '/auth/facebook',
      clientId: '',
      authorizationEndpoint: 'https://www.facebook.com/v10.0/dialog/oauth',
      redirectUri: getRedirectUri('/'),
      requiredUrlParams: ['display', 'scope'],
      tokenPath: 'access_token',
      scope: ['email'],
      scopeDelimiter: ',',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 580, height: 400 },
      tokenPath: 'access_token',
    },

    google: {
      name: 'google',
      url: '/auth/google',
      clientId: '',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      scope: ['profile', 'email'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 452, height: 633 },
      tokenPath: 'access_token',
    },

    github: {
      name: 'github',
      url: '/auth/github',
      clientId: '',
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      redirectUri: getRedirectUri(),
      optionalUrlParams: ['scope'],
      scope: ['user:email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: { width: 1020, height: 618 },
      tokenPath: 'access_token',
    },

    instagram: {
      name: 'instagram',
      url: '/auth/instagram',
      clientId: '',
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['scope'],
      scope: ['basic'],
      scopeDelimiter: '+',
      oauthType: '2.0',
      popupOptions: { width: null, height: null },
      tokenPath: 'access_token',
    },

    twitter: {
      name: 'twitter',
      url: '/auth/twitter',
      clientId: '',
      authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
      redirectUri: getRedirectUri(),
      oauthType: '1.0',
      popupOptions: { width: 495, height: 645 },
      tokenPath: 'access_token',
    },

    bitbucket: {
      name: 'bitbucket',
      url: '/auth/bitbucket',
      clientId: '',
      authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
      redirectUri: getRedirectUri('/'),
      optionalUrlParams: ['scope'],
      scope: ['email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: { width: 1020, height: 618 },
      tokenPath: 'access_token',
    },

    linkedin: {
      name: 'linkedin',
      url: '/auth/linkedin',
      clientId: '',
      authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['state'],
      scope: ['r_emailaddress'],
      scopeDelimiter: ' ',
      state: 'STATE',
      oauthType: '2.0',
      popupOptions: { width: 527, height: 582 },
      tokenPath: 'access_token',
    },

    live: {
      name: 'live',
      url: '/auth/live',
      clientId: '',
      authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['display', 'scope'],
      scope: ['wl.emails'],
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: { width: 500, height: 560 },
      tokenPath: 'access_token',
    },

    oauth1: {
      name: 'oauth1',
      url: '/auth/oauth1',
      clientId: '',
      authorizationEndpoint: '',
      redirectUri: getRedirectUri(),
      oauthType: '1.0',
      popupOptions: {},
      tokenPath: 'access_token',
    },

    oauth2: {
      name: 'oauth2',
      url: '/auth/oauth2',
      clientId: '',
      redirectUri: getRedirectUri(),
      authorizationEndpoint: '',
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      requiredUrlParams: undefined,
      optionalUrlParams: undefined,
      scope: undefined,
      scopePrefix: undefined,
      scopeDelimiter: undefined,
      state: undefined,
      oauthType: '2.0',
      popupOptions: undefined,
      responseType: 'code',
      responseParams: {
        code: 'code',
        clientId: 'clientId',
        redirectUri: 'redirectUri',
      },
      tokenPath: 'access_token',
    },
  },
} as Partial<AuthConfig>;
