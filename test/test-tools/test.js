var tape = require('tape-catch');
var assign = require('object-assign');

module.exports = function(partName) {
  return assign(
    function test(title) {
      var rest = Array.prototype.slice.apply(arguments, [1]);
      return tape.apply(this, [partName + ':  ' + title].concat(rest));
    },
    tape
  );
};
