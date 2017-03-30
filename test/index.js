import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource' // Comment for axios example

// import axios from 'axios' // Uncomment for axios example
// import VueAxios from 'vue-axios' // Uncomment for axios example

import VueAuthenticate from '../src/index.js'

Vue.use(VueRouter)
Vue.use(VueResource) // Comment for axios example

// Vue.use(VueAxios, axios) // Uncomment for axios example

Vue.use(VueAuthenticate, {})

const router = new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/',
      name: 'index',
      component: {
        data: function () {
          return {
            response: null
          }
        },
        template: `
          <div class="index-component">
            <button @click="authLogin()">Login</button>
            <button @click="authRegister()">Register</button>
            <button @click="authLogout()">Logout</button>
            <hr />
            <button @click="auth('github')" class="button--github">Auth github</button>
            <button @click="auth('facebook')" class="button--facebook">Auth facebook</button>
            <button @click="auth('google')" class="button--google">Auth google</button>
            <button @click="auth('twitter')" class="button--twitter">Auth twitter</button>

            <pre class="response" v-if="response !== null">{{JSON.stringify(response, null, 2)}}</pre>
          </div>
        `,
        methods: {
          authLogin: function() {
            let user = {
              email: 'john.doe@domain.com', 
              password: 'pass123456'
            };

            if (this.$auth.isAuthenticated()) {
              this.$auth.logout()  
            }

            this.$auth.login(user).then((response) => {
              this.response = response
              console.log(this.$auth.isAuthenticated())
              console.log(this.$auth.getPayload())
            })
          },

          authRegister: function() {
            let user = {
              name: 'John Doe',
              email: 'john.doe@domain.com', 
              password: 'pass123456'
            };

            if (this.$auth.isAuthenticated()) {
              this.$auth.logout()  
            }
            
            this.$auth.register(user).then((response) => {
              this.response = response
              console.log(this.$auth.isAuthenticated())
              console.log(this.$auth.getPayload())
            })
          },

          authLogout: function() {
            this.$auth.logout().then(() => {
              if (!this.$auth.isAuthenticated()) {
                this.response = null
              } else {
                console.log(this.$auth.isAuthenticated())
              }
            })
          },

          auth: function(provider) {
            this.$auth.logout()
            this.response = null

            console.log('User authenticated: ', this.$auth.isAuthenticated())

            this.$auth.authenticate(provider).then((authResponse) => {
              if (provider === 'github') {
                this.$http.get('https://api.github.com/user').then((response) => {
                  this.response = response
                })
              } else if (provider === 'facebook') {
                this.$http.get('https://graph.facebook.com/v2.5/me', {
                  params: { access_token: this.$auth.getToken() }
                }).then((response) => {
                  this.response = response
                })
              } else if (provider === 'google') {
                this.$http.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect').then((response) => {
                  this.response = response
                })
              } else if (provider === 'twitter') {
                this.response = authResponse.body.profile
              }
            })
          }
        }
      } 
    },

    {
      path: '/auth/callback',
      component: {
        template: '<div class="auth-component"></div>',
        mounted: function () {

        }
      }
    }
  ]
})

const app = new Vue({
  router
}).$mount('#app')