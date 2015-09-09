var http = require('http');
var url = require('url');
var querystring = require('querystring');
var async = require('async');

var httpRequest = (function() {
    /**
     * Post запрос
     * @param  {String}   siteurl   - Адрес запроса
     * @param  {Object}   data      - POST параметры
     * @param  {Function} callback  - Callback функция
     * @param  {String}   encode    - Кодировка ответа
     */
    function post(siteurl, data, callback, encode) {
        var queryData = querystring.stringify( data );

        var parsedUrl = url.parse( siteurl );

        var options = {
            hostname: parsedUrl.host,
            port: 80,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': queryData.length
            }
        };

        var req = http.request(options, function(res) {
            var data = '';

            res.setEncoding( encode || 'utf8' );
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                callback( data );
            });
        });

        req.write(queryData);
        req.end();
    }

    /**
     * Get запрос
     * @param  {String}   siteurl   - Адрес запроса
     * @param  {Object}   data      - POST параметры
     * @param  {Function} callback  - Callback функция
     * @param  {String}   encode    - Кодировка ответа
     */
    function get(siteurl, data, callback, encode) {
        var parsedUrl = url.parse( siteurl );

        var path = parsedUrl.pathname;

        if(data) {
            var queryData = querystring.stringify( data );
            path += "?" + queryData;
        }

        var options = {
            hostname: parsedUrl.host,
            port: 80,
            path: path,
            method: 'GET'
        };

        var req = http.request(options, function(res) {
            var data = '';

            res.setEncoding( encode || 'utf8' );
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                callback( data );
            });
        });
        req.end();
    }

    return {
        post: post,
        get: get
    }
})();

module.exports = httpRequest;