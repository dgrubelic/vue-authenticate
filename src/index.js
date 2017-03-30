import './utils.js'
import Promise from './promise.js'
import VueAuthenticate from './auth.js'

/**
 * VueAuthenticate plugin
 * @param {Object} Vue
 */
function plugin(Vue, options) {
  if (plugin.installed) {
    return;
  }

  Object.defineProperties(Vue.prototype, {
    $auth: {
      get() {
        // vue-resource module not found, throw error
        if (!this.$http) {
          throw new Error('vue-resource instance not found')
        }

        return new VueAuthenticate(this.$http, options)
      }
    }
  });
}

export default plugin;