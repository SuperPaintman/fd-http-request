http            = require 'http'
https           = require 'https'
url             = require 'url'
querystring     = require 'querystring'

iconv           = require 'iconv-lite'
objectMerge     = require 'object-merge'
cookieParser    = require 'cookie'
overlord        = require 'overlord-js'

request = ()=>
    # Класс запроса
    ###*
     * Класс для работы с запросами
     * @class Request
     * @param {object} opts                 - параметры конструктора
     * @param {boolean} opts.saveCookies    - хранить ли Cookie
     * @param {object} opts.headers         - постоянные заголовки запроса
    ###
    class Request
        constructor: (opts)->
            @cookies        = null
            @headers        = opts?.headers ? null
            @saveCookies    = opts?.saveCookies ? true

        ###*
         * Аналог запроса
         * @memberOf Request
         * @method _request
         * @see  {function} _request
        ###
        _request: (method, siteurl, callback, opts)->
            self = @
            opts = opts ? {}

            if opts?.cookies?
                self.cookies = mergeResCookie self.cookies, toResCookie opts.cookies

            # Headers
            if self.headers?
                if opts?.headers?
                    opts.headers = objectMerge self.headers, opts.headers
                else
                    opts.headers = self.headers

            # Cookie
            # Если это не первое соединение
            if self.saveCookies && self.cookies
                parsedUrl   = url.parse siteurl
                host        = parsedUrl.host
                path        = parsedUrl.pathname

                reqCookies = {}
                for cookie, i in self.cookies
                    cookieHost      = cookie.domain  ? undefined
                    cookiePath      = cookie.path    ? undefined
                    cookieExpires   = cookie.expires ? undefined

                    isValidHost = false

                    # Добавление www.
                    if cookieHost
                        reg = /^(?:.*?\/\/)?(?:www)?(?:\.)?(.*?)$/

                        siteMatches = host.match reg 
                        cookMatches = cookieHost.match reg
                        if siteMatches && cookMatches && siteMatches[1] == cookMatches[1]
                            isValidHost = true

                    if cookieExpires
                        cookieExpiresTimestamp = new Date( cookieExpires ).getTime()
                    else
                        cookieExpiresTimestamp = undefined

                    key = Object.keys( cookie )[0]
                    val = cookie[key]

                    # Проверка домена
                    if !cookieHost || isValidHost
                        # Проверка пути
                        reg = new RegExp "^#{cookiePath}", 'i'
                        matches = path.match reg

                        if !cookiePath || matches && matches[0]
                            # Проверка срока годности
                            if !cookieExpiresTimestamp || cookieExpiresTimestamp > new Date().getTime()
                                reqCookies[key] = val

                if opts?.cookies?
                    opts.cookies = objectMerge reqCookies, opts.cookies
                else
                    opts.cookies = reqCookies

            _request method, siteurl, ( res )->
                if self.saveCookies?
                    if self.cookies?
                        self.cookies = mergeResCookie self.cookies, res.cookies
                    else if res.cookies?
                        self.cookies = res.cookies

                callback res
            , opts

        ###*
         * Аналог Post
         * @memberOf Request
         * @method post
         * @see  {function} _request
        ###
        post: (siteurl, callback, opts)->
            @_request 'post', siteurl, callback, opts


        ###*
         * Аналог Get
         * @memberOf Request
         * @method get
         * @see  {function} _request
        ###
        get: (siteurl, callback, opts)->
            @_request 'get', siteurl, callback, opts

        ###*
         * Получение и установка header
         * @memberOf Request
         * @method header
         * @param {Object|Null} first    - Устанавливаемые header 
         * @return {Object}              - Текущие header
        ###
        header: overlord [
            args: [Object]
            func: (headers)->
                if @headers?
                    @headers = objectMerge @.headers, headers
                else
                    @headers = headers
        ], () ->
            @headers

        ###*
         * Отчестка header'ов. В случае, если аргумент не установлен удалятся все header.
         * @memberOf Request
         * @param {String} first        - Имя удаляемой Header
         * @return {Object|Null}        - Успешное ли удаление
        ###
        clearHeader: overlord [
            # One
            args: [String]
            func: (name)->
                removeHeader @headers, name
        ], () ->
            # All
            @headers = null

        ###*
         * Получение и установка cookie
         * @memberOf Request
         * @method cookie
         * @param {Array|Null} first    - Устанавливаемые cookie 
         * @param {Boolean|Null} second - Конвертировать ли cookie
         * @return {Array}              - Текущие cookie
        ###
        cookie: overlord [
            # Set
            args: [Array, '...']
            func: (cookies)->
                convert = arguments[1] ? true

                if convert
                    cookies = toResCookie cookies

                if @cookies?
                    @cookies = mergeResCookie @.cookies, cookies
                else
                    @cookies = cookies
        ], () ->
            # Get
            self.cookies

        ###
         * Отчестка cookie. В случае, если аргумент не установлен удалятся все cookie.
         * @memberOf Request
         * @param {String} first        - Имя удаляемой Cookie
         * @return {Array|Null}         - Успешное ли удаление
        ###
        clearCookie: overlord [
            # One
            args: [String]
            func: (name)->
                removeResCookie @cookies, name
        ], () ->
            # All
            self.cookies = null

    # Удаление header
    removeHeader = (headers, name)->
        if headers[ name ]?
            delete headers[ name ]

        return headers

    # Перевод cookie в вид ответа
    toReqCookie = (cookies)->
        reqCookies = {}
        for i of cookies
            key = Object.keys(cookies[i])[0]
            val = cookies[i][key]
            reqCookies[key] = val

        return reqCookies

    # Перевод cookie в вид запроса
    toResCookie = (cookies)->
        resCookies = []
        for val, key in cookies
            obj = {}
            obj[ key ] = val

            resCookies.push obj

        return resCookies

    # Удаление cookie
    removeResCookie = (cookies, name)->
        for cookie, i in cookies
            key = Object.keys(cookie)[0]

            if key == name
                cookies.splice i, 1
                break

        return cookies

    # Объединение cookie запроса
    mergeResCookie = ()->
        # arguments
        resCookies = []

        # Обход аргументов
        for cookie, i in arguments
            if cookie instanceof Object
                # Обход кук
                for cook, x in cookie
                    key = Object.keys(cook)[0]
                    val = cook[key]

                    found = false

                    # Поиск уже имеющихся cookie
                    for resCookie, resI in resCookies
                        resKey = Object.keys(resCookie)[0]
                        resVal = resCookie[resKey]

                        if resKey == key
                            found = true

                            resCookies.splice resI, 1
                            resCookies.push cook

                            break

                    if !found then resCookies.push cook

        return resCookies

    # Общий запрос
    _request = (method, siteurl, callback, opts)->
        queryData = querystring.stringify  opts.data
        parsedUrl = url.parse siteurl

        host = parsedUrl.host
        path = parsedUrl.pathname

        if method == 'get'
            if opts.data
                path += "?" + queryData

        options = {
            hostname: host
            path: path
            method: method.toUpperCase()
            encoding: 'binary'
        }

        # Добавление заголовков POST
        if method == 'post'
            options = objectMerge options, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                    'Content-Length': queryData.length
                }
            }

        # Merge заголовков с запросом
        if opts?.headers?
            options = objectMerge options, {
                headers: opts.headers
            }

        # Cookie заголовков с запросом
        if opts?.cookies?
            cookies = ''
            step = 0
            for val, key in opts.cookies
                if step > 0
                    cookies += '; '

                # cookies += cookieParser.serialize key, decodeURIComponent val #TODO: не всегда cookie поступают в encode виде
                cookies += "#{key}=#{val}"
                step++

            options = objectMerge options, {
                headers: { 
                    'Cookie': cookies
                }
            }

        # Установка протокола
        if (parsedUrl.protocol == 'https:' && !opts.protocol) || opts.protocol == 'https'
            options.port = 443
            _http = https
        else
            options.port = 80
            _http = http

        req = _http.request options, (res)->
            data = ''
            status = res.statusCode
            headers = res.headers
            cookies = []
            parsedCookies = []

            for val, key in res.headers['set-cookie']
                cookie = cookieParser.parse val
                cookies.push cookie

            ###*
             * Перевод в формат запроса
             * @todo  заменить на единый формат
            ###
            parsedCookies = toReqCookie cookies

            res.setEncoding 'binary'
            res.on 'data', (chunk)->
                data += chunk

            res.on 'end', ()->
                # Проверка кодировки
                charset = opts.charset
                contentType = headers['content-type']
                if contentType && !charset
                    reg = /charset=([a-zA-Z0-9\-]+)(?:;|$|\ )/
                    mathes = contentType.match reg
                    if mathes then charset = mathes[1]

                data = new Buffer data, 'binary'
                if charset 
                    data = iconv.decode(data, charset).toString()
                else
                    data = data.toString()

                callback {
                    status:         status
                    data:           data
                    headers:        headers
                    cookies:        cookies
                    parsedCookies:  parsedCookies
                    charset:        charset
                }

        # Отправка POST даты
        if method == 'post'
            req.write queryData

        req.end()

    ###*
     * Post запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - POST параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.charset      - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
    ###
    post = (siteurl, callback, opts)->
        _request 'post', siteurl, callback, opts

    ###*
     * Get запрос
     * @param  {String}   siteurl           - Адрес запроса
     * @param  {Function} callback          - Callback функция
     * @param  {Object}   opts              - Опции
     * @param  {Object}   opts.data         - GET параметры
     * @param  {Object}   opts.headers      - Заголовки
     * @param  {Object}   opts.cookies      - Cookies
     * @param  {String}   opts.charset      - Кодировка ответа
     * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
    ###
    get = (siteurl, callback, opts)->
        _request 'get', siteurl, callback, opts

    return {
        post: post
        get: get
        Request: Request
    }

module.exports = request