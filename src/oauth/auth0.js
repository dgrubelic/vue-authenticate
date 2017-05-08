import Promise from '../promise.js'
import { objectExtend } from '../utils.js'

const defaultProviderConfig = {
  name: null,
  oauthType: 'auth0',
  autoclose: true,
  auth: {
    redirect: false,
    responseType: 'token'
  }
}

export default class Auth0 {
  constructor(providerConfig, options) {
    this.providerConfig = objectExtend({}, defaultProviderConfig)
    this.providerConfig = objectExtend(this.providerConfig, providerConfig)
    this.options = options

    let lockOptions = objectExtend({}, this.providerConfig)
    delete lockOptions.clientId
    delete lockOptions.domain
    delete lockOptions.name
    delete lockOptions.oauthType

    this.auth0Lock = new window.Auth0Lock(this.providerConfig.clientId, this.providerConfig.domain, lockOptions)
  }

  init() {
    return new Promise((resolve, reject) => {
      let onAuthenticated = (response) => {
        let authResponse = {}
        authResponse[this.options.responseDataKey] = response
        resolve(authResponse)
      }

      let onAuthorizationError = (err) => {
        reject(err)
      }

      this.auth0Lock.on('authenticated', onAuthenticated)
      this.auth0Lock.on('authorization_error', onAuthorizationError)

      // Initialize Auth0
      this.auth0Lock.show()
    })
  } 
}