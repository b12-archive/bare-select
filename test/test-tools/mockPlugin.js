var mockView = require('./mockView');
var mockModel = require('./mockModel');

module.exports = function(plugin) {
  var mocks = {
    view: mockView(),
    model: mockModel(),
  };

  plugin(mocks);
  return mocks;
};
