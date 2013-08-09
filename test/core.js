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

  it('count');

  it('delete');

  it('deleteByQuery');

  it('exists');

  it('explain');

  it('get', function (done) {
    client.index({_type: 'person', _id: 'brian'}, {name: 'Brian', color: 'blue'}, function (err, result) {
      if (err) return done(err);
      client.get({_type: 'person', _id: 'brian'}, function (err, doc) {
        if (err) return done(err);
        assert.equal(doc._source.name, 'Brian');
        done();
      });
    });
  });

  it('index');

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