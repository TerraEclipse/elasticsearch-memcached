describe('core', function () {
  var client;

  before(function (done) {
    client = createClient({
      _index: index
    });
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
      client.count({_type: 'foo'}, null, function (err, result) {
        assert.ifError(err);
        console.log(result._shards.failures);
        done();
      });
    });
  });

  it('delete');

  it('deleteByQuery');

  it('exists');

  it('explain');

  it('get', function (done) {
    client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'brian'}, function (err, doc) {
        assert.ifError(err);
        assert.equal(doc._source.name, 'Brian');
        done();
      });
    });
  });

  it('index', function (done) {
    client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
      assert.ifError(err);
      client.get({_type: 'person', _id: 'brian'}, function (err, doc) {
        assert.ifError(err);
        assert.equal(doc._source.name, 'Brian');
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