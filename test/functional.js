require('elasticsearch/test/common');

global.clientOptions = {
  request: require('../')
};

require('elasticsearch/test/functional/core');
require('elasticsearch/test/functional/indices');
require('elasticsearch/test/functional/cluster');
