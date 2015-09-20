var cookieParser, http, https, iconv, objectMerge, overlord, querystring, request, url;

http = require('http');

https = require('https');

url = require('url');

querystring = require('querystring');

iconv = require('iconv-lite');

objectMerge = require('object-merge');

cookieParser = require('cookie');

overlord = require('overlord-js');

request = (function() {

  /**
   * Класс для работы с запросами
   * @class Request
   * @param {object} opts                 - параметры конструктора
   * @param {boolean} opts.saveCookies    - хранить ли Cookie
   * @param {object} opts.headers         - постоянные заголовки запроса
   */
  var Request, _request, get, mergeResCookie, post, removeHeader, removeResCookie, toReqCookie, toResCookie;
  Request = (function() {
    function Request(opts) {
      var ref, ref1;
      this.cookies = null;
      this.headers = (ref = opts != null ? opts.headers : void 0) != null ? ref : null;
      this.saveCookies = (ref1 = opts != null ? opts.saveCookies : void 0) != null ? ref1 : true;
    }


    /**
     * Аналог запроса
     * @memberOf Request
     * @method _request
     * @see  {function} _request
     */

    Request.prototype._request = function(method, siteurl, callback, opts) {
      var cookMatches, cookie, cookieExpires, cookieExpiresTimestamp, cookieHost, cookiePath, host, i, isValidHost, j, key, len, matches, parsedUrl, path, ref, ref1, ref2, ref3, reg, reqCookies, self, siteMatches, val;
      self = this;
      opts = opts != null ? opts : {};
      if ((opts != null ? opts.cookies : void 0) != null) {
        self.cookies = mergeResCookie(self.cookies, toResCookie(opts.cookies));
      }
      if (self.headers != null) {
        if ((opts != null ? opts.headers : void 0) != null) {
          opts.headers = objectMerge(self.headers, opts.headers);
        } else {
          opts.headers = self.headers;
        }
      }
      if (self.saveCookies && self.cookies) {
        parsedUrl = url.parse(siteurl);
        host = parsedUrl.host;
        path = parsedUrl.pathname;
        reqCookies = {};
        ref = self.cookies;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          cookie = ref[i];
          cookieHost = (ref1 = cookie.domain) != null ? ref1 : void 0;
          cookiePath = (ref2 = cookie.path) != null ? ref2 : void 0;
          cookieExpires = (ref3 = cookie.expires) != null ? ref3 : void 0;
          isValidHost = false;
          if (cookieHost) {
            reg = /^(?:.*?\/\/)?(?:www)?(?:\.)?(.*?)$/;
            siteMatches = host.match(reg);
            cookMatches = cookieHost.match(reg);
            if (siteMatches && cookMatches && siteMatches[1] === cookMatches[1]) {
              isValidHost = true;
            }
          }
          if (cookieExpires) {
            cookieExpiresTimestamp = new Date(cookieExpires).getTime();
          } else {
            cookieExpiresTimestamp = void 0;
          }
          key = Object.keys(cookie)[0];
          val = cookie[key];
          if (!cookieHost || isValidHost) {
            reg = new RegExp("^" + cookiePath, 'i');
            matches = path.match(reg);
            if (!cookiePath || matches && matches[0]) {
              if (!cookieExpiresTimestamp || cookieExpiresTimestamp > new Date().getTime()) {
                reqCookies[key] = val;
              }
            }
          }
        }
        if ((opts != null ? opts.cookies : void 0) != null) {
          opts.cookies = objectMerge(reqCookies, opts.cookies);
        } else {
          opts.cookies = reqCookies;
        }
      }
      return _request(method, siteurl, function(res) {
        if (self.saveCookies != null) {
          if (self.cookies != null) {
            self.cookies = mergeResCookie(self.cookies, res.cookies);
          } else if (res.cookies != null) {
            self.cookies = res.cookies;
          }
        }
        return callback(res);
      }, opts);
    };


    /**
     * Аналог Post
     * @memberOf Request
     * @method post
     * @see  {function} _request
     */

    Request.prototype.post = function(siteurl, callback, opts) {
      return this._request('post', siteurl, callback, opts);
    };


    /**
     * Аналог Get
     * @memberOf Request
     * @method get
     * @see  {function} _request
     */

    Request.prototype.get = function(siteurl, callback, opts) {
      return this._request('get', siteurl, callback, opts);
    };


    /**
     * Получение и установка header
     * @memberOf Request
     * @method header
     * @param {Object|Null} first    - Устанавливаемые header 
     * @return {Object}              - Текущие header
     */

    Request.prototype.header = overlord([
      {
        args: [Object],
        func: function(headers) {
          if (this.headers != null) {
            return this.headers = objectMerge(this.headers, headers);
          } else {
            return this.headers = headers;
          }
        }
      }
    ], function() {
      return this.headers;
    });


    /**
     * Отчестка header'ов. В случае, если аргумент не установлен удалятся все header.
     * @memberOf Request
     * @param {String} first        - Имя удаляемой Header
     * @return {Object|Null}        - Успешное ли удаление
     */

    Request.prototype.clearHeader = overlord([
      {
        args: [String],
        func: function(name) {
          return removeHeader(this.headers, name);
        }
      }
    ], function() {
      return this.headers = null;
    });


    /**
     * Получение и установка cookie
     * @memberOf Request
     * @method cookie
     * @param {Array|Null} first    - Устанавливаемые cookie 
     * @param {Boolean|Null} second - Конвертировать ли cookie
     * @return {Array}              - Текущие cookie
     */

    Request.prototype.cookie = overlord([
      {
        args: [Array, '...'],
        func: function(cookies) {
          var convert, ref;
          convert = (ref = arguments[1]) != null ? ref : true;
          if (convert) {
            cookies = toResCookie(cookies);
          }
          if (this.cookies != null) {
            return this.cookies = mergeResCookie(this.cookies, cookies);
          } else {
            return this.cookies = cookies;
          }
        }
      }
    ], function() {
      return self.cookies;
    });


    /*
     * Отчестка cookie. В случае, если аргумент не установлен удалятся все cookie.
     * @memberOf Request
     * @param {String} first        - Имя удаляемой Cookie
     * @return {Array|Null}         - Успешное ли удаление
     */

    Request.prototype.clearCookie = overlord([
      {
        args: [String],
        func: function(name) {
          return removeResCookie(this.cookies, name);
        }
      }
    ], function() {
      return self.cookies = null;
    });

    return Request;

  })();
  removeHeader = function(headers, name) {
    if (headers[name] != null) {
      delete headers[name];
    }
    return headers;
  };
  toReqCookie = function(cookies) {
    var i, key, reqCookies, val;
    reqCookies = {};
    for (i in cookies) {
      key = Object.keys(cookies[i])[0];
      val = cookies[i][key];
      reqCookies[key] = val;
    }
    return reqCookies;
  };
  toResCookie = function(cookies) {
    var j, key, len, obj, resCookies, val;
    resCookies = [];
    for (key = j = 0, len = cookies.length; j < len; key = ++j) {
      val = cookies[key];
      obj = {};
      obj[key] = val;
      resCookies.push(obj);
    }
    return resCookies;
  };
  removeResCookie = function(cookies, name) {
    var cookie, i, j, key, len;
    for (i = j = 0, len = cookies.length; j < len; i = ++j) {
      cookie = cookies[i];
      key = Object.keys(cookie)[0];
      if (key === name) {
        cookies.splice(i, 1);
        break;
      }
    }
    return cookies;
  };
  mergeResCookie = function() {
    var cook, cookie, found, i, j, k, key, l, len, len1, len2, resCookie, resCookies, resI, resKey, resVal, val, x;
    resCookies = [];
    for (i = j = 0, len = arguments.length; j < len; i = ++j) {
      cookie = arguments[i];
      if (cookie instanceof Object) {
        for (x = k = 0, len1 = cookie.length; k < len1; x = ++k) {
          cook = cookie[x];
          key = Object.keys(cook)[0];
          val = cook[key];
          found = false;
          for (resI = l = 0, len2 = resCookies.length; l < len2; resI = ++l) {
            resCookie = resCookies[resI];
            resKey = Object.keys(resCookie)[0];
            resVal = resCookie[resKey];
            if (resKey === key) {
              found = true;
              resCookies.splice(resI, 1);
              resCookies.push(cook);
              break;
            }
          }
          if (!found) {
            resCookies.push(cook);
          }
        }
      }
    }
    return resCookies;
  };
  _request = function(method, siteurl, callback, opts) {
    var _http, cookies, host, j, key, len, options, parsedUrl, path, queryData, ref, req, step, val;
    queryData = querystring.stringify(opts.data);
    parsedUrl = url.parse(siteurl);
    host = parsedUrl.host;
    path = parsedUrl.pathname;
    if (method === 'get') {
      if (opts.data) {
        path += "?" + queryData;
      }
    }
    options = {
      hostname: host,
      path: path,
      method: method.toUpperCase(),
      encoding: 'binary'
    };
    if (method === 'post') {
      options = objectMerge(options, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': queryData.length
        }
      });
    }
    if ((opts != null ? opts.headers : void 0) != null) {
      options = objectMerge(options, {
        headers: opts.headers
      });
    }
    if ((opts != null ? opts.cookies : void 0) != null) {
      cookies = '';
      step = 0;
      ref = opts.cookies;
      for (key = j = 0, len = ref.length; j < len; key = ++j) {
        val = ref[key];
        if (step > 0) {
          cookies += '; ';
        }
        cookies += key + "=" + val;
        step++;
      }
      options = objectMerge(options, {
        headers: {
          'Cookie': cookies
        }
      });
    }
    if ((parsedUrl.protocol === 'https:' && !opts.protocol) || opts.protocol === 'https') {
      options.port = 443;
      _http = https;
    } else {
      options.port = 80;
      _http = http;
    }
    req = _http.request(options, function(res) {
      var cookie, data, headers, k, len1, parsedCookies, ref1, status;
      data = '';
      status = res.statusCode;
      headers = res.headers;
      cookies = [];
      parsedCookies = [];
      if ((res != null ? res.headers['set-cookie'] : void 0) != null) {
        ref1 = res.headers['set-cookie'];
        for (key = k = 0, len1 = ref1.length; k < len1; key = ++k) {
          val = ref1[key];
          cookie = cookieParser.parse(val);
          cookies.push(cookie);
        }
      }

      /**
       * Перевод в формат запроса
       * @todo  заменить на единый формат
       */
      parsedCookies = toReqCookie(cookies);
      res.setEncoding('binary');
      res.on('data', function(chunk) {
        return data += chunk;
      });
      return res.on('end', function() {
        var charset, contentType, mathes, reg;
        charset = opts.charset;
        contentType = headers['content-type'];
        if (contentType && !charset) {
          reg = /charset=([a-zA-Z0-9\-]+)(?:;|$|\ )/;
          mathes = contentType.match(reg);
          if (mathes) {
            charset = mathes[1];
          }
        }
        data = new Buffer(data, 'binary');
        if (charset) {
          data = iconv.decode(data, charset).toString();
        } else {
          data = data.toString();
        }
        return callback({
          status: status,
          data: data,
          headers: headers,
          cookies: cookies,
          parsedCookies: parsedCookies,
          charset: charset
        });
      });
    });
    if (method === 'post') {
      req.write(queryData);
    }
    return req.end();
  };

  /**
   * Post запрос
   * @param  {String}   siteurl           - Адрес запроса
   * @param  {Function} callback          - Callback функция
   * @param  {Object}   opts              - Опции
   * @param  {Object}   opts.data         - POST параметры
   * @param  {Object}   opts.headers      - Заголовки
   * @param  {Object}   opts.cookies      - Cookies
   * @param  {String}   opts.charset      - Кодировка ответа
   * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
   */
  post = function(siteurl, callback, opts) {
    return _request('post', siteurl, callback, opts);
  };

  /**
   * Get запрос
   * @param  {String}   siteurl           - Адрес запроса
   * @param  {Function} callback          - Callback функция
   * @param  {Object}   opts              - Опции
   * @param  {Object}   opts.data         - GET параметры
   * @param  {Object}   opts.headers      - Заголовки
   * @param  {Object}   opts.cookies      - Cookies
   * @param  {String}   opts.charset      - Кодировка ответа
   * @param  {String}   opts.protocol     - Протокол запроса ['http'|'https']
   */
  get = function(siteurl, callback, opts) {
    return _request('get', siteurl, callback, opts);
  };
  return {
    post: post,
    get: get,
    Request: Request
  };
})();

module.exports = request;
