describe('core', function () {
  var client;

  before(function (done) {
    client = elasticsearch.createClient(options);
    client.indices.createIndex(done);
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

  it('deleteByQuery');

  it('exists');

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