var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var øCatch = require('stereo/catch');

module.exports = function model(rootElement) {
  // Initialize the input channel `patches`.
  var patches = Object.freeze({
    emit: øEmit(),
  });

  // Initialize the output channel `updates`.
  var emitOptions = øEmit();
  var updates = Object.freeze({
    on: øOn(emitOptions),
    when: øWhen(emitOptions),
    catch: øCatch(emitOptions),
  });

  return Object.freeze({
    patches: patches,
    updates: updates,
  });
};
