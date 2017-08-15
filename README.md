# vue-authenticate

[![Join the chat at https://gitter.im/vuejs-auth/vue-authenticate](https://badges.gitter.im/vue-authenticate/Lobby.svg)](https://gitter.im/vuejs-auth/vue-authenticate?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**vue-authenticate** is easily configurable solution for [Vue.js](https://vuejs.org/) that provides local login/registration as well as Social login using Github, Facebook, Google and Twitter OAuth providers (only those 4 tested for now).

The best part about this library is that it is not strictly coupled to one request handling library like [vue-resource](https://github.com/pagekit/vue-resource). You will be able to use it with different libraries. 

For now it is tested to work with  [vue-resource](https://github.com/pagekit/vue-resource) (default library) and [axios](https://github.com/mzabriskie/axios) (using [vue-axios](https://github.com/imcvampire/vue-axios) wrapper).

This library was inspired by well known authentication library for Angular called [Satellizer](https://github.com/sahat/satellizer) developed by [Sahat Yalkabov](http://sahatyalkabov.com). They share almost identical configuration and API so you can easily switch from Angular to Vue.js project.

**DISCLAIMER**

For now, this package only supports ES6 import usage, but soon will have standalone ES5 build.



*DEMO app comming soon...*

## Instalation
```bash
npm install vue-authenticate
```

## Usage
```javascript
import Vue from 'vue'
import VueResource from 'vue-resource'
import VueAuthenticate from 'vue-authenticate'

Vue.use(VueResource)
Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:3000', // Your API domain
  
  providers: {
    github: {
      clientId: '',
      redirectUri: 'http://localhost:8080/auth/callback' // Your client app URL
    }
  }
})
```

### Email & password login and registration
```javascript
new Vue({
  methods: {
    login: function () {
      this.$auth.login({ email, password }).then(function () {
        // Execute application logic after successful login
      })
    },

    register: function () {
      this.$auth.register({ name, email, password }).then(function () {
        // Execute application logic after successful registration
      })
    }
  }
})
```

```html
<button @click="login()">Login</button>
<button @click="register()">Register</button>
```

### Social authentication

```javascript
new Vue({
  methods: {
    authenticate: function (provider) {
      this.$auth.authenticate(provider).then(function () {
        // Execute application logic after successful social authentication
      })
    }
  }
})
```

```html
<button @click="authenticate('github')">auth Github</button>
<button @click="authenticate('facebook')">auth Facebook</button>
<button @click="authenticate('google')">auth Google</button>
<button @click="authenticate('twitter')">auth Twitter</button>
```

### Vuex authentication

#### Import and initialize all required libraries

```javascript
// ES6 example
import Vue from 'vue'
import Vuex from 'vuex'
import VueResource from 'vue-resource'
import { VueAuthenticate } from 'vue-authenticate'

Vue.use(Vuex)
Vue.use(VueResource)

const vueAuth = new VueAuthenticate(Vue.http, {
  baseUrl: 'http://localhost:4000'
})
```

```javascript
// CommonJS example
var Vue = require('vue')
var Vuex = require('vuex')
var VueResource = require('vue-resource')
var VueAuthenticate = require('vue-authenticate')

Vue.use(Vuex)
Vue.use(VueResource)

// ES5, CommonJS example
var vueAuth = VueAuthenticate.factory(Vue.http, {
  baseUrl: 'http://localhost:4000'
})
```

Once you have created VueAuthenticate instance, you can use it in Vuex store like this:

```javascript
export default new Vuex.Store({
  
  // You can use it as state property
  state: {
    isAuthenticated: false
  },

  // You can use it as a state getter function (probably the best solution)
  getters: {
    isAuthenticated () {
      return vueAuth.isAuthenticated()
    }
  },

  // Mutation for when you use it as state property
  mutations: {
    isAuthenticated (state, payload) {
      state.isAuthenticated = payload.isAuthenticated
    }
  },

  actions: {

    // Perform VueAuthenticate login using Vuex actions
    login (context, payload) {

      vueAuth.login(payload.user, payload.requestOptions).then((response) => {
        context.commit('isAuthenticated', {
          isAuthenticated: vueAuth.isAuthenticated()
        })
      })

    }
  }
})
```

Later in Vue component, you can dispatch Vuex state action like this

```javascript
// You define your store logic here
import store from './store.js'

new Vue({
  store,

  computed: {
    isAuthenticated: function () {
      return this.$store.getters.isAuthenticated()
    }
  },

  methods: {
    login () {
      this.$store.dispatch('login', { user, requestOptions })
    }
  }
})
```

### Custom request and response interceptors

You can easily setup custom request and response interceptors if you use different request handling library.
For example, if you use **axios** in your app, request and response interceptors would look something like this:

**Important**: You must set both `request` and `response` interceptors if your uses request handling library other than `vue-resource` (default library).

```javascript

Vue.use(VueAuthenticate, {
  bindRequestInterceptor: function () {
    this.$http.interceptors.request.use((config) => {
      if (this.isAuthenticated()) {
        config.headers['Authorization'] = [
          this.options.tokenType, this.getToken()
        ].join(' ')
      } else {
        delete config.headers['Authorization']
      }
      return config
    })
  },

  bindResponseInterceptor: function () {
    this.$http.interceptors.response.use((response) => {
      this.setToken(response)
      return response
    })
  }
})

```

## License

The MIT License (MIT)

Copyright (c) 2017 Davor Grubelić

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
