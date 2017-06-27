import Promise from '../promise.js'
import { isInAppBrowserInstalled, objectExtend, parseQueryString, getFullUrlPath } from '../utils.js'

/**
 * InAppBrowser OAuth2 popup management class
 *
 * @author James Kirkby <https://github.com/jkirkby91-2> <jkirkby@protonmail.ch>
 * @copyright ames Kirkby <jkirkby@protonmail.ch>
 * heavily influanced cordova inappbrowser oauth popup from ng-cordova-oauth and sahat/satellizer
 * adjusted to fit vue-authenticate library
 */
export default class InAppBrowser {
    constructor(url) {
        this.popup = null
        this.url = url
        // this.name = name
        // this.popupOptions = popupOptions
        // this.skipPooling = true
        this.redirectUri = 'http://localhost/auth/oauth/facebook/callback'
    }

    open(redirectUri) {
        console.log('inappbrowser')

        try {
            console.log('try')
            this.popup = window.cordova.InAppBrowser.open(this.url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
            console.log(this.popup)
            this.popup.addEventListener('loadstart', (event) => {
                console.log((event.url).indexOf(this.redirectUri))
                if((event.url).indexOf(this.redirectUri) === 0) {
                    this.popup.removeEventListener("exit",function(event){});
                    this.popup.close();
                    var callbackResponse = (event.url).split("#")[1];
                    var responseParameters = (callbackResponse).split("&");
                    var parameterMap = [];
                    for(var i = 0; i < responseParameters.length; i++) {
                        parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
                    }
                    console.log(parameterMap);
                    if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                        return Promise.resolve({ access_token: parameterMap.access_token, expires_in: parameterMap.expires_in });
                    } else {
                        if ((event.url).indexOf("error_code=100") !== 0) {
                            return Promise.reject(new Error("Facebook returned error_code=100: Invalid permissions"));
                        } else {
                            return Promise.reject(new Error("Problem authenticating"));
                        }
                    }
                }
            });

            this.popup.addEventListener('loaderror', () => {
                reject(new Error('Authorization failed'));
            });

            this.popup.addEventListener('exit', () => {
                reject(new Error('The popup window was closed'));
            });

        } catch(e) {
            return Promise.reject(new Error('OAuth popup error occurred'))
        }
    }



    _stringifyOptions() {
        let options = []
        for (var optionKey in this.popupOptions) {
            options.push(`${optionKey}=${this.popupOptions[optionKey]}`)
        }
        return options.join(',')
    }
}
