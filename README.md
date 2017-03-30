# vue-authenticate
`vue-authenticate` is easily configurable solution for *Vue.js* that provides local login/registration as well as Social login using Github, Facebook, Google and Twitter OAuth providers.

The best part about this library is that it is not strictly coupled to one request handling library like `vue-resource`. You will be able to use it with different libraries. 

For now it is tested to work with  `vue-resource` and `axios` (using `vue-axios` wrapper).

This library was inspired by well known authentication library for Angular called [Satellizer](https://github.com/sahat/satellizer) developed by [Sahat Yalkabov](http://sahatyalkabov.com). They share almost identical configuration and API so you can easily switch from Angular to Vue.js project.

## Instalation
`npm install vue-authenticate`

## Usage
```javascript
import Vue from 'vue'
import VueResource from 'vue-resource'
import VueAuthenticate from '../src/index.js'

Vue.use(VueRouter)
Vue.use(VueResource)

Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:4000',
  
  providers: {
    github: {
      clientId: '91b3c6a5b8411640e1b3',
      redirectUri: 'http://localhost:8080/auth/callback'
    }
  }
}
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