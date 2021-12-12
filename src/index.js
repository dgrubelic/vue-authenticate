import './utils.js';
import VueAuthenticate from './authenticate.js';

let vueAuthInstance;

const VueAuthenticatePlugin = {
  install (app, options) {
    if (!options) {
      options = {};
    }

    if (!vueAuthInstance) {
      let axios = app.config.globalProperties.$http;
      if (options.axios) {
        axios = options.axios;
      } else if (!axios) {
        throw new Error('No axios instance found, as option or as vue global');
      }

      vueAuthInstance = new VueAuthenticate(axios, options);
      app.config.globalProperties.$auth = vueAuthInstance;
    }
  }
};

export default VueAuthenticatePlugin;
