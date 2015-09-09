# Node.js module for POST / GET http requests

## Installation
```sh
npm install fd-http-request --save
```

## Usage Example (VK.com API)
```js
var httpRequest = require('fd-http-request');

// Get request
httpRequest.get('https://api.vk.com/method/users.get', {
    user_ids: 205387401,
    fields: 'photo_50,city,verified',
    version: 5.37
}, function(data){
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
}, 'utf8');
```

## Methods
### get(url, args, callback, encode)
* `string` url - the requested address
* `object | null` args - GET data
* `callback` callback - **function(data)** callback function after a request.
    * `string` data - response from server
* `string` encode - response encoding. _default: `utf8`_

### post(url, args, callback, encode)
* `string` url - the requested address
* `object | null` args - POST data
* `callback` callback - **function(data)** callback function after a request
    * `string` data - response from server
* `string` encode - response encoding. _default: `utf8`_