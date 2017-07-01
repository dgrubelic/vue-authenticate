import Promise from '../promise.js'
import { stringifyOptions } from '../utils.js'

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
  constructor(url, target, popupOptions) {
    this.url = url
    this.target = target
    this.options = popupOptions
  }

  open(redirectUri) {
    return new Promise((resolve, reject) => {

      var browserRef = window.cordova.InAppBrowser.open(this.url, this.target, stringifyOptions(this.options));
      browserRef.addEventListener("loadstart", (event) => {
        if ((event.url).indexOf(redirectUri) === 0) {
          browserRef.removeEventListener("exit", (event) => {});
          browserRef.close();
          var responseParameters = ((event.url).split("#")[1]).split("&");
          var parsedResponse = {};
          for (var i = 0; i < responseParameters.length; i++) {
            parsedResponse[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
          }
          if (parsedResponse["access_token"] !== undefined && parsedResponse["access_token"] !== null) {
            console.log(parsedResponse)
            resolve(parsedResponse);
          } else {
            reject("Problem authenticating with Facebook");
          }
        }
      });
      browserRef.addEventListener("exit", function(event) {
        reject("The Facebook sign in flow was canceled");
      });

    })

  }
}
