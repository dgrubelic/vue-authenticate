import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueAuthenticate from '../src/index.js'
import store from './store.js'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.http.options.root = 'http://localhost:3000';
Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:4000',  
  providers: {
    // Define OAuth providers config
  }
})

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
        computed: {

          isVuexAuthenticated: function () {
            return this.$store.state.isAuthenticated
          }
          
        },
        template: `
          <div class="index-component">
            <button @click="authLogin()">Login</button>
            <button @click="authLoginVuex()">Login (Vuex)</button>
            <button @click="authRegister()">Register</button>
            <button @click="authLogout()">Logout</button>
            
            <hr />

            <button @click="auth('github')" class="button--github">Auth github</button>
            <button @click="auth('facebook')" class="button--facebook">Auth facebook</button>
            <button @click="auth('google')" class="button--google">Auth google</button>
            <button @click="auth('twitter')" class="button--twitter">Auth twitter</button>

            <hr />
            
            <button @click="auth('instagram')" class="button--instagram">Auth instagram</button>

            <div class="vuex-auth" v-if="isVuexAuthenticated">
              <p><strong>Hooray! Vuex authentication was successful!</strong></p>
              <p>Don't worry, this message will dissappear in 3 seconds.</p>
            </div>

            <pre class="response" v-if="response !== null">{{JSON.stringify(response, null, 2)}}</pre>
          </div>
        `,
        methods: {

          authLoginVuex: function () {
            this.response = null
            let user = {
              email: 'john.doe@domain.com', 
              password: 'pass123456'
            };

            this.$store.dispatch('login', user)
          },

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
            })
          },

          authLogout: function() {
            this.$auth.logout().then(() => {
              if (!this.$auth.isAuthenticated()) {
                this.response = null
              }
            })
          },

          auth: function(provider) {
            this.$auth.logout()
            this.response = null

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
              } else if (provider === 'instagram') {
                this.response = authResponse
              }
            }).catch((err) => {
              this.response = err
            })
          }
        }
      } 
    },

    {
      path: '/auth/callback',
      component: {
        template: '<div class="auth-component"></div>'
      }
    }
  ]
})

const app = new Vue({
  router,
  store
}).$mount('#app')