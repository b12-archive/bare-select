var findIndex = require('find-index');
var error = require('./error');

module.exports = function(options) {
  var values;
  var radioNodes;

  if (
    !options ||
    !Array.isArray(values = options.values) ||
    !Array.isArray(radioNodes = options.radioNodes)
  ) return {error: error(
    'Can’t get the selected value. The view hasn’t registered valid ' +
    'options. I’m expecting `{String[]} options.values` and ' +
    '`{HTMLInputElement[]} options.radioNodes`.'
  )};

  return {value: options.values[
    findIndex(options.radioNodes, function(node) {
      return node.checked;
    })
  ]};
};
