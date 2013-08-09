var
  request = require('request'),
  DEFAULT_TIMEOUT = 30000;

/*
  A closure that enables basic configuration of the request
  that will be applied for every operation of the lib.
*/
exports.initialize = function (settings, self) {
  'use strict';

  self = self || {};
  self.failover = {
    count : 0,
    index : 0,
    key : '',
    values : []
  };
  self.settings = settings || {};

  /*
    If failover information is provided, store the options for use
    in the event of a connection failure.
  */
  ['hosts', 'hostnames'].forEach(function (hostsKey) {
    if (self.settings[hostsKey] && Array.isArray(self.settings[hostsKey])) {
      // remove the "s" from the key
      self.failover.key = hostsKey.slice(0, -1);
      self.failover.values = self.settings[hostsKey];

      // set the current default host/hostname
      self.settings[self.failover.key] = self.failover.values[self.failover.index];

      // clear the failover settings from the default settings
      delete self.settings[hostsKey];
    }
  });

  /*
    Actually executes a request given the supplied options,
    writing the specified data and returning the result to the
    supplied callback.

    In the event that an exception occurs on the request, the
    Error is captured and returned via the callback.
  */
  function exec (options, data, callback) {
    data = data || '';
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Content-Length'] = Buffer.byteLength(data);

    options.uri = options;
    options.uri.protocol = options.secure ? 'https:': 'http:';

    options.json = true;
    if (data) {
      options.body = data;
    }

    function handleRequestError (err) {
      var
        failover =
          self.failover.values.length > 1 &&
          err.code &&
          (err.code === 'ENOTFOUND' ||
          err.code === 'ECONNREFUSED' ||
          err.code === 'ECONNRESET'),
        hostOverridden =
          (options.hostname || options.host) !==
          (self.settings.hostname || self.settings.host);

      // if there is a connection error and the host/hostname settings
      // weren't overridden in the options, let's failover to the
      // next host/hostname if one is available
      if (failover && !hostOverridden) {
        self.failover.count++;
        self.failover.index =
          self.failover.index === self.failover.values.length - 1 ?
          0 :
          self.failover.index + 1;

        if (self.failover.count <= self.failover.values.length) {
          self.settings[self.failover.key] = self.failover.values[self.failover.index];
          options[self.failover.key] = self.settings[self.failover.key];

          return exec(options, data, callback);
        }
      }

      self.failover.count = 0;
      return callback(err, null);
    }

    return request(options, function (err, res, body) {
      if (err) return handleRequestError(err);
      if (res.statusCode >= 400) {
        var err = new Error(body);
        err.statusCode = statusCode;
        return callback(err);
      }

      if (!body && options.method === 'HEAD') {
        body = {
          statusCode : statusCode
        };
      }

      self.failover.count = 0;
      return callback(null, body);
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
  function getRequestOptions (options) {
    var returnOptions = self.settings;
    Object.keys(options).forEach(function (field) {
      returnOptions[field] = options[field];
    });

    // ensure default timeout is applied if one is not supplied
    if (typeof returnOptions.timeout === 'undefined') {
      returnOptions.timeout = DEFAULT_TIMEOUT;
    }

    return returnOptions;
  }

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

    options.method = 'DELETE';
    return exec(getRequestOptions(options), data, callback);
  };

  /*
    Used to format any options NOT specified in excludes as a
    querystring.

    formatParameters({ test : true, excludeMe : 'yes', other : 'kitteh' }, ['excludeMe']);

    Outputs: 'test=true&other=ktteh'
  */
  self.formatParameters = function (options, excludes) {
    var params;

    Object.keys(options).forEach(function (key) {
      if (excludes.indexOf(key) === -1) {
        params = (params || '') + key + '=' + options[key] + '&';
        delete options[key];
      }
    });

    return params ? params.substring(0, params.length - 1) : '';
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

    options.method = 'GET';
    return exec(getRequestOptions(options), data, callback);
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
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    options.method = 'HEAD';
    return exec(getRequestOptions(options), data, callback);
  };

  /*
    Convenience method used for building path string used
    when issuing the HTTP/HTTPS request. If the resource param
    is undefined, empty or false an empty sting is returned.

    If the input resource string has a value, it is returned
    with a '/' prepend.

    pathAppend('kitteh')

    Outputs: '/kitteh'
  */
  self.pathAppend = function (resource) {
    if (resource) {
      return '/' + resource;
    }

    return '';
  };

  /*
    Issues a POST request with data (if supplied) to the server
  */
  self.post = function (options, data, callback) {
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    options.method = 'POST';
    return exec(getRequestOptions(options), data, callback);
  };

  /*
    Issues a PUT request with data (if supplied) to the server
  */
  self.put = function (options, data, callback) {
    if (!callback && typeof data === 'function') {
      callback = data;
      data = null;
    }

    options.method = 'PUT';
    return exec(getRequestOptions(options), data, callback);
  };

  return self;
};