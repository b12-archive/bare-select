require('es6-set/implement');

var øEmit = require('stereo/emit');
var øOn = require('stereo/on');
var øWhen = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');
var patchAttributes = require('./model/patchAttributes');
var curry = require('1-liners/curry2');

// TODO: Document the function.
module.exports = function model(rootElement) {

  // Initialize the input channel `patches`.
  var emitPatches = øEmit();
  var patches = Object.freeze({
    emit: emitPatches,
  });
  øOn(emitPatches)('apply',
    curry(patchAttributes)(rootElement)
  );

  // Initialize the output channel `updates`.
  var emitUpdates = øEmit();
  var updates = Object.freeze({
    on: øOn(emitUpdates),
    when: øWhen(emitUpdates),
  });
  // TODO: Add `off`.
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
