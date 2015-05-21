var assign = require('object-assign');
var noop = require('1-liners/noop');

module.exports = function(keyCode, options) {
  return assign({
    keyCode: keyCode,
    preventDefault: noop,
  }, options);
};
