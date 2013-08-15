describe('core', function () {
  var client;

  before(function (done) {
    client = elasticsearch.createClient(options);
    client.indices.createIndex(done);
  });

  before(function (done) {
    client.indices.putMapping({_type: 'person'}, {
      person: {
        properties: {
          name: {type: 'string', store: 'yes'},
          color: {type: 'string', store: 'yes'}
        }
      }
    }, done);
  });

  after(function (done) {
    client.indices.deleteIndex(done);
  });

  it('bulk');

  it('bulkIndex');

  it('count', function (done) {
    var stack = createStack(function (next) {
      client.index({_type: 'number', _id: this}, {num: this}, next);
    });
    stack.add(1);
    stack.add(2);
    stack.add(3);
    stack.add(4);
    stack.add(5);
    stack.run(function (err) {
      assert.ifError(err);
      client.indices.refresh(function (err) {
        assert.ifError(err);
        client.count({_type: 'foo'}, null, function (err, result) {
          assert.ifError(err);
          assert.equal(result.count, 0);
          client.count({_type: 'number'}, null, function (err, result) {
            assert.ifError(err);
            assert.equal(result.count, 5);
            done();
          });
        });
      });
    });
  });

  it('delete', function (done) {
    client.index({_type: 'person', _id: 'joe'}, {name: 'Joe', color: 'red'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'joe'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result._source.name, 'Joe');
        client.delete({_type: 'person', _id: 'joe'}, function (err, result) {
          assert.ifError(err);
          client.get({_type: 'person', _id: 'joe'}, function (err, result) {
            assert(err);
            assert.equal(err.statusCode, 404);
            done();
          });
        });
      });
    });
  });

  it.skip('deleteByQuery', function (done) {
    var stack = createStack(function (next) {
      client.index({_type: 'person', _id: this._id}, this, next);
    });
    stack.add({_id: 'bill', name: 'Bill', color: 'green'});
    stack.add({_id: 'bob', name: 'Bob', color: 'blue'});
    stack.add({_id: 'babe', name: 'Babe', color: 'green'});
    stack.run(function (err) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'bob'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result._source.name, 'Bob');
        client.deleteByQuery({}, {field: {color: 'green'}}, function (err, foo) {
          assert.ifError(err);
          client.get({_type: 'person', _id: 'bob'}, function (err, result) {
            assert(err);
            assert(err.statusCode, 404);
            done();
          });
        });
      });
    });
  });

  it('exists', function (done) {
    client.index({_type: 'person', _id: 'mary'}, {name: 'Mary', color: 'purple'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'mary'}, function (err, result) {
        assert.ifError(err);
        assert(result.exists);
        done();
      });
    });
  });

  it('explain');

  it('get', function (done) {
    client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'brian'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result._source.name, 'Brian');
        done();
      });
    });
  });

  it('index', function (done) {
    client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'brian'}, function (err, result) {
        assert.ifError(err);
        assert.equal(result._source.name, 'Brian');
        done();
      });
    });
  });

  it('moreLikeThis');

  it('multiGet');

  it('multiSearch');

  it('percolate');

  it('registerPercolator');

  it('search');

  it('unregisterPercolator');

  it('update');

  it('validate');


});