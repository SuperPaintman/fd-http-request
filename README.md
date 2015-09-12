# Node.js module for POST / GET http requests

## Installation
```sh
npm install fd-http-request --save
```

## Usage Example (VK.com API)
```js
var httpRequest = require('fd-http-request');

// Get request
httpRequest.get('https://api.vk.com/method/users.get', function(res){
    console.log( res );
    /* RESPONSE:
        {
            status: 200,
            data: '{"response":[{"uid":205387401,"first_name":"Tom","last_name":"Cruise","city":5331,"photo_50":"http:\/\/cs402330.vk.me\/v402330401\/9760\/pV6sZ5wRGxE.jpg","verified":0}]}',
            headers: {
                server: 'Apache',
                date: 'Sat, 12 Sep 2015 02:13:31 GMT',
                'content-type': 'application/json; charset=utf-8',
                'content-length': 169,
                connection: 'close',
                'x-powered-by': 'PHP/3.17046',
                'set-cookie':[
                    'remixlang=0; expires=Sun, 18 Sep 2016 03:04:05 GMT; path=/; domain=.vk.com'
                ],
                pragma: 'no-cache',
                'cache-control': 'no-store'
            },
            cookies: [
                {
                    remixlang: 0,
                    expires: 'Sun, 18 Sep 2016 03:04:05 GMT',
                    path: '/',
                    domain: '.vk.com'
                }
            ]
        }
    */
}, {
    charset: 'utf-8',
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
* `callback` callback - **function(res)** callback function after a request
    * `object` res - response from server
        * `integer` status - response status
        * `string` data - response text from server
        * `object` headers - response headers
        * `array` cookies - response cookies
        * `string` charset - response charset
* `object` opts - request options **[optional]**
    * `object` data - GET data. _default: `null`_ . _example: `{user_ids: 205387401}`_
    * `object` headers - request headers. _default: `null`_ . _example: `{'User-Agent': 'Mozilla/5.0'}`_
    * `object` cookies - request cookies. _default: `null`_ . _example: `{foo: 'bar'}`_
    * `string` charset - response encoding. _default: `autodetect from the header`_ . _example: `'cp1251'`_
    * `string` protocol - request protocol . _default: `autodetect from the protocol`_ . [ _`'http'` or `'https'`_ ]

### post(url, callback, opts)
* `string` url - the requested address
* `callback` callback - **function(res)** callback function after a request
    * `object` res - response from server
        * `integer` status - response status
        * `string` data - response text from server
        * `object` headers - response headers
        * `array` cookies - response cookies
        * `string` charset - response charset
* `object` opts - request options **[optional]**
    * `object` data - POST data. _default: `null`_ . _example: `{user_ids: 205387401}`_
    * `object` headers - request headers. _default: `null`_ . _example: `{'User-Agent': 'Mozilla/5.0'}`_
    * `object` cookies - request cookies. _default: `null`_ . _example: `{foo: 'bar'}`_
    * `string` charset - response encoding. _default: `autodetect from the header`_ . _example: `'cp1251'`_
    * `string` protocol - request protocol . _default: `autodetect from the protocol`_ . [ _`'http'` or `'https'`_ ]

## Changelog
### 0.5.0
* `Add` - dependence on the [iconv-lite](https://www.npmjs.com/package/iconv-lite)
* `Add` - autodetect body charset from header `content-type` and convert it
* `Add` - response charset argument `res.charset` to the callback
* `Change` - rename `opts.encode` to `opts.charset`

### 0.4.0
* `Add` - dependence on the [cookie](https://www.npmjs.com/package/cookie)
* `Add` - custom cookie `opts.cookies`
* `Change` - callback function. Now it called with `object` res argument

### 0.3.0
* `Add` - dependence on the [object-merge](https://www.npmjs.com/package/object-merge)
* `Add` - custom headers `opts.headers`
* `Change` - moved 2-nd `data` argument to `opts.data`
* `Other` - make code less

### 0.2.0
* `Add` - autodetect protocol `http` or `https`
* `Change` - 4-th argument from the `string` _encode_ to the `object` _opts_