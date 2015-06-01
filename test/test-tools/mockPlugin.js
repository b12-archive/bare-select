var mockView = require('./mockView');
var mockModel = require('./mockModel');

module.exports = function(plugin, args) {
  var mocks = {
    view: mockView(),
    model: mockModel(),
  };

  plugin(args)(mocks);
  return mocks;
};
