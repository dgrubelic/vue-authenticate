[**WARNING**]: README file is currently in process of rewrite and will be released soon.

# vue-authenticate-2

[![Join the chat at https://gitter.im/vuejs-auth/vue-authenticate](https://badges.gitter.im/vue-authenticate/Lobby.svg)](https://gitter.im/vuejs-auth/vue-authenticate?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**vue-authenticate** is easily configurable solution for [Vue.js](https://vuejs.org/) that provides local login/registration as well as Social login using Github, Facebook, Google and other OAuth providers.

This library was inspired by well known authentication library for Angular called [Satellizer](https://github.com/sahat/satellizer) developed by [Sahat Yalkabov](http://sahatyalkabov.com). They share almost identical configuration and API so you can easily switch from Angular to Vue.js project.

## Changes in vue-authenticate-2

This is a fork of [dgrubelic/vue-authenticate](https://github.com/dgrubelic/vue-authenticate), mainly because I needed to use this with Vue3 and the
upstream project was no longer getting any attention from the original
developer. If anything changes I'd be happy to make the changes available
to the upstream

Note, this version drops support for commonJS, while adding support for
Vue3. Additionally, this version also supports passing an axios instance
as a configuration option, which means you can easily confugure your
interceptors, for example. If you wish to choose an alternative to Axios,
then make sure that it is compatible with the `axios.post()` function.

Support for vuex-axios is likely to be dropped in a future. The main
justification is to avoid duplication with a vue instance that may
already be used, but if a global `$http` is available, then it will be
used.

## OAuth Providers

Support for the following OAuth providers are included out of the box:

 - GitHub
 - Facebook
 - Google
 - Bitbucket
 - LinkedIn
 - Twitter
 - Instagram
 - Microsoft Live

For more on the configuration of existing providers and adding your
own, see the documentation on [OAuth provider configurations](./docs/providers.md).

## Installation
```bash
npm install vue-authenticate
```

## Usage

```javascript
import { createApp } from 'vue';
import VueAuthenticate from 'vue-authenticate';
import axios from 'axios';

const app = createApp(Root);

app.use(VueAuthenticate, {
  baseUrl: 'http://localhost:3000', // Your API domain
  axios: axios.create({}),
  providers: {
    github: {
      clientId: '',
      redirectUri: 'http://localhost:8080/auth/callback' // Your client app URL
    }
  }
});

app.mount('#app');
```

### Email & password login and registration

```javascript
// TODO This needs to be reviewed for Vue3
new Vue({
  methods: {
    async login () {
      await this.$auth.login({ email, password });
      // Execute application logic after successful login
    },

    async register () {
      await this.$auth.register({ name, email, password });
      // Execute application logic after successful registration
    }
  }
})
```

```html
<button @click="login()">Login</button>
<button @click="register()">Register</button>
```

### Social account authentication

```javascript
new Vue({
  methods: {
    async authenticate (provider) {
      await this.$auth.authenticate(provider);
      // Execute application logic after successful social authentication
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
import { VueAuthenticate } from 'vue-authenticate/authenticate'
import axios from 'axios';

const axiosInstance = axios.create({});

const vueAuth = new VueAuthenticate(axiosInstance, {
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

**Important**: You must set both `request` and `response` interceptors at all times.

```javascript

/**
* This is example for request and response interceptors for axios library
*/

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
