var http = require('http');
var https = require('https');
var url = require('url');
var querystring = require('querystring');

var request = (function() {
    /**
     * Post запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Object}   data              - POST параметры
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {String}   opts.encode       - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function post(siteurl, data, callback, opts) {
        // Default
        opts = opts || {};
        opts.encode = opts.encode || 'utf8';

        var queryData = querystring.stringify( data );

        var parsedUrl = url.parse( siteurl );

        var options = {
            hostname: parsedUrl.host,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': queryData.length
            }
        };

        if( (parsedUrl.protocol == 'https:' && !opts.protocol) || opts.protocol == 'https'){
            options.port = 443;
            var _http = https;
        } else {
            options.port = 80;
            var _http = http;
        }

        var req = _http.request(options, function(res) {
            var data = '';

            res.setEncoding( opts.encode );
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
     * Post запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Object}   data              - POST параметры
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {String}   opts.encode       - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function get(siteurl, data, callback, opts) {
        // Default
        opts = opts || {};
        opts.encode = opts.encode || 'utf8';

        var parsedUrl = url.parse( siteurl );

        var path = parsedUrl.pathname;

        if(data) {
            var queryData = querystring.stringify( data );
            path += "?" + queryData;
        }

        var options = {
            hostname: parsedUrl.host,
            path: path,
            method: 'GET'
        };

        if( (parsedUrl.protocol == 'https:' && !opts.protocol) || opts.protocol == 'https'){
            options.port = 443;
            var _http = https;
        } else {
            options.port = 80;
            var _http = http;
        }

        var req = _http.request(options, function(res) {
            var data = '';

            res.setEncoding( opts.encode  );
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

module.exports = request;