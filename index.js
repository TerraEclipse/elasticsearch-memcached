var
  cluster = require('elasticsearch/lib/cluster'),
  core = require('elasticsearch/lib/core'),
  indices = require('elasticsearch/lib/indices'),
  request = require('./lib/request'),

  // defaults applied to request if
  // not supplied on instantiation
  defaults = {
    server : {
      memcached: {
        host : 'localhost',
        port : 11211
      },
      rest: {
        host: 'localhost',
        port: 9200
      }
    }
  };


// let the magic begin
function createClient (options) {
  'use strict';

  options = options || {};
  Object.keys(defaults).forEach(function (key) {
    if (!options[key]) {
      options[key] = defaults[key];
    }
  });

  // backwards compatibility helper... remaps 'index' to '_index'
  if (options.index) {
    options._index = options.index;
    delete options.index;
  }

  var
    req = request.initialize(options.server),
    client = core(options, req);

  client.cluster = cluster(options, req);
  client.indices = indices(options, req);

  return client;
}

// exports
exports = module.exports = createClient;
exports.createClient = createClient;
