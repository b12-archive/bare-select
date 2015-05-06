var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');

// TODO: Document the function.
module.exports = function model(rootElement) {

  // Initialize the input channel `patches`.
  var patches = Object.freeze({
    emit: øEmit(),
  });

  // Initialize the output channel `updates`.
  var emitUpdates = øEmit();
  var updates = Object.freeze({
    on: øOn(emitUpdates),
    when: øWhen(emitUpdates),
  });
  var emitCurrentAttributes = attributeUpdater({
    emitter: emitUpdates,
    attributesObject: rootElement.attributes,
  });

  // Emit initial messages to `updates`.
  emitCurrentAttributes();

  // Export channels and `attributeChangedCallback`.
  return Object.freeze({
    patches: patches,
    updates: updates,
    attributeChangedCallback: emitCurrentAttributes,
  });
};
