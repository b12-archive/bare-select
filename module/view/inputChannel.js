var snatch = require('stereo/catch');

module.exports = function (emitter) {return Object.freeze({
  emit: emitter,
  catch: snatch(emitter),
});};
