# OAuth Provider Configurations

The vue-authenticate packages provides support for the following
OAuth providers out of the box:

 - GitHub
 - Facebook
 - Google
 - Bitbucket
 - LinkedIn
 - Twitter
 - Instagram
 - Microsoft Live

For any other provider, it is simply a question of providing the right
provider configuration in the options to your vue-authenticate instance.

For the provider already provided by this package, you should only need
to provide the `clientId` and `redirectUri` at minimum, with other
properties as you see fit.

For `clientId`, use the value provided by your OAuth provider, when you
configured it. For example, Google is done through their [developer console](https://console.cloud.google.com/).

For `redirectUri`, provide the URL the OAuth provider should redirect to
after successful authentication. Also note, in many cases this needs to
have been whitelisted on the OAuth provider side.

## Custom Provider

Using Discord as an example, here is an annotated provider configuration:

```js
discord: {
  // the client id provided for you client, by your OAuth provider
  clientId: '0000000000',
  // where the oauth server should redirect to, after successfully authenticating
  redirectUri: 'http://localhost:8080/account/linked-accounts', /
  // the name of the provider, in lower case, suitable for use as a property
  name: 'discord',
  // url appended to the baseUrl, when sending response base to your API server
  url: '/auth/discord',
  // the authorisation endpoint
  authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
  // which params are included in the URL
  requiredUrlParams: ['display', 'scope'],
  // what is being asked of the oauth provider in terms of extra
  // information, beyond id
  scope: ['email'],
  // separator between scopes, as expected by OAuth provider
  scopeDelimiter: ',',
  // indicate whether to be shown in a pop-up (appears to be ignored
  // and be pop-up always)
  display: 'popup',
  // indicates the oauth type to be used. Either 1.0 or 2.0
  oauthType: '2.0',
  // controls the size of the pop up window
  popupOptions: { width: 580, height: 700 }
}
```

You should double check the configuration for your provider for any
specific details. For example, in some cases the scope field might
be ignored and the scope is defined as part of the provider's OAuth
configuration page.

## Diving Under The Hood

To see the how the included OAuth providers are configured, take
a look at [src/options.js](../src/options.js), in the `providers`
block.


