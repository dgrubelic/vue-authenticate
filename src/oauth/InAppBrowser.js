import Promise from '../promise.js'
import { stringifyOptions, objectExtend, parseQueryString } from '../utils.js'

/**
 * InAppBrowser OAuth2 popup management class
 *
 * @author James Kirkby <https://github.com/jkirkby91-2> <jkirkby@protonmail.ch>
 * @copyright ames Kirkby <jkirkby@protonmail.ch>
 * heavily influanced cordova inappbrowser oauth popup from ng-cordova-oauth and sahat/satellizer
 * adjusted to fit vue-authenticate library,
 * make sure you set your provider default option responseType to token
 */
export default class InAppBrowser {
  constructor(url, target, popupOptions, responseType) {
    this.url = url
    this.target = target
    this.options = popupOptions
    this.responseType = responseType
  }

  open(redirectUri) {
    return new Promise((resolve, reject) => {

      var browserRef = window.cordova.InAppBrowser.open(this.url, this.target, stringifyOptions(this.options));
      browserRef.addEventListener("loadstart", (event) => {
        if ((event.url).indexOf(redirectUri) === 0) {
          browserRef.removeEventListener("exit", (event) => {});
          browserRef.close();
          console.log(event)
          console.log((event.url))
          console.log(((event.url).split("#")[1]))
          if (this.responseType === 'token') {
            var responseParameters = ((event.url).split("#")[1]).split("&");
            var parsedResponse = {};
            for (var i = 0; i < responseParameters.length; i++) {
              parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) {
              console.log(parsedResponse)
              resolve(parsedResponse);
            } else {
              reject("Problem authenticating");
            }
          } else {
            const query = parseQueryString(((event.url).split("/auth/oauth/linkedin/callback?code=")[1]).split('&')[1]);
            const hash = []
            hash['code'] = ((event.url).split("/auth/oauth/linkedin/callback?code=")[1]).split('&')[0];
            let params = objectExtend({}, query);
            params = objectExtend(params, hash);
            console.log(params);
            if (params.error) {
              reject(new Error(params.error));
            } else {
              resolve(params);
            }
          }
        }
      });
      browserRef.addEventListener("exit", function(event) {
        reject("The sign in flow was canceled");
      });
    })
  }
}
