import Promise from '../promise.js'
import { objectExtend, parseQueryString, getFullUrlPath } from '../utils.js'

/**
 * OAuth2 popup management class
 * 
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer 
 * and adjusted to fit vue-authenticate library
 */
export default class OAuthPopup {
  constructor(url, name, popupOptions) {
    this.popup = null
    this.url = url
    this.name = name
    this.popupOptions = popupOptions
  }

  open(redirectUri, skipPooling) {
    try {
      this.popup = window.open(this.url, this.name, this._stringifyOptions())
      if (this.popup && this.popup.focus) {
        this.popup.focus()
      }

      if (skipPooling) {
        return Promise.resolve()
      } else {
        return this.pooling(redirectUri)
      }
    } catch(e) {
      return Promise.reject(new Error('OAuth popup error occurred'))
    }
  }

  pooling(redirectUri) {
    return new Promise((resolve, reject) => {
      const redirectUriParser = document.createElement('a')
      redirectUriParser.href = redirectUri
      const redirectUriPath = getFullUrlPath(redirectUriParser)

      let poolingInterval = setInterval(() => {
        if (!this.popup || this.popup.closed || this.popup.closed === undefined) {
          clearInterval(poolingInterval)
          poolingInterval = null
          reject(new Error('Auth popup window closed'))
        }

        try {
          const popupWindowPath = getFullUrlPath(this.popup.location)

          if (popupWindowPath === redirectUriPath) {
            if (this.popup.location.search || this.popup.location.hash) {
              const query = parseQueryString(this.popup.location.search.substring(1).replace(/\/$/, ''));
              const hash = parseQueryString(this.popup.location.hash.substring(1).replace(/[\/$]/, ''));
              let params = objectExtend({}, query);
              params = objectExtend(params, hash)

              if (params.error) {
                reject(new Error(params.error));
              } else {
                resolve(params);
              }
            } else {
              reject(new Error('OAuth redirect has occurred but no query or hash parameters were found.'))
            }

            clearInterval(poolingInterval)
            poolingInterval = null
            this.popup.close()
          }
        } catch(e) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        }
      }, 250)
    })
  }

  _stringifyOptions() {
    let options = []
    for (var optionKey in this.popupOptions) {
      options.push(`${optionKey}=${this.popupOptions[optionKey]}`)
    }
    return options.join(',')
  }
}