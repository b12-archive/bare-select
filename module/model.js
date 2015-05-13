require('es6-set/implement');

var emit = require('stereo/emit');
var on = require('stereo/on');
var when = require('stereo/when');
var attributeUpdater = require('./model/attributeUpdater');
var patchAttributes = require('./model/patchAttributes');
var curry = require('1-liners/curry');

// TODO: Document the function.
module.exports = function model(rootElement) {

  // Initialize the input channel `patches`.
  var emitPatches = emit();
  var patches = Object.freeze({
    emit: emitPatches,
  });
  on(emitPatches)('apply',
    curry(patchAttributes)(rootElement)
  );

  // Initialize the output channel `updates`.
  var emitUpdates = emit();
  var updates = Object.freeze({
    on: on(emitUpdates),
    when: when(emitUpdates),
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
