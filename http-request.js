var http = require('http');
var https = require('https');
var url = require('url');
var querystring = require('querystring');

var objectMerge = require('object-merge');
var cookieParser = require('cookie');

var request = (function() {
    function _request(method, siteurl, callback, opts){
        // Default
        opts            = opts          || {};
        opts.data       = opts.data     || null;
        opts.headers    = opts.headers  || null;
        opts.cookies    = opts.cookies  || null;
        opts.encode     = opts.encode   || 'utf8';

        var queryData = querystring.stringify( opts.data );
        var parsedUrl = url.parse( siteurl );

        var host = parsedUrl.host;
        var path = parsedUrl.pathname;

        if(method == 'get'){
            if(opts.data) {
                path += "?" + queryData;
            }
        }

        var options = {
            hostname: host,
            path: path,
            method: method.toUpperCase(),
        };

        // Добавление заголовков POST
        if( method == 'get' ){
        } else {
            options = objectMerge(options, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': queryData.length
                }
            });
        }

        // Merge заголовков с запросом
        if( opts.headers ){
            options = objectMerge(options, {
                headers: opts.headers
            });
        }

        // Cookie заголовков с запросом
        if( opts.cookies ){
            var cookies = '';
            var step = 0;
            for( key in opts.cookies ){
                if(step > 0)
                    cookies += '; '
                var val = opts.cookies[ key ];

                // cookies += cookieParser.serialize( key, decodeURIComponent(val) ); //TODO: не всегда cookie поступают в encode виде
                cookies += key+'='+val;
                step++;
            }

            options = objectMerge(options, {
                headers: { 
                    'Cookie': cookies
                }
            });
        }

        // Установка протокола
        if( (parsedUrl.protocol == 'https:' && !opts.protocol) || opts.protocol == 'https'){
            options.port = 443;
            var _http = https;
        } else {
            options.port = 80;
            var _http = http;
        }

        var req = _http.request(options, function(res) {
            var data = '';
            var status = res.statusCode;
            var headers = res.headers;
            var cookies = [];

            for( var key in res.headers['set-cookie'] ){
                var cookie = cookieParser.parse( res.headers['set-cookie'][ key ] );
                cookies.push(cookie);
            }

            res.setEncoding( opts.encode );
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                callback({
                    status: status,
                    data: data, 
                    headers: headers,
                    cookies: cookies
                });
            });
        });

        // Отправка POST даты
        if( method == 'get' ){
        } else {
            req.write(queryData);
        }
        req.end();
    }

    /**
     * Post запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - POST параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.encode       - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function post(siteurl, callback, opts) {
        _request('post', siteurl, callback, opts);
    }

    /**
     * Get запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - GET параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.encode       - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
     */
    function get(siteurl, callback, opts) {
        _request('get', siteurl, callback, opts);
    }

    return {
        post: post,
        get: get
    }
})();

module.exports = request;