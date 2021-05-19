import { $document, $window } from '../globals';
import {
  objectExtend,
  parseQueryString,
  getFullUrlPath,
  isUndefined,
} from '../utils';

/**
 * OAuth2 popup management class
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Class mostly taken from https://github.com/sahat/satellizer
 * and adjusted to fit vue-authenticate library
 */
export default class OAuthPopup {
  popup: Window | null;
  popupOptions: Record<string, any>;
  url: string;
  name: string;

  constructor(url: string, name: string, popupOptions?: Record<string, any>) {
    this.popup = null;
    this.url = url;
    this.name = name;
    this.popupOptions = popupOptions || {};
  }

  open(redirectUri: string, skipPooling?: boolean) {
    try {
      this.popup = ($window.open(this.url, this.name, this._stringifyOptions())) as Window;

      if (this.popup && this.popup.focus) {
        this.popup.focus();
      }

      if (skipPooling) {
        return Promise.resolve();
      } else {
        return this.pooling(redirectUri);
      }
    } catch (e) {
      return Promise.reject(new Error('OAuth popup error occurred'));
    }
  }

  async pooling(redirectUri: string) {
      const redirectUriParser: HTMLAnchorElement = ($document.createElement('a')) as HTMLAnchorElement;
      redirectUriParser.href = redirectUri;

      if (!redirectUriParser) {
        return;
      }

      const redirectUriPath = getFullUrlPath({
        hash: redirectUriParser.hash,
        hostname: redirectUriParser.hostname,
        pathname: redirectUriParser.pathname,
        protocol: redirectUriParser.protocol,
        port: redirectUriParser.port,
      } as Location);

      let poolingInterval: NodeJS.Timeout | null = setInterval(() => {
        if (
          !this.popup ||
          this.popup.closed ||
          this.popup.closed === undefined
        ) {
          if (poolingInterval) {
            clearInterval(poolingInterval);
          }

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
                throw new Error(params.error);
              } else {
                if (poolingInterval) {
                  clearInterval(poolingInterval);
                }
                
                poolingInterval = null;
                this.popup.close();

                return params;
              }
            }
          }
        } catch (e) {
          if (!(e instanceof DOMException)) {
            throw e;
          }
        }
      }, 250);
  }

  _stringifyOptions() {
    let options = [];

    for (var optionKey in this.popupOptions) {
      if (!isUndefined(this.popupOptions[optionKey])) {
        options.push(`${optionKey}=${this.popupOptions[optionKey]}`);
      }
    }
    return options.join(',');
  }
}
