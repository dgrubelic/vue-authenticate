import {isUndefined} from './utils';

export function getCookieDomainUrl() {
  try {
    return window.location.hostname
  } catch (e) {
  }

  return '';
}

export function getRedirectUri(uri) {
  try {
    return (!isUndefined(uri))
      ? `${window.location.origin}${uri}`
      : window.location.origin
  } catch (e) {
  }

  return uri || null;
}

/**
 * Default configuration
 */
export default {
  baseUrl: null,
  tokenName: 'token',
  tokenPrefix: 'vueauth',
  tokenHeader: 'Authorization',
  tokenType: 'Bearer',
  // There are three types of refresh tokens,
  // 1. (httponly): refresh token is set via HttpOnly Cookie which is the safest method
  // 2. (storage): refresh token is safe in the local storage, which is as safe as just send a long life access_token
  // 3. (null): refresh token is not use
  refreshType: null,
  refreshTokenName: 'refresh_token',
  refreshTokenPrefix: null,
  expirationName: 'expiration',
  expirationPrefix: null,
  loginUrl: '/auth/login',
  registerUrl: '/auth/register',
  logoutUrl: null,
  refreshUrl: '/auth/login/refresh',
  storageType: 'localStorage',
  storageNamespace: 'vue-authenticate',
  cookieStorage: {
    domain: getCookieDomainUrl(),
    path: '/',
    secure: false
  },
  requestDataKey: 'data',
  responseDataKey: 'data',

  /**
   * Default request interceptor for Axios library
   * @context {VueAuthenticate}
   */
  bindRequestInterceptor: function ($auth) {
    const tokenHeader = $auth.options.tokenHeader;

    $auth.$http.interceptors.request.use((request) => {
      if ($auth.isAuthenticated()) {
        request.headers[tokenHeader] = [
          $auth.options.tokenType, $auth.getToken()
        ].join(' ')
      } else {
        delete request.headers[tokenHeader]
      }
      return request
    })
  },

  bindResponseInterceptor: function ($auth) {
    $auth.$http.interceptors.response.use((response) => {
      return response
    }, (error) => {
      const {config, response: {status}} = error
      const originalRequest = config

      // Check if we should refresh the token
      // 1. unauthorized
      // 2. refreshType is set
      // 3. any token is set
      if (status === 401 && $auth.options.refreshType && $auth.isTokenSet()) {

        // check if we are already refreshing, to prevent endless loop
        if (!$auth._isRefreshing) {
          $auth._isRefreshing = true
          // Try to refresh our token
          return $auth.refresh()
            .then(response => {
              // refreshing was successful :)
              $auth._isRefreshing = false
              // send original request
              return $auth.$http(originalRequest)
            })
            .catch(error => {
              // Refreshing fails :(
              $auth._isRefreshing = false
              return Promise.reject(error)
            })
        }
      }
      return Promise.reject(error)
    });
  },

  providers: {
    facebook: {
      name: 'facebook',
      url: '/auth/facebook',
      authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
      redirectUri: getRedirectUri('/'),
      requiredUrlParams: ['display', 'scope'],
      scope: ['email'],
      scopeDelimiter: ',',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: {width: 580, height: 400}
    },

    google: {
      name: 'google',
      url: '/auth/google',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display'],
      scope: ['profile', 'email'],
      scopePrefix: 'openid',
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: {width: 452, height: 633}
    },

    github: {
      name: 'github',
      url: '/auth/github',
      authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      redirectUri: getRedirectUri(),
      optionalUrlParams: ['scope'],
      scope: ['user:email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: {width: 1020, height: 618}
    },

    instagram: {
      name: 'instagram',
      url: '/auth/instagram',
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['scope'],
      scope: ['basic'],
      scopeDelimiter: '+',
      oauthType: '2.0',
      popupOptions: {width: null, height: null}
    },

    twitter: {
      name: 'twitter',
      url: '/auth/twitter',
      authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
      redirectUri: getRedirectUri(),
      oauthType: '1.0',
      popupOptions: {width: 495, height: 645}
    },

    bitbucket: {
      name: 'bitbucket',
      url: '/auth/bitbucket',
      authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
      redirectUri: getRedirectUri('/'),
      optionalUrlParams: ['scope'],
      scope: ['email'],
      scopeDelimiter: ' ',
      oauthType: '2.0',
      popupOptions: {width: 1020, height: 618}
    },

    linkedin: {
      name: 'linkedin',
      url: '/auth/linkedin',
      authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['state'],
      scope: ['r_emailaddress'],
      scopeDelimiter: ' ',
      state: 'STATE',
      oauthType: '2.0',
      popupOptions: {width: 527, height: 582}
    },

    live: {
      name: 'live',
      url: '/auth/live',
      authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
      redirectUri: getRedirectUri(),
      requiredUrlParams: ['display', 'scope'],
      scope: ['wl.emails'],
      scopeDelimiter: ' ',
      display: 'popup',
      oauthType: '2.0',
      popupOptions: {width: 500, height: 560}
    },

    oauth1: {
      name: null,
      url: '/auth/oauth1',
      authorizationEndpoint: null,
      redirectUri: getRedirectUri(),
      oauthType: '1.0',
      popupOptions: null
    },

    oauth2: {
      name: null,
      url: '/auth/oauth2',
      clientId: null,
      redirectUri: getRedirectUri(),
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
}
