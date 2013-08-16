var Memcached = require('memcached')
  , qs = require('querystring')
  , _request = require('./rest')
  , DEFAULT_TIMEOUT = 30000;

/*
  A closure that enables basic configuration of the request
  that will be applied for every operation of the lib.
*/
exports.initialize = function (settings, self) {
  'use strict';

  self = self || {};
  self.settings = settings.memcached || {};

  // Create a REST request agent to fall back to.
  self._request = _request.initialize(settings.rest);

  /*
    Set up memcached client based on settings.
   */
  if (self.settings.hostnames) {
    self.client = new Memcached(self.settings.hostnames.map(function (hostname) {
      return hostname + ':' + self.settings.port;
    }), self.settings.options);
  }
  else if (self.settings.hosts) {
    self.client = new Memcached(self.settings.hosts, self.settings.options);
  }
  else {
    self.client = new Memcached(self.settings.host + ':' + self.settings.port, self.settings.options);
  }

  /*
    Actually executes a request given the supplied options,
    writing the specified data and returning the result to the
    supplied callback.

    In the event that an exception occurs on the request, the
    Error is captured and returned via the callback.
  */
  function exec (method, options, data, callback) {
    var path, req;

    data = data || '';
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    if (method !== 'set' && data) {
      options.query = options.query || {};
      options.query.source = data;
    }

    options = self.getRequestOptions(options);

    if (method === 'get') {
      req = self.client.get.bind(self.client, options.path);
    }
    if (method === 'set') {
      req = self.client.set.bind(self.client, options.path, data, 0);
    }
    if (method === 'del') {
      req = self.client.del.bind(self.client, options.path);
    }

    req(function (err, res) {
      var json, e;

      if (err) return callback(err);

      try {
        json = JSON.parse(res);
      }
      catch (err) {
        return callback(new Error(res));
      }

      if (method === 'get' && (typeof json.exists !== 'undefined') && !json.exists) {
        e = new Error('Resource could not be found');
        e.statusCode = 404;
        return callback(e);
      }

      return callback(null, json);
    });
  }

  /*
    Effectively merges request options with preconfigured
    information. Priority is given to the input options...

    This could get wonky if a client thinks to encapsulate
    settings for the server within a server sub-document of
    the options document.

    i.e.

    // this will override base config.host
    options.host = '127.0.0.1'

    // this will result in config.server being set... host
    // will not effectively be overriden for the request
    options.server.host = '127.0.0.1'
  */
  self.getRequestOptions = function (options) {
    var returnOptions = {};

    Object.keys(self.settings).forEach(function (field) {
      returnOptions[field] = self.settings[field];
    });
    Object.keys(options).forEach(function (field) {
      returnOptions[field] = options[field];
    });

    // ensure default timeout is applied if one is not supplied
    if (typeof returnOptions.timeout === 'undefined') {
      returnOptions.timeout = DEFAULT_TIMEOUT;
    }

    // create `path` from pathname and query.
    returnOptions.path = returnOptions.pathname;
    if (returnOptions.query && Object.keys(returnOptions.query).length) {
      returnOptions.path += '?' + qs.stringify(returnOptions.query);
    }

    return returnOptions;
  };

  /*
    Issues a DELETE request with data (if supplied) to the server

    Disclaimer: It's not a common practice to pass POST
    data via the DELETE method. This, however, is how the
    ES API operates:

    http://www.elasticsearch.org/guide/reference/api/delete-by-query/
  */
  self.delete = function (options, data, callback) {
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    return exec('del', options, data, callback);
  };

  /*
    Issues a GET request with data (if supplied) to the server

    Disclaimer: It's not a common practice to pass POST
    data via the GET method. This, however, is how the
    ES API operates:

    http://www.elasticsearch.org/guide/reference/api/search/
    http://www.elasticsearch.org/guide/reference/api/multi-get/
    http://www.elasticsearch.org/guide/reference/api/multi-search/
    http://www.elasticsearch.org/guide/reference/api/percolate/
    http://www.elasticsearch.org/guide/reference/api/validate/
  */
  self.get = function (options, data, callback) {
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    return exec('get', options, data, callback);
  };

  /*
    Issues a HEAD request with data (if supplied) to the server

    Disclaimer: It's not a common practice to pass POST
    data via the HEAD method.

    It's in here, however, because ES does this for other
    methods (i.e. GET and DELETE)... there is no immediate
    need for this.
  */
  self.head = function (options, data, callback) {
    return self._request.head(options, data, callback);
  };

  /*
    Issues a POST request with data (if supplied) to the server
  */
  self.post = function (options, data, callback) {
    var method;

    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    if (options.pathname.match(/_mget/)) {
      return self._request.post(options, data, callback);
    }
    else if (options.pathname.match(/_query/)) {
      method = 'del';
    }
    else if (options.pathname.match(/_search|_msearch|_explain/)) {
      method = 'get';
    }
    else {
      method = 'set';
    }

    return exec(method, options, data, callback);
  };

  /*
    Issues a PUT request with data (if supplied) to the server
  */
  self.put = function (options, data, callback) {
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    return exec('set', options, data, callback);
  };

  return self;
};
