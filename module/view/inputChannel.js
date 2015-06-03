var snatch = require('stereo/catch');

module.exports = function (emitter) {return Object.freeze({
  emit: emitter,
  catch: snatch(emitter),
});};
// TODO: Delegate error handling to `view.error` or get rid of `view.error`
//       altogether.
