assert = require('assert');
createStack = require('stact');
index = 'elasticsearch-memcached-test-' + Date.now();
createClient = require('../').createClient;