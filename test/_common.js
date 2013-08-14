assert = require('assert');
createStack = require('stact');
elasticsearch = require('elasticsearch');

index = 'elasticsearch-memcached-test-' + Date.now();
options = {
  _index: index,
  request: require('../'),
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
