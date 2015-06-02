var curry = require('1-liners/curry');
var equal = curry(require('1-liners/equal'));
var findIndex = require('find-index');
var error = require('./error');

module.exports = function (options, value) {
  var values;
  var labelNodes;

  if (
    !options ||
    !Array.isArray(values = options.values) ||
    !Array.isArray(labelNodes = options.labelNodes)
  ) return {error: error(
    'Can’t get the requested label. The view hasn’t registered valid ' +
    'options. I’m expecting `{String[]} options.values` and ' +
    '`{HTMLLabelElement[]} options.labelNodes`.'
  )};

  return {value:
    options.labelNodes[
      findIndex(options.values, equal(value))
    ] ||
    null
  };
};
