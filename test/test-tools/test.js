var tape = require('tape-catch');

module.exports = function(partName) {
  function test(title) {
    var rest = Array.prototype.slice.apply(arguments, [1]);
    return tape.apply(this, [partName + ':  ' + title].concat(rest));
  }

  Object.keys(tape).forEach(function(key) {
    test[key] = tape[key];
  });

  return test;
};
