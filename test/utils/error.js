var test = require('../test-tools/test')('error util');

var error = require('../../utils/error');

test(
  'Returns a lightweight error object.',
  function(is) {
    var original = 'a message';
    var expected = '<bare-select>: a message';

    is.equal(
      error(original).message,
      expected,
      'with a labeled `message` property'
    );

    is.equal(
      String(error(original)),
      expected,
      'casting gracefully to a string'
    );

    is.end();
  }
);
