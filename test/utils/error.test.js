var test = require('../test-tools/test')('error util');

var error = require('../../module/utils/error');

test(
  'Returns a lightweight error object.',
  function(is) {
    var original = 'a message';

    var expected = 'bare-select: ' + original;
    var defaultError = error({}, original);
    is.equal(
      defaultError.message,
      expected,
      'with a labeled `message` property'
    );

    is.equal(
      String(defaultError),
      expected,
      'casting gracefully to a string'
    );

    var errorWithSource = error({source: 'source'}, original);
    is.equal(
      errorWithSource.message,
      'bare-select (source): ' + original,
      'annotating the `message` with an optional source'
    );

    is.end();
  }
);
