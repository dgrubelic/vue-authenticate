import './utils.js'
import Promise from './promise.js'
import VueAuthenticate from './authenticate.js'

/**
 * VueAuthenticate plugin
 * @param {Object} Vue
 * @param {Object} options
 */
function plugin(Vue, options) {
  if (plugin.installed) {
    return
  }
  plugin.installed = true

  let vueAuthInstance = null;
  Object.defineProperties(Vue.prototype, {
    $auth: {
      get() {
        if (!vueAuthInstance) {
          // Request handler library not found, throw error
          if (!this.$http) {
            throw new Error('Request handler instance not found')
          }

          vueAuthInstance = new VueAuthenticate(this.$http, options)
        }
        return vueAuthInstance
      }
    }
  })
}

export default plugin
export { VueAuthenticate }