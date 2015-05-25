var mockView = require('./mockView');
var mockModel = require('./mockModel');
var assign = require('object-assign');

module.exports = function(plugin, args) {
  var mocks = {
    view: mockView(),
    model: mockModel(),
  };

  plugin(assign(mocks, args));
  return mocks;
};
