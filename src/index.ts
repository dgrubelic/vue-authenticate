import VueAuthenticate from './authenticate.js';
import VueInterface from 'vue';
import { AuthConfig } from './options.js';
import { AuthHttp } from './network/types';

declare module 'vue/types/vue' {
  interface Vue {
    prototype: VueInterface
  }
}

const plugin = {
  installed: false,

  /**
   * VueAuthenticate plugin
   * @param {Object} Vue
   * @param {Object} options
   */
  install(Vue: VueInterface, options: AuthConfig) {
    if (plugin.installed) {
      return;
    }

    plugin.installed = true;

    let vueAuthInstance: VueAuthenticate;

    Object.defineProperties(Vue.prototype, {
      $auth: {
        get() {
          if (!vueAuthInstance) {
            // Request handler library not found, throw error
            if (!this.$http) {
              throw new Error('Request handler instance not found');
            }

            vueAuthInstance = new VueAuthenticate(this.$http, options);
          }
          return vueAuthInstance;
        },
      },
    });
  },

  /**
   * External factory helper for ES5 and CommonJS
   * @param  {Object} $http     Instance of request handling library
   * @param  {Object} options   Configuration object
   * @return {VueAuthenticate}  VueAuthenticate instance
   */
  factory($http: AuthHttp, options: AuthConfig) {
    return new VueAuthenticate($http, options);
  },
};

export default plugin;
