import './utils.js'
import Promise from './promise.js'
import VueAuthenticate from './auth.js'

/**
 * VueAuthenticate plugin
 * @param {Object} Vue
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
          // vue-resource module not found, throw error
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