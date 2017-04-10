import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import VueAuthenticate from '../src/authenticate.js'

Vue.use(Vuex)
Vue.use(VueResource)
const vueAuth = new VueAuthenticate(Vue.http, {
  baseUrl: 'http://localhost:4000'
})

export default new Vuex.Store({
  state: {
    isAuthenticated: false
  },

  getters: {
    isAuthenticated () {
      return vueAuth.isAuthenticated()
    }
  },

  mutations: {
    isAuthenticated (state, payload) {
      state.isAuthenticated = payload.isAuthenticated
    }
  },

  actions: {
    login (context, user, requestOptions) {
      vueAuth.login(user, requestOptions).then((response) => {
        context.commit('isAuthenticated', {
          isAuthenticated: vueAuth.isAuthenticated()
        })

        setTimeout(function () {
          vueAuth.logout()

          context.commit('isAuthenticated', {
            isAuthenticated: vueAuth.isAuthenticated()
          })
        }, 3000)
      })
    }
  }
})