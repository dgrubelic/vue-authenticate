import { $document, $window } from '../globals.js';
import {
  objectExtend,
  parseQueryString,
  getFullUrlPath,
  isUndefined
} from '../utils.js';

/**
 * OAuth2 popup management class
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer
 * and adjusted to fit vue-authenticate library
 */
export default class OAuthPopup {
  constructor (url, name, popupOptions) {
    this.popup = null;
    this.url = url;
    this.name = name;
    this.popupOptions = popupOptions;
  }

  async open (redirectUri, skipPooling) {
    try {
      this.popup = $window.open(this.url, this.name, this._stringifyOptions());
      if (this.popup && this.popup.focus) {
        this.popup.focus();
      }

      if (!skipPooling) {
        return this.pooling(redirectUri);
      }
    } catch (error) {
      throw new Error('OAuth popup error occurred');
    }
  }

  async pooling (redirectUri) {
    // promise needed here to be able to return result of popup window,
    // from interval
    return new Promise((resolve, reject) => {
      const redirectUriParser = $document.createElement('a');
      redirectUriParser.href = redirectUri;
      const redirectUriPath = getFullUrlPath(redirectUriParser);

      let poolingInterval = setInterval(() => {
        if (
          !this.popup ||
          this.popup.closed ||
          this.popup.closed === undefined
        ) {
          clearInterval(poolingInterval);
          poolingInterval = null;
          throw new Error('Auth popup window closed');
        }

        try {
          const popupWindowPath = getFullUrlPath(this.popup.location);

          if (popupWindowPath === redirectUriPath) {
            if (this.popup.location.search || this.popup.location.hash) {
              const query = parseQueryString(
                this.popup.location.search.substring(1).replace(/\/$/, '')
              );
              const hash = parseQueryString(
                this.popup.location.hash.substring(1).replace(/[\/$]/, '')
              );
              let params = objectExtend({}, query);
              params = objectExtend(params, hash);

              if (params.error) {
                reject(new Error(params.error));
              } else {
                resolve(params);
              }

              clearInterval(poolingInterval);
              poolingInterval = null;
              this.popup.close();
            } else {
              reject(new Error(
                'OAuth redirect has occurred but no query or hash parameters were found.'
              )
              );
            }
          }
        } catch (error) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        }
      }, 250);
    });
  }

  _stringifyOptions () {
    const options = [];
    for (const optionKey in this.popupOptions) {
      if (!isUndefined(this.popupOptions[optionKey])) {
        options.push(`${optionKey}=${this.popupOptions[optionKey]}`);
      }
    }
    return options.join(',');
  }
}
