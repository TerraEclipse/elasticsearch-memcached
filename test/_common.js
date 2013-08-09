assert = require('assert');
index = 'elasticsearch-memcached-test-' + Date.now();
createClient = require('../').createClient;