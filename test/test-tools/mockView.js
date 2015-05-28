require('es6-set/implement');

var ø = require('stereo');

function domChannel () {
  var channel = ø();
  return {
    emit: channel.emit,
    on: channel.on,
    off: channel.off,
  };
}

module.exports = function() { return {
  update: ø(),
  captionContent: ø(),
  options: ø(),
  captionElement: domChannel(),
  dropdownElement: domChannel(),
  switchElement: domChannel(),
  error: ø(),
};};
