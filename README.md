# Node.js module for POST / GET http requests

## Installation
```sh
npm install fd-http-request --save
```

## Usage Example (VK.com API)
```js
var httpRequest = require('fd-http-request');

// Get request
httpRequest.get('https://api.vk.com/method/users.get', function(data){
    console.log( data );
    /* RESPONSE:
        response: [{
            id: 205387401,
            first_name: 'Tom',
            last_name: 'Cruise',
            city: {
                id: 5331,
                title: 'Los Angeles'
            },
            photo_50: 'https://pp.vk.me/...760/pV6sZ5wRGxE.jpg',
            verified: 1
        }]
    */
}, {
    encode: 'utf8',
    protocol: 'https',
    data: {
        user_ids: 205387401,
        fields: 'photo_50,city,verified',
        version: 5.37
    }
});
```

## Methods
### get(url, callback, opts)
* `string` url - the requested address
* `callback` callback - **function(data)** callback function after a request
    * `string` data - response from server
* `object` opts - request options **[optional]**
    * `object` data - GET data. _default: `null`_
    * `object` headers - request headers. _default: `null`_
    * `string` encode - response encoding. _default: `utf8`_
    * `string` protocol - request protocol ._default: `autodetect from the protocol`_. [_`'http'` or `'https'`_]

### post(url, callback, opts)
* `string` url - the requested address
* `callback` callback - **function(data)** callback function after a request
    * `string` data - response from server
* `object` opts - request options **[optional]**
    * `object` data - POST data. _default: `null`_
    * `object` headers - request headers. _default: `null`_
    * `string` encode - response encoding. _default: `utf8`_
    * `string` protocol - request protocol ._default: `autodetect from the protocol`_. [_`'http'` or `'https'`_]

## Changelog
### 0.3.0
* `Add` - dependence on the [object-merge](https://www.npmjs.com/package/object-merge)
* `Add` - custom headers `opts.headers`
* `Change` - moved 2-nd `data` argument to `opts.data`
* `Other` - make code less

### 0.2.0
* `Add` - autodetect protocol `http` or `https`
* `Change` - 4-th argument from the `string` _encode_ to the `object` _opts_