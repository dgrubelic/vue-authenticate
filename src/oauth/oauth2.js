import OAuthPopup from './popup.js'
import { camelCase, isFunction, isString, objectExtend, joinUrl } from '../utils.js'

/**
 * Default provider configuration
 * @type {Object}
 */
const defaultProviderConfig = {
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
}

export default class OAuth2 {
  constructor($http, storage, providerConfig, options) {
    this.$http = $http
    this.storage = storage
    this.providerConfig = objectExtend({}, defaultProviderConfig)
    this.providerConfig = objectExtend(this.providerConfig, providerConfig)
    this.options = options
  }

  init(userData) {
    let stateName = this.providerConfig.name + '_state';
    if (isFunction(this.providerConfig.state)) {
      this.storage.setItem(stateName, this.providerConfig.state())
    } else if (isString(this.providerConfig.state)) {
      this.storage.setItem(stateName, this.providerConfig.state)
    }

    let url = [this.providerConfig.authorizationEndpoint, this._stringifyRequestParams()].join('?')

    this.oauthPopup = new OAuthPopup(url, this.providerConfig.name, this.providerConfig.popupOptions)
    
    return new Promise((resolve, reject) => {
      this.oauthPopup.open(this.providerConfig.redirectUri).then((response) => {
        if (this.providerConfig.responseType === 'token' || !this.providerConfig.url) {
          return resolve(response)
        }

        if (response.state && response.state !== this.storage.getItem(stateName)) {
          return reject(new Error('State parameter value does not match original OAuth request state value'))
        }

        resolve(this.exchangeForToken(response, userData))
      }).catch((err) => {
        reject(err)
      })
    })
  }

  /**
   * Exchange temporary oauth data for access token
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   * 
   * @param  {[type]} oauth    [description]
   * @param  {[type]} userData [description]
   * @return {[type]}          [description]
   */
  exchangeForToken(oauth, userData) {
    let payload = objectExtend({}, userData)

    for (let key in defaultProviderConfig.responseParams) {
      let value = defaultProviderConfig[key]

      switch(key) {
        case 'code':
          payload[key] = oauth.code
          break
        case 'clientId':
          payload[key] = this.providerConfig.clientId
          break
        case 'redirectUri':
          payload[key] = this.providerConfig.redirectUri
          break
        default:
          payload[key] = oauth[key]
      }
    }

    if (oauth.state) {
      payload.state = oauth.state
    }

    let exchangeTokenUrl
    if (this.options.baseUrl) {
      exchangeTokenUrl = joinUrl(this.options.baseUrl, this.providerConfig.url)
    } else {
      exchangeTokenUrl = this.providerConfig.url
    }

    return this.$http.post(exchangeTokenUrl, payload, {
      withCredentials: this.options.withCredentials
    })
  }

  /**
   * Stringify oauth params
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   * 
   * @return {String}
   */
  _stringifyRequestParams() {
    let keyValuePairs = []
    let paramCategories = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams']

    paramCategories.forEach((categoryName) => {
      if (!this.providerConfig[categoryName]) return
      if (!Array.isArray(this.providerConfig[categoryName])) return

      this.providerConfig[categoryName].forEach((paramName) => {
        let camelCaseParamName = camelCase(paramName)
        let paramValue = isFunction(this.providerConfig[paramName]) ? this.providerConfig[paramName]() : this.providerConfig[camelCaseParamName]

        if (paramName === 'redirect_uri' && !paramValue) return

        if (paramName === 'state') {
          let stateName = this.providerConfig.name + '_state';
          paramValue = encodeURIComponent(this.storage.getItem(stateName));
        }
        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(this.providerConfig.scopeDelimiter);
          if (this.providerConfig.scopePrefix) {
            paramValue = [this.providerConfig.scopePrefix, paramValue].join(this.providerConfig.scopeDelimiter);
          }
        }

        keyValuePairs.push([paramName, paramValue])
      })
    })

    return keyValuePairs.map((param) => {
      return param.join('=')
    }).join('&')
  }
}