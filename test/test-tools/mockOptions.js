var createElement = require('../test-tools/createElement');
var repeat = require('repeat-element');
var mockOptionRadio = require('../test-tools/mockOptionRadio');

module.exports = function(options) {
  if (!options) options = {};
  var selectedIndex = (options.hasOwnProperty('selectedIndex') ?
    options.selectedIndex :
    0
  );

  var stamp = repeat(null, 5);
  return {
    values: stamp.map(function (_, index) {return String(index);}),
    radioNodes: stamp.map(function (_, index) {
      return createElement(mockOptionRadio({
        value: String(index),
        checked: (index === selectedIndex),
      }));
    }),
  };
};
