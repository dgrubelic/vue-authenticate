import { VueAuthenticate } from 'vue-authenticate';

declare module 'vue/types/vue' {
  interface Vue {
    $auth: VueAuthenticate;
  }
}
