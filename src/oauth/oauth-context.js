import Promise from '../promise.js'
import { objectExtend, parseQueryString, getFullUrlPath, isUndefined } from '../utils.js'

/**
 * OAuth2 popup/iframe management class
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer/blob/master/src/popup.ts
 * and adjusted to fit vue-authenticate library
 */
export default class OAuthContext {
  constructor (url, name, authContextOptions = {}) {
    this.authWindow = null
    this.url = url
    this.name = name
    this.authContextOptions = authContextOptions
  }

  open (redirectUri, skipPooling) {
    try {
      if (this.authContextOptions.iframe) {
        this.iframe = document.createElement('iframe')
        this.iframe.src = this.url
        this.iframeTarget.appendChild(this.iframe)
      } else {
        this.authWindow = window.open(this.url, this.name, this._stringifyOptions())
        if (this.authWindow && this.authWindow.focus) {
          this.authWindow.focus()
        }
      }

      if (skipPooling) {
        return Promise.resolve()
      } else {
        return this.pooling(redirectUri)
      }
    } catch (e) {
      return Promise.reject(new Error('Error occurred while opening authentication context'))
    }
  }

  get iframeTarget () {
    if (!this._iframeTarget) {
      if (this.authContextOptions.iframeTarget) {
        this._iframeTarget = this.authContextOptions.iframeTarget
      } else {
        this._iframeTarget = document.createElement('div')
        this._iframeTarget.style.display = 'none'
        document.body.appendChild(this._iframeTarget)
      }
    }

    return this._iframeTarget
  }

  pooling (redirectUri) {
    this.timedOut = false
    let authTimeout
    if (this.authContextOptions.timeout) {
      authTimeout = setTimeout(() => {
        this.timedOut = true
      }, this.authContextOptions.timeout)
    }

    return new Promise((resolve, reject) => {
      const redirectUriParser = document.createElement('a')
      redirectUriParser.href = redirectUri
      const redirectUriPath = getFullUrlPath(redirectUriParser)
  
      let poolingInterval = setInterval(() => {
        if (!this.iframe) {
          if (!this.authWindow || this.authWindow.closed || this.authWindow.closed === undefined) {
            clearInterval(poolingInterval)
            poolingInterval = null
            reject(new Error('Auth popup window closed'))
          }
        }

        try {
          const authWindow = this.authWindow || this.iframe.contentWindow
          const authWindowPath = getFullUrlPath(authWindow.location)

          if (authWindowPath === redirectUriPath) {
            if (authWindow.location.search || authWindow.location.hash) {
              const query = parseQueryString(authWindow.location.search.substring(1).replace(/\/$/, ''))
              const hash = parseQueryString(authWindow.location.hash.substring(1).replace(/[\/$]/, ''))
              let params = objectExtend({}, query)
              params = objectExtend(params, hash)

              if (params.error) {
                reject(new Error(params.error))
              } else {
                resolve(params)
              }
            } else {
              reject(new Error('OAuth redirect has occurred but no query or hash parameters were found.'))
            }
            clearTimeout(authTimeout)
            clearInterval(poolingInterval)
            poolingInterval = null
            if (this.iframe) {
              if (this.authContextOptions.iframeTarget) {
                this.iframeTarget.removeChild(this.iframe)
              } else {
                document.body.removeChild(this.iframeTarget)
              }
            } else {
              this.authWindow.close()
            }
          } else {
            if (this.timedOut) {
              clearInterval(poolingInterval)
              poolingInterval = null
              reject(new Error('auth_timeout'))
            }
          }
        } catch (e) { // DOMException: Blocked a frame with origin from accessing a cross-origin frame.
          if (this.timedOut) {
            clearInterval(poolingInterval)
            poolingInterval = null
            reject(new Error('auth_timeout'))
          }
        }
      }, 250)
    })
  }

  _stringifyOptions () {
    let options = []
    for (var optionKey in this.authContextOptions) {
      if (!isUndefined(this.authContextOptions[optionKey])) {
        options.push(`${optionKey}=${this.authContextOptions[optionKey]}`)
      }
    }
    return options.join(',')
  }
}
